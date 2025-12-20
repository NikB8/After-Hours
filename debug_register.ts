
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing bcrypt...');
        const hash = await bcrypt.hash('test', 10);
        console.log('Bcrypt hash success:', hash.substring(0, 10) + '...');

        console.log('Checking Role "Player"...');
        const role = await prisma.role.findUnique({ where: { name: 'Player' } });
        if (role) {
            console.log('Role found:', role);
        } else {
            console.log('ERROR: Role "Player" NOT FOUND. Registration will fail.');
        }
    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
