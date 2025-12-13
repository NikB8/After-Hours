
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function testRegister() {
    console.log("Simulating Register...");
    const email = `fail_test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Fail Tester';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const domain = email.split('@')[1];

        let companyId = null;
        let isCorporateVerified = false;

        console.log(`Looking up company for domain: ${domain}`);
        const company = await prisma.company.findUnique({
            where: { domain_name: domain }
        });
        if (company) {
            console.log("Company found:", company.id);
            companyId = company.id;
        }

        console.log("Starting Transaction...");
        const user = await prisma.$transaction(async (tx) => {
            console.log("Creating User...");
            const newUser = await tx.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    primary_company_id: companyId,
                    is_corporate_verified: false,
                    company_domain: domain
                },
            });
            console.log("User Created:", newUser.id);

            console.log("Looking up Player Role...");
            const playerRole = await tx.role.findUnique({ where: { name: 'Player' } });

            if (!playerRole) {
                console.error("CRITICAL: Player Role NOT FOUND. Seed might be missing.");
                throw new Error("Player Role missing");
            }
            console.log("Role Found:", playerRole.id);

            console.log("Assigning UserRole...");
            await tx.userRole.create({
                data: {
                    user_id: newUser.id,
                    role_id: playerRole.id,
                    company_id: companyId
                }
            });
            console.log("UserRole Created.");

            return newUser;
        });

        console.log("SUCCESS: User created", user.id);

    } catch (error) {
        console.error("FAIL: Registration Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testRegister();
