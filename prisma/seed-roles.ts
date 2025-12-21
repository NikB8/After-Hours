
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = [
        { name: 'System_Admin', description: 'Administrator with full system access' },
        { name: 'Corporate_Admin', description: 'Administrator for a specific company' },
        { name: 'Organizer', description: 'User who organizes events' },
        { name: 'Player', description: 'Standard user who participates in events' },
        { name: 'Guest', description: 'Temporary user' },
    ];

    console.log('Start seeding roles...');

    for (const role of roles) {
        const upsertedRole = await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
                description: role.description,
            },
        });
        console.log(`Upserted role: ${upsertedRole.name}`);
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
