const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Users ---");
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
    });
    console.table(users);

    const email = 'admin@yopmail.com';
    const targetUser = users.find(u => u.email === email);

    // Search for 'NB'
    const nbUser = users.find(u => u.name && u.name.startsWith("NB"));
    if (nbUser) {
        console.log(`\nFound possible user for 'NB': ${nbUser.name} (${nbUser.email})`);
    }

    if (targetUser) {
        console.log(`\n--- Data for ${email} (${targetUser.id}) ---`);

        const hosted = await prisma.event.findMany({
            where: { organizer_id: targetUser.id },
            select: { id: true, sport: true, start_time: true }
        });
        console.log(`Hosted Events (${hosted.length}):`);
        console.table(hosted);

        const rsvps = await prisma.participant.findMany({
            where: { user_id: targetUser.id },
            include: { event: { select: { sport: true } } }
        });
        console.log(`RSVPs (${rsvps.length}):`);
        console.table(rsvps.map(p => ({ id: p.id, event: p.event.sport, status: p.status })));

        const clubs = await prisma.clubMember.findMany({
            where: { user_id: targetUser.id },
            include: { club: { select: { name: true } } }
        });
        console.log(`Clubs (${clubs.length}):`);
        console.table(clubs.map(c => ({ id: c.id, club: c.club.name, role: c.role })));
    } else {
        console.log(`\nUser ${email} NOT FOUND.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
