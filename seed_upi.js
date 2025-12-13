
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Organizer UPI...');
    try {
        await prisma.user.update({
            where: { email: 'test_1765601718253@example.com' },
            data: { upi_id: 'nikhil@upi_mock' }
        });
        console.log('Success: Added UPI ID to nikhil@example.com');
    } catch (e) {
        console.error('Error seeding UPI:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
