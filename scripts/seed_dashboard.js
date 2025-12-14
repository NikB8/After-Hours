const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@yopmail.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log("User not found");
        return;
    }

    // Create 5 Hosted Events
    for (let i = 1; i <= 5; i++) {
        await prisma.event.create({
            data: {
                sport: 'Padel',
                start_time: new Date(Date.now() + i * 86400000), // +i days
                end_time: new Date(Date.now() + i * 86400000 + 3600000),
                venue_name: 'Downtown Courts Arena Center',
                max_players: 4,
                organizer_id: user.id,
                status: 'Open',
                is_active: true,
                map_link: 'https://maps.google.com',
                estimated_cost: 100
            }
        });
    }

    // Create 5 Events to RSVP to (organized by someone else? or same user for simplicity)
    // Let's create events organized by user, but create participants for them
    // Actually, "Your RSVPs" comes from `participant.findMany`.
    // We can just add the user as participant to the events we just created, or new ones.
    // Let's create new ones to distinguish.

    for (let i = 1; i <= 5; i++) {
        const event = await prisma.event.create({
            data: {
                sport: 'Badminton',
                start_time: new Date(Date.now() + (i + 5) * 86400000),
                end_time: new Date(Date.now() + (i + 5) * 86400000 + 3600000),
                venue_name: 'City Sports Complex',
                max_players: 2,
                organizer_id: user.id, // User organizing, but also participating? 
                // Usually "Your RSVPs" might exclude hosted? 
                // In page.tsx: prisma.participant.findMany({ where: { user_id: user.id } })
                // It shows all.
                status: 'Open',
                is_active: true,
                map_link: 'https://maps.google.com',
                estimated_cost: 100
            }
        });

        await prisma.participant.create({
            data: {
                event_id: event.id,
                user_id: user.id,
                status: 'Confirmed',
                payment_status: 'Paid',
                amount_due: 100
            }
        });
    }

    // Create 5 Clubs
    for (let i = 1; i <= 5; i++) {
        const club = await prisma.club.create({
            data: {
                name: `Weekend Warriors ${i}`,
                description: 'Fun weekend games',
                category: 'Sports',
                company_domain: 'example.com',
                created_by_id: user.id,
            }
        });

        await prisma.clubMember.create({
            data: {
                club_id: club.id,
                user_id: user.id,
                role: 'Member'
            }
        });
    }

    console.log("Seeding complete: 5 Hosted, 5 RSVPs, 5 Clubs");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
