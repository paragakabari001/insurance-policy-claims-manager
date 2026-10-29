import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seed() {
  console.log('Seeding demo accounts...');

  const passwordCustomer1 = await bcrypt.hash('Customer1@Demo26', 10);
  const passwordCustomer2 = await bcrypt.hash('Customer2@Demo26', 10);
  const passwordAdmin = await bcrypt.hash('Admin@Demo26', 10);

  // Upsert users
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

  console.log('Predefined demo accounts seeded:');
  console.log(' - Customer 1: customer1 / Customer1@Demo26');
  console.log(' - Customer 2: customer2 / Customer2@Demo26');
  console.log(' - Administrator: admin / Admin@Demo26');

  // Seed sample policies if none exist
  const existingPolicies = await prisma.policy.count();
  if (existingPolicies === 0) {
    console.log('Seeding initial demonstration policies and claims...');

    // Policy matching specification's illustrative example (SI: 10,00,000)
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

    // Policy for customer 2
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

    console.log('Sample policies and claims seeded successfully.');
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
