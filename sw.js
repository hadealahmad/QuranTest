// Cache configuration
const CACHE_NAME = 'quran-quiz-v1';

// List of assets to cache for offline availability
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './data.js',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap'
];

/**
 * Service Worker Install Event
 * Caches all critical assets to ensure the app works offline.
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

/**
 * Service Worker Fetch Event
 * Intercepts network requests and serves cached resources if available.
 * Implements a "Cache First" strategy.
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
