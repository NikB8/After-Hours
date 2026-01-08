
import { PrismaClient, MeetingType, MeetingScope, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class MeetingService {

    /**
     * Get Default Attendees for Bulk Invites
     * logic for fetching relevant users based on internal meeting type.
     * @param type MeetingType (CLUSTER_REVIEW | PAN_INDIA_REVIEW)
     * @param scope MeetingScope (INTERNAL_CLUSTER | INTERNAL_PAN_INDIA)
     * @param refId Cluster ID (required for CLUSTER_REVIEW)
     */
    static async getDefaultAttendees(type: MeetingType, scope: MeetingScope, refId?: string): Promise<string[]> {
        console.log(`[Meeting Service] Fetching attendees for ${scope} - ${type}`);

        if (scope === MeetingScope.INTERNAL_CLUSTER && type === MeetingType.CLUSTER_REVIEW) {
            if (!refId) {
                throw new Error("Cluster ID (refId) is required for Cluster Reviews");
            }

            // Fetch all users in this Cluster
            const users = await prisma.user.findMany({
                where: { clusterId: refId },
                select: { id: true }
            });

            return users.map(u => u.id);
        }

        if (scope === MeetingScope.INTERNAL_PAN_INDIA && type === MeetingType.PAN_INDIA_REVIEW) {
            // Fetch Leadership (National Head/Admin + Cluster Leads)
            const users = await prisma.user.findMany({
                where: {
                    role: {
                        in: [UserRole.CLUSTER_LEAD, UserRole.ADMIN]
                    }
                },
                select: { id: true }
            });

            return users.map(u => u.id);
        }

        return [];
    }
}
