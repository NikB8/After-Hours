
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Internal Module Data ---');

    console.log('1. Creating Clusters...');

    // Create North Cluster
    const northCluster = await prisma.cluster.create({
        data: {
            name: 'North Cluster',
            region: 'North'
        }
    });

    // Create South Cluster
    const southCluster = await prisma.cluster.create({
        data: {
            name: 'South Cluster',
            region: 'South'
        }
    });

    console.log(`✅ Created Clusters: ${northCluster.name}, ${southCluster.name}`);

    console.log('2. Assigning existing AMs to Clusters (Round Robin)...');

    const ams = await prisma.user.findMany({
        where: { role: UserRole.AM }
    });

    for (let i = 0; i < ams.length; i++) {
        const clusterId = i % 2 === 0 ? northCluster.id : southCluster.id;
        await prisma.user.update({
            where: { id: ams[i].id },
            data: { clusterId }
        });
        console.log(`  - Assigned ${ams[i].email} to ${i % 2 === 0 ? 'North' : 'South'}`);
    }

    console.log('3. Creating National Head...');

    const headEmail = 'national.head@example.com';
    const existingHead = await prisma.user.findUnique({ where: { email: headEmail } });

    if (!existingHead) {
        await prisma.user.create({
            data: {
                email: headEmail,
                name: 'National Head',
                role: UserRole.ADMIN // Assuming Admin role for Head unless specific role needed
            }
        });
        console.log(`✅ Created National Head: ${headEmail}`);
    } else {
        console.log(`  - National Head already exists.`);
    }

    console.log('--- Seeding Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
