const CACHE_NAME = 'squadup-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through for now, can be enhanced for offline support later
    // We don't want to aggressively cache API calls or Next.js chunks without proper strategy
    if (event.request.method !== 'GET') return;
});
