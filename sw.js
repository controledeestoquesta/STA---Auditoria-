/* Auditoria de Ruas – Santa Therezinha: funcionamento offline */
const VERSION = 'sta-v170';
const CORE = ['./', './index.html', './style.css', './script.js', './manifest.json', './icon-192.png', './icon-512.png',
  './lib/html2canvas.min.js', './lib/jspdf.umd.min.js', './lib/xlsx.full.min.js', './lib/chart.umd.min.js', './cesta.html', './liberacao.html', './devolucoes.html'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // cache:'reload' ignora o cache do navegador: a versão nova nunca guarda arquivos antigos
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // envios à planilha passam direto
  const u = new URL(req.url);
  if (u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return;
  if (u.origin === location.origin) { e.respondWith(u.pathname.endsWith('sw.js') ? fetch(req) : fastFirst(req)); return; }
  if (/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)) e.respondWith(cacheFirst(req));
});

// Site: tenta a versão nova (até 4 s); sem internet ou rede lenta, usa a cópia salva.
async function networkFirst(req) {
  const c = await caches.open(VERSION);
  const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; });
  net.catch(() => {});
  const cached = (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await c.match('./index.html') : undefined);
  if (!cached) return net;
  try { return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(0), 4000))]); }
  catch (e) { return cached; }
}

// Site: abre na hora com a cópia da versão instalada e atualiza a cópia em segundo plano.
// Versão nova chega pelo sw.js (outra VERSION): instala, assume e o app recarrega sozinho.
async function fastFirst(req) {
  const c = await caches.open(VERSION);
  const cached = (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? await c.match('./index.html') : undefined);
  if (cached) return cached;
  try { const r = await fetch(req, { cache: 'no-cache' }); if (r && r.ok) c.put(req, r.clone()); return r; } catch (e) { return networkFirst(req); }
}

// Bibliotecas e fontes: usa a cópia salva; baixa só na primeira vez.
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const m = await c.match(req);
  if (m) return m;
  const r = await fetch(req);
  if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone());
  return r;
}
