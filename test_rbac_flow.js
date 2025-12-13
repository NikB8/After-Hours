
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRBAC() {
    console.log("Starting RBAC Verification...");
    const email = `rbac_test_${Date.now()}@acme.com`;
    const domain = 'acme.com';

    try {
        // 1. Setup Company
        console.log("1. Creating Company 'acme.com'...");
        const company = await prisma.company.upsert({
            where: { domain_name: domain },
            update: {},
            create: { domain_name: domain }
        });
        console.log("   -> Company ID:", company.id);

        // 2. Simulate Registration Logic
        console.log("2. Simulating Registration...");
        const playerRole = await prisma.role.findUnique({ where: { name: 'Player' } });
        if (!playerRole) throw new Error("Player Role not found! Run seed.");

        const user = await prisma.user.create({
            data: {
                email,
                name: 'RBAC Tester',
                primary_company_id: company.id,
                company_domain: domain,
                // Assign Role Inline? No, prompt used UserRole table.
            }
        });

        await prisma.userRole.create({
            data: {
                user_id: user.id,
                role_id: playerRole.id,
                company_id: company.id
            }
        });
        console.log("   -> User Created with Player Role.");

        // 3. Verify Player Role
        const checkRoles = await prisma.userRole.findMany({
            where: { user_id: user.id },
            include: { role: true }
        });
        console.log("   -> Roles:", checkRoles.map(r => r.role.name));
        if (!checkRoles.some(r => r.role.name === 'Player')) throw new Error("FAIL: Player role missing.");

        // 4. Simulate Event Create Logic (Organizer Upgrade)
        console.log("3. Simulating Event Creation (Organizer Upgrade)...");
        const organizerRole = await prisma.role.findUnique({ where: { name: 'Organizer' } });

        // Upgrade User
        if (organizerRole) {
            await prisma.userRole.create({
                data: {
                    user_id: user.id,
                    role_id: organizerRole.id,
                    company_id: company.id
                }
            });
        }

        // Create Event
        const event = await prisma.event.create({
            data: {
                organizer_id: user.id,
                company_id: company.id,
                sport: 'Tennis',
                start_time: new Date(),
                end_time: new Date(),
                venue_name: 'Test Court',
                map_link: 'http://maps.google.com',
                max_players: 4,
                estimated_cost: 100,
                status: 'Draft'
            }
        });
        console.log("   -> Event Created:", event.id);

        // 5. Final Check
        const finalRoles = await prisma.userRole.findMany({
            where: { user_id: user.id },
            include: { role: true }
        });
        console.log("   -> Final Roles:", finalRoles.map(r => r.role.name));

        if (finalRoles.length < 2) throw new Error("FAIL: Should have both Player and Organizer roles.");

        console.log("SUCCESS: RBAC Logic Verified.");

    } catch (e) {
        console.error("FAIL:", e);
    } finally {
        // Cleanup? Optional.
        await prisma.$disconnect();
    }
}

testRBAC();
