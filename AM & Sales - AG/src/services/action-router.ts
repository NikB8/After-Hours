
import { PrismaClient, ActionPriority, ActionCategory, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ActionRouter {

    /**
     * Create Action Item and Route Logic
     * IF isInternal: Create Dashboard Notification (mock)
     * IF !isInternal: Create External Ticket (mock)
     */
    static async createAction(data: {
        description: string;
        priority: ActionPriority;
        category: ActionCategory;
        meetingId: string;
        assignedToId?: string; // Internal User ID
        isInternal: boolean;
        dueDate?: Date;
    }) {
        console.log(`[Action Router] Processing Action: "${data.description}" (Internal: ${data.isInternal})`);

        // 1. Create the Action Item Record
        const actionItem = await prisma.actionItem.create({
            data: {
                description: data.description,
                priority: data.priority,
                category: data.category,
                meetingId: data.meetingId,
                assignedToId: data.assignedToId,
                isInternal: data.isInternal,
                dueDate: data.dueDate
            }
        });

        // 2. Routing Logic
        if (data.isInternal) {
            // Scenario B: Internal Task
            // Create Dashboard Notification for the assigned owner
            if (data.assignedToId) {
                console.log(`  -> [Internal Route] Creating Dashboard Notification for User ${data.assignedToId}`);
                // In a real app: await NotificationService.createDashboardNotification(...)
            } else {
                console.warn(`  -> [Internal Route] Warning: Internal Action created without Assignee.`);
            }
        } else {
            // Scenario A: Client Ticket
            // Create Ticket in External System (Jira/Mock)
            console.log(`  -> [External Route] Creating Client Ticket...`);

            await prisma.ticket.create({
                data: {
                    actionItemId: actionItem.id,
                    status: TicketStatus.OPEN,
                    department: this.getDepartmentForCategory(data.category),
                    externalTicketId: `JIRA-${Math.floor(Math.random() * 1000)}`
                }
            });
        }

        return actionItem;
    }

    private static getDepartmentForCategory(category: ActionCategory): string {
        switch (category) {
            case ActionCategory.IT: return "IT_DEPT";
            case ActionCategory.MAINTENANCE: return "PROJECTS_DEPT";
            case ActionCategory.OPS: return "OPERATIONS_DEPT";
            case ActionCategory.HR: return "HR_DEPT";
            case ActionCategory.FINANCE: return "FINANCE_DEPT";
            case ActionCategory.LEADERSHIP: return "EXECUTIVE";
            default: return "GENERAL";
        }
    }
}
