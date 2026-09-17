const CACHE='airun-v54-core';
const CORE=[
  './','./index.html','./style.css?v=54','./app.js?v=54','./manifest.webmanifest',
  './assets/icon.svg','./assets/danang-runner-hero.svg','./assets/route-riverside.svg','./assets/route-coast.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  // Navigation may fall back to the app shell when offline.
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request).then(response=>{
        if(response.ok)caches.open(CACHE).then(cache=>cache.put('./index.html',response.clone()));
        return response;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  // IMPORTANT: never return index.html for JS/CSS/image requests.
  // Returning HTML as app.js was able to kill all button handlers.
  event.respondWith(
    fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(async()=>{
      const cached=await caches.match(event.request);
      return cached || Response.error();
    })
  );
});
