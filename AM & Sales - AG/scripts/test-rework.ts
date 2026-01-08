import { PrismaClient, ClientCategory, UserRole } from '@prisma/client';
import { ReworkManager } from '../src/services/rework-service';

const prisma = new PrismaClient();
const manager = new ReworkManager();

async function main() {
    console.log("TEST: Starting Rework Workflow Test...");

    // 1. Setup Data (AM + Client)
    const am = await prisma.user.create({
        data: {
            email: `test-am-${Date.now()}@example.com`,
            role: UserRole.AM,
            name: "Test AM"
        }
    });

    const client = await prisma.client.create({
        data: {
            name: "Test Client Rework",
            crm_id: `REWORK-${Date.now()}`,
            region: "North",
            category: ClientCategory.CAT_A
        }
    });

    console.log(`TEST: Setup done. AM: ${am.id}, Client: ${client.id}`);

    // 2. Submit Request
    const request = await manager.submitRequest(am.id, client.id, "Need new wall paint");
    console.log(`TEST: Request Submitted. ID: ${request.id}, Status: ${request.status}`);

    // 3. Attach Cost Sheet
    const pendingRequest = await manager.attachCostSheet(request.id, 5000, "http://pdf.com/quote.pdf");
    console.log(`TEST: Cost Sheet Attached. Status: ${pendingRequest.status}`);

    // 4. Approve
    const approvedRequest = await manager.approveCostSheet(request.id);
    console.log(`TEST: Request Approved. Status: ${approvedRequest.status}`);

    if (approvedRequest.status === 'BILLING_TRIGGERED') {
        console.log("TEST: SUCCESS - Billing Triggered");
    } else {
        console.error("TEST: FAILED - Status Mismatch");
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
