import { config } from 'dotenv';
config();
import { prisma } from '../lib/prisma';

async function main() {
    const superAdmins = await prisma.user.findMany({
        where: { is_super_admin: true },
        select: { email: true, id: true, is_super_admin: true }
    });
    console.log('Super Admins:', superAdmins);

    // Also check for System_Admin role
    const systemAdmins = await prisma.userRole.findMany({
        where: { role: { name: 'System_Admin' } },
        include: { user: { select: { email: true } } }
    });
    console.log('System Admins (Role):', systemAdmins.map(sa => sa.user.email));
}

main().catch(console.error).finally(() => prisma.$disconnect());
