/* ==========================================================
   Intizom — Service Worker
   Maqsad: internet uzilganda ham ilova ochilsin.
   Strategiya:
     - HTML  -> avval tarmoq, bo'lmasa kesh (yangilanish tez yetadi)
     - qolgan fayllar -> avval kesh, fonda yangilanadi
     - Supabase/API so'rovlari -> keshlanmaydi
   Yangi versiya chiqarganda KESH raqamini oshiring.
   ========================================================== */
var KESH = 'intizom-v33';

var ASOSIY = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './bulut.js',
  './manifest.webmanifest',
  './icon-192.png',
  './favicon-32.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(KESH).then(function (c) {
      /* Bittasi topilmasa ham o'rnatish buzilmasin */
      return Promise.all(ASOSIY.map(function (u) {
        return c.add(u).catch(function () { return null; });
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nomlar) {
      return Promise.all(nomlar.map(function (n) {
        if (n !== KESH) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function tashqiMi(url) {
  /* Supabase, Telegram, ob-havo, YouTube va h.k. — hech qachon keshlanmaydi */
  return url.origin !== self.location.origin;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (tashqiMi(url)) return;                 /* API so'rovlari to'g'ridan-to'g'ri o'tadi */

  var htmlMi = req.mode === 'navigate' ||
               (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (htmlMi) {
    /* Avval tarmoq — shunda yangi versiya darhol yetadi */
    e.respondWith(
      fetch(req).then(function (r) {
        var nusxa = r.clone();
        caches.open(KESH).then(function (c) { c.put('./index.html', nusxa); });
        return r;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) {
          return r || caches.match('./');
        });
      })
    );
    return;
  }

  /* Qolgani: avval kesh, fonda yangilash */
  e.respondWith(
    caches.match(req).then(function (keshda) {
      var tarmoq = fetch(req).then(function (r) {
        if (r && r.status === 200 && r.type === 'basic') {
          var nusxa = r.clone();
          caches.open(KESH).then(function (c) { c.put(req, nusxa); });
        }
        return r;
      }).catch(function () { return keshda; });
      return keshda || tarmoq;
    })
  );
});
