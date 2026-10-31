import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireAdmin, requireCustomer } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  isValidDateFormat,
  isDateWithinRange,
  calculatePolicyBalances,
} from '../services/policyService';

const router = Router();

// GET /api/claims
// Administrator: all claims across all customers
// Customer: only their own claims
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const isAdmin = user.role === 'Administrator';

    const whereClause = isAdmin
      ? {}
      : {
          policy: {
            OR: [
              { customerId: user.id },
              ...(user.username ? [{ customer: { username: user.username } }] : []),
            ],
          },
        };

    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        policy: {
          include: {
            customer: {
              select: { id: true, username: true, name: true },
            },
            claims: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedClaims = claims.map((claim) => {
      const policyBalances = calculatePolicyBalances(claim.policy);
      return {
        id: claim.id,
        policyId: claim.policyId,
        incidentDate: claim.incidentDate,
        amount: claim.amount,
        status: claim.status,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        customer: {
          id: claim.policy.customer.id,
          username: claim.policy.customer.username,
          name: claim.policy.customer.name,
        },
        policyDetails: {
          id: claim.policy.id,
          startDate: claim.policy.startDate,
          endDate: claim.policy.endDate,
          sumInsured: claim.policy.sumInsured,
          remainingClaimableSI: policyBalances.remainingClaimableSI,
        },
      };
    });

    res.json({ claims: formattedClaims });
  } catch (err: any) {
    console.error('Error fetching claims:', err);
    res.status(500).json({ error: 'Failed to retrieve claims.' });
  }
});

// POST /api/claims (Customer only)
// Submit a claim against customer's own policy
router.post('/', ...requireCustomer, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { policyId, incidentDate, amount, customId } = req.body;

    if (!policyId) {
      res.status(400).json({ error: 'Policy ID is required.' });
      return;
    }

    if (!incidentDate || !isValidDateFormat(incidentDate)) {
      res.status(400).json({
        error: 'Incident date must be a valid calendar date in YYYY-MM-DD format.',
      });
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        error: 'Claim amount must be a positive number greater than 0.',
      });
      return;
    }

    const roundedAmount = Math.round(parsedAmount * 100) / 100;

    // Concurrency safe transactional check & create
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch policy and verify ownership
      const policy = await tx.policy.findUnique({
        where: { id: policyId },
        include: { claims: true, customer: true },
      });

      if (!policy) {
        throw { statusCode: 404, message: `Policy with ID "${policyId}" not found.` };
      }

      if (policy.customerId !== user.id && policy.customer?.username !== user.username) {
        throw {
          statusCode: 403,
          message: 'Access denied. You can only submit claims against your own policies.',
        };
      }

      // 2. Validate incident date falls within policy start and end dates (inclusive)
      if (!isDateWithinRange(incidentDate, policy.startDate, policy.endDate)) {
        throw {
          statusCode: 400,
          message: `Incident date (${incidentDate}) must fall within policy coverage period (${policy.startDate} to ${policy.endDate}).`,
        };
      }

      // 3. Calculate remaining claimable SI
      const balances = calculatePolicyBalances(policy);

      if (roundedAmount > balances.remainingClaimableSI) {
        throw {
          statusCode: 400,
          message: `Claim amount (${roundedAmount.toLocaleString()}) exceeds the remaining claimable Sum Insured (${balances.remainingClaimableSI.toLocaleString()}).`,
        };
      }

      // 4. Generate unique claim ID on server
      let claimId = customId ? String(customId).trim() : null;
      if (claimId) {
        const existingClaim = await tx.claim.findUnique({ where: { id: claimId } });
        if (existingClaim) {
          throw { statusCode: 409, message: `Claim ID "${claimId}" already exists.` };
        }
      } else {
        let unique = false;
        let attempt = 0;
        while (!unique && attempt < 20) {
          attempt++;
          const claimCount = await tx.claim.count();
          const randSuffix = Math.floor(1000 + Math.random() * 9000);
          const candidate = `CLM-${1000 + claimCount + attempt}-${randSuffix}`;
          const existing = await tx.claim.findUnique({ where: { id: candidate } });
          if (!existing) {
            claimId = candidate;
            unique = true;
          }
        }
        if (!claimId) {
          claimId = `CLM-${Date.now()}`;
        }
      }

      // 5. Create claim in Submitted status (immediately blocks SI)
      const newClaim = await tx.claim.create({
        data: {
          id: claimId,
          policyId: policy.id,
          incidentDate,
          amount: roundedAmount,
          status: 'Submitted',
        },
      });

      const updatedRemainingSI = Math.round((balances.remainingClaimableSI - roundedAmount) * 100) / 100;

      return {
        claim: newClaim,
        remainingClaimableSI: updatedRemainingSI,
      };
    });

    res.status(201).json({
      message: 'Claim submitted successfully.',
      claim: result.claim,
      remainingClaimableSI: result.remainingClaimableSI,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Error submitting claim:', err);
    res.status(500).json({ error: 'Failed to submit claim.' });
  }
});

// PATCH /api/claims/:id/decision (Administrator only)
// Approve or reject a claim that is in Submitted status
router.patch('/:id/decision', ...requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { decision } = req.body;

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      res.status(400).json({
        error: 'Invalid decision. Decision must be either "Approved" or "Rejected".',
      });
      return;
    }

    const updatedClaim = await prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({
        where: { id },
        include: {
          policy: {
            include: {
              claims: true,
              customer: { select: { id: true, username: true, name: true } },
            },
          },
        },
      });

      if (!claim) {
        throw { statusCode: 404, message: `Claim with ID "${id}" was not found.` };
      }

      // Rule: Only Submitted claims may be approved or rejected. A decided claim cannot be decided again.
      if (claim.status !== 'Submitted') {
        throw {
          statusCode: 400,
          message: `Claim cannot be decided. Only claims in "Submitted" status can be approved or rejected. Current status is "${claim.status}".`,
        };
      }

      const updated = await tx.claim.update({
        where: { id },
        data: { status: decision },
        include: {
          policy: {
            include: {
              claims: true,
              customer: { select: { id: true, username: true, name: true } },
            },
          },
        },
      });

      return updated;
    });

    const updatedBalances = calculatePolicyBalances(updatedClaim.policy);

    res.json({
      message: `Claim ${id} successfully marked as ${decision}.`,
      claim: {
        id: updatedClaim.id,
        policyId: updatedClaim.policyId,
        incidentDate: updatedClaim.incidentDate,
        amount: updatedClaim.amount,
        status: updatedClaim.status,
        createdAt: updatedClaim.createdAt,
        updatedAt: updatedClaim.updatedAt,
        customer: updatedClaim.policy.customer,
      },
      policyRemainingClaimableSI: updatedBalances.remainingClaimableSI,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    console.error('Error deciding claim:', err);
    res.status(500).json({ error: 'Failed to update claim decision.' });
  }
});

export default router;
