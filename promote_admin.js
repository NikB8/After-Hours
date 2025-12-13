
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
    console.log("Promoting latest user to Admin...");

    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!user) {
        console.error("No user found!");
        return;
    }

    try {
        // 1. Set Boolean Flag
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { is_super_admin: true },
        });

        // 2. Assign System_Admin Role (New RBAC)
        const adminRole = await prisma.role.findUnique({ where: { name: 'System_Admin' } });
        if (adminRole) {
            // Check if the user already has the role
            const exists = await prisma.userRole.findFirst({
                where: { user_id: updatedUser.id, role_id: adminRole.id }
            });

            // If not, create the association
            if (!exists) {
                await prisma.userRole.create({
                    data: { user_id: updatedUser.id, role_id: adminRole.id, company_id: null } // Assuming company_id can be null for system roles
                });
            }
        }

        console.log(`Success! ${updatedUser.email} is now a Super Admin (and System_Admin role).`);
    } catch (error) {
        console.error("Error promoting user:", error);
    }
}

promoteToAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

