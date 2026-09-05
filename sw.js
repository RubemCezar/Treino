/* Service worker do app de treino.
   Estratégia: a página tenta a rede primeiro (para pegar atualizações) e cai
   para o cache quando não há internet.
   Importante: o cache é montado item a item. Se um ícone faltar, o app continua
   funcionando offline — só aquele arquivo fica de fora. */
const V = "treino-v2";
const ESSENCIAL = ["./index.html", "./"];
const OPCIONAL  = ["./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    // o essencial precisa entrar; se a rede falhar aqui, tenta de novo na próxima visita
    await Promise.allSettled(ESSENCIAL.map(u => c.add(new Request(u, {cache: "reload"}))));
    await Promise.allSettled(OPCIONAL.map(u => c.add(new Request(u, {cache: "reload"}))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  // Navegação: rede primeiro, cache como rede de segurança
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(V);
        c.put("./index.html", res.clone());
        return res;
      } catch (err) {
        const c = await caches.open(V);
        return (await c.match("./index.html")) ||
               (await c.match("./")) ||
               new Response("<h1>App indisponível offline</h1><p>Abra uma vez com internet.</p>",
                            {headers: {"Content-Type": "text/html; charset=utf-8"}});
      }
    })());
    return;
  }

  // Demais arquivos: cache primeiro
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      const c = await caches.open(V);
      c.put(req, res.clone());
      return res;
    } catch (err) {
      return new Response("", {status: 504});
    }
  })());
});
