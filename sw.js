const CACHE='hvac-v1';
const ASSETS=['./','/index.html'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  // Network first for Google Fonts, cache fallback for everything else
  if(e.request.url.includes('fonts.googleapis.com')||e.request.url.includes('fonts.gstatic.com')||e.request.url.includes('cdnjs')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached=>{
        if(cached) return cached;
        return fetch(e.request).then(r=>{
          if(r.status===200){
            const clone=r.clone();
            caches.open(CACHE).then(c=>c.put(e.request,clone));
          }
          return r;
        }).catch(()=>caches.match('/index.html'));
      })
    );
  }
});
