const CACHE='aidme-vida-shell-v5-20260905c';
const SHELL=['./','./index.html','./styles.css?v=20260817b','./app.js?v=20260817b','./manifest.webmanifest?v=20260817b'];

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
  if(url.origin!==self.location.origin||url.pathname.includes('/functions/')||url.hostname.includes('supabase.co'))return;
  event.respondWith(fetch(request,{cache:'no-cache'}).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
    return response;
  }).catch(()=>caches.match(request).then(hit=>hit||caches.match('./index.html'))));
});
