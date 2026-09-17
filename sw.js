// AIRUN V5.5 stability worker: intentionally self-removing.
// V5.5 temporarily disables offline caching while API/GPS behavior is stabilised.
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(key=>key.startsWith('airun-')).map(key=>caches.delete(key)));
      await self.registration.unregister();
      await self.clients.claim();
    }catch{}
  })());
});
