
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const organizerEmail = 'organizer@afterhours.com';
    const participantEmail = 'demo@afterhours.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Ensure Roles (Assuming 'Player' and 'Organizer' roles exist or just 'Player' is enough for basic features)
    // Actually, usually roles are 'Player', 'Captain', etc. Let's just rely on basic user creation.
    // Ideally we should assign a role if the system requires it. 'Player' seems standard.
    const role = await prisma.role.findFirst({ where: { name: 'Player' } });
    if (!role) throw new Error("Player role missing. Run seed.");

    // 2. Create/Update Organizer
    const organizer = await prisma.user.upsert({
        where: { email: organizerEmail },
        update: { password: hashedPassword, name: 'Test Organizer' },
        create: {
            email: organizerEmail,
            password: hashedPassword,
            name: 'Test Organizer',
            company_domain: 'afterhours.com',
            is_active: true
        }
    });

    // Assign Role to Organizer
    const orgRoleLink = await prisma.userRole.findFirst({ where: { user_id: organizer.id, role_id: role.id } });
    if (!orgRoleLink) await prisma.userRole.create({ data: { user_id: organizer.id, role_id: role.id } });

    // 3. Create/Update Participant
    const participant = await prisma.user.upsert({
        where: { email: participantEmail },
        update: { password: hashedPassword, name: 'Test Participant' },
        create: {
            email: participantEmail,
            password: hashedPassword,
            name: 'Test Participant',
            company_domain: 'afterhours.com',
            is_active: true
        }
    });

    // Assign Role to Participant
    const partRoleLink = await prisma.userRole.findFirst({ where: { user_id: participant.id, role_id: role.id } });
    if (!partRoleLink) await prisma.userRole.create({ data: { user_id: participant.id, role_id: role.id } });

    // 4. Create Event
    const eventRaw = await prisma.event.create({
        data: {
            organizer_id: organizer.id,
            sport: 'Badminton',
            // title and description removed per schema
            start_time: new Date(Date.now() + 86400000 * 7), // 7 days from now
            end_time: new Date(Date.now() + 86400000 * 7 + 7200000), // 2 hours duration
            venue_name: 'Sports Complex',
            map_link: 'https://maps.google.com',
            max_players: 10,
            status: 'Open',
            estimated_cost: 100,
        }
    });

    console.log(`Setup Complete.`);
    console.log(`Event ID: ${eventRaw.id}`);
    console.log(`Event URL: http://localhost:3000/events/${eventRaw.id}`);
    console.log(`Organizer: ${organizerEmail} / ${password}`);
    console.log(`Participant: ${participantEmail} / ${password}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
