const CACHE='kenliao-202611100733';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url); if(url.origin!==self.location.origin) return;
  if(url.pathname.includes('/lib/')) return; // 素材库的音频/原文不进离线缓存：下载后存在 IndexedDB 里
  const key = req.mode==='navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(key);
    const fresh=fetch(req).then(res=>{ if(res&&res.ok) c.put(key,res.clone()); return res; }).catch(()=>null);
    return cached || (await fresh) || new Response('离线且没有缓存，请先联网打开一次', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }));
});
