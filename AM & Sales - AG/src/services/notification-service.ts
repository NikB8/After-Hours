import { PrismaClient, ClientCategory, TicketStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {

    // Helper to mock email sending
    private static async mockSendEmail(to: string, subject: string, body: string) {
        console.log(`\n[Notification System] 📧 SENDING EMAIL`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log(`[Notification System] ✅ SENT\n`);
    }

    /**
     * Broadcast AM Leave
     * Fetches all assigned Clients and sends a standardized email template to their SPOCs.
     */
    static async broadcastAMLeave(amId: string, startDate: string, endDate: string) {
        console.log(`[Notification System] Broadcasting leave for AM ${amId}...`);

        const amUser = await prisma.user.findUnique({ where: { id: amId } });

        if (!amUser) {
            console.error(`[Notification System] AM User not found: ${amId}`);
            return;
        }

        // Find all clients where this user is assigned
        const teamAssignments = await prisma.clientTeam.findMany({
            where: { userId: amId },
            include: { client: true }
        });

        if (teamAssignments.length === 0) {
            console.log(`[Notification System] AM ${amUser.name} has no assigned clients.`);
            return;
        }

        for (const assignment of teamAssignments) {
            const client = assignment.client;

            if (client.spocEmail) {
                await this.mockSendEmail(
                    client.spocEmail,
                    `Important Update: Account Manager Leave`,
                    `Dear ${client.name} Team,\n\nThis is to inform you that your Account Manager, ${amUser.name}, will be on leave from ${startDate} to ${endDate}.\n\nFor urgent matters, please contact the Cluster Lead.\n\nRegards,\nAfter Hours Team`
                );
            } else {
                console.warn(`[Notification System] Client ${client.name} has no SPOC email configured.`);
            }
        }
    }

    /**
     * SLA Breach Alert
     * Alerts the ClusterLead if a Ticket in a Category A client is open > 48 hours.
     */
    static async checkSLABreach() {
        console.log(`[Notification System] Checking for SLA breaches...`);

        // 48 hours ago
        const deadline = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const breachedTickets = await prisma.ticket.findMany({
            where: {
                status: TicketStatus.OPEN,
                createdAt: {
                    lt: deadline
                },
                actionItem: {
                    meeting: {
                        client: {
                            category: ClientCategory.CAT_A
                        }
                    }
                }
            },
            include: {
                actionItem: {
                    include: {
                        meeting: {
                            include: {
                                client: {
                                    include: {
                                        team: {
                                            include: { user: true } // Need to find Cluster Lead
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(`[Notification System] Found ${breachedTickets.length} breached tickets.`);

        for (const ticket of breachedTickets) {
            const client = ticket.actionItem.meeting.client;

            // Find Cluster Lead for this client
            const clusterLead = client.team.find(t => t.user.role === UserRole.CLUSTER_LEAD);

            if (clusterLead) {
                await this.mockSendEmail(
                    clusterLead.user.email,
                    `SLA BREACH ALERT: Ticket ${ticket.id}`,
                    `Ticket ${ticket.id} for CAT_A Client "${client.name}" has been OPEN for more than 48 hours.\n\nPlease intervene immediately.`
                );
            } else {
                console.warn(`[Notification System] Alert: Client ${client.name} has no Cluster Lead assigned!`);
            }
        }
    }
}
