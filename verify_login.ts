
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Environment Variables...");
    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            console.log("DEBUG: SCRIPT DB config:", {
                protocol: url.protocol,
                host: url.hostname,
                port: url.port,
                user: url.username,
                passLength: url.password.length,
                dbName: url.pathname
            });
        } catch (e) {
            console.error("DEBUG: Failed to parse DATABASE_URL");
        }
    }

    const email = `test_auth_${Date.now()}@test.com`;
    const password = 'password123';

    console.log(`\n1. Simulating Register for ${email}...`);

    try {
        // Hash
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('   Hash generated:', hashedPassword);

        // Create
        // Need to ensure Role exists first or we fail like before
        // But assuming seed ran, it should be fine. But let's check manually here to be safe
        const role = await prisma.role.findUnique({ where: { name: 'Player' } });
        if (!role) throw new Error("Role Player missing");

        const user = await prisma.user.create({
            data: {
                email,
                name: 'Test Auth User',
                password: hashedPassword,
                company_domain: 'test.com'
                // skipping roles for simplicity unless mandatory? 
                // In register route we add roles. Let's add it here too to match.
            }
        });

        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role_id: role.id
            }
        });

        console.log('   User created:', user.id);

        console.log('2. Simulating Login...');
        const loginUser = await prisma.user.findUnique({ where: { email } });
        if (!loginUser || !loginUser.password) throw new Error("User not found or no password");

        const isValid = await bcrypt.compare(password, loginUser.password);
        console.log(`   Password valid? ${isValid}`);

        if (isValid) {
            console.log('SUCCESS: Login logic works.');
        } else {
            console.log('FAILURE: Invalid credentials.');
        }

    } catch (e) {
        console.error('ERROR during simulation:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
