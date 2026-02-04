// --- sw.js ---
const CACHE_NAME = "achik-learn-v1.0.12";

const ASSETS = [
  "./",
  "./index.html",
  "./leaderboard.js",
  "./rank-design.js",
  "./rank.js",
  "./navbar.js",
  "./auth.js"
];

// Install Event
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use map to catch errors on individual files so the whole SW doesn't fail
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn("SW: Could not cache", url, err));
        })
      );
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

// Fetch Event
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => {
          // If both fail, return nothing (prevents ERR_FAILED)
          return new Response("Offline content not available");
      });
    })
  );
});
