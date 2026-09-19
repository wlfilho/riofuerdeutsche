// Service worker do cronômetro de tour.
//
// Escopo /cronometro de propósito: o /sw.js na raiz deste projeto é um worker
// AUTO-DESTRUTIVO (limpa caches e se desregistra), e o site não usa service
// worker. Este aqui é a exceção, restrita à ferramenta de campo, e não deve
// jamais assumir o escopo da raiz.
//
// Offline aqui não é melhoria: Cristo, Floresta da Tijuca e Rocinha medem mal
// ou nada, e são as medições que mais interessam. Sem o shell em cache, abrir
// o app sem sinal mostraria a tela de dinossauro e o tour passaria sem dado.
//
// Estratégia, por tipo de pedido:
//   navegação  -> rede primeiro, cache como rede de segurança;
//   /_next/static/ -> cache primeiro (nome com hash, conteúdo imutável);
//   resto (API) -> passa direto, sem cache. Gravação nunca é servida de cache.

const CACHE = 'cronometro-v1';
const SHELL = '/cronometro';

self.addEventListener('install', event => {
  // Busca o shell já na instalação para que o PRIMEIRO uso offline funcione,
  // mesmo que o app tenha sido instalado e fechado sem navegar.
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.add(new Request(SHELL, { cache: 'reload' })))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(
        nomes.filter(n => n.startsWith('cronometro-') && n !== CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Chunks e CSS do build: nome carrega hash, então o que está em cache é
  // exatamente o que foi pedido. Cache primeiro deixa o app abrir sem rede.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }))
    );
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then(c => c.put(SHELL, copia));
          }
          return res;
        })
        // Sem rede: devolve o shell guardado. A tela sobe com o estado que
        // está em IndexedDB, que é onde o dia inteiro vive mesmo.
        .catch(() => caches.match(SHELL).then(hit => hit || Response.error()))
    );
  }
});
