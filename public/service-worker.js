// Cache version for app shell updates.
const CACHE_NAME = "fluttr-v12";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/search.html",
  "/search.js",
  "/butterfly.html",
  "/butterfly.js",
  "/about.html",
  "/submit.html",
  "/signin.html",
  "/signin.js",
  "/signup.html",
  "/signup.js",
  "/auth.js",
  "/manifest.json",
  "/images/Ambrax swallowtail.jpg",
  "/images/Black-spotted white.jpg",
  "/images/Blue triangle.jpg",
  "/images/blue-tiger.jpg",
  "/images/cairns-birdwing.jpg",
  "/images/Caper white.jpg",
  "/images/Chequered swallowtail.jpg",
  "/images/Clearwing swallowtail.jpg",
  "/images/Dainty swallowtail.jpg",
  "/images/Fuscus swallowtail.jpg",
  "/images/Green triangle.jpg",
  "/images/Green-spotted triangle.jpg",
  "/images/Lemon migrant.jpg",
  "/images/New Guinea or common green birdwing.jpg",
  "/images/Orchard swallowtail.jpg",
  "/images/Pale triangle.jpg",
  "/images/Red-banded Jezebel.jpg",
  "/images/Red-bodied swallowtail.jpg",
  "/images/Richmond birdwing.jpg",
  "/images/Scarlet Jezebel.jpg",
  "/images/Southern pearl-white.jpg",
  "/images/ulysses.jpg",
  "/images/White or common albatross.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

// Use cache first for static assets.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}

// Use network first for API requests with offline fallback.
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
