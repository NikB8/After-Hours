import { PrismaClient, UserRole, ClientCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a User (Account Manager)
  const amUser = await prisma.user.upsert({
    where: { email: 'am@example.com' },
    update: {},
    create: {
      email: 'am@example.com',
      name: 'John Doe',
      role: UserRole.AM,
    },
  });

  console.log(`Created User: ${amUser.name} (${amUser.role})`);

  // 2. Define Clients to create (One of each category)
  const clientsData = [
    { name: 'Alpha Corp', crm: 'CRM-001', region: 'North', cat: ClientCategory.CAT_A },
    { name: 'Beta Ltd', crm: 'CRM-002', region: 'South', cat: ClientCategory.CAT_B },
    { name: 'Gamma Inc', crm: 'CRM-003', region: 'East', cat: ClientCategory.CAT_C },
    { name: 'Delta LLC', crm: 'CRM-004', region: 'West', cat: ClientCategory.CAT_D },
  ];

  for (const c of clientsData) {
    // Create Client
    const client = await prisma.client.upsert({
      where: { crm_id: c.crm },
      update: {},
      create: {
        name: c.name,
        crm_id: c.crm,
        region: c.region,
        category: c.cat,
        // Initialize empty lifecycle
        lifecycle: {
          create: {}, 
        },
      },
    });

    // Assign the AM to this Client
    await prisma.clientTeam.upsert({
      where: {
        clientId_userId: {
          clientId: client.id,
          userId: amUser.id,
        },
      },
      update: {},
      create: {
        clientId: client.id,
        userId: amUser.id,
        responsibility: 'Primary Account Manager',
      },
    });

    console.log(`Created Client: ${client.name} [${client.category}] with AM assigned.`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
