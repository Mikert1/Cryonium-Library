self.addEventListener('install', event => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open('static-cache').then(cache => {
            return cache.addAll([
                '/', // Root page
                '/index.html', // HTML file
                '/style.css', // CSS file
                '/script.js', // JavaScript file
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