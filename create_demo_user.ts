
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'demo@afterhours.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating/Updating demo user: ${email}`);

    // Ensure Role
    const role = await prisma.role.findUnique({ where: { name: 'Player' } });
    if (!role) throw new Error("Player role missing. Run seed.");

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            name: 'Demo User'
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Demo User',
            company_domain: 'afterhours.com',
            is_active: true
        }
    });

    // Ensure Role Link
    const existingRole = await prisma.userRole.findFirst({
        where: { user_id: user.id, role_id: role.id }
    });

    if (!existingRole) {
        await prisma.userRole.create({
            data: { user_id: user.id, role_id: role.id }
        });
        console.log('Role assigned.');
    } else {
        console.log('Role already assigned.');
    }

    console.log('Demo user ready.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
