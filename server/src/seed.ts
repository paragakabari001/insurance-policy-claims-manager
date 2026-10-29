import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Seeding demo accounts safely without resetting existing data...');

  const passwordCustomer1 = await bcrypt.hash('Customer1@Demo26', 10);
  const passwordCustomer2 = await bcrypt.hash('Customer2@Demo26', 10);
  const passwordAdmin = await bcrypt.hash('Admin@Demo26', 10);

  // Upsert users safely
  const customer1 = await prisma.user.upsert({
    where: { username: 'customer1' },
    update: { password: passwordCustomer1, role: 'Customer', name: 'Customer 1' },
    create: {
      username: 'customer1',
      password: passwordCustomer1,
      role: 'Customer',
      name: 'Customer 1',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { username: 'customer2' },
    update: { password: passwordCustomer2, role: 'Customer', name: 'Customer 2' },
    create: {
      username: 'customer2',
      password: passwordCustomer2,
      role: 'Customer',
      name: 'Customer 2',
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: passwordAdmin, role: 'Administrator', name: 'Administrator' },
    create: {
      username: 'admin',
      password: passwordAdmin,
      role: 'Administrator',
      name: 'Administrator',
    },
  });

  console.log('Demo accounts verified:');
  console.log(' - Customer 1: customer1 / Customer1@Demo26');
  console.log(' - Customer 2: customer2 / Customer2@Demo26');
  console.log(' - Administrator: admin / Admin@Demo26');

  // Seed initial demo policies only if database has no policies yet
  const existingPolicies = await prisma.policy.count();
  if (existingPolicies === 0) {
    console.log('Seeding clean demonstration policies and claims...');

    // Policy 1: Customer 1 active policy (10 Lakhs SI)
    await prisma.policy.create({
      data: {
        id: 'POL-1001',
        customerId: customer1.id,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        sumInsured: 1000000,
        claims: {
          create: [
            {
              id: 'CLM-1001',
              incidentDate: '2026-03-15',
              amount: 250000,
              status: 'Approved',
            },
            {
              id: 'CLM-1002',
              incidentDate: '2026-06-20',
              amount: 150000,
              status: 'Submitted',
            },
          ],
        },
      },
    });

    // Policy 2: Customer 2 active policy (5 Lakhs SI)
    await prisma.policy.create({
      data: {
        id: 'POL-1002',
        customerId: customer2.id,
        startDate: '2026-02-01',
        endDate: '2026-11-30',
        sumInsured: 500000,
        claims: {
          create: [
            {
              id: 'CLM-1003',
              incidentDate: '2026-04-10',
              amount: 100000,
              status: 'Submitted',
            },
          ],
        },
      },
    });

    // Policy 3: Customer 1 expired coverage policy (3 Lakhs SI)
    await prisma.policy.create({
      data: {
        id: 'POL-1003',
        customerId: customer1.id,
        startDate: '2026-01-01',
        endDate: '2026-09-30',
        sumInsured: 300000,
        claims: {
          create: [
            {
              id: 'CLM-1004',
              incidentDate: '2026-05-15',
              amount: 50000,
              status: 'Approved',
            },
          ],
        },
      },
    });

    console.log('Demo policies and claims created successfully.');
  }
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
