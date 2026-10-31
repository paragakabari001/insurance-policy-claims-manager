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

  // Seed initial demo policies and claims safely if they do not exist
  console.log('Ensuring clean demonstration policies and claims...');

  const pol1 = await prisma.policy.findUnique({ where: { id: 'POL-1001' } });
  if (!pol1) {
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
  }

  const pol2 = await prisma.policy.findUnique({ where: { id: 'POL-1002' } });
  if (!pol2) {
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
  }

  const pol3 = await prisma.policy.findUnique({ where: { id: 'POL-1003' } });
  if (!pol3) {
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
  }

  // Ensure foreign keys stay synchronized even if user UUIDs were re-generated
  await prisma.policy.updateMany({
    where: { id: { in: ['POL-1001', 'POL-1003'] } },
    data: { customerId: customer1.id },
  });
  await prisma.policy.updateMany({
    where: { id: 'POL-1002' },
    data: { customerId: customer2.id },
  });

  console.log('Demo policies and claims verified and synchronized successfully.');
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
