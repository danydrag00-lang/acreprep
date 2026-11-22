// Network-first keeps updated research-agent content visible after a refresh.
// Last successful copies remain available for offline interview study.
const CACHE = 'aceprep-v7-secure-groq';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './coach-content.js', './agent.js', './icon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('aceprep-') && name !== CACHE).map(name => caches.delete(name)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(async response => {
    if (response.ok) {const cache = await caches.open(CACHE);cache.put(event.request,response.clone()).catch(()=>{});}
    return response;
  }).catch(() => caches.match(event.request)));
});
