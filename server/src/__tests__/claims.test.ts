import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';
import { seed } from '../seed';

describe('Comprehensive Insurance Policy & Claims Verification Suite', () => {
  let customer1Token: string;
  let customer2Token: string;
  let adminToken: string;

  beforeAll(async () => {
    // Clean test fixture policies
    await prisma.claim.deleteMany({
      where: {
        policyId: { in: ['POL-TEST-001', 'POL-SPEC-TEST', 'POL-BOUND-001', 'POL-CONC-001'] },
      },
    });
    await prisma.policy.deleteMany({
      where: {
        id: { in: ['POL-TEST-001', 'POL-SPEC-TEST', 'POL-BOUND-001', 'POL-CONC-001'] },
      },
    });

    // Seed demo accounts safely
    await seed();

    // 1. All three demo accounts login
    const resC1 = await request(app).post('/api/auth/login').send({
      username: 'customer1',
      password: 'Customer1@Demo26',
    });
    expect(resC1.status).toBe(200);
    expect(resC1.body.user.role).toBe('Customer');
    customer1Token = resC1.body.token;

    const resC2 = await request(app).post('/api/auth/login').send({
      username: 'customer2',
      password: 'Customer2@Demo26',
    });
    expect(resC2.status).toBe(200);
    expect(resC2.body.user.role).toBe('Customer');
    customer2Token = resC2.body.token;

    const resAdmin = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'Admin@Demo26',
    });
    expect(resAdmin.status).toBe(200);
    expect(resAdmin.body.user.role).toBe('Administrator');
    adminToken = resAdmin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication, Access Control & Roles', () => {
    it('rejects invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
    });

    it('successfully processes logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });

    it('rejects unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/policies');
      expect(res.status).toBe(401);
    });

    it('rejects customer from performing admin action: create policy', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 500000,
        });
      expect(res.status).toBe(403);
    });

    it('rejects customer from performing admin action: decide claim', async () => {
      const res = await request(app)
        .patch('/api/claims/CLM-1002/decision')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({ decision: 'Approved' });
      expect(res.status).toBe(403);
    });
  });

  describe('2. Data Isolation & Cross-Customer Protection', () => {
    it('customer 1 sees only their own policies', async () => {
      const res = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(res.status).toBe(200);
      for (const policy of res.body.policies) {
        expect(policy.customerUsername).toBe('customer1');
      }
    });

    it('customer 1 cannot view customer 2 policy by ID', async () => {
      const pol2 = await prisma.policy.findFirst({
        where: { customer: { username: 'customer2' } },
      });
      expect(pol2).not.toBeNull();

      const res = await request(app)
        .get(`/api/policies/${pol2!.id}`)
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(res.status).toBe(403);
    });

    it('customer 1 cannot submit claim against customer 2 policy', async () => {
      const pol2 = await prisma.policy.findFirst({
        where: { customer: { username: 'customer2' } },
      });
      expect(pol2).not.toBeNull();

      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: pol2!.id,
          incidentDate: pol2!.startDate,
          amount: 5000,
        });
      expect(res.status).toBe(403);
    });

    it('admin can view all policies across all customers', async () => {
      const res = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const usernames = res.body.policies.map((p: any) => p.customerUsername);
      expect(usernames).toContain('customer1');
      expect(usernames).toContain('customer2');
    });
  });

  describe('3. Validation of Dates and Monetary Precision', () => {
    it('rejects policy creation if end date is earlier than start date', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerUsername: 'customer1',
          startDate: '2026-12-31',
          endDate: '2026-01-01',
          sumInsured: 1000000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/earlier than start date/i);
    });

    it('rejects policy creation with non-positive Sum Insured (<= 0)', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 0,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/greater than 0/i);
    });

    it('rejects claim with zero or negative amount', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: 'POL-1001',
          incidentDate: '2026-06-01',
          amount: -500,
        });
      expect(res.status).toBe(400);
    });

    it('rejects invalid calendar date format (e.g. 2026-02-31)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: 'POL-1001',
          incidentDate: '2026-02-31',
          amount: 5000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/valid calendar date/i);
    });
  });

  describe('4. Coverage Boundaries & Incident Date Verification', () => {
    const boundPolicyId = 'POL-BOUND-001';

    beforeAll(async () => {
      await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customId: boundPolicyId,
          customerUsername: 'customer1',
          startDate: '2026-03-01',
          endDate: '2026-09-30',
          sumInsured: 500000,
        });
    });

    it('accepts incident date exactly on coverage start date (boundary inclusion)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: boundPolicyId,
          incidentDate: '2026-03-01', // exactly startDate
          amount: 10000,
        });
      expect(res.status).toBe(201);
    });

    it('accepts incident date exactly on coverage end date (boundary inclusion)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: boundPolicyId,
          incidentDate: '2026-09-30', // exactly endDate
          amount: 10000,
        });
      expect(res.status).toBe(201);
    });

    it('rejects incident date 1 day before coverage start date', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: boundPolicyId,
          incidentDate: '2026-02-28', // 1 day before start
          amount: 10000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/coverage period/i);
    });

    it('rejects incident date 1 day after coverage end date', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: boundPolicyId,
          incidentDate: '2026-10-01', // 1 day after end
          amount: 10000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/coverage period/i);
    });
  });

  describe('5. Claim Accounting Rules & Spec Illustrative Example', () => {
    const specPolicyId = 'POL-SPEC-TEST';
    let claim600kId: string;

    beforeAll(async () => {
      await prisma.claim.deleteMany({ where: { policyId: specPolicyId } });
      await prisma.policy.deleteMany({ where: { id: specPolicyId } });

      // Create policy with SI = ₹10,00,000 for customer 1
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customId: specPolicyId,
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 1000000,
        });
      expect(res.status).toBe(201);
    });

    it('Step 1: Customer submits claim for 6,00,000 -> remaining SI becomes 4,00,000', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: specPolicyId,
          incidentDate: '2026-05-10',
          amount: 600000,
        });
      expect(res.status).toBe(201);
      expect(res.body.remainingClaimableSI).toBe(400000);
      claim600kId = res.body.claim.id;
    });

    it('Step 2: Customer tries to submit further claim for 5,00,000 -> rejected (exceeds 4,00,000)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: specPolicyId,
          incidentDate: '2026-06-01',
          amount: 500000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/exceeds the remaining claimable Sum Insured/i);
    });

    it('Customer submits claim equal to exact remaining SI (4,00,000) -> accepted', async () => {
      // Submitting 4,00,000 exactly matches remaining 4,00,000
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: specPolicyId,
          incidentDate: '2026-06-01',
          amount: 400000,
        });
      expect(res.status).toBe(201);
      expect(res.body.remainingClaimableSI).toBe(0);

      // Now with 0 remaining, even 1 rupee is rejected
      const overRes = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: specPolicyId,
          incidentDate: '2026-06-02',
          amount: 1,
        });
      expect(overRes.status).toBe(400);

      // Admin rejects this 4,00,000 claim to free up balance again
      await request(app)
        .patch(`/api/claims/${res.body.claim.id}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Rejected' });
    });

    it('Step 3: Administrator rejects the 6,00,000 claim -> remaining SI returns to 10,00,000', async () => {
      const res = await request(app)
        .patch(`/api/claims/${claim600kId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Rejected' });
      expect(res.status).toBe(200);
      expect(res.body.claim.status).toBe('Rejected');
      expect(res.body.policyRemainingClaimableSI).toBe(1000000);
    });

    it('Step 4: Now the 5,00,000 claim can be submitted, since claimed amount <= 10,00,000', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: specPolicyId,
          incidentDate: '2026-06-15',
          amount: 500000,
        });
      expect(res.status).toBe(201);
      expect(res.body.remainingClaimableSI).toBe(500000);
      const claim500kId = res.body.claim.id;

      // Administrator approves this claim -> remaining stays 5,00,000
      const approveRes = await request(app)
        .patch(`/api/claims/${claim500kId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Approved' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.claim.status).toBe('Approved');
      expect(approveRes.body.policyRemainingClaimableSI).toBe(500000);
    });

    it('Step 5: Decided claims cannot be decided again (immutability)', async () => {
      const res = await request(app)
        .patch(`/api/claims/${claim600kId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Approved' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Only claims in "Submitted" status can be approved or rejected/i);
    });
  });

  describe('6. Concurrency Safety & Race Condition Protection', () => {
    const concPolicyId = 'POL-CONC-001';

    beforeAll(async () => {
      await prisma.claim.deleteMany({ where: { policyId: concPolicyId } });
      await prisma.policy.deleteMany({ where: { id: concPolicyId } });

      // Create policy with SI = ₹5,00,000
      await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customId: concPolicyId,
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 500000,
        });
    });

    it('concurrent claims that together exceed SI cannot breach policy limit', async () => {
      // Both claims ask for 3,50,000 each. Total = 7,00,000 > SI 5,00,000.
      // Under concurrency, serialized transactions MUST accept at most ONE claim and reject the other!
      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/claims')
          .set('Authorization', `Bearer ${customer1Token}`)
          .send({
            policyId: concPolicyId,
            incidentDate: '2026-04-01',
            amount: 350000,
          }),
        request(app)
          .post('/api/claims')
          .set('Authorization', `Bearer ${customer1Token}`)
          .send({
            policyId: concPolicyId,
            incidentDate: '2026-04-02',
            amount: 350000,
          }),
      ]);

      const statuses = [resA.status, resB.status];
      expect(statuses).toContain(201); // Exactly one succeeded
      expect(statuses).toContain(400); // Exactly one was rejected due to insufficient SI

      // Verify the final remaining claimable balance in the database
      const checkRes = await request(app)
        .get(`/api/policies/${concPolicyId}`)
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(checkRes.body.policy.remainingClaimableSI).toBe(150000); // 500,000 - 350,000 = 150,000
    });
  });

  describe('7. Data Persistence Verification', () => {
    it('persists policy and claim records durability in database', async () => {
      const persistedPolicy = await prisma.policy.findUnique({
        where: { id: 'POL-SPEC-TEST' },
        include: { claims: true },
      });
      expect(persistedPolicy).not.toBeNull();
      expect(persistedPolicy!.sumInsured).toBe(1000000);
      expect(persistedPolicy!.claims.length).toBeGreaterThan(0);
    });
  });

  describe('8. AI Policy & Claims Assistant Security & Behavior', () => {
    it('rejects unauthenticated requests to /api/ai/chat (401)', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'What is my policy coverage?' });
      expect(res.status).toBe(401);
    });

    it('rejects empty or invalid message (400)', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({ message: '' });
      expect(res.status).toBe(400);
    });

    it('processes authenticated customer chat and returns safe structured response', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({ message: 'What is my remaining coverage?' });
      expect(res.status).toBe(200);
      expect(typeof res.body.reply).toBe('string');
      expect(res.body.reply.length).toBeGreaterThan(0);
      expect(Array.isArray(res.body.suggestedQuestions)).toBe(true);
    });
  });
});
