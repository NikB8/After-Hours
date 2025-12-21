import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configure Web Push
// VAPID keys should be generated with `web-push generate-vapid-keys`
// and stored in environment variables.
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
} else {
    console.warn('VAPID keys are missing. Web Push notifications will not work.');
}

// Enum matching the schema comment: RSVP, PAYMENT, SYSTEM, REMINDER
export enum NotificationType {
    RSVP = 'RSVP',
    PAYMENT = 'PAYMENT',
    SYSTEM = 'SYSTEM',
    REMINDER = 'REMINDER',
}

interface NotifyUserArgs {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    url: string;
    triggerUserId?: string | null;
}

/**
 * Unified notification helper:
 * 1. Creates a notification record in the database.
 * 2. Fetches all push subscriptions for the recipient.
 * 3. Sends web push notifications to all subscriptions.
 * 4. Cleans up dead subscriptions (410 Gone).
 */
export async function notifyUser({
    recipientId,
    type,
    title,
    message,
    url,
    triggerUserId = null,
}: NotifyUserArgs) {
    try {
        // Step A: Create DB Record
        const notification = await prisma.notification.create({
            data: {
                recipientId: recipientId,
                type: type, // string in schema, enum here matches string values
                title: title,
                message: message,
                linkUrl: url,
                triggerUserId: triggerUserId,
                isRead: false,
            },
        });

        // Step B: Fetch Subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: recipientId },
        });

        if (!subscriptions || subscriptions.length === 0) {
            return { success: true, notification, pushedTo: 0 };
        }

        if (!publicVapidKey || !privateVapidKey) {
            console.warn('Skipping push notifications: VAPID keys not configured');
            return { success: true, notification, pushedTo: 0 };
        }

        // Step C: Send Push Notifications
        const payload = JSON.stringify({
            title,
            body: message,
            url, // The service worker should handle opening this URL on click
        });

        const pushPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
                return { status: 'fulfilled', id: sub.id };
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription is gone, delete it from DB
                    try {
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                        console.log(`Cleaned up dead subscription: ${sub.id}`);
                    } catch (deleteError) {
                        console.error('Failed to delete dead subscription:', deleteError);
                    }
                } else {
                    console.error('Error sending push notification:', error);
                }
                return { status: 'rejected', error, id: sub.id };
            }
        });

        await Promise.allSettled(pushPromises);

        return {
            success: true,
            notification,
            pushedTo: subscriptions.length,
        };

    } catch (error) {
        console.error('Error in notifyUser:', error);
        // Depending on requirements, we might want to throw or return false
        // For now, logging and rethrowing to let caller handle critical DB failures
        throw error;
    }
}
