const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'nikhil@example.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log("User not found");
        return;
    }

    const hostedCount = await prisma.event.count({ where: { organizer_id: user.id } });
    const rsvpCount = await prisma.participant.count({ where: { user_id: user.id } });
    const clubCount = await prisma.clubMember.count({ where: { user_id: user.id } });

    console.log(`Hosted: ${hostedCount}`);
    console.log(`RSVPs: ${rsvpCount}`);
    console.log(`Clubs: ${clubCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
