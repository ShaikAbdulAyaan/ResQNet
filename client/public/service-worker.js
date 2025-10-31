self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("resqnet-cache").then((cache) => {
      return cache.addAll(["/", "/index.html", "/logo.png"]);
    })
  );
  console.log("Service Worker installed");
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
