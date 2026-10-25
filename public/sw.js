self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.delete('echo-v1').then(()=>self.registration.unregister())));
