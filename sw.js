// sw.js - offline cache (demo)
const CACHE = "bookquest80s-v2";
const ASSETS = [
  "/index.html",
  "/dashboard.html",
  "/css/style.css",
  "/css/retro.css",
  "/js/firebaseConfig.js",
  "/js/auth.js",
  "/js/main.js",
  "/js/logros.js",
  "/js/ia.js",
  "/assets/sounds/click.wav",
  "/assets/sounds/levelup.wav",
  "/assets/img/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
