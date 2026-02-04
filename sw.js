// --- sw.js ---

// 1. UPDATE VERSION HERE (Must match index.html version)
const CACHE_NAME = "achik-learn-v1.0.13";

const ASSETS = [
  "./",
  "./index.html"
  "leaderboard.js"
  "rank-design.js"
  "rank.js",

  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// Install Service Worker
self.addEventListener("install", (e) => {
  // Forces this new service worker to activate immediately, skipping the "waiting" state
  self.skipWaiting();
  
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching new assets for version:', CACHE_NAME);
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event - CRITICAL: This cleans up the old 'achik-learn-v2' cache
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // If the cache key isn't the new one, delete it
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Tell the SW to take control of the page immediately
  return self.clients.claim();
});

// Fetch Assets
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(e.request);
    })
  );
});
