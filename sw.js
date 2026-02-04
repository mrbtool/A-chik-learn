// --- sw.js ---

// 🔥 CHANGE VERSION EVERY UPDATE
const CACHE_NAME = "achik-learn-v1.0.13";

const ASSETS = [
  "/",
  "/index.html",
  "/leaderboard.js",
  "/rank-design.js",
  "/rank.js",
  "/manifest.json",

  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];


// ======================
// INSTALL
// ======================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets:", CACHE_NAME);
      return cache.addAll(ASSETS);
    })
  );
});


// ======================
// ACTIVATE (delete old cache)
// ======================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  return self.clients.claim();
});


// ======================
// FETCH (fast + offline)
// ======================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
