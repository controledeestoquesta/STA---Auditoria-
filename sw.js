/* Auditoria de Ruas – Santa Therezinha: funcionamento offline */
const VERSION = 'sta-v219';
/* arquivos que mudam a cada versão (pequenos) */
const CORE = ['./', './index.html', './style.css', './script.js', './manifest.json', './icon-192.png', './icon-512.png', './cesta.html', './liberacao.html', './devolucoes.html'];
/* arquivos estáticos e pesados (bibliotecas e bases fixas): baixados uma única vez e mantidos entre as versões.
   Para trocar um deles, mude o nome do arquivo (ex.: base-v2.js) ou a STATIC abaixo. */
const STATIC = 'sta-static-1';
const FIXOS = ['./base-v2.js', './lib/html2canvas.min.js', './lib/jspdf.umd.min.js', './lib/xlsx.full.min.js', './lib/chart.umd.min.js', './lib/three.min.js'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // cache:'reload' ignora o cache do navegador: a versão nova nunca guarda arquivos antigos
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    const s = await caches.open(STATIC);
    for (const u of FIXOS) { if (!(await s.match(u))) { try { const r = await fetch(u); if (r && r.ok) await s.put(u, r); } catch (err) { } } }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION && k !== STATIC) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // envios à planilha passam direto
  const u = new URL(req.url);
  if (u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return;
  if (u.origin === location.origin) { e.respondWith(u.pathname.endsWith('sw.js') ? fetch(req) : (/\/lib\/|\/base-v\d+\.js$|inventario_base\.json$/.test(u.pathname) ? staticFirst(req) : fastFirst(req))); return; }
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

// Arquivos estáticos do site: cópia permanente (sobrevive às versões novas).
async function staticFirst(req) {
  const s = await caches.open(STATIC);
  const m = await s.match(req, { ignoreSearch: true });
  if (m) return m;
  const r = await fetch(req);
  if (r && r.ok) s.put(req, r.clone());
  return r;
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
