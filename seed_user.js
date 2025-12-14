const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'nikhil@example.com';
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            company_domain: 'example.com',

            bio: 'Founder',
            is_super_admin: true
        },
    });
    console.log('Seeded user:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
