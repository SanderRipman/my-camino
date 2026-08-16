const CACHE='aidme-vida-shell-v1';
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  // Never cache API/Auth traffic or cross-origin requests. Sensitive portal data stays network-only.
  if(url.origin!==self.location.origin||url.pathname.includes('/functions/')||url.hostname.includes('supabase.co'))return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
    return response;
  }).catch(()=>caches.match(request).then(hit=>hit||caches.match('./index.html'))));
});
