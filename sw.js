const CACHE_NAME = 'cmpay-cache-v1';

// All paths are relative to work perfectly inside your subfolder
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.png'
];

// Install Event: Cache the App Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event: Clean up old caches if the version changes
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
  // CRITICAL: Do NOT cache API requests to Google Apps Script
  // This ensures your form submissions always work
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if found
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Optional: Return a fallback offline page here if you add one
        console.log('Network request failed and no cache available.');
      });
    })
  );
});
