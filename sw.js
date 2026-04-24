const CACHE = "enduro-atleta-v1";
const ASSETS = ["/", "/index.html", "/manifest.json"];

// Instala e faz cache dos assets principais
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve do cache quando offline, busca da rede quando online
self.addEventListener("fetch", e => {
  // Não intercepta requisições ao Supabase
  if(e.request.url.includes("supabase.co")) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        // Salva no cache para uso futuro
        if(response.ok && e.request.method === "GET"){
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached || caches.match("/index.html"));
    })
  );
});
