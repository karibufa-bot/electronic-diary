const CACHE='ediary-40-shell';
const ROOT=new URL('./',self.location.href);
const SHELL=['index.html','manifest.json','icon-192.png','icon-512.png'].map(x=>new URL(x,ROOT).href);

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));

self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ediary-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener('fetch',e=>{
if(e.request.method!=='GET')return;
const url=new URL(e.request.url);
if(url.origin!==ROOT.origin)return;
if(e.request.mode==='navigate'&&(url.pathname===ROOT.pathname||url.pathname===new URL('index.html',ROOT).pathname)){
e.respondWith(fetch(e.request).catch(()=>caches.match(SHELL[0])));
return;
}
if(SHELL.includes(url.href))e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});

self.addEventListener('push',e=>e.waitUntil(self.registration.showNotification('Электронный дневник',{
body:'Есть новые оценки или задания. Откройте дневник.',
icon:new URL('icon-192.png',ROOT).href,
tag:'diary-update'
})));

self.addEventListener('notificationclick',e=>{
e.notification.close();
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
const w=list.find(c=>c.url.startsWith(ROOT.href));
return w?w.focus():clients.openWindow(new URL('index.html',ROOT).href);
}));
});
