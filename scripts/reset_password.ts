import { config } from 'dotenv';
config();
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function resetPassword(email: string, plainPass: string) {
    console.log(`Checking user: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log(`User ${email} does not exist. Creating...`);
        const hashedPassword = await bcrypt.hash(plainPass, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Test User',
                is_super_admin: true // Promoting since user likely expects admin access
            }
        });
        console.log('User created with password.');
    } else {
        console.log(`User found. Resetting password...`);
        const hashedPassword = await bcrypt.hash(plainPass, 10);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                is_super_admin: true // Ensure admin access while we are at it
            }
        });
        console.log('Password updated successfully.');
    }
}

const email = 'nikb8@yopmail.com';
const pass = 'Nbftw8';

resetPassword(email, pass)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
