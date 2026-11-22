// AcePrep 2.0.2: remove stale offline service worker and its old script caches.
// Saved interview answers and progress remain untouched in localStorage.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('aceprep-')).map(key => caches.delete(key)));
  await self.registration.unregister();
  const clients = await self.clients.matchAll({type: 'window'});
  await Promise.all(clients.map(client => client.navigate(client.url).catch(() => {})));
})()));
