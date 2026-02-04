// --- sw.js ---

// 1. UPDATE VERSION HERE - This controls the UI version number
const CACHE_NAME = "achik-learn-v1.0.13";

const ASSETS = [
  "./",
  "./index.html",      // FIXED: Added comma here
  "leaderboard.js",    // FIXED: Added comma here
  "rank-design.js",    // FIXED: Added comma here
  "rank.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// --- NEW: LISTEN FOR VERSION REQUEST FROM APP ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    // We clean the string to remove "achik-learn-" if you want just the number
    // Or just send CACHE_NAME directly.
    const cleanVersion = CACHE_NAME.replace('achik-learn-', ''); 
    
    if (event.source) {
      event.source.postMessage({
        type: 'VERSION_RESPONSE',
        version: cleanVersion // Sends "v1.0.12"
      });
    }
  }
});

// Install Service Worker
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Assets
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
