/* ============================================================
   INTIZOM — Bulut sinxron + Email KOD (OTP) bilan kirish
   Ilova kodiga tegmaydi. Ustidan ishlaydi.
     1) Birinchi kirish: email -> 6 xonali kod -> ichkariga
     2) Keyin xohlasa: sozlamalardan parol qo'yadi (parol bilan tez kiradi)
     - kirgach: serverdan ma'lumot -> localStorage -> render
     - har o'zgarishda: localStorage -> serverga saqlash (debounce)
   ============================================================ */
(function () {
  "use strict";

  var SUPA_URL = "https://kqtonpusgorwfqktbeto.supabase.co";
  var SUPA_KEY = "sb_publishable_bclhi6PMaXkdYB5JvpqCIQ_YpB5GJGN";
  var TABLE = "intizom_data";
  window.BULUT_VERSIYA = "35";   /* har o'zgarishda oshiriladi */

  // ---- localStorage kalitlarini yig'ish ----
  function collect() {
    var skip = { i_pin_session: 1, i_parol_ok: 1, i_parol: 1, i_vaqt_versiya: 1, i_soat_farqi: 1 };
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("i_") === 0 && !skip[k]) data[k] = localStorage.getItem(k);
    }
    return data;
  }
  function apply(data) {
    if (!data) return;
    Object.keys(data).forEach(function (k) {
      try { localStorage.setItem(k, data[k]); } catch (e) {}
    });
  }

  function loadSb() {
    return new Promise(function (res, rej) {
      if (window.supabase && window.supabase.createClient) return res();
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload = res;
      s.onerror = function () { rej(new Error("Supabase kutubxonasi yuklanmadi")); };
      document.head.appendChild(s);
    });
  }

  var SKIP_SYNC = { i_pin_session: 1, i_parol_ok: 1, i_parol: 1, i_vaqt_versiya: 1, i_soat_farqi: 1 };

  /* ============================================================
     VAQT TAMG'ALARI (06.09.2026)
     Ilgari bulut ma'lumoti mahalliy ma'lumot ustiga so'zsiz
     yozilardi. Ikki qurilmada ishlatilsa yoki yangi yozuv
     yuklanishga ulgurmasa — u yo'qolardi.
     Endi har kalit qachon o'zgargani yozib boriladi va
     sinxronlashda faqat YANGIROG'I qoladi.
     ============================================================ */
  var VAQT_KEY = "i_kalit_vaqt";
  var _rawSet = localStorage.setItem.bind(localStorage);

  /* ------------------------------------------------------------
     SOAT FARQI
     Vaqt tamg'asi qurilma soatidan olinadi. Agar birovning
     qurilmasida sana noto'g'ri bo'lsa, uning ma'lumoti doim "eng
     yangi" bo'lib chiqib, boshqasini bosib ketardi. obuna_holat()
     server vaqtini qaytaradi \u2014 farqni hisoblab, tuzatamiz.
     ------------------------------------------------------------ */
  var soatFarqi = 0;
  try {
    var _sf = localStorage.getItem("i_soat_farqi");
    if (_sf) soatFarqi = parseInt(_sf, 10) || 0;
  } catch (e) {}

  function serverVaqtiBelgila(serverVaqt) {
    if (!serverVaqt) return;
    var s = new Date(serverVaqt).getTime();
    if (!s) return;
    var farq = s - Date.now();
    /* 30 soniyagacha farq oddiy kechikish \u2014 e'tiborsiz qoldiramiz */
    soatFarqi = Math.abs(farq) > 30000 ? farq : 0;
    try { _rawSet("i_soat_farqi", String(soatFarqi)); } catch (e) {}
  }

  function hozir() { return Date.now() + soatFarqi; }

  /* Ilova yuklanayotganda o'nlab kalitni qaytadan yozadi — qiymat
     mazmunan o'sha, lekin matn sifatida biroz farq qiladi (JSON
     tartibi, standart qiymatlar). Ilgari bular ham "o'zgardi" deb
     belgilanardi va ilovani ochgan qurilma hamma narsani "eng yangi"
     qilib olardi. Endi tamg'a FAQAT foydalanuvchi ekranga tekkanidan
     keyin qo'yiladi — haqiqiy tahrir doim bosish yoki yozishdan
     keyin bo'ladi, yuklanish esa bo'lmaydi. */
  var tegildi = false;
  ["pointerdown", "keydown", "touchstart"].forEach(function (e) {
    window.addEventListener(e, function () { tegildi = true; }, { once: true, capture: true });
  });

  /* Birinchi versiyada tamg'alar ilova yuklanganda ham qo'yilardi,
     natijada bir qurilmadagi butun ma'lumot bir zumda "eng yangi"
     bo'lib qolgan edi. Bunday yolg'on tamg'alarni bir marta tozalaymiz,
     aks holda ular haqiqiy tahrirlarni bosib ketaveradi. */
  var VAQT_VERSIYA = "i_vaqt_versiya";
  function vaqtTozala() {
    try {
      if (localStorage.getItem(VAQT_VERSIYA) === "2") return;
      localStorage.removeItem(VAQT_KEY);
      _rawSet(VAQT_VERSIYA, "2");
    } catch (e) {}
  }
  vaqtTozala();

  function vaqtlarOl() {
    try { return JSON.parse(localStorage.getItem(VAQT_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function vaqtBelgila(k) {
    if (!k || k.indexOf("i_") !== 0 || k === VAQT_KEY || SKIP_SYNC[k]) return;
    try {
      var v = vaqtlarOl();
      v[k] = Date.now();
      _rawSet(VAQT_KEY, JSON.stringify(v));
    } catch (e) {}
  }
  var sb = null, uid = null, saveTimer = null, pulling = false;
  // Serverdan bir marta muvaffaqiyatli o'qimaguncha hech narsa yozilmaydi
  var sinxronTayyor = false;

  function badgeHolat(h) {
    var dot = document.getElementById("bulut-dot");
    if (!dot) return;
    dot.style.background = h === "xato" ? "#EF4444" : (h === "kutilmoqda" ? "#F59E0B" : "#10B981");
  }

  var oxirgiImzo = null;   // oxirgi muvaffaqiyatli yuborilgan ma'lumot imzosi
  var oxirgiHajm = 0;      // uning hajmi — keskin kamayishni sezish uchun

  // Arzon imzo: uzunlik + belgilar yig'indisi. Kriptografik emas,
  // maqsad — "o'zgardimi yo'qmi" degan savolga tez javob berish.
  function imzo(o) {
    var s = JSON.stringify(o), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return s.length + ":" + h.toString(16);
  }

  function pushNow() {
    if (!sb || !uid || pulling) return;
    // XAVFSIZLIK: serverdan hali bir marta ham muvaffaqiyatli o'qimagan bo'lsak,
    // hech narsa YOZMAYMIZ. Aks holda internet uzilganda bo'sh localStorage
    // serverdagi ma'lumot ustiga yozilib, hammasi yo'qolardi.
    if (!sinxronTayyor) { badgeHolat("kutilmoqda"); return; }
    var d = collect();
    var yangiImzo = imzo(d);

    // O'zgarmagan bo'lsa — yubormaymiz. Bu trafikning katta qismini kesadi:
    // ilova ichida ko'p joyda localStorage qayta yoziladi, lekin qiymat o'sha.
    if (yangiImzo === oxirgiImzo) { badgeHolat("ok"); return; }

    /* HIMOYA: yuborilayotgan ma'lumot oldingisidan keskin kichik
       bo'lsa — bu ehtimol xato. Bulutdagi to'liq nusxani
       yo'qotmaslik uchun to'xtaymiz va zaxira olamiz. */
    if (oxirgiHajm && JSON.stringify(d).length < oxirgiHajm * 0.5) {
      console.warn("Sinxron to'xtatildi: ma'lumot keskin kamaydi.",
                   "oldin:", oxirgiHajm, "hozir:", JSON.stringify(d).length);
      zaxiraOl("keskin kamayish");
      badgeHolat("xato");
      return;
    }

    var row = { user_id: uid, data: d, updated_at: new Date(hozir()).toISOString() };
    sb.from(TABLE).upsert(row, { onConflict: "user_id" }).then(function (r) {
      if (!r.error) { oxirgiImzo = yangiImzo; oxirgiHajm = JSON.stringify(d).length; }
      badgeHolat(r.error ? "xato" : "ok");
    });
  }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(pushNow, 1200); }

  /* Ikki qurilma bir vaqtda ochiq bo'lsa ham bir-birini ko'rsin:
     har 3 daqiqada va ilovaga qaytilganda bulutni tekshiramiz. */
  var oxirgiTekshiruv = 0;
  function fondaTekshir() {
    if (!sb || !uid || pulling || !sinxronTayyor) return;
    if (Date.now() - oxirgiTekshiruv < 60000) return;   // daqiqada bir martadan tez emas
    oxirgiTekshiruv = Date.now();
    sb.from(TABLE).select("data, updated_at").eq("user_id", uid).maybeSingle().then(function (r) {
      if (r.error || !r.data || !r.data.data) return;
      var bv = 0;
      try { bv = new Date(r.data.updated_at).getTime() || 0; } catch (e) {}
      var b = birlashtir(r.data.data, bv);
      if (!b.ozgardi) return;
      apply(b.data);
      pushNow();
      try { showNotif("\u2601\ufe0f Yangilandi", "Boshqa qurilmadagi o'zgarish qo'shildi"); } catch (e) {}
      if (typeof window.INTIZOM_YANGILA !== "function") {
        setTimeout(function () { location.reload(); }, 1200);
      }
    }).catch(function () {});
  }
  setInterval(fondaTekshir, 3 * 60 * 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") setTimeout(fondaTekshir, 800);
  });

  function hookStorage() {
    if (hookStorage._qoyilgan) return;
    hookStorage._qoyilgan = true;

    var _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      var eski = null;
      try { eski = localStorage.getItem(k); } catch (e) {}
      _set(k, v);
      if (k && k.indexOf("i_") === 0 && !SKIP_SYNC[k] && k !== VAQT_KEY) {
        /* Qiymat haqiqatan o'zgargandagina vaqt yangilanadi. Ilova
           ko'p joyda bir xil qiymatni qayta yozadi — ular hisobga
           olinsa, tegilmagan kalit ham "yangi" bo'lib ko'rinardi. */
        if (eski !== v && tegildi) {
          vaqtBelgila(k);
          if (k !== OCH_KEY) ochirishlarniYoz(k, eski, v);
        }
        /* Odat va reja endi bazada alohida qator — farqini yuboramiz */
        if (eski !== v && YOZUV_TURLARI[k]) yozuvNavbatga(k);
        scheduleSave();
      }
    };
    var _rem = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (k) {
      _rem(k);
      if (k && k.indexOf("i_") === 0) { vaqtBelgila(k); scheduleSave(); }
    };

    /* Ilova yopilayotganda kutib turgan o'zgarishni darhol yuboramiz.
       Ilgari 1.2 soniyalik kechikish tugamasdan ilova yopilsa,
       oxirgi yozuv bulutga umuman bormasdi. */
    function darhol() {
      try { clearTimeout(saveTimer); pushNow(); } catch (e) {}
    }
    window.addEventListener("pagehide", darhol);
    window.addEventListener("beforeunload", darhol);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") darhol();
    });
  }

  /* Bulut va telefondagi nusxani QO'SHIB chiqadi.
     Har kalit uchun qaysi tomon yangiroq bo'lsa, o'shanisi qoladi.
     Qaytaradi: {data, ozgardi} — ozgardi=true bo'lsa mahalliy
     nusxada haqiqatan o'zgarish bo'ldi, sahifani yangilash kerak. */
  /* ============================================================
     YOZUV DARAJASIDA BIRLASHTIRISH
     Ilgari to'qnashuvda BUTUN bo'lim tanlanardi: bir tomon yutib,
     ikkinchisining yozuvlari butunlay yo'qolardi. Kundalik uchun bu
     qabul qilib bo'lmaydigan holat — belgilangan odatni qayta
     belgilash mumkin, yozilgan kundalikni esa yo'q.
     Endi ro'yxatlar yozuvma-yozuv qo'shiladi: bir tomonda bor
     yozuv hech qachon yo'qolmaydi.
     ============================================================ */

  /* ------------------------------------------------------------
     O'CHIRISH BELGILARI
     Yozuvlar qo'shilgani uchun o'chirilgan narsa boshqa qurilmadan
     qaytib kelishi mumkin edi. Endi nima o'chirilgani ham yozib
     boriladi va qaytib kelmaydi. Belgilar bulutga ham ketadi.
     ------------------------------------------------------------ */
  var OCH_KEY = "i_ochirilgan";

  function ochirilganOl() {
    try { return JSON.parse(localStorage.getItem(OCH_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }

  /* Yozuv qachon yaratilgan: id odatda Date.now() bo'ladi */
  function _yaratilgan(x) {
    if (x && typeof x === "object") {
      if (typeof x.id === "number" && x.id > 1000000000000) return x.id;
      var s = x.date || x.sana || x.vaqt;
      if (s) { var t = new Date(s).getTime(); if (t) return t; }
    }
    return 0;
  }

  /* Tuzilma ichidagi barcha yozuvlarni yig'adi (ichma-ich ham) */
  function _yozuvlarniYig(x, chiq, chuqur) {
    chiq = chiq || {};
    if (chuqur > 6) return chiq;
    if (Array.isArray(x)) {
      x.forEach(function (i) {
        if (i && typeof i === "object" && !Array.isArray(i)) chiq[_belgi(i)] = 1;
        else _yozuvlarniYig(i, chiq, (chuqur || 0) + 1);
      });
    } else if (x && typeof x === "object") {
      Object.keys(x).forEach(function (k) { _yozuvlarniYig(x[k], chiq, (chuqur || 0) + 1); });
    }
    return chiq;
  }

  /* Eski va yangi holatni solishtirib, tushib qolgan yozuvlarni belgilaymiz.
     Reja kabi ichma-ich tuzilmalarda ham ishlaydi. */
  function ochirishlarniYoz(kalit, eskiMatn, yangiMatn) {
    try {
      var a, b;
      try { a = JSON.parse(eskiMatn); b = JSON.parse(yangiMatn); } catch (e) { return; }
      if (!a || typeof a !== "object") return;

      var eskiYozuv = _yozuvlarniYig(a, {}, 0);
      var yangiYozuv = _yozuvlarniYig(b, {}, 0);

      var och = ochirilganOl();
      if (!och[kalit]) och[kalit] = {};
      var vaqt = hozir(), oz = false;
      Object.keys(eskiYozuv).forEach(function (bl) {
        if (!yangiYozuv[bl]) { och[kalit][bl] = vaqt; oz = true; }
      });
      if (!oz) return;

      /* Ro'yxat cheksiz o'smasin: har bo'limda oxirgi 400 tasi */
      var kalitlar = Object.keys(och[kalit]);
      if (kalitlar.length > 400) {
        kalitlar.sort(function (x, y) { return och[kalit][y] - och[kalit][x]; });
        var yangi = {};
        kalitlar.slice(0, 400).forEach(function (k) { yangi[k] = och[kalit][k]; });
        och[kalit] = yangi;
      }
      _rawSet(OCH_KEY, JSON.stringify(och));
    } catch (e) {}
  }

  /* Yozuvni nimasi bilan tanish: id, bo'lmasa sana, bo'lmasa o'zi */
  function _belgi(x) {
    if (x && typeof x === "object") {
      if (x.id !== undefined && x.id !== null) return "id:" + x.id;
      if (x.date) return "d:" + x.date;
      if (x.sana) return "s:" + x.sana;
    }
    try { return "j:" + JSON.stringify(x); } catch (e) { return "x:" + String(x); }
  }

  /* Ikki ro'yxatni qo'shadi. Avval yangi tomon, keyin eski tomonda
     bor-u yangisida yo'q yozuvlar. Hech biri tushib qolmaydi. */
  function _royxatQosh(yangi, eski, ochirilgan) {
    var chiq = [], korilgan = {};
    function qosh(x) {
      var b = _belgi(x);
      if (korilgan[b]) return;
      /* O'chirilgan bo'lsa va o'chirish yozuvdan KEYIN bo'lgan bo'lsa —
         qaytarmaymiz. O'chirib, keyin qayta qo'shilgan bo'lsa yangi id
         oladi va o'tib ketadi. */
      if (ochirilgan && ochirilgan[b]) {
        var yar = _yaratilgan(x);
        if (!yar || ochirilgan[b] >= yar) { korilgan[b] = 1; return; }
      }
      korilgan[b] = 1;
      chiq.push(x);
    }
    (yangi || []).forEach(qosh);
    (eski || []).forEach(qosh);
    return chiq;
  }

  /* Obyektlarni ICHMA-ICH qo'shadi.
     Reja {shablon:[], bugun:{"2026-09-06":[...]}} ko'rinishida
     saqlanadi. Ilgari faqat yuqori qavat qo'shilardi va 'bugun'
     bitta kalit sanalib, bir tomonning butun kunlari ikkinchisini
     almashtirib yuborardi. Endi har kun, har yozuv alohida. */
  function _obyektQosh(yangi, eski, ochirilgan) {
    var chiq = {};
    Object.keys(eski || {}).forEach(function (k) { chiq[k] = eski[k]; });

    Object.keys(yangi || {}).forEach(function (k) {
      var y = yangi[k], e = (eski || {})[k];

      if (e === undefined) { chiq[k] = y; return; }

      if (Array.isArray(y) && Array.isArray(e)) {
        chiq[k] = _royxatQosh(y, e, ochirilgan);
        return;
      }
      if (y && e && typeof y === "object" && typeof e === "object" &&
          !Array.isArray(y) && !Array.isArray(e)) {
        chiq[k] = _obyektQosh(y, e, ochirilgan);
        return;
      }
      chiq[k] = y;   /* oddiy qiymat \u2014 yangi tomon ustun */
    });
    return chiq;
  }

  /* Ikki matnni mazmuniga qarab qo'shishga urinadi.
     Uddasidan chiqmasa null qaytaradi — shunda eski usul ishlaydi. */
  function _aqlliQosh(yangiMatn, eskiMatn, ochirilgan) {
    var a, b;
    try { a = JSON.parse(yangiMatn); b = JSON.parse(eskiMatn); }
    catch (e) { return null; }

    if (Array.isArray(a) && Array.isArray(b)) {
      var r = _royxatQosh(a, b, ochirilgan);
      try { return JSON.stringify(r); } catch (e) { return null; }
    }
    if (a && b && typeof a === "object" && typeof b === "object" &&
        !Array.isArray(a) && !Array.isArray(b)) {
      try { return JSON.stringify(_obyektQosh(a, b, ochirilgan)); } catch (e) { return null; }
    }
    return null;
  }

  function birlashtir(bulutData, bulutVaqt) {
    var mahalliy = collect();
    var mVaqt = vaqtlarOl();
    var bVaqt = {};
    try { bVaqt = JSON.parse((bulutData && bulutData[VAQT_KEY]) || "{}") || {}; } catch (e) {}

    /* O'chirish belgilarini ham ikki tomondan qo'shamiz */
    var mOch = ochirilganOl(), bOch = {};
    try { bOch = JSON.parse((bulutData && bulutData[OCH_KEY]) || "{}") || {}; } catch (e) {}
    var birlashganOch = {};
    [mOch, bOch].forEach(function (manba) {
      Object.keys(manba || {}).forEach(function (kal) {
        if (!birlashganOch[kal]) birlashganOch[kal] = {};
        Object.keys(manba[kal] || {}).forEach(function (bl) {
          var t = manba[kal][bl] || 0;
          if (!birlashganOch[kal][bl] || t > birlashganOch[kal][bl]) birlashganOch[kal][bl] = t;
        });
      });
    });

    var natija = {}, ozgardi = false, yangiVaqt = {};
    var kalitlar = {};
    Object.keys(mahalliy).forEach(function (k) { kalitlar[k] = 1; });
    Object.keys(bulutData || {}).forEach(function (k) { kalitlar[k] = 1; });
    delete kalitlar[VAQT_KEY];
    delete kalitlar[OCH_KEY];

    Object.keys(kalitlar).forEach(function (k) {
      /* Odat va reja yozuv jadvalidan boshqariladi — eski yaxlit
         birlashtirish ularga tegmasin, aks holda ikki tizim
         bir-biriga xalaqit qiladi. Zaxira uchun bulutga yozilaveradi. */
      if (YOZUV_TURLARI[k]) {
        if (mahalliy[k] !== undefined) {
          natija[k] = mahalliy[k];
          if (mVaqt[k]) yangiVaqt[k] = mVaqt[k];
        } else if (bulutData && bulutData[k] !== undefined) {
          natija[k] = bulutData[k];
          ozgardi = true;
        }
        return;
      }
      var mQiymat = mahalliy[k];
      var bQiymat = (bulutData || {})[k];
      var mt = mVaqt[k] || 0;
      /* Bulutda vaqt yozilmagan bo'lsa — qatorning umumiy
         yangilanish vaqtini olamiz (eski nusxalar uchun) */
      var bt = bVaqt[k] || (bQiymat !== undefined ? bulutVaqt : 0);

      var tanlangan, tanlanganVaqt;
      if (mQiymat === bQiymat) { tanlangan = mQiymat; tanlanganVaqt = Math.max(mt, bt); }
      else if (bQiymat === undefined) { tanlangan = mQiymat; tanlanganVaqt = mt; }
      else if (mQiymat === undefined) { tanlangan = bQiymat; tanlanganVaqt = bt; }
      else {
        /* Ikkala tomonda ham bor va farq qiladi — avval yozuvma-yozuv
           qo'shishga urinamiz, shunda hech narsa yo'qolmaydi. */
        var yangiTomon = (mt >= bt) ? mQiymat : bQiymat;
        var eskiTomon  = (mt >= bt) ? bQiymat : mQiymat;
        var qoshilgan = _aqlliQosh(yangiTomon, eskiTomon, birlashganOch[k]);
        if (qoshilgan !== null) {
          tanlangan = qoshilgan;
          tanlanganVaqt = Math.max(mt, bt);
        } else {
          /* Qo'shib bo'lmadi (oddiy son yoki matn) — yangirog'i qoladi,
             teng bo'lsa mahalliy nusxa ustun. */
          tanlangan = yangiTomon;
          tanlanganVaqt = Math.max(mt, bt);
        }
      }

      if (tanlangan !== undefined) {
        natija[k] = tanlangan;
        if (tanlanganVaqt) yangiVaqt[k] = tanlanganVaqt;
        if (tanlangan !== mQiymat) ozgardi = true;
      }
    });

    natija[VAQT_KEY] = JSON.stringify(yangiVaqt);
    try {
      natija[OCH_KEY] = JSON.stringify(birlashganOch);
      _rawSet(OCH_KEY, natija[OCH_KEY]);
    } catch (e) {}
    return { data: natija, ozgardi: ozgardi };
  }


  /* ============================================================
     YOZUV DARAJASIDAGI SINXRON  —  06.09.2026
     2-BOSQICH: odat va reja endi bazada ALOHIDA QATOR bo'lib
     yashaydi. Ilova kodiga tegilmagan — bu qatlam localStorage
     o'zgarishini ushlab, farqini serverga yuboradi va serverdan
     kelganini qaytarib yig'adi.

     Nima uchun: butun ma'lumotni yaxlit yuborganda ikki qurilma
     bir-birining ustiga yozardi. Endi har yozuv o'z qatorida,
     ikki qurilma bir-biriga tegmaydi.
     ============================================================ */

  var YOZUV_TURLARI = {
    i_odatlar: "odat",
    i_reja:    "reja",
    i_hifz:    "hifz",     /* Qur'on yodlash \u2014 sura bo'yicha */
    i_trans:   "moliya",
    i_xarid:   "xarid",
    i_jurnal:  "kundalik"  /* matni shifrlangan holicha ko'chadi */
  };
  /* Har turning shakli: royxat (massiv), reja (ichma-ich), hifz (sura) */
  var YOZUV_SHAKLI = {
    i_odatlar: "royxat",
    i_reja:    "reja",
    i_hifz:    "hifz",
    i_trans:   "royxat",
    i_xarid:   "royxat",
    i_jurnal:  "royxat"
  };
  var SINXRON_VAQT = "i_yozuv_sinxron";   /* oxirgi muvaffaqiyatli o'qish vaqti */

  /* Eski versiyada to'liq nusxalar saqlangan edi \u2014 ular xotirani
     behuda egallaydi. Bir marta tozalaymiz, keyingi yuborishda
     qisqa belgilar bilan qaytadan yoziladi. */
  try {
    if (localStorage.getItem("i_yozuv_holat_v2") !== "1") {
      ["i_odatlar","i_reja","i_hifz","i_trans","i_xarid","i_jurnal"].forEach(function (k) {
        try { localStorage.removeItem("i_yozuv_holat_" + k); } catch (e) {}
      });
      localStorage.setItem("i_yozuv_holat_v2", "1");
    }
  } catch (e) {}

  /* --- localStorage qiymati -> yozuvlar ro'yxati --- */
  function _yozuvlarga(kalit, matn) {
    var chiq = {};
    var d;
    try { d = JSON.parse(matn || "null"); } catch (e) { return chiq; }
    if (!d) return chiq;

    var shakl = YOZUV_SHAKLI[kalit] || "royxat";

    if (shakl === "royxat") {
      if (!Array.isArray(d)) return chiq;
      d.forEach(function (x) {
        if (!x || typeof x !== "object") return;
        /* Kundalik yozuvlarida id yo'q \u2014 sana o'rniga ishlaydi */
        var id = (x.id !== undefined && x.id !== null) ? x.id : (x.date || x.sana);
        if (id === undefined || id === null) return;
        chiq[String(id)] = x;
      });
      return chiq;
    }

    if (shakl === "hifz") {
      /* {s:{sura:[[a,b]]}, t:{sura:{k,d}}} \u2014 har sura bitta yozuv */
      if (typeof d !== "object") return chiq;
      var s = d.s || {}, t = d.t || {};
      Object.keys(s).forEach(function (sura) {
        chiq[String(sura)] = { s: s[sura], t: t[sura] || null };
      });
      /* Faqat takror holati bor sura ham tushib qolmasin */
      Object.keys(t).forEach(function (sura) {
        if (!chiq[String(sura)]) chiq[String(sura)] = { s: [], t: t[sura] };
      });
      return chiq;
    }

    if (kalit === "i_reja") {
      /* Eski massiv shakli ham tushuniladi */
      if (Array.isArray(d)) {
        d.forEach(function (x) {
          if (x && x.id !== undefined) chiq["b:" + x.id] = { kun: x.date || null, item: x };
        });
        return chiq;
      }
      if (typeof d !== "object") return chiq;
      Object.keys(d.bugun || {}).forEach(function (kun) {
        (d.bugun[kun] || []).forEach(function (x) {
          if (x && x.id !== undefined) chiq["b:" + x.id] = { kun: kun, item: x };
        });
      });
      (d.shablon || []).forEach(function (x) {
        if (x && x.id !== undefined) chiq["s:" + x.id] = { kun: null, item: x };
      });
      return chiq;
    }
    return chiq;
  }

  /* --- yozuvlar ro'yxati -> localStorage qiymati --- */
  function _qiymatga(kalit, yozuvlar) {
    var shakl = YOZUV_SHAKLI[kalit] || "royxat";

    if (shakl === "royxat") {
      var arr = [];
      Object.keys(yozuvlar).forEach(function (id) { arr.push(yozuvlar[id]); });
      if (kalit === "i_jurnal" || kalit === "i_trans") {
        /* Yangi yozuv tepada tursin */
        arr.sort(function (a, b) {
          var x = new Date(a.date || 0).getTime() || (a.id || 0);
          var y = new Date(b.date || 0).getTime() || (b.id || 0);
          return y - x;
        });
      } else {
        arr.sort(function (a, b) { return (a.id || 0) - (b.id || 0); });
      }
      return JSON.stringify(arr);
    }

    if (shakl === "hifz") {
      var o = { s: {}, t: {} };
      Object.keys(yozuvlar).forEach(function (sura) {
        var y = yozuvlar[sura];
        if (!y) return;
        if (y.s && y.s.length) o.s[sura] = y.s;
        if (y.t) o.t[sura] = y.t;
      });
      return JSON.stringify(o);
    }

    if (kalit === "i_reja") {
      var o = { shablon: [], bugun: {} };
      Object.keys(yozuvlar).forEach(function (id) {
        var y = yozuvlar[id];
        if (!y || !y.item) return;
        if (id.indexOf("s:") === 0) { o.shablon.push(y.item); return; }
        var kun = y.kun || y.item.date;
        if (!kun) return;
        if (!o.bugun[kun]) o.bugun[kun] = [];
        o.bugun[kun].push(y.item);
      });
      Object.keys(o.bugun).forEach(function (k) {
        o.bugun[k].sort(function (a, b) { return (a.id || 0) - (b.id || 0); });
      });
      return JSON.stringify(o);
    }
    return null;
  }

  /* Yozuvning qisqa belgisi. Ilgari bu yerda yozuvning TO'LIQ nusxasi
     saqlanardi \u2014 xotira sarfi deyarli ikki barobar oshardi.
     Xotira to'lsa Supabase yangi kirish kalitini saqlay olmaydi va
     sessiya o'ladi (har yangilanishda kod so'ralishi shundan edi).
     Endi faqat qisqa belgi: uzunlik + nazorat yig'indisi. */
  function _belgiHash(x) {
    var s;
    try { s = JSON.stringify(x); } catch (e) { return "0"; }
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      n = ((n << 5) - n + s.charCodeAt(i)) | 0;
    }
    return s.length + ":" + (n >>> 0).toString(36);
  }

  /* Oxirgi serverga yuborilgan holat \u2014 farqni shundan hisoblaymiz */
  var _serverHolat = {};   /* {i_odatlar: {id: JSON}, i_reja: {...}} */

  function _holatOl(kalit) {
    if (_serverHolat[kalit]) return _serverHolat[kalit];
    try {
      var s = JSON.parse(localStorage.getItem("i_yozuv_holat_" + kalit) || "{}");
      _serverHolat[kalit] = s || {};
    } catch (e) { _serverHolat[kalit] = {}; }
    return _serverHolat[kalit];
  }
  function _holatYoz(kalit, holat) {
    _serverHolat[kalit] = holat;
    try { _rawSet("i_yozuv_holat_" + kalit, JSON.stringify(holat)); } catch (e) {}
  }

  /* --- Mahalliy o'zgarishni serverga yuborish --- */
  var _yuborishNavbat = {};
  var _yuborishTimer = null;

  function yozuvNavbatga(kalit) {
    if (!YOZUV_TURLARI[kalit]) return;
    _yuborishNavbat[kalit] = 1;
    clearTimeout(_yuborishTimer);
    _yuborishTimer = setTimeout(yozuvlarniYubor, 1500);
  }

  function yozuvlarniYubor() {
    if (!sb || !uid) return;
    var kalitlar = Object.keys(_yuborishNavbat);
    _yuborishNavbat = {};
    kalitlar.forEach(function (kalit) {
      try {
        var tur = YOZUV_TURLARI[kalit];
        var hozirgi = _yozuvlarga(kalit, localStorage.getItem(kalit));
        var eski = _holatOl(kalit);

        var yangilar = [], ochirilganlar = [];
        Object.keys(hozirgi).forEach(function (id) {
          var m = _belgiHash(hozirgi[id]);
          if (eski[id] !== m) yangilar.push({ id: id, data: hozirgi[id] });
        });
        Object.keys(eski).forEach(function (id) {
          if (hozirgi[id] === undefined) ochirilganlar.push(id);
        });

        if (!yangilar.length && !ochirilganlar.length) return;

        var ishlar = [];
        if (yangilar.length) {
          ishlar.push(sb.rpc("yozuv_saqla", { p_tur: tur, p_yozuvlar: yangilar }));
        }
        if (ochirilganlar.length) {
          ishlar.push(sb.rpc("yozuv_ochir", { p_tur: tur, p_idlar: ochirilganlar }));
        }

        Promise.all(ishlar).then(function (natijalar) {
          var xato = natijalar.some(function (r) { return r && r.error; });
          if (xato) {
            console.warn("Yozuv yuborilmadi, keyin qayta urinamiz");
            _yuborishNavbat[kalit] = 1;   /* keyingi safar qayta */
            return;
          }
          /* Muvaffaqiyatli \u2014 holatni yangilaymiz */
          var yangiHolat = {};
          Object.keys(hozirgi).forEach(function (id) {
            yangiHolat[id] = _belgiHash(hozirgi[id]);
          });
          _holatYoz(kalit, yangiHolat);
          badgeHolat("ok");
        }).catch(function () { _yuborishNavbat[kalit] = 1; });
      } catch (e) { console.warn("yozuvlarniYubor:", e); }
    });
  }

  /* --- Serverdan olib, mahalliy nusxaga qo'shish --- */
  function yozuvlarniOl(hammasi) {
    if (!sb || !uid) return Promise.resolve(false);
    var since = null;
    if (!hammasi) {
      try { since = localStorage.getItem(SINXRON_VAQT) || null; } catch (e) {}
    }

    return sb.rpc("yozuvlar_ol", { p_since: since }).then(function (r) {
      if (r.error || !r.data || r.data.holat !== "ok") return false;
      var royxat = r.data.yozuvlar || [];
      var serverVaqt = r.data.server_vaqt;
      if (!royxat.length) {
        try { if (serverVaqt) _rawSet(SINXRON_VAQT, serverVaqt); } catch (e) {}
        return false;
      }

      /* Turlar bo'yicha ajratamiz */
      var turKalit = {};
      Object.keys(YOZUV_TURLARI).forEach(function (k) { turKalit[YOZUV_TURLARI[k]] = k; });

      var ozgardi = false;
      var guruh = {};
      royxat.forEach(function (y) {
        var kalit = turKalit[y.tur];
        if (!kalit) return;
        if (!guruh[kalit]) guruh[kalit] = [];
        guruh[kalit].push(y);
      });

      Object.keys(guruh).forEach(function (kalit) {
        var hozirgi = _yozuvlarga(kalit, localStorage.getItem(kalit));
        var holat = _holatOl(kalit);
        var oz = false;

        guruh[kalit].forEach(function (y) {
          if (y.ochirilgan) {
            if (hozirgi[y.id] !== undefined) { delete hozirgi[y.id]; oz = true; }
            delete holat[y.id];
          } else {
            var m = _belgiHash(y.data);
            if (_belgiHash(hozirgi[y.id]) !== m) { hozirgi[y.id] = y.data; oz = true; }
            holat[y.id] = m;
          }
        });

        if (oz) {
          var yangiQiymat = _qiymatga(kalit, hozirgi);
          if (yangiQiymat !== null) {
            try { _rawSet(kalit, yangiQiymat); } catch (e) {}
            ozgardi = true;
          }
        }
        _holatYoz(kalit, holat);
      });

      try { if (serverVaqt) _rawSet(SINXRON_VAQT, serverVaqt); } catch (e) {}

      if (ozgardi) {
        try { window.dispatchEvent(new CustomEvent("intizom-bulut-yangilandi")); } catch (e) {}
      }
      return ozgardi;
    }).catch(function () { return false; });
  }

  /* --- Birinchi marta: mavjud ma'lumotni serverga ko'chirish --- */
  /* --- Birinchi marta: mavjud ma'lumotni serverga ko'chirish ---
     Belgi HAR TUR uchun alohida. Ilgari bitta umumiy belgi bor edi:
     odat va reja ko'chgach belgi qo'yilar, keyin qo'shilgan turlar
     (yodlash, moliya, xarid, kundalik) hech qachon ko'chmasdi. */
  /* --- Birinchi marta: mavjud ma'lumotni serverga ko'chirish ---
     MUHIM (06.09.2026): ilgari "serverda bu turdan bor bo'lsa
     ko'chirmaymiz" degan shart bor edi. Natijada ikkinchi
     qurilmadagi yozuvlar hech qachon serverga chiqmasdi \u2014
     birinchi qurilma yuborgan bo'lsa, ikkinchisi jim turardi.
     Endi har qurilma o'zidagini bir marta yuboradi. Bir xil
     yozuv qayta yuborilsa zarari yo'q: id bo'yicha ustiga
     yoziladi, nusxa ko'paymaydi. */
  function yozuvKochir() {
    if (!sb || !uid) return;

    var yangiTur = false;

    Object.keys(YOZUV_TURLARI).forEach(function (kalit) {
      var tur = YOZUV_TURLARI[kalit];
      var belgi = "i_yozuv_kochdi_" + tur;

      try { if (localStorage.getItem(belgi) === "1") return; } catch (e) {}

      var bor = false;
      try {
        var m = localStorage.getItem(kalit);
        bor = !!(m && Object.keys(_yozuvlarga(kalit, m)).length);
      } catch (e) {}

      try { _rawSet(belgi, "1"); } catch (e) {}
      yangiTur = true;

      if (!bor) return;
      yozuvNavbatga(kalit);
      console.log("Ko'chirilmoqda: " + tur);
    });

    /* Yangi tur qo'shilgan bo'lsa \u2014 TO'LIQ o'qiymiz.
       "Oxirgi so'rovdan keyingi" o'qish yetmaydi: boshqa qurilma
       o'sha yozuvni ilgariroq yuborgan bo'lishi mumkin va u
       belgidan oldin qolib ketardi. */
    if (yangiTur) {
      try { localStorage.removeItem(SINXRON_VAQT); } catch (e) {}
      setTimeout(function () { yozuvlarniOl(true); }, 2500);
    }
  }

  /* Yozuv sinxronini ishga tushiradi: avval ko'chirish (bir marta),
     keyin serverdan o'qish, so'ng vaqti-vaqti bilan tekshirib turish. */
  var _yozuvBoshlandi = false;
  function yozuvBoshla() {
    if (_yozuvBoshlandi) return;
    _yozuvBoshlandi = true;
    try {
      yozuvKochir();
      setTimeout(function () { yozuvlarniOl(false); }, 1500);
      setInterval(function () { yozuvlarniOl(false); }, 60 * 1000);
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
          setTimeout(function () { yozuvlarniOl(false); }, 600);
        }
      });
      /* Ilova yopilayotganda kutib turgan o'zgarish darhol ketsin */
      window.addEventListener("pagehide", function () {
        try { clearTimeout(_yuborishTimer); yozuvlarniYubor(); } catch (e) {}
      });
    } catch (e) { console.warn("yozuvBoshla:", e); }
  }

  /* Konsoldan tekshirish uchun */
  window.intizomYozuv = {
    yubor: function () {
      Object.keys(YOZUV_TURLARI).forEach(yozuvNavbatga);
      yozuvlarniYubor();
      return "yuborilmoqda...";
    },
    ol: function () { return yozuvlarniOl(true); },
    hisob: function () {
      return sb.rpc("yozuv_hisob").then(function (r) { console.log(r.data); return r.data; });
    },
    kochir: function () {
      /* Ko'chirish belgilarini tozalab, qaytadan ko'chiradi */
      Object.keys(YOZUV_TURLARI).forEach(function (k) {
        try { localStorage.removeItem("i_yozuv_kochdi_" + YOZUV_TURLARI[k]); } catch (e) {}
      });
      yozuvKochir();
      return "ko'chirilmoqda...";
    }
  };

  function pullThenStart(urinish) {
    urinish = urinish || 1;
    pulling = true;
    sb.from(TABLE).select("data, updated_at").eq("user_id", uid).maybeSingle().then(function (r) {
      pulling = false;

      // --- Xato bo'lsa: HECH NARSA YOZMAYMIZ, qayta urinamiz ---
      if (r.error) {
        console.warn("Bulutdan o'qib bo'lmadi:", r.error.message);
        badgeHolat("xato");
        if (urinish < 5) { setTimeout(function () { pullThenStart(urinish + 1); }, 3000 * urinish); }
        else { hookStorage(); badge(); }   // sinxronTayyor=false -> yozmaydi
        return;
      }

      // --- Serverda ma'lumot bor: USTIGA YOZMAYMIZ, birlashtiramiz ---
      if (r.data && r.data.data) {
        zaxiraOl();   // har ehtimolga qarshi mahalliy nusxa saqlanadi

        var bVaqt = 0;
        try { bVaqt = new Date(r.data.updated_at).getTime() || 0; } catch (e) {}

        try { oxirgiHajm = JSON.stringify(r.data.data).length; } catch (e) {}
        var b = birlashtir(r.data.data, bVaqt);
        apply(b.data);
        sinxronTayyor = true;

        /* Cheksiz qayta yuklanishning oldini olamiz */
        var qaytaSoni = parseInt(sessionStorage.getItem("i_reload_soni") || "0", 10);
        if (b.ozgardi && qaytaSoni >= 2) {
          console.warn("Bulutdan yangilik keldi, lekin qayta yuklash chegarasi tugadi.");
          hookStorage(); pushNow(); badge();
          return;
        }
        if (b.ozgardi) sessionStorage.setItem("i_reload_soni", String(qaytaSoni + 1));

        if (b.ozgardi) {
          /* Ilova o'zi yangilana olsa — qayta yuklamaymiz. Qayta
             yuklash paytida boshqa kod xotiradagi eski ma'lumotni
             saqlab yuborishi mumkin edi. */
          if (typeof window.INTIZOM_YANGILA === "function") {
            try { window.INTIZOM_YANGILA(); } catch (e) {}
            hookStorage(); pushNow(); badge();
            yozuvBoshla();
            return;
          }
          location.reload();
        } else {
          /* Mahalliy nusxa yangiroq yoki bir xil edi. Sahifani
             yangilash shart emas; birlashgan holatni bulutga
             qaytarib yuboramiz, ikki tomon tenglashsin. */
          hookStorage(); pushNow(); badge();
          yozuvBoshla();
        }
        return;
      }

      // --- Serverda qator YO'Q (yangi foydalanuvchi): mahalliyni yuklaymiz ---
      sinxronTayyor = true;
      hookStorage(); pushNow(); badge();
      yozuvBoshla();
    }).catch(function (e) {
      pulling = false;
      console.warn("Bulut xatosi:", e);
      badgeHolat("xato");
      if (urinish < 5) setTimeout(function () { pullThenStart(urinish + 1); }, 3000 * urinish);
      else { hookStorage(); badge(); }
    });
  }

  /* MAHALLIY ZAXIRA — uchta aylanma nusxa.
     Ilgari bitta nusxa saqlanardi va u har safar ustiga yozilardi:
     ikki marta noto'g'ri sinxronlash bo'lsa, qaytaradigan narsa
     qolmasdi. Endi oxirgi uchtasi turadi. */
  var ZAX_SONI = 3;
  function zaxiraOl(sabab) {
    try {
      var d = collect();
      var kalitlar = Object.keys(d);
      if (!kalitlar.length) return;

      var matn = JSON.stringify({ vaqt: hozir(), sabab: sabab || "", data: d });
      /* Juda katta bo'lsa xotirani to'ldirmaymiz */
      if (matn.length > 1500000) return;

      /* Eskilarini suramiz: 2 -> 3, 1 -> 2 */
      for (var i = ZAX_SONI - 1; i >= 1; i--) {
        var eski = localStorage.getItem("zaxira_" + i);
        if (eski) { try { localStorage.setItem("zaxira_" + (i + 1), eski); } catch (e) {} }
      }
      localStorage.setItem("zaxira_1", matn);
      localStorage.setItem("zaxira_oxirgi", matn);   // eski nom bilan moslik
    } catch (e) {}
  }

  /* Ro'yxat: qaysi nusxalar bor */
  window.intizomZaxiralar = function () {
    var ro = [];
    for (var i = 1; i <= ZAX_SONI; i++) {
      try {
        var z = JSON.parse(localStorage.getItem("zaxira_" + i) || "null");
        if (z && z.data) ro.push({
          nomer: i,
          sana: new Date(z.vaqt).toLocaleString(),
          kalit: Object.keys(z.data).length,
          sabab: z.sabab || ""
        });
      } catch (e) {}
    }
    return ro;
  };

  // Zaxirani qaytarish — konsoldan: intizomZaxiraQaytar()
  window.intizomZaxiraQaytar = function (nomer) {
    try {
      var kalit = "zaxira_" + (nomer || 1);
      var z = JSON.parse(localStorage.getItem(kalit) || "null");
      if (!z || !z.data) z = JSON.parse(localStorage.getItem("zaxira_oxirgi") || "null");
      if (!z || !z.data) { alert("Zaxira topilmadi."); return; }
      if (!confirm("Zaxira " + new Date(z.vaqt).toLocaleString() +
                   " holatiga qaytarilsinmi?\n" + Object.keys(z.data).length + " ta bo'lim.")) return;
      /* Qaytarishdan oldin hozirgi holatni ham saqlab qo'yamiz */
      zaxiraOl("qaytarishdan oldin");
      apply(z.data);
      /* Qaytarilgan ma'lumot eng yangi hisoblansin, aks holda bulut
         uni yana bosib ketadi */
      try {
        var v = {};
        Object.keys(z.data).forEach(function (k) { v[k] = hozir(); });
        _rawSet(VAQT_KEY, JSON.stringify(v));
      } catch (e) {}
      location.reload();
    } catch (e) { alert("Zaxira o'qilmadi."); }
  };

  /* Bulutdagi eski nusxalar (server tarixi) */
  window.intizomBulutZaxiralar = function () {
    if (!sb) { alert("Bulutga ulanmagan"); return; }
    return sb.rpc("zaxira_royxat").then(function (r) {
      if (r.error) { console.warn(r.error.message); return []; }
      console.table(r.data || []);
      return r.data || [];
    });
  };
  window.intizomBulutdanQaytar = function (id) {
    if (!sb) { alert("Bulutga ulanmagan"); return; }
    return sb.rpc("zaxira_ol", { p_id: id }).then(function (r) {
      if (r.error || !r.data) { alert("Nusxa topilmadi"); return; }
      if (!confirm(Object.keys(r.data).length + " ta bo'lim qaytarilsinmi?")) return;
      zaxiraOl("bulut nusxasidan oldin");
      apply(r.data);
      try {
        var v = {};
        Object.keys(r.data).forEach(function (k) { v[k] = hozir(); });
        _rawSet(VAQT_KEY, JSON.stringify(v));
      } catch (e) {}
      location.reload();
    });
  };

  // ============================================================
  //  OBUNA — sinov muddati / pro holati
  //  Server obuna_holat() RPC dan keladi (vaqt SERVERNIKI).
  //  isPro() ni ilovaning istalgan joyidan chaqirish mumkin.
  // ============================================================
  var OB_CACHE = "obuna_cache_v1";   // "i_" bilan boshlanmaydi -> bulutga ketmaydi
  var OB_ISHON = 3 * 24 * 3600 * 1000; // internetsiz keshga necha muddat ishonamiz

  function obunaYangila() {
    if (!sb) return Promise.resolve(null);
    return sb.rpc("obuna_holat").then(function (r) {
      if (r.error || !r.data) return null;
      window.INTIZOM_OBUNA = r.data;
      /* Server vaqtini olib, qurilma soati bilan farqini hisoblaymiz */
      try { serverVaqtiBelgila(r.data.server_vaqt); } catch (e) {}
      try { localStorage.setItem(OB_CACHE, JSON.stringify({ t: Date.now(), d: r.data })); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent("obuna-yangilandi", { detail: r.data })); } catch (e) {}
      return r.data;
    }).catch(function () { return null; });
  }

  function obunaHolat() {
    if (window.INTIZOM_OBUNA) return window.INTIZOM_OBUNA;
    try {
      var c = JSON.parse(localStorage.getItem(OB_CACHE) || "null");
      if (c && c.d && (Date.now() - c.t) < OB_ISHON) return c.d;
    } catch (e) {}
    return null;
  }

  // Ma'lumot yo'q bo'lsa BLOKLAMAYMIZ — internet uzilgani uchun
  // odamni o'z ilovasidan chiqarib qo'ymaslik kerak.
  window.isPro = function () {
    var d = obunaHolat();
    if (!d) return true;
    return !!d.ochiq;
  };
  window.obunaHolat = obunaHolat;
  window.obunaYangila = obunaYangila;

  function obunaMatn() {
    var d = obunaHolat();
    if (!d) return "";
    if (d.pro && d.ochiq) {
      return d.obuna_tugash
        ? "\u2b50 Pro \u2014 " + String(d.obuna_tugash).slice(0, 10) + " gacha"
        : "\u2b50 Pro";
    }
    if (d.ochiq) {
      var q = d.sinov_qoldi || 0;
      return "\ud83c\udd93 Sinov muddati \u2014 yana " + q + " kun";
    }
    return "\u23f3 Sinov tugadi \u2014 obuna kerak";
  }
  window.obunaMatn = obunaMatn;

  /* ------------------------------------------------------------
     KIRISH SAQLANISHI
     Kod faqat ro'yxatdan o'tganda so'ralishi kerak. Ilgari brauzer
     xotirani tozalasa yoki token muddati o'tsa, qaytadan kod
     so'ralardi. Endi kirish kalitining nusxasini o'zimiz ham
     saqlaymiz va sessiya yo'qolsa o'shandan tiklaymiz.
     ------------------------------------------------------------ */
  /* Kalit "i_" bilan boshlanmaydi \u2014 shuning uchun bulutga
     yuborilmaydi va boshqa qurilmaga o'tmaydi. Bu ataylab: kirish
     kaliti faqat shu qurilmada qolishi kerak. */

  /* Zaxira kalit saqlash OLIB TASHLANDI (06.09.2026).
     Saqlangan yangilanish kalitini keyin ishlatish \u2014 uni ikkinchi
     marta ishlatish demak. Supabase buni sessiya o'g'irlanishi deb
     hisoblab, butun sessiyani bekor qiladi. Foydasidan zarari ko'p edi. */
  function kirishKalitiTozala() {
    try { localStorage.removeItem("kirish_kaliti"); } catch (e) {}
  }

  /* Brauzerdan xotirani o'chirmaslikni so'raymiz.
     iPhone va Android ishlatilmagan saytlar xotirasini o'zi
     tozalaydi \u2014 ruxsat berilsa, tozalamaydi. */
  function xotiraniHimoyala() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persisted().then(function (bor) {
          if (bor) return;
          navigator.storage.persist().then(function (ok) {
            console.log(ok ? "Xotira himoyalandi." : "Xotira himoyasi berilmadi.");
          });
        });
      }
    } catch (e) {}
  }

  function afterAuth(user) {
    uid = user.id;
    removeGate();
    xotiraniHimoyala();
    kirishKalitiTozala();
    obunaYangila();
    /* Ilgari sessiyada bir marta o'qib, keyin boshqa qaytib
       qaramasdi. Natijada qurilma o'zinikini yuborar, boshqasinikini
       esa hech qachon olmasdi — ikkalasi bir-birini ko'rmasdi.
       Birlashtirish endi xavfsiz, shuning uchun har safar o'qiymiz. */
    pullThenStart();
  }

  // index.html dagi "PIN'ni unutdim" shu yerga keladi
  window.BULUT = window.BULUT || {};

  // Ilova serverdagi funksiyalarni shu orqali chaqiradi (oila, obuna va h.k.)
  window.BULUT.rpc = function (nom, args) {
    if (!sb) return Promise.resolve({ error: { message: "Bulutga ulanmagan" } });
    return sb.rpc(nom, args || {});
  };
  window.BULUT.kirganmi = function () { return !!uid; };
  window.BULUT.chiqish = function () {
    if (!sb) { location.reload(); return; }
    sb.auth.signOut().then(function () {
      try { sessionStorage.removeItem("i_bulut_hydrated"); } catch (e) {}
      location.reload();
    });
  };

  // ---- bulut nuqtasi + hisob menyusi (parol qo'yish / chiqish) ----
  // Hisob menyusida ko'rinadigan "kim" satri
  function kimMatn() {
    var ism = "", tel = "";
    try { ism = localStorage.getItem("foydalanuvchi_ism") || ""; tel = localStorage.getItem("foydalanuvchi_tel") || ""; } catch (e) {}
    if (ism && tel) return ism + " \u00b7 " + telChiroy(tel);
    return ism || telChiroy(tel) || "...";
  }

  function badge() {
    if (document.getElementById("bulut-badge")) return;
    var b = document.createElement("div");
    b.id = "bulut-badge";
    b.style.cssText = "position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:10px;z-index:99998;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);padding:5px 9px;border-radius:20px;font-size:11px;color:#fff;font-family:system-ui;cursor:pointer";
    b.innerHTML = '<span id="bulut-dot" style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block"></span><span>Hisob</span>';
    b.onclick = accountMenu;
    document.body.appendChild(b);
  }

  function accountMenu() {
    var em = "";
    try { sb.auth.getUser().then(function (r) { em = (r.data && r.data.user && r.data.user.email) || ""; }); } catch (e) {}
    var m = document.createElement("div");
    m.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;font-family:system-ui";
    m.innerHTML =
      '<div style="width:100%;max-width:420px;background:#fff;border-radius:20px 20px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom,0px));color:#111">' +
        '<div style="width:40px;height:4px;background:#ddd;border-radius:2px;margin:0 auto 16px"></div>' +
        '<div style="font-size:18px;font-weight:800;margin-bottom:2px">Hisob</div>' +
        '<div id="acc-email" style="font-size:13px;color:#666;margin-bottom:10px">' + kimMatn() + '</div>' +
        '<div id="acc-obuna" style="font-size:13px;font-weight:700;color:#111;background:#F3F4F6;border-radius:10px;padding:10px 12px;margin-bottom:16px">' + (obunaMatn() || "Holat tekshirilmoqda...") + '</div>' +
        '<button id="acc-out" style="width:100%;padding:14px;border:none;border-radius:12px;background:#FEE2E2;color:#B91C1C;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px">Chiqish</button>' +
        '<button id="acc-close" style="width:100%;padding:12px;border:none;border-radius:12px;background:transparent;color:#666;font-size:14px;cursor:pointer">Yopish</button>' +
      '</div>';
    document.body.appendChild(m);
    try { sb.auth.getUser().then(function (r) {
      var u = r.data && r.data.user, md = (u && u.user_metadata) || {};
      if (md.ism) { try { localStorage.setItem("foydalanuvchi_ism", md.ism); } catch (e) {} }
      if (md.tel) { try { localStorage.setItem("foydalanuvchi_tel", md.tel); } catch (e) {} }
      var e2 = document.getElementById("acc-email"); if (e2) e2.textContent = kimMatn();
    }); } catch (e) {}
    obunaYangila().then(function () {
      var o = document.getElementById("acc-obuna");
      if (o) o.textContent = obunaMatn() || "Holat aniqlanmadi";
    });
    m.querySelector("#acc-close").onclick = function () { m.remove(); };
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector("#acc-out").onclick = function () {
      sb.auth.signOut().then(function () { sessionStorage.removeItem("i_bulut_hydrated"); location.reload(); });
    };
  }

  function toast(t) {
    var el = document.createElement("div");
    el.textContent = t;
    el.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;z-index:100000;font-family:system-ui";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  // ============================================================
  //  KIRISH — TELEGRAM orqali (04.09.2026)
  //  Raqam Telegram'ning o'zidan keladi, qo'lda yozilmaydi.
  //  Bot: @IIntizom_bot
  //  Zaxira yo'l: ism + raqam (Telegram'i yo'q odam uchun)
  // ============================================================
  var BOT_NOMI = "IIntizom_bot";
  var TEL_DOMEN = "intizom.app";

  function telNorm(t) {
    var d = (t || "").replace(/\D/g, "");
    if (d.length === 9) d = "998" + d;
    if (d.length === 12 && d.slice(0, 3) === "998") return d;
    return null;
  }
  function telChiroy(d) {
    if (!d || d.length !== 12) return d || "";
    return "+" + d.slice(0, 3) + " " + d.slice(3, 5) + " " + d.slice(5, 8) + "-" + d.slice(8, 10) + "-" + d.slice(10);
  }
  function telEmail(d) { return "u" + d + "@" + TEL_DOMEN; }
  function telParol(d) {
    var s = "intizom-parol-v1:" + d;
    try {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
        return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("").slice(0, 32);
      });
    } catch (e) {
      var h = 5381;
      for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
      return Promise.resolve("z" + h.toString(16) + "-intizom");
    }
  }

  function gate() {
    var wrap = document.createElement("div");
    wrap.id = "bulut-gate";
    wrap.style.cssText = "position:fixed;inset:0;z-index:99999;background:linear-gradient(160deg,#0b1220,#111827);display:flex;align-items:center;justify-content:center;padding:22px;font-family:system-ui,-apple-system,sans-serif;overflow:auto";
    wrap.innerHTML =
      '<div style="width:100%;max-width:360px;color:#fff">' +
        '<div style="text-align:center;margin-bottom:22px">' +
          '<div style="font-size:40px">&#127919;</div>' +
          '<div style="font-size:26px;font-weight:800;margin-top:6px">Intizom</div>' +
          '<div id="bg-sub" style="font-size:14px;opacity:.7;margin-top:4px">Kirish uchun Telegram yetarli</div>' +
        '</div>' +

        // --- 1-bosqich: Telegram tugmasi ---
        '<div id="bg-tg" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px">' +
          '<button id="bg-tgo" style="width:100%;padding:15px;border:none;border-radius:12px;background:#229ED9;color:#fff;font-weight:800;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">' +
            '<span style="font-size:19px">&#9993;</span> Telegram orqali kirish' +
          '</button>' +
          '<div style="font-size:12px;opacity:.55;margin-top:12px;line-height:1.5;text-align:center">' +
            'Bot ochiladi, bir tugma bilan raqamingizni tasdiqlaysiz. Parol o\'ylash shart emas.' +
          '</div>' +
          '<div style="text-align:center;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)">' +
            '<a id="bg-qol" href="#" style="color:#93C5FD;text-decoration:none;font-size:13px">Telegramim yo\'q — qo\'lda kiritaman</a>' +
          '</div>' +
        '</div>' +

        // --- 2-bosqich: kutish ---
        '<div id="bg-kut" style="display:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:22px;text-align:center">' +
          '<div id="bg-spin" style="width:36px;height:36px;margin:0 auto 14px;border:3px solid rgba(255,255,255,.15);border-top-color:#229ED9;border-radius:50%;animation:bgspin 1s linear infinite"></div>' +
          '<div style="font-weight:700;font-size:16px;margin-bottom:6px">Telegram kutilmoqda...</div>' +
          '<div style="font-size:13px;opacity:.65;line-height:1.5">Botda <b>Raqamimni yuborish</b> tugmasini bosing. Tasdiqlangach bu yerga o\'zi kiradi.</div>' +
          '<div id="bg-kuterr" style="color:#FCA5A5;font-size:13px;margin-top:12px;min-height:18px"></div>' +
          '<button id="bg-qayta" style="width:100%;padding:13px;border:none;border-radius:12px;background:#229ED9;color:#fff;font-weight:700;font-size:15px;cursor:pointer;margin-top:14px">Botni qayta ochish</button>' +
          '<button id="bg-tek" style="width:100%;padding:12px;border:1px solid rgba(255,255,255,.15);border-radius:12px;background:transparent;color:#fff;font-weight:600;font-size:14px;cursor:pointer;margin-top:8px">Tekshirish</button>' +
          '<button id="bg-bekor" style="width:100%;padding:11px;border:none;border-radius:12px;background:transparent;color:#93C5FD;font-size:14px;cursor:pointer;margin-top:6px">&#8592; Orqaga</button>' +
        '</div>' +

        // --- Zaxira: ism + raqam ---
        '<div id="bg-man" style="display:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px">' +
          '<input id="bg-ism" type="text" autocomplete="name" placeholder="Ism familiya" ' +
            'style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;font-size:15px;outline:none;margin-bottom:10px">' +
          '<input id="bg-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="90 123 45 67" ' +
            'style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;font-size:17px;letter-spacing:1px;outline:none">' +
          '<div id="bg-err" style="color:#FCA5A5;font-size:13px;min-height:18px;margin:8px 2px 0"></div>' +
          '<button id="bg-go" style="width:100%;padding:15px;border:none;border-radius:12px;background:#00D4A0;color:#04231b;font-weight:800;font-size:16px;cursor:pointer">Kirish</button>' +
          '<div style="text-align:center;margin-top:14px">' +
            '<a id="bg-tgqayt" href="#" style="color:#93C5FD;text-decoration:none;font-size:13px">&#8592; Telegram orqali kirish</a>' +
          '</div>' +
        '</div>' +

        '<div style="text-align:center;font-size:11px;opacity:.4;margin-top:16px">Ma\'lumotlaringiz bulutda saqlanadi</div>' +
      '</div>' +
      '<style>@keyframes bgspin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(wrap);

    var $ = function (id) { return wrap.querySelector(id); };
    var qTimer = null, qKod = null;

    // iPhone da Telegram ga o'tganda Safari sahifani yopib qo'yadi va
    // qaytganda ilova qaytadan yuklanadi. Shuning uchun kutayotgan kodni
    // saqlaymiz — qayta ochilganda o'sha joydan davom etadi.
    var KUT = "tg_kutish";
    function kutSaqla(k) {
      try { localStorage.setItem(KUT, JSON.stringify({ kod: k, vaqt: Date.now() })); } catch (e) {}
    }
    function kutOchir() { try { localStorage.removeItem(KUT); } catch (e) {} }
    function kutOl() {
      try {
        var o = JSON.parse(localStorage.getItem(KUT) || "null");
        if (o && o.kod && (Date.now() - o.vaqt) < 10 * 60 * 1000) return o.kod;
      } catch (e) {}
      return null;
    }

    function korsat(qaysi) {
      $("#bg-tg").style.display  = qaysi === "tg"  ? "block" : "none";
      $("#bg-kut").style.display = qaysi === "kut" ? "block" : "none";
      $("#bg-man").style.display = qaysi === "man" ? "block" : "none";
      var s = $("#bg-sub");
      s.textContent = qaysi === "man" ? "Ismingiz va raqamingizni kiriting" : "Kirish uchun Telegram yetarli";
    }

    function kutishniToxtat() { if (qTimer) { clearInterval(qTimer); qTimer = null; } }

    // ---------- TELEGRAM YO'LI ----------
    function tgBoshla() {
      var btn = $("#bg-tgo");
      btn.disabled = true;
      sb.rpc("tg_kod_yarat").then(function (r) {
        btn.disabled = false;
        if (r.error || !r.data) { alert("Ulanishda xatolik. Internetni tekshiring."); return; }
        qKod = r.data;
        kutSaqla(qKod);
        try { window.open("https://t.me/" + BOT_NOMI + "?start=" + qKod, "_blank"); }
        catch (e) { location.href = "https://t.me/" + BOT_NOMI + "?start=" + qKod; }
        korsat("kut");
        surash();
      }).catch(function () { btn.disabled = false; alert("Ulanishda xatolik."); });
    }

    // har 2 soniyada sessiya tayyormi deb so'raymiz
    function surash() {
      kutishniToxtat();
      var boshlandi = Date.now();
      qTimer = setInterval(function () {
        if (Date.now() - boshlandi > 10 * 60 * 1000) {   // 10 daqiqa
          kutishniToxtat();
          $("#bg-kuterr").textContent = "Vaqt tugadi. Qaytadan boshlang.";
          return;
        }
        sb.rpc("tg_holat", { p_kod: qKod }).then(function (r) {
          var d = r.data;
          if (!d) return;
          if (d.holat === "tayyor" && d.sessiya) {
            kutishniToxtat(); kutOchir();
            sb.auth.setSession({
              access_token: d.sessiya.access_token,
              refresh_token: d.sessiya.refresh_token,
            }).then(function (s) {
              if (s.error || !s.data || !s.data.user) {
                $("#bg-kuterr").textContent = "Sessiya o'rnatilmadi. Qaytadan urinib ko'ring.";
                return;
              }
              try {
                if (d.ism) localStorage.setItem("foydalanuvchi_ism", d.ism);
                if (d.tel) localStorage.setItem("foydalanuvchi_tel", d.tel);
              } catch (e) {}
              afterAuth(s.data.user);
            });
          } else if (d.holat === "eskirgan" || d.holat === "yoq") {
            kutishniToxtat(); kutOchir();
            $("#bg-kuterr").textContent = "Havola eskirdi. Qaytadan boshlang.";
          }
        });
      }, 2000);
    }

    $("#bg-tgo").onclick = tgBoshla;
    $("#bg-qayta").onclick = function () {
      if (!qKod) { korsat("tg"); return; }
      $("#bg-kuterr").textContent = "";
      window.open("https://t.me/" + BOT_NOMI + "?start=" + qKod, "_blank");
      if (!qTimer) surash();
    };
    $("#bg-tek").onclick = function () {
      $("#bg-kuterr").textContent = "";
      if (qKod) surash(); else korsat("tg");
    };
    $("#bg-bekor").onclick = function () { kutishniToxtat(); kutOchir(); qKod = null; korsat("tg"); };

    // ---------- QO'LDA KIRITISH (zaxira) ----------
    $("#bg-qol").onclick = function (e) { e.preventDefault(); kutishniToxtat(); korsat("man"); setTimeout(function () { try { $("#bg-ism").focus(); } catch (x) {} }, 100); };
    $("#bg-tgqayt").onclick = function (e) { e.preventDefault(); korsat("tg"); };

    $("#bg-tel").addEventListener("input", function () {
      var d = this.value.replace(/\D/g, "").slice(0, 12);
      if (d.length > 9 && d.slice(0, 3) === "998") d = d.slice(3);
      var p = [];
      if (d.length > 0) p.push(d.slice(0, 2));
      if (d.length > 2) p.push(d.slice(2, 5));
      if (d.length > 5) p.push(d.slice(5, 7));
      if (d.length > 7) p.push(d.slice(7, 9));
      this.value = p.join(" ");
    });

    function qolKir() {
      var ism = ($("#bg-ism").value || "").trim();
      var tel = telNorm($("#bg-tel").value);
      var err = $("#bg-err");
      err.textContent = "";
      if (ism.length < 2) { err.textContent = "Ismingizni kiriting"; $("#bg-ism").focus(); return; }
      if (!tel) { err.textContent = "Raqamni to'liq kiriting (90 123 45 67)"; $("#bg-tel").focus(); return; }

      var btn = $("#bg-go");
      btn.disabled = true; btn.textContent = "Kirilmoqda...";
      var em = telEmail(tel);

      telParol(tel).then(function (pw) {
        return sb.auth.signInWithPassword({ email: em, password: pw }).then(function (r) {
          if (r.data && r.data.user) return r;
          return sb.auth.signUp({ email: em, password: pw, options: { data: { ism: ism, tel: tel } } });
        });
      }).then(function (r) {
        btn.disabled = false; btn.textContent = "Kirish";
        if (r.error) { err.textContent = tr(r.error.message); return; }
        if (r.data && r.data.user) {
          try {
            localStorage.setItem("foydalanuvchi_ism", ism);
            localStorage.setItem("foydalanuvchi_tel", tel);
          } catch (e) {}
          afterAuth(r.data.user);
        } else {
          err.textContent = "Kirib bo'lmadi — qaytadan urinib ko'ring";
        }
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = "Kirish";
        err.textContent = tr((e && e.message) || "Xatolik");
      });
    }

    $("#bg-go").onclick = qolKir;
    $("#bg-tel").addEventListener("keydown", function (e) { if (e.key === "Enter") qolKir(); });
    $("#bg-ism").addEventListener("keydown", function (e) { if (e.key === "Enter") $("#bg-tel").focus(); });

    // Telegram'dan qaytganda darhol tekshirib ko'ramiz
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && qKod) surash();
    });
    window.addEventListener("focus", function () { if (qKod) surash(); });

    // --- Sahifa qayta yuklangan bo'lsa, kutishni davom ettiramiz ---
    var saqlangan = kutOl();
    if (saqlangan) {
      qKod = saqlangan;
      korsat("kut");
      $("#bg-kuterr").textContent = "";
      surash();
    }
  }

  function tr(m) {
    m = (m || "").toLowerCase();
    if (m.indexOf("invalid login") >= 0) return "Bu raqam band yoki xato";
    if (m.indexOf("already registered") >= 0) return "Kirib bo'lmadi — qaytadan urinib ko'ring";
    if (m.indexOf("rate") >= 0 || m.indexOf("too many") >= 0) return "Ko'p urinildi — biroz kuting";
    if (m.indexOf("network") >= 0 || m.indexOf("fetch") >= 0) return "Internet yo'q — ulanishni tekshiring";
    return m || "Xatolik";
  }

  function removeGate() { var g = document.getElementById("bulut-gate"); if (g) g.remove(); }

  /* Saqlangan sessiya bormi \u2014 to'g'ridan-to'g'ri xotiradan tekshiramiz.
     Bor bo'lsa-yu tarmoq sabab tasdiqlanmasa, kod so'ramaymiz. */
  function _sessiyaBormi() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("sb-") === 0 && k.indexOf("auth-token") > 0) {
          var v = localStorage.getItem(k);
          if (v && v.length > 20) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function start() {
    loadSb().then(function () {
      sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });

      sb.auth.getSession().then(function (r) {
        if (r.data && r.data.session && r.data.session.user) {
          afterAuth(r.data.session.user);
          return;
        }

        /* MUHIM (06.09.2026): bu yerda refreshSession() ni QO'LDA
           chaqirmaymiz va saqlangan kalitni ham ishlatmaymiz.
           Supabase yangilanish kalitini har safar almashtiradi.
           Bitta kalit ikki marta ishlatilsa \u2014 kutubxona bir marta,
           biz ikkinchi marta \u2014 server 400 "already used" qaytaradi
           va butun sessiyani bekor qiladi. Konsolda ko'ringan
           400 (Bad Request) aynan shundan edi.

           To'g'ri yo'l: kutubxona o'zi yangilaydi, biz kutamiz. */
        if (!_sessiyaBormi()) { gate(); return; }

        console.log("Sessiya bor \u2014 yangilanishini kutamiz...");
        var urinish = 0;
        var kutish = setInterval(function () {
          urinish++;
          sb.auth.getSession().then(function (r2) {
            if (r2 && r2.data && r2.data.session && r2.data.session.user) {
              clearInterval(kutish);
              console.log("Sessiya tiklandi \u2014 kod so'ralmadi.");
              afterAuth(r2.data.session.user);
              return;
            }
            if (urinish >= 8) {
              clearInterval(kutish);
              if (typeof navigator !== "undefined" && navigator.onLine === false) {
                console.warn("Internet yo'q \u2014 kirish keyinga qoldirildi.");
                removeGate();
                window.addEventListener("online", function () { location.reload(); }, { once: true });
                return;
              }
              console.warn("Sessiya tiklanmadi \u2014 kirish so'ralmoqda.");
              gate();
            }
          });
        }, 1000);
      });

      /* Sessiya o'zgarishini kuzatamiz: token yangilanganda qayta kirish
         so'ralmasin, chiqib ketilganda esa sabab konsolda ko'rinsin. */
      try {
        sb.auth.onAuthStateChange(function (hodisa, sessiya) {
          if (hodisa === "TOKEN_REFRESHED") { console.log("Token yangilandi."); }
          if (hodisa === "SIGNED_OUT") { console.warn("Sessiya tugadi (SIGNED_OUT)."); }
        });
      } catch (e) {}

    }).catch(function (e) { console.warn("Bulut ulanmadi:", e && e.message); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
