
self.addEventListener('push', function (event) {
    if (event.data) {
        const payload = event.data.json();

        const options = {
            body: payload.body,
            icon: '/icon-192.png',
            badge: '/badge.png',
            data: {
                url: payload.url // Store the URL in the notification data
            }
        };

        event.waitUntil(
            self.registration.showNotification(payload.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const url = event.notification.data.url;

            // Check if there's already a tab open with this URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
