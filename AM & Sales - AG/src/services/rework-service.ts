import { PrismaClient, ReworkStatus } from '@prisma/client';

const prisma = new PrismaClient();

class BillingAdapter {
    static async triggerSupplementaryBill(clientId: string, amount: number) {
        console.log(`[Billing System] Triggering One-time setup fee of ${amount} for Client ${clientId}`);
        // Real implementation would call external API
    }
}

export class ReworkManager {

    async submitRequest(amId: string, clientId: string, description: string) {
        return prisma.reworkRequest.create({
            data: {
                amId,
                clientId,
                description,
                status: ReworkStatus.REQUESTED,
            },
        });
    }

    async attachCostSheet(requestId: string, amount: number, pdfUrl: string) {
        // 1. Create Cost Sheet
        // 2. Update Status -> CLIENT_APPROVAL_PENDING
        return prisma.$transaction(async (tx) => {
            await tx.costSheet.create({
                data: {
                    reworkRequestId: requestId,
                    amount,
                    pdfUrl,
                }
            });

            return tx.reworkRequest.update({
                where: { id: requestId },
                data: { status: ReworkStatus.CLIENT_APPROVAL_PENDING }
            });
        });
    }

    async approveCostSheet(requestId: string) {
        const request = await prisma.reworkRequest.findUnique({
            where: { id: requestId },
            include: { costSheet: true }
        });

        if (!request || !request.costSheet) {
            throw new Error("Invalid Request or Cost Sheet missing");
        }

        // Trigger External Billing
        await BillingAdapter.triggerSupplementaryBill(request.clientId, Number(request.costSheet.amount));

        return prisma.reworkRequest.update({
            where: { id: requestId },
            data: { status: ReworkStatus.BILLING_TRIGGERED }
        });
    }
}
