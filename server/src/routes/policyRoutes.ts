import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  isValidDateFormat,
  calculatePolicyBalances,
  getCoverageStatus,
  getTodayCalendarDate,
} from '../services/policyService';

const router = Router();

// GET /api/policies
// Administrator: retrieves all policies
// Customer: retrieves only their own policies
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const isAdmin = user.role === 'Administrator';

    const whereClause = isAdmin ? {} : { customerId: user.id };

    const policies = await prisma.policy.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, username: true, name: true },
        },
        claims: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedPolicies = policies.map((policy) => {
      const balances = calculatePolicyBalances(policy);
      const coverageStatus = getCoverageStatus(policy.startDate, policy.endDate);

      return {
        id: policy.id,
        customerId: policy.customerId,
        customerUsername: policy.customer?.username,
        customerName: policy.customer?.name,
        startDate: policy.startDate,
        endDate: policy.endDate,
        coverageStatus,
        sumInsured: policy.sumInsured,
        remainingClaimableSI: balances.remainingClaimableSI,
        totalReservedAndUsed: balances.totalReservedAndUsed,
        submittedTotal: balances.submittedTotal,
        approvedTotal: balances.approvedTotal,
        rejectedTotal: balances.rejectedTotal,
        claimsCount: policy.claims.length,
        createdAt: policy.createdAt,
      };
    });

    // Summary metrics
    const today = getTodayCalendarDate();
    const totalPolicies = enrichedPolicies.length;
    const activePoliciesCount = enrichedPolicies.filter((p) => p.coverageStatus === 'Active').length;
    const expiredPoliciesCount = enrichedPolicies.filter((p) => p.coverageStatus === 'Expired').length;
    const upcomingPoliciesCount = enrichedPolicies.filter((p) => p.coverageStatus === 'Upcoming').length;

    res.json({
      policies: enrichedPolicies,
      meta: {
        today,
        totalPolicies,
        activePoliciesCount,
        expiredPoliciesCount,
        upcomingPoliciesCount,
      },
    });
  } catch (err: any) {
    console.error('Error fetching policies:', err);
    res.status(500).json({ error: 'Failed to retrieve policies.' });
  }
});

// GET /api/policies/:id
// Get single policy with calculated remaining SI
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const policy = await prisma.policy.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, username: true, name: true },
        },
        claims: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!policy) {
      res.status(404).json({ error: 'Policy not found.' });
      return;
    }

    // Role-based access control: customer can only view their own policy
    if (user.role === 'Customer' && policy.customerId !== user.id) {
      res.status(403).json({ error: 'Access denied. You can only view your own policies.' });
      return;
    }

    const balances = calculatePolicyBalances(policy);
    const coverageStatus = getCoverageStatus(policy.startDate, policy.endDate);

    res.json({
      policy: {
        id: policy.id,
        customerId: policy.customerId,
        customerUsername: policy.customer?.username,
        customerName: policy.customer?.name,
        startDate: policy.startDate,
        endDate: policy.endDate,
        coverageStatus,
        sumInsured: policy.sumInsured,
        remainingClaimableSI: balances.remainingClaimableSI,
        totalReservedAndUsed: balances.totalReservedAndUsed,
        submittedTotal: balances.submittedTotal,
        approvedTotal: balances.approvedTotal,
        rejectedTotal: balances.rejectedTotal,
        claims: policy.claims,
        createdAt: policy.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error retrieving policy:', err);
    res.status(500).json({ error: 'Failed to retrieve policy.' });
  }
});

// POST /api/policies (Administrator only)
// Create a policy for either customer
router.post('/', ...requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { customerId, customerUsername, startDate, endDate, sumInsured, customId } = req.body;

    // 1. Resolve Customer
    let targetCustomer;
    if (customerId) {
      targetCustomer = await prisma.user.findUnique({ where: { id: customerId } });
    } else if (customerUsername) {
      targetCustomer = await prisma.user.findUnique({ where: { username: customerUsername } });
    }

    if (!targetCustomer) {
      res.status(400).json({ error: 'Target customer was not found.' });
      return;
    }

    if (targetCustomer.role !== 'Customer') {
      res.status(400).json({ error: 'Policies can only be created for users with Customer role.' });
      return;
    }

    // 2. Validate calendar dates
    if (!startDate || !isValidDateFormat(startDate)) {
      res.status(400).json({
        error: 'Start date must be a valid calendar date in YYYY-MM-DD format.',
      });
      return;
    }

    if (!endDate || !isValidDateFormat(endDate)) {
      res.status(400).json({
        error: 'End date must be a valid calendar date in YYYY-MM-DD format.',
      });
      return;
    }

    // Reject invalid policy dates (end before start)
    if (endDate < startDate) {
      res.status(400).json({
        error: 'Invalid policy dates: Coverage end date cannot precede start date (cannot be earlier than start date).',
      });
      return;
    }

    // 3. Validate Sum Insured (SI)
    const parsedSI = Number(sumInsured);
    if (isNaN(parsedSI) || parsedSI <= 0) {
      res.status(400).json({
        error: 'Sum Insured must be a positive number greater than 0.',
      });
      return;
    }

    // 4. Generate unique Policy ID
    let policyId = customId ? String(customId).trim() : null;
    if (policyId) {
      const existing = await prisma.policy.findUnique({ where: { id: policyId } });
      if (existing) {
        res.status(409).json({ error: `Policy ID "${policyId}" already exists.` });
        return;
      }
    } else {
      const count = await prisma.policy.count();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      policyId = `POL-${1000 + count + 1}-${randomSuffix}`;
    }

    const roundedSI = Math.round(parsedSI * 100) / 100;

    const newPolicy = await prisma.policy.create({
      data: {
        id: policyId,
        customerId: targetCustomer.id,
        startDate,
        endDate,
        sumInsured: roundedSI,
      },
      include: {
        customer: {
          select: { id: true, username: true, name: true },
        },
      },
    });

    const coverageStatus = getCoverageStatus(newPolicy.startDate, newPolicy.endDate);

    res.status(201).json({
      message: 'Policy created successfully.',
      policy: {
        id: newPolicy.id,
        customerId: newPolicy.customerId,
        customerUsername: newPolicy.customer?.username,
        customerName: newPolicy.customer?.name,
        startDate: newPolicy.startDate,
        endDate: newPolicy.endDate,
        coverageStatus,
        sumInsured: newPolicy.sumInsured,
        remainingClaimableSI: newPolicy.sumInsured,
        totalReservedAndUsed: 0,
        claimsCount: 0,
        createdAt: newPolicy.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error creating policy:', err);
    res.status(500).json({ error: 'Failed to create policy.' });
  }
});

export default router;
