importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js'
);
var cacheStorageKey = 'minimal-pwa-1';
var cacheList = ['/', 'index.html', 'main.css', 'inquire.jpg'];

self.addEventListener('install', (e) => {
  console.log('listen install');
  e.waitUntil(
    caches
      .open(cacheStorageKey)
      .then((cache) => {
        console.log('cache', cache);
        cache.addAll(cacheList);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', function(e) {
  console.log('listen fetch');
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response;
      }
      return fetch(e.request.url);
    })
  );
});
self.addEventListener('activate', function(e) {
  console.log('listen activate');
  e.waitUntil(
    //获取所有cache名称
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          // 获取所有不同于当前版本名称cache下的内容
          cacheNames
            .filter((cacheNames) => {
              return cacheNames !== cacheStorageKey;
            })
            .map((cacheNames) => {
              return caches.delete(cacheNames);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});
