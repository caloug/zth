// ZTH Stats service worker: offline app shell + fresh stats when online.
const CACHE = 'zth-v25';
const SHELL = ['./', './index.html', './assets/css/styles.css', './assets/css/chrome.css', './assets/css/bars.css', './assets/js/app.js', './manifest.webmanifest', './fonts/LilitaOne.woff2',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;              // CDN images: straight to network
  const isData = url.pathname.endsWith('.json') || /\.(css|js)$/.test(url.pathname);
  if (req.mode === 'navigate' || isData) {                 // network-first: fresh app + fresh stats
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then((m) => m || caches.match('./index.html'))));
  } else {                                                  // static assets: cache-first
    e.respondWith(caches.match(req).then((m) => m || fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })));
  }
});
