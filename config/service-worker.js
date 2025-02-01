self.addEventListener('install', event => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open('static-cache').then(cache => {
            return cache.addAll([
                '/assets/img/icon.png' // Icon
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});