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

  // ---- localStorage kalitlarini yig'ish ----
  function collect() {
    var skip = { i_pin_session: 1, i_parol_ok: 1, i_parol: 1 };
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

  var SKIP_SYNC = { i_pin_session: 1, i_parol_ok: 1, i_parol: 1 };
  var sb = null, uid = null, saveTimer = null, pulling = false;
  // Serverdan bir marta muvaffaqiyatli o'qimaguncha hech narsa yozilmaydi
  var sinxronTayyor = false;

  function badgeHolat(h) {
    var dot = document.getElementById("bulut-dot");
    if (!dot) return;
    dot.style.background = h === "xato" ? "#EF4444" : (h === "kutilmoqda" ? "#F59E0B" : "#10B981");
  }

  var oxirgiImzo = null;   // oxirgi muvaffaqiyatli yuborilgan ma'lumot imzosi

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

    var row = { user_id: uid, data: d, updated_at: new Date().toISOString() };
    sb.from(TABLE).upsert(row, { onConflict: "user_id" }).then(function (r) {
      if (!r.error) oxirgiImzo = yangiImzo;
      badgeHolat(r.error ? "xato" : "ok");
    });
  }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(pushNow, 1200); }

  function hookStorage() {
    var _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      _set(k, v);
      if (k && k.indexOf("i_") === 0 && !SKIP_SYNC[k]) scheduleSave();
    };
    var _rem = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (k) {
      _rem(k);
      if (k && k.indexOf("i_") === 0) scheduleSave();
    };
  }

  function pullThenStart(urinish) {
    urinish = urinish || 1;
    pulling = true;
    sb.from(TABLE).select("data").eq("user_id", uid).maybeSingle().then(function (r) {
      pulling = false;

      // --- Xato bo'lsa: HECH NARSA YOZMAYMIZ, qayta urinamiz ---
      if (r.error) {
        console.warn("Bulutdan o'qib bo'lmadi:", r.error.message);
        badgeHolat("xato");
        if (urinish < 5) { setTimeout(function () { pullThenStart(urinish + 1); }, 3000 * urinish); }
        else { hookStorage(); badge(); }   // hook qo'yamiz, lekin sinxronTayyor=false -> yozmaydi
        return;
      }

      // --- Serverda ma'lumot bor: mahalliy nusxani ZAXIRAGA olib, keyin qo'llaymiz ---
      if (r.data && r.data.data) {
        zaxiraOl();                       // ustiga yozishdan oldin
        apply(r.data.data);
        sinxronTayyor = true;
        sessionStorage.setItem("i_bulut_hydrated", "1");
        location.reload();
        return;
      }

      // --- Serverda qator YO'Q (yangi foydalanuvchi): mahalliyni yuklaymiz ---
      sinxronTayyor = true;
      hookStorage(); pushNow(); badge();
    }).catch(function (e) {
      pulling = false;
      console.warn("Bulut xatosi:", e);
      badgeHolat("xato");
      if (urinish < 5) setTimeout(function () { pullThenStart(urinish + 1); }, 3000 * urinish);
      else { hookStorage(); badge(); }
    });
  }

  // Ustiga yozishdan oldin mahalliy nusxani saqlab qo'yamiz (bir kunlik zaxira)
  function zaxiraOl() {
    try {
      var d = collect();
      if (!Object.keys(d).length) return;
      localStorage.setItem("zaxira_oxirgi", JSON.stringify({ vaqt: Date.now(), data: d }));
    } catch (e) {}
  }

  // Zaxirani qaytarish — konsoldan: intizomZaxiraQaytar()
  window.intizomZaxiraQaytar = function () {
    try {
      var z = JSON.parse(localStorage.getItem("zaxira_oxirgi") || "null");
      if (!z || !z.data) { alert("Zaxira topilmadi."); return; }
      if (!confirm("Zaxira " + new Date(z.vaqt).toLocaleString() + " holatiga qaytarilsinmi?")) return;
      apply(z.data);
      location.reload();
    } catch (e) { alert("Zaxira o'qilmadi."); }
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

  function afterAuth(user) {
    uid = user.id;
    removeGate();
    obunaYangila();
    if (sessionStorage.getItem("i_bulut_hydrated") === "1") { sinxronTayyor = true; hookStorage(); badge(); return; }
    pullThenStart();
  }

  // index.html dagi "PIN'ni unutdim" shu yerga keladi
  window.BULUT = window.BULUT || {};
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
            kutishniToxtat();
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
            kutishniToxtat();
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
    $("#bg-bekor").onclick = function () { kutishniToxtat(); qKod = null; korsat("tg"); };

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
      if (document.visibilityState === "visible" && qKod && qTimer) surash();
    });
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

  function start() {
    loadSb().then(function () {
      sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      sb.auth.getSession().then(function (r) {
        if (r.data && r.data.session && r.data.session.user) afterAuth(r.data.session.user);
        else gate();
      });
    }).catch(function (e) { console.warn("Bulut ulanmadi:", e && e.message); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
