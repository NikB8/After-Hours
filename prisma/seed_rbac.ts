
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = [
        'System_Admin',
        'Corporate_Admin',
        'Organizer',
        'Player',
        'Guest'
    ];

    console.log('Seeding Roles...');
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName }
        });
    }
    console.log('Roles seeded.');

    // Optional: Seed a default company
    // await prisma.company.upsert({ ... })
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
