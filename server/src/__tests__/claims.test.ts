import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';
import { seed } from '../seed';

describe('Insurance Policy & Claims Management System Tests', () => {
  let customer1Token: string;
  let customer2Token: string;
  let adminToken: string;

  beforeAll(async () => {
    await prisma.claim.deleteMany({ where: { policyId: { in: ['POL-TEST-001', 'POL-SPEC-TEST'] } } });
    await prisma.policy.deleteMany({ where: { id: { in: ['POL-TEST-001', 'POL-SPEC-TEST'] } } });

    await seed();

    // Login customer 1
    const resC1 = await request(app).post('/api/auth/login').send({
      username: 'customer1',
      password: 'Customer1@Demo26',
    });
    expect(resC1.status).toBe(200);
    customer1Token = resC1.body.token;

    // Login customer 2
    const resC2 = await request(app).post('/api/auth/login').send({
      username: 'customer2',
      password: 'Customer2@Demo26',
    });
    expect(resC2.status).toBe(200);
    customer2Token = resC2.body.token;

    // Login admin
    const resAdmin = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'Admin@Demo26',
    });
    expect(resAdmin.status).toBe(200);
    adminToken = resAdmin.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Role-Based Access Control', () => {
    it('rejects unauthenticated requests to protected endpoints', async () => {
      const res = await request(app).get('/api/policies');
      expect(res.status).toBe(401);
    });

    it('rejects customer from creating policies (Admin only)', async () => {
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

    it('allows admin to create a policy with valid inputs', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customId: 'POL-TEST-001',
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 1000000,
        });
      expect(res.status).toBe(201);
      expect(res.body.policy.id).toBe('POL-TEST-001');
      expect(res.body.policy.remainingClaimableSI).toBe(1000000);
    });

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

    it('rejects policy creation with non-positive Sum Insured', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: -5000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/greater than 0/i);
    });
  });

  describe('2. Data Isolation', () => {
    it('customer 1 cannot see customer 2 policies', async () => {
      const res = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(res.status).toBe(200);
      const policies = res.body.policies;
      for (const p of policies) {
        expect(p.customerUsername).toBe('customer1');
      }
    });

    it('customer 1 cannot submit a claim against customer 2 policy', async () => {
      // Find policy owned by customer 2
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
          amount: 10000,
        });
      expect(res.status).toBe(403);
    });
  });

  describe('3. Mandatory Validation & Claim Accounting Rules (Illustrative Example from Spec)', () => {
    const testPolicyId = 'POL-SPEC-TEST';
    let firstClaimId: string;

    beforeAll(async () => {
      // Clean up if exists
      await prisma.claim.deleteMany({ where: { policyId: testPolicyId } });
      await prisma.policy.deleteMany({ where: { id: testPolicyId } });

      // Create Policy with SI: 10,00,000 for Customer 1
      await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customId: testPolicyId,
          customerUsername: 'customer1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          sumInsured: 1000000,
        });
    });

    it('rejects claim with incident date outside coverage period', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: testPolicyId,
          incidentDate: '2025-12-31', // Before start date
          amount: 100000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/coverage period/i);
    });

    it('rejects claim with non-positive amount (0 or negative)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: testPolicyId,
          incidentDate: '2026-06-01',
          amount: 0,
        });
      expect(res.status).toBe(400);
    });

    it('Step 1: Customer submits claim for 6,00,000 -> remaining claimable SI becomes 4,00,000', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: testPolicyId,
          incidentDate: '2026-06-01',
          amount: 600000,
        });
      expect(res.status).toBe(201);
      expect(res.body.claim.status).toBe('Submitted');
      expect(res.body.remainingClaimableSI).toBe(400000);
      firstClaimId = res.body.claim.id;

      // Verify policy details
      const polRes = await request(app)
        .get(`/api/policies/${testPolicyId}`)
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(polRes.body.policy.remainingClaimableSI).toBe(400000);
    });

    it('Step 2: Customer tries to submit further claim for 5,00,000 -> system rejects it (exceeds 4,00,000 remaining)', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: testPolicyId,
          incidentDate: '2026-06-15',
          amount: 500000,
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/exceeds the remaining claimable Sum Insured/i);
    });

    it('Step 3: Administrator rejects the 6,00,000 claim -> remaining claimable SI returns to 10,00,000', async () => {
      const res = await request(app)
        .patch(`/api/claims/${firstClaimId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Rejected' });

      expect(res.status).toBe(200);
      expect(res.body.claim.status).toBe('Rejected');
      expect(res.body.policyRemainingClaimableSI).toBe(1000000);

      // Verify policy details reflect released amount
      const polRes = await request(app)
        .get(`/api/policies/${testPolicyId}`)
        .set('Authorization', `Bearer ${customer1Token}`);
      expect(polRes.body.policy.remainingClaimableSI).toBe(1000000);
    });

    it('Step 4: Now the 5,00,000 claim can be submitted, since claimed amount is less than 10,00,000', async () => {
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          policyId: testPolicyId,
          incidentDate: '2026-06-15',
          amount: 500000,
        });
      expect(res.status).toBe(201);
      expect(res.body.remainingClaimableSI).toBe(500000);

      const secondClaimId = res.body.claim.id;

      // Administrator approves this claim -> remaining stays 5,00,000
      const approveRes = await request(app)
        .patch(`/api/claims/${secondClaimId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Approved' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.claim.status).toBe('Approved');
      expect(approveRes.body.policyRemainingClaimableSI).toBe(500000);
    });

    it('Step 5: Decided claims cannot be decided again', async () => {
      const res = await request(app)
        .patch(`/api/claims/${firstClaimId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'Approved' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Only claims in "Submitted" status can be approved or rejected/i);
    });
  });
});
