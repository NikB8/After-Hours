
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB...');
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Successfully connected.');
        if (users.length > 0) {
            console.log('User found:', users[0].email);
            console.log('is_super_admin:', users[0].is_super_admin);
        } else {
            console.log('No users found.');
        }
    } catch (e) {
        console.error('DB Connection Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
