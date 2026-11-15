const CACHE = "shift-miles-v2";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "icon-180.png", "manifest.webmanifest"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// Network first so updates show up; fall back to the saved copy when there is no signal.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Address and route lookups always go straight to the network and are never stored.
  if (/nominatim\.openstreetmap\.org|router\.project-osrm\.org/.test(e.request.url)) return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
