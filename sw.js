const CACHE='aceprep-v8-fixed';
const ASSETS=['/','/index.html','/styles.css','/app.js','/coach-content.js','/agent.js','/icon.svg','/manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aceprep-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/'))return;
 if(!ASSETS.includes(url.pathname))return;
 e.respondWith(fetch(e.request).then(response=>{
   if(response.ok){const copy=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}
   return response;
 }).catch(()=>caches.match(e.request)));
});
