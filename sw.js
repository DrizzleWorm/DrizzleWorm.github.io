importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js'
);
var cacheStorageKey = 'minimal-pwa-1';
var cacheList = ['/', 'index.html', 'main.css', 'inquire.jpg'];

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
});

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
