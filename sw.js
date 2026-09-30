/* ==========================================================
   Intizom — Service Worker
   Maqsad: internet uzilganda ham ilova ochilsin + serverdan
   kelgan eslatmalar ilova yopiq bo'lsa ham ko'rinsin.
   Strategiya:
     - HTML  -> avval tarmoq, LEKIN 3 soniya kutib, javob
                kelmasa keshdagi nusxa beriladi (sekin mobil
                internetda ilova oq ekranda osilib qolmasin)
     - qolgan fayllar -> avval kesh, fonda yangilanadi
     - Supabase/API so'rovlari -> keshlanmaydi
     - push -> bildirishnoma ko'rsatiladi (30.09.2026)
   Yangi versiya chiqarganda KESH raqamini oshiring.
   ========================================================== */
var KESH = 'intizom-v104';

/* Tarmoqni qancha kutamiz. Bundan uzoq kutish foydasiz:
   keshda ishlaydigan nusxa turibdi. */
var HTML_KUTISH = 3000;

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
  /* Supabase, Telegram, ob-havo, shrift va h.k. — hech qachon keshlanmaydi */
  return url.origin !== self.location.origin;
}

/* Keshdagi HTML, u ham bo'lmasa oddiy offline sahifa.
   Ilgari ikkalasi ham bo'lmasa brauzerning o'z xato sahifasi
   chiqardi — foydalanuvchi ilova buzilgan deb o'ylardi. */
function htmlZaxira() {
  return caches.match('./index.html').then(function (r) {
    return r || caches.match('./').then(function (r2) {
      return r2 || new Response(
        '<!doctype html><html lang="uz"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Intizom</title></head><body style="font-family:system-ui;background:#F1F6F3;' +
        'color:#12332B;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        '<div style="text-align:center;padding:24px"><div style="font-size:44px">🎯</div>' +
        '<h1 style="font-size:20px;margin:10px 0 6px">Internet yo\'q</h1>' +
        '<p style="color:#5C7A72;font-size:15px;margin:0 0 18px">Ulanish tiklanganda ilova o\'zi ochiladi.</p>' +
        '<button onclick="location.reload()" style="padding:12px 22px;border:none;border-radius:12px;' +
        'background:#00C896;color:#fff;font-size:15px;font-weight:700">Qayta urinish</button></div></body></html>',
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    });
  });
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
    /* Avval tarmoq, lekin CHEKLANGAN vaqt. Ilgari bu yerda
       muddat yo'q edi: zaif mobil internetda fetch o'ndan ortiq
       soniya osilib turar, foydalanuvchi esa oq ekran ko'rardi —
       holbuki keshda ishlaydigan nusxa bor edi. */
    e.respondWith(new Promise(function (yechim) {
      var tugadi = false;
      function ber(r) { if (!tugadi) { tugadi = true; yechim(r); } }

      var soat = setTimeout(function () {
        htmlZaxira().then(ber);
      }, HTML_KUTISH);

      fetch(req).then(function (r) {
        clearTimeout(soat);
        /* Javob kech kelgan bo'lsa ham keshni yangilab qo'yamiz —
           keyingi ochilishda yangi versiya darhol beriladi. */
        try {
          var nusxa = r.clone();
          if (r.ok) caches.open(KESH).then(function (c) { c.put('./index.html', nusxa); });
        } catch (err) {}
        ber(r);
      }).catch(function () {
        clearTimeout(soat);
        htmlZaxira().then(ber);
      });
    }));
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

/* ==========================================================
   SERVERDAN KELGAN ESLATMA                    30.09.2026
   Ilgari eslatma faqat ilova OCHIQ turganda, sahifadagi
   taymer orqali chiqardi — ilova yopiq bo'lsa hech narsa
   kelmasdi. Endi Supabase'dagi cron push yuboradi, shu
   yerda qabul qilinadi va bildirishnoma ko'rsatiladi.
   ========================================================== */
self.addEventListener('push', function (e) {
  var m = { title: 'Intizom', body: 'Vaqti keldi', tag: 'intizom', url: './' };
  try {
    if (e.data) {
      var j = e.data.json();
      if (j && typeof j === 'object') {
        if (j.title) m.title = String(j.title);
        if (j.body)  m.body  = String(j.body);
        if (j.tag)   m.tag   = String(j.tag);
        if (j.url)   m.url   = String(j.url);
      }
    }
  } catch (err) {
    try { if (e.data) m.body = e.data.text(); } catch (e2) {}
  }

  e.waitUntil(
    self.registration.showNotification(m.title, {
      body: m.body,
      tag: m.tag,
      renotify: false,
      icon: './icon-192.png',
      badge: './favicon-32.png',
      vibrate: [180, 90, 180],
      requireInteraction: false,
      data: { url: m.url }
    })
  );
});

/* Bildirishnoma bosilganda: ilova ochiq bo'lsa o'shani oldinga
   chiqaramiz, yopiq bo'lsa ochamiz. Ikkita nusxa ochilib
   ketmasin. */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var manzil = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (royxat) {
      for (var i = 0; i < royxat.length; i++) {
        var c = royxat[i];
        if (c.url.indexOf(self.location.origin) === 0) {
          if ('focus' in c) {
            try { c.postMessage({ tur: 'eslatma', url: manzil }); } catch (err) {}
            return c.focus();
          }
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(manzil);
    })
  );
});

/* Push obunasi eskirsa brauzer yangisini beradi — ilova keyingi
   ochilishda uni serverga yozadi. Shu yerda faqat belgilab
   qo'yamiz. */
self.addEventListener('pushsubscriptionchange', function (e) {
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (royxat) {
      royxat.forEach(function (c) {
        try { c.postMessage({ tur: 'push_yangilansin' }); } catch (err) {}
      });
    })
  );
});
