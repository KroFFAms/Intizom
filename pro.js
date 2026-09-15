/* ==================================================================
   INTIZOM — PRO MODULI (pro.js)                       v103 · 15.09.2026
   index.html dan 14.09.2026 da ajratilgan qism. Kechiktirib yuklanadi
   (proModulYukla() orqali, faqat PRO/sinov foydalanuvchida yoki PRO
   tugmasi bosilganda). index.html bilan BIR papkada turishi shart.
   Tarkibi: kun siri, omad g'ildiragi, viktorina, 60 soniya, avatar,
   AI kunlik reja, missiyalar, reyting, kaloriya skaneri + RATSION_DATA,
   ratsion dasturi, kitoblar (+ tavsiya ro'yxati), inglizcha.
   Oxirida proModulOralar() PRO qulfini qayta o'raydi.
   ================================================================== */
// ════════════════════════════════════════════
// 🌟 KUN SIRI
// ════════════════════════════════════════════
var KUN_SIRLAR=[
  {sir:'Kichik o\'zgarish katta natija beradi. Bugun bitta odatingni yaxshila.',manba:'James Clear'},
  {sir:'Muvaffaqiyat — har kuni qilingan narsadir.',manba:'Aristotel'},
  {sir:'Siz o\'ylagan narsangiz bo\'lasiz. Bugun yaxshi o\'ylang.',manba:'Buddha'},
  {sir:'Vaqt — eng qimmatli boylik. Uni faqat muhim narsalarga sarf qiling.',manba:'Seneka'},
  {sir:'Har bir katta yutuq kichik g\'alabalardan iborat.',manba:'Konfutsiy'},
  {sir:'Dangasalik — vaqtni o\'g\'irlovchi. Harakat — umrni uzaytiruvchi.',manba:'Hikmat'},
  {sir:'Alloh sabrlilар bilan birgadir.',manba:'Qur\'on'},
  {sir:'Badaningizni harakat qilдириnг, aqlingiz ochiladi.',manba:'Ilm'},
  {sir:'Bitta kitob bir dunyo eshigini ochadi. Bugun o\'qi.',manba:'Hikmat'},
  {sir:'Uyqu — xotiraning do\'sti. Yaxshi uxlab yaxshi o\'rganing.',manba:'Ilm'},
  {sir:'Ko\'proq suv ich — bu eng arzon dori.',manba:'Tibbiyot'},
  {sir:'Telefon qo\'ying, oila bilan o\'tiring.',manba:'Hayot'},
  {sir:'Har kuni bir odamga iltifot qiling.',manba:'Psixologiya'},
  {sir:'Kechirish — kuchlilар ishi. Bugun kimnidir kechiring.',manba:'Hikmat'},
  {sir:'Salomatlik — boyliklarning eng kattasi.',manba:'Tibbiyot'},
  {sir:'Streakingizni uzmaslik — o\'zingizga berilgan va\'da.',manba:'Intizom'},
  {sir:'Kichik narsalarga shukr qil — Alloh kattaroq beradi.',manba:'Hadis'},
  {sir:'Bugun qilib qo\'ysang — ertaga imkon bo\'lmasligi mumkin.',manba:'Hayot'},
  {sir:'Pul topish oson — uni saqlash qiyin. Tejashni o\'rgan.',manba:'Moliya'},
  {sir:'Namoz — qalbning ozigi. Bugun o\'qidingmi?',manba:'Din'},
  {sir:'Sport qilish — depressiyaning eng yaxshi davosi.',manba:'Ilm'},
  {sir:'Har kuni biror narsadan ko\'proq bil.',manba:'O\'sish'},
  {sir:'Bitta kitob bir dunyo eshigini ochadi.',manba:'Hikmat'},
  {sir:'O\'zingizni sevmasangiz, boshqalar ham sevmaydi.',manba:'Psixologiya'},
  {sir:'Qo\'rquv o\'tadi. Pushaymonlik qoladi. Bugun harakat qil.',manba:'Noma\'lum'},
  {sir:'Suv iching, harakating, uxlang — sog\'lig\'ingiz shunda.',manba:'Tibbiyot'},
  {sir:'Do\'stingni baxtli ko\'rsang — quvon. Qayg\'usa — qo\'llab-quvvat.',manba:'Do\'stlik'},
  {sir:'O\'z fikringni yoz — yozilgan fikr yo\'lga solingan fikr.',manba:'Jurnal'},
  {sir:'Har kechasi bir narsaga shukr ayt — baxt shu yerda.',manba:'Psixologiya'},
  {sir:'Alloh qiyin paytda ham yaqin. U\'nga tavakkal qil.',manba:'Iymon'},
];

function openKunSir(){
  var today=Math.floor(Date.now()/86400000);
  var sir=KUN_SIRLAR[today%KUN_SIRLAR.length];
  var unlocked=S.g('i_sir_'+today);
  var el=document.getElementById('sir-text');
  var src=document.getElementById('sir-source');
  var anim=document.getElementById('sir-unlock-anim');
  if(!unlocked){S.s('i_sir_'+today,true);addBall(3,'Kun siri');
    if(anim){anim.textContent='🔮';setTimeout(function(){anim.textContent='⭐';},500);setTimeout(function(){anim.textContent='🌟';},1000);}
  }
  if(el) el.textContent='"'+sir.sir+'"';
  if(src) src.textContent='— '+sir.manba;
  var prev=document.getElementById('kun-sir-preview');
  if(prev) prev.textContent=sir.sir.slice(0,60)+'...';
  openM('kun-sir-modal');
}

function shareKunSir(){
  var today=Math.floor(Date.now()/86400000);
  var sir=KUN_SIRLAR[today%KUN_SIRLAR.length];
  var text='"'+sir.sir+'"\n— '+sir.manba+'\n\n📱 Intizom: kroffams.github.io/Intizom';
  if(navigator.share)navigator.share({text:text});
  else if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showNotif('✅','Nusxalandi!');});
}

// ════════════════════════════════════════════
// 🎡 SPIN WHEEL
// ════════════════════════════════════════════
var SPIN_ITEMS=[];var _spinning=false;var _spinAngle=0;

function openSpinWheel(){
  var odatlar=(S.g('i_odatlar')||[]).map(function(o){return o.name;});
  var defaults=['10 ta squat','5 ta push-up','2 stakan suv','Bir sahifa kitob','Namoz o\'qi','Zikr ayt','3 daq nafas','Do\'stga qo\'ngiroq'];
  SPIN_ITEMS=odatlar.length?odatlar.concat(defaults.slice(0,4)):defaults;
  SPIN_ITEMS=SPIN_ITEMS.slice(0,8);
  document.getElementById('spin-result').textContent='';
  drawWheel();
  openM('spin-modal');
}

function drawWheel(){
  var canvas=document.getElementById('spin-canvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var n=SPIN_ITEMS.length;
  var arc=2*Math.PI/n;
  var colors=['#DE7831','#DB9725','#1E8C8C','#1FA4BB','#875DE5','#E35199','#E35050','#4F86E2'];
  ctx.clearRect(0,0,260,260);
  for(var i=0;i<n;i++){
    var a=_spinAngle+i*arc;
    ctx.beginPath();ctx.moveTo(130,130);ctx.arc(130,130,125,a,a+arc);ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];ctx.fill();
    ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
    ctx.save();ctx.translate(130,130);ctx.rotate(a+arc/2);
    ctx.textAlign='right';ctx.fillStyle='white';ctx.font='bold 11px Inter,sans-serif';
    var label=SPIN_ITEMS[i].length>12?SPIN_ITEMS[i].slice(0,12)+'..':SPIN_ITEMS[i];
    ctx.fillText(label,118,4);ctx.restore();
  }
  ctx.beginPath();ctx.arc(130,130,28,0,2*Math.PI);ctx.fillStyle='white';ctx.fill();
}

function spinWheel(){
  if(_spinning)return;
  _spinning=true;
  var btn=document.getElementById('spin-btn');
  if(btn)btn.disabled=true;
  var totalSpin=(1440+Math.random()*1440)*(Math.PI/180);
  var duration=3000;var start=Date.now();var startAngle=_spinAngle;
  function animate(){
    var elapsed=Date.now()-start;
    var progress=Math.min(elapsed/duration,1);
    var ease=1-Math.pow(1-progress,4);
    _spinAngle=startAngle+totalSpin*ease;
    drawWheel();
    if(progress<1){requestAnimationFrame(animate);}
    else{
      _spinning=false;if(btn)btn.disabled=false;
      var n=SPIN_ITEMS.length;var arc=2*Math.PI/n;
      var ptr=((-_spinAngle%(2*Math.PI))+(2*Math.PI))%(2*Math.PI);
      var idx=Math.floor(ptr/arc)%n;
      var result=SPIN_ITEMS[idx];
      var resEl=document.getElementById('spin-result');
      if(resEl)resEl.innerHTML='🎉 <strong>'+result+'</strong><br><span style="font-size:14px;color:var(--t2)">Bugun shu vazifani bajaring!</span>';
      addBall(5,'Spin');
      if(typeof konfettiYog==='function')konfettiYog();
    }
  }
  requestAnimationFrame(animate);
}

// ════════════════════════════════════════════
// 🧠 VIKTORINA
// ════════════════════════════════════════════
var SAVOLLAR=[
  {s:"Qur'on qaysi oyda nozil bo'la boshlagan?",j:["Shavvol","Ramazon","Rajab","Muharram"],t:1,kat:"Din"},
  {s:"Islom arkonlari (asosiy farzlar) nechta?",j:["3","4","5","6"],t:2,kat:"Din"},
  {s:"Qur'ondagi eng uzun sura qaysi?",j:["Yasin","Baqara","Fotiha","Ixlos"],t:1,kat:"Din"},
  {s:"Haj amali qaysi shaharda ado etiladi?",j:["Madina","Makka","Quddus","Kufa"],t:1,kat:"Din"},
  {s:"Zakot umumiy qoidada qancha ulushda beriladi?",j:["1%","2.5%","5%","10%"],t:1,kat:"Din"},
  {s:"Bir yilda nechta hayit bor?",j:["1","2","3","4"],t:1,kat:"Din"},
  {s:"Kattalarda inson tanasida nechta suyak bor?",j:["106","186","206","306"],t:2,kat:"Sog'liq"},
  {s:"Qaysi vitamin quyosh nuridan olinadi?",j:["A","C","D","B12"],t:2,kat:"Sog'liq"},
  {s:"Insulin gormoni qaysi a'zoda ishlab chiqariladi?",j:["Jigar","Oshqozon osti bezi","Buyrak","Yurak"],t:1,kat:"Sog'liq"},
  {s:"Suyaklar uchun eng muhim mineral qaysi?",j:["Temir","Kalsiy","Natriy","Yod"],t:1,kat:"Sog'liq"},
  {s:"Eng kichik qon tomiri qaysi?",j:["Arteriya","Vena","Kapillyar","Aorta"],t:2,kat:"Sog'liq"},
  {s:"Yurak daqiqasiga o'rtacha necha marta uradi?",j:["40","70","100","120"],t:1,kat:"Sog'liq"},
  {s:"Marafon masofasi taxminan qancha?",j:["21 km","42 km","50 km","10 km"],t:1,kat:"Sport"},
  {s:"Olimpiada o'yinlari necha yilda bir bo'ladi?",j:["2","3","4","5"],t:2,kat:"Sport"},
  {s:"Push-up asosan qaysi mushakni ishlatadi?",j:["Son","Ko'krak va tritseps","Qorin","Bel"],t:1,kat:"Sport"},
  {s:"Futbolda bir jamoada nechta o'yinchi bo'ladi?",j:["9","10","11","12"],t:2,kat:"Sport"},
  {s:"Moliyada 'aktiv' nima?",j:["Qarz","Daromad keltiruvchi mulk","Xarajat","Soliq"],t:1,kat:"Moliya"},
  {s:"Likvidlik nimani bildiradi?",j:["Foyda","Pulga tez aylantirish osonligi","Qarz","Soliq"],t:1,kat:"Moliya"},
  {s:"Aksiya nima?",j:["Qarz qog'ozi","Kompaniya ulushi","Valyuta","Soliq"],t:1,kat:"Moliya"},
  {s:"Murakkab foiz (compound) nima?",j:["Foiz ustiga foiz","Soliq","Chegirma","Jarima"],t:0,kat:"Moliya"},
  {s:"Diversifikatsiya nimani anglatadi?",j:["Bitta joyga sarmoya","Sarmoyani taqsimlash","Qarz olish","Tejash"],t:1,kat:"Moliya"},
  {s:"Suvning kimyoviy formulasi qaysi?",j:["CO2","H2O","O2","NaCl"],t:1,kat:"Ilm"},
  {s:"Eng katta okean qaysi?",j:["Atlantika","Hind","Tinch","Shimoliy Muz"],t:2,kat:"Ilm"},
  {s:"Quyosh tizimidagi eng katta sayyora qaysi?",j:["Yer","Mars","Yupiter","Saturn"],t:2,kat:"Ilm"},
  {s:"Yorug'lik tezligi taxminan qancha?",j:["300 km/s","3 000 km/s","300 000 km/s","30 000 km/s"],t:2,kat:"Ilm"},
  {s:"Nafas olishda qaysi gaz kerak?",j:["Azot","Kislorod","Vodorod","Karbonat angidrid"],t:1,kat:"Ilm"},
  {s:"Fotosintez o'simlikning qaysi qismida sodir bo'ladi?",j:["Ildiz","Barg","Gul","Poya"],t:1,kat:"Ilm"},
  {s:"Amir Temur davlatining poytaxti qaysi shahar edi?",j:["Buxoro","Samarqand","Xiva","Toshkent"],t:1,kat:"Tarix"},
  {s:"O'zbekiston mustaqillikni qaysi yili e'lon qildi?",j:["1989","1990","1991","1992"],t:2,kat:"Tarix"},
  {s:"Dunyodagi eng baland tog' cho'qqisi qaysi?",j:["K2","Everest","Elbrus","Mont Blan"],t:1,kat:"Geografiya"},
  {s:"Samarqanddagi mashhur tarixiy maydon nomi?",j:["Registon","Chorsu","Hazrati Imom","Chimboy"],t:0,kat:"Geografiya"},
  {s:"Yer Quyosh atrofini taxminan necha kunda aylanadi?",j:["30","180","365","700"],t:2,kat:"Ilm"},
  {s:'Kunlik necha vaqt namoz o\'qiladi?',j:['3','4','5','6'],t:2,kat:'Din'},
  {s:'Asmaul Husna nechta?',j:['55','77','88','99'],t:3,kat:'Din'},
  {s:'Qur\'on nechta suradan iborat?',j:['112','113','114','115'],t:2,kat:'Din'},
  {s:'Kuniga necha litr suv ichish tavsiya etiladi?',j:['1 litr','2 litr','3 litr','0.5 litr'],t:1,kat:'Sog\'liq'},
  {s:'Odamning normal uyqu soati?',j:['4-5','6-7','7-9','10-12'],t:2,kat:'Sog\'liq'},
  {s:'Tuxumning asosiy foydasi?',j:['Uglevod','Oqsil','Yog\'','Vitamin'],t:1,kat:'Sog\'liq'},
  {s:'Kuniga necha qadam yurish tavsiya etiladi?',j:['3000','5000','10000','15000'],t:2,kat:'Sog\'liq'},
  {s:'Plank qaysi mushaklarga foydali?',j:['Qo\'l','Oyoq','Qorin va yelka','Orqa'],t:2,kat:'Sport'},
  {s:'Squat qaysi mushaklarga foydali?',j:['Qo\'l','Son va dumba','Qorin','Ko\'krak'],t:1,kat:'Sport'},
  {s:'Inflyatsiya nima?',j:['Pul qadri oshishi','Pul qadri tushishi','Foiz stavkasi','Soliq'],t:1,kat:'Moliya'},
  {s:'Tejamkorlikning asosiy qoidasi?',j:['Ko\'p xarid','Daromaddan kam xarajat','Qarz olish','Kredit'],t:1,kat:'Moliya'},
  {s:'O\'zbekistonning poytaxti?',j:['Samarqand','Buxoro','Toshkent','Namangan'],t:2,kat:'Ilm'},
  {s:'Dunyo aholisi taxminan qancha?',j:['5 mlrd','7 mlrd','8 mlrd','10 mlrd'],t:2,kat:'Ilm'},
  {s:'Ramazon oyi necha kun?',j:['28','29 yoki 30','31','27'],t:1,kat:'Din'},
  {s:'Kofein qaysi ichimlikda ko\'p?',j:['Choy','Kofe','Suv','Sharbat'],t:1,kat:'Ilm'},
];
var _viktIdx=0;var _viktScore=0;var _viktAnswered=false;

function openViktorina(){
  _viktScore=0;_viktIdx=Math.floor(Math.random()*SAVOLLAR.length);_viktAnswered=false;
  renderViktorina();openM('vikt-modal');
}

function renderViktorina(){
  var el=document.getElementById('vikt-content');
  var sl=document.getElementById('vikt-score-lbl');
  if(!el)return;
  if(sl)sl.textContent=_viktScore+' ball to\'plandi';
  var q=SAVOLLAR[_viktIdx%SAVOLLAR.length];
  el.innerHTML=
    '<div style="background:rgba(6,182,212,.1);border-radius:12px;padding:6px 14px;margin-bottom:14px;display:inline-block">'+
      '<span style="font-size:13.5px;font-weight:700;color:#1FA4BB">'+q.kat+'</span>'+
    '</div>'+
    '<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:20px;line-height:1.5">'+q.s+'</div>'+
    '<div style="display:flex;flex-direction:column;gap:10px" id="vikt-options">'+
    q.j.map(function(javob,i){
      return '<button onclick="checkVikt('+i+')" style="padding:14px 16px;border-radius:14px;border:2px solid var(--bd);background:var(--card);color:var(--text);font-size:15px;text-align:left;cursor:pointer;transition:all .2s;font-weight:700">'+
        '<span style="color:var(--g);font-weight:700;margin-right:8px">'+String.fromCharCode(65+i)+'.</span>'+javob+'</button>';
    }).join('')+'</div>';
}

function checkVikt(chosen){
  if(_viktAnswered)return;
  _viktAnswered=true;
  var q=SAVOLLAR[_viktIdx%SAVOLLAR.length];
  document.querySelectorAll('#vikt-options button').forEach(function(b,i){
    b.style.cursor='default';
    if(i===q.t){b.style.background='rgba(30,140,140,.2)';b.style.borderColor='var(--g)';b.style.color='var(--g)';}
    else if(i===chosen){b.style.background='rgba(239,68,68,.1)';b.style.borderColor='#E35050';b.style.color='#E35050';}
  });
  var ok=chosen===q.t;
  if(ok){_viktScore+=10;addBall(10,'Viktorina');}
  var el=document.getElementById('vikt-content');
  if(el)el.innerHTML+=(ok
    ?'<div style="background:rgba(30,140,140,.1);border-radius:12px;padding:12px;margin-top:14px;text-align:center;border:1px solid var(--g)">✅ <strong style="color:var(--g)">To\'g\'ri! +10 ball</strong></div>'
    :'<div style="background:rgba(239,68,68,.08);border-radius:12px;padding:12px;margin-top:14px;text-align:center;border:1px solid #E35050">❌ Noto\'g\'ri. To\'g\'ri: <strong style="color:#E35050">'+q.j[q.t]+'</strong></div>')+
    '<button onclick="nextVikt()" style="width:100%;margin-top:14px;padding:13px;border-radius:14px;background:linear-gradient(135deg,#1FA4BB,#1C7BAD);color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer">Keyingi ➡️</button>';
  var sl=document.getElementById('vikt-score-lbl');
  if(sl)sl.textContent=_viktScore+' ball to\'plandi';
}

function nextVikt(){_viktIdx++;_viktAnswered=false;renderViktorina();}

// ════════════════════════════════════════════
// ⚡ MINI 60 SONIYA CHALLENGE
// ════════════════════════════════════════════
var MINI_MASHQLAR=[
  {nom:'Squat ⬇️',desc:'Tizza 90° — baland tur'},
  {nom:'Push-up 💪',desc:'Qo\'llar yelka kengligida'},
  {nom:'Jumping Jacks ⭐',desc:'Qo\'l va oyoqlarni kering'},
  {nom:'High Knees 🏃',desc:'Tizzani yuqori ko\'taring'},
  {nom:'Burpee 🔥',desc:'Cho\'k-yot-tur ketma-ket'},
  {nom:'Crunch 💥',desc:'Qorinni qis, yelkani ko\'tar'},
  {nom:'Leg Raises 🦵',desc:'Oyoqni tekis ko\'taring'},
  {nom:'Mountain Climbers ⛰️',desc:'Plankda oyoq almashtiring'},
];
var _miniTimer=null;var _miniTime=60;var _miniCount=0;var _miniIdx=0;

function openMiniChallenge(){
  _miniIdx=Math.floor(Math.random()*MINI_MASHQLAR.length);
  _miniTime=60;_miniCount=0;
  var m=MINI_MASHQLAR[_miniIdx];
  var ne=document.getElementById('mini-exercise');var de=document.getElementById('mini-desc');
  var ce=document.getElementById('mini-count');var te=document.getElementById('mini-timer');
  if(ne)ne.textContent=m.nom;if(de)de.textContent=m.desc;
  if(ce)ce.textContent='0';if(te)te.textContent='60';
  updateMiniRing(60);
  if(_miniTimer)clearInterval(_miniTimer);
  _miniTimer=setInterval(function(){
    _miniTime--;
    var te2=document.getElementById('mini-timer');if(te2)te2.textContent=_miniTime;
    updateMiniRing(_miniTime);
    if(_miniTime<=0){clearInterval(_miniTimer);_miniTimer=null;miniFinish();}
  },1000);
  openM('mini-modal');
}

function updateMiniRing(t){
  var ring=document.getElementById('mini-ring');if(!ring)return;
  ring.style.strokeDashoffset=440*(1-t/60);
  ring.style.stroke=t>30?'#1E8C8C':t>10?'#DB9725':'#E35050';
}

function miniTap(){
  _miniCount++;
  var ce=document.getElementById('mini-count');
  if(ce){ce.textContent=_miniCount;ce.style.transform='scale(1.3)';setTimeout(function(){ce.style.transform='scale(1)';},120);}
  addBall(1,'Mini');
}

function miniNext(){
  _miniIdx=(_miniIdx+1)%MINI_MASHQLAR.length;
  var m=MINI_MASHQLAR[_miniIdx];
  var ne=document.getElementById('mini-exercise');var de=document.getElementById('mini-desc');
  if(ne)ne.textContent=m.nom;if(de)de.textContent=m.desc;
}

function miniFinish(){
  var ne=document.getElementById('mini-exercise');var de=document.getElementById('mini-desc');
  var ce=document.getElementById('mini-count');
  if(ne)ne.textContent='🎉 Barakalla!';if(de)de.textContent=_miniCount+' marta bajardingiz!';
  if(ce){ce.textContent=_miniCount;ce.style.color='#DBBE24';}
  addBall(Math.min(_miniCount,20),'Mini challenge');
  if(typeof konfettiYog==='function')konfettiYog();
  showNotif('⚡ '+_miniCount+' marta!','60 soniya challenge tugadi!');
}

function stopMiniChallenge(){if(_miniTimer){clearInterval(_miniTimer);_miniTimer=null;}closeM('mini-modal');}

// ════════════════════════════════════════════
// 🧑 AVATAR TIZIMI
// ════════════════════════════════════════════
var AVATAR_LEVELS=[
  {min:0,   max:99,  nom:'Yangi boshlovchi',emoji:'🧒',rang:'#64748B'},
  {min:100, max:299, nom:'Harakat qiluvchi', emoji:'🏃',rang:'#1E8C8C'},
  {min:300, max:599, nom:'Intizomli',        emoji:'💪',rang:'#4F86E2'},
  {min:600, max:999, nom:'Qahramoncha',      emoji:'⚡',rang:'#DB9725'},
  {min:1000,max:1999,nom:'Master',           emoji:'🌟',rang:'#875DE5'},
  {min:2000,max:3999,nom:'Ustoz',            emoji:'🏆',rang:'#E35050'},
  {min:4000,max:9999,nom:'Afsonaviy',        emoji:'👑',rang:'#DBBE24'},
  {min:10000,max:99999,nom:'O\'lmas',        emoji:'🦅',rang:'#DE7831'},
];

function openAvatar(){renderAvatar();openM('avatar-modal');}

function renderAvatar(){
  var ball=S.g('i_ball')||0;
  var lidx=0;
  for(var li=0;li<AVATAR_LEVELS.length;li++){if(ball>=AVATAR_LEVELS[li].min)lidx=li;}
  var level=AVATAR_LEVELS[lidx];
  var nextLevel=AVATAR_LEVELS[lidx+1];
  var pct=nextLevel?Math.round((ball-level.min)/(nextLevel.min-level.min)*100):100;

  var els={big:'av-big',name:'av-name',bar:'av-bar',lbl:'av-ball-lbl',disp:'avatar-display',lvl:'avatar-level-lbl'};
  Object.keys(els).forEach(function(k){var el=document.getElementById(els[k]);if(!el)return;
    if(k==='big'||k==='disp')el.textContent=level.emoji;
    else if(k==='name')el.textContent=level.nom;
    else if(k==='bar'){el.style.width=pct+'%';el.style.background='linear-gradient(90deg,'+level.rang+','+level.rang+'88)';}
    else if(k==='lbl')el.textContent=ball+(nextLevel?' / '+nextLevel.min:'+')+ ' ball';
    else if(k==='lvl')el.textContent='Daraja: '+(lidx+1);
  });

  var levelsEl=document.getElementById('av-levels');
  if(levelsEl)levelsEl.innerHTML=AVATAR_LEVELS.map(function(l,i){
    var reached=ball>=l.min;var cur=i===lidx;
    return '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:'+(cur?l.rang+'18':'var(--bg)')+';border:1.5px solid '+(cur?l.rang:'var(--bd)')+';margin-bottom:4px">'+
      '<div style="font-size:22px">'+(reached?l.emoji:'⬜')+'</div>'+
      '<div style="flex:1"><div style="font-size:15px;font-weight:700;color:'+(reached?'var(--text)':'var(--t2)')+'">'+l.nom+'</div>'+
      '<div style="font-size:13.5px;color:var(--t2)">'+l.min+'+ ball</div></div>'+
      (cur?'<div style="background:'+l.rang+';color:#fff;border-radius:8px;padding:2px 8px;font-size:12.5px;font-weight:700">HOZIR</div>':
       reached?'<div style="color:var(--g);font-size:16px">✓</div>':'<div style="color:var(--bd);font-size:15px">🔒</div>')+
    '</div>';
  }).join('');
}

var _aiMoodTag = '';

function setAiMood(btn, val){
  _aiMoodTag = val;
  document.querySelectorAll('.ai-mood-tag').forEach(function(b){
    b.style.background = 'var(--bg)'; b.style.color = 'var(--t2)'; b.style.borderColor = 'var(--bd)';
  });
  btn.style.background = 'var(--g)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--g)';
}

function genAiReja(){
  var input = (document.getElementById('ai-reja-input').value||'').trim();
  var mood = _aiMoodTag || 'Oddiy';
  var today = new Date();
  var dayName = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'][today.getDay()];
  var odatlar = (S.g('i_odatlar')||[]).map(function(o){return o.name;}).join(', ');
  var namozlar = ['Bomdod','Peshin','Asr','Shom','Xufton'];

  document.getElementById('ai-reja-loading').style.display='block';
  document.getElementById('ai-reja-result').style.display='none';
  document.getElementById('ai-reja-btn').disabled=true;

  if(!AI_READY){
    document.getElementById('ai-reja-loading').style.display='none';
    document.getElementById('ai-reja-btn').disabled=false;
    showNotif('🤖 AI hali ulanmagan','Bu funksiya uchun AI proxy sozlash kerak');
    return;
  }

  var prompt = 'Men uchun bugungi kun rejas tuz. Bugun '+dayName+'. Kayfiyatim: '+mood+
    (input?'. Rejalarim: '+input:'')+
    (odatlar?'. Odatlarim: '+odatlar:'')+
    '. Soat bo\'yicha jadval tuz: bomdod, ertalab, kun, kechki, xufton vaqtlari bilan. '+
    'Namoz vaqtlarini kirgizt. Sport, oziqlanish, ish, dam olish muvozanatini saqla. '+
    'JSON formatda: {"jadval":[{"soat":"05:30","vazifa":"Bomdod namoz","emoji":"🕌","tur":"din"},...], "maslahat":"..."}'+
    ' Faqat JSON, boshqa hech narsa yozma. O\'zbek tilida.';

  aiFetch('reja', {
      model:'claude-sonnet-4-6', max_tokens:4000,
      system:'Sen shaxsiy produktivlik yordamchisisan. Faqat JSON javob ber.',
      messages:[{role:'user',content:prompt}]
    })
  .then(function(r){return r.json();})
  .then(function(d){
    document.getElementById('ai-reja-loading').style.display='none';
    document.getElementById('ai-reja-btn').disabled=false;
    var text=(d.content&&d.content[0]&&d.content[0].text)||'';
    var dbg=document.getElementById('ai-reja-result');
    if(!text){
      dbg.style.display='block';
      dbg.innerHTML='<div style="background:rgba(244,63,94,.1);border:1px solid var(--red);border-radius:12px;padding:12px;font-size:14px;word-break:break-word">\u26A0\uFE0F AI matn qaytarmadi. Javob:<br><br>'+JSON.stringify(d).slice(0,600).replace(/</g,'&lt;')+'</div>';
      return;
    }
    var res=_extractReja(text);
    if(!res){
      dbg.style.display='block';
      dbg.innerHTML='<div style="background:rgba(244,63,94,.1);border:1px solid var(--red);border-radius:12px;padding:12px;font-size:14px;word-break:break-word">\u26A0\uFE0F [v2] JSON o\'qilmadi. AI javobi:<br><br>'+text.slice(0,600).replace(/</g,'&lt;')+'</div>';
      return;
    }
    try{ showAiReja(res); }catch(e){
      dbg.style.display='block';
      dbg.innerHTML='<div style="background:rgba(244,63,94,.1);border:1px solid var(--red);border-radius:12px;padding:12px;font-size:14px;word-break:break-word">\u26A0\uFE0F Ko\'rsatishda xato: '+String(e).replace(/</g,'&lt;')+'<br><br>'+JSON.stringify(res).slice(0,400).replace(/</g,'&lt;')+'</div>';
    }
  })
  .catch(function(){
    document.getElementById('ai-reja-loading').style.display='none';
    document.getElementById('ai-reja-btn').disabled=false;
    showNotif('❌','Internet kerak');
  });
}

function showAiReja(res){
  var el=document.getElementById('ai-reja-result');
  el.style.display='block';
  var turRang={'din':'#DBBE24','sport':'#E35050','oziq':'#1E8C8C','ish':'#4F86E2','dam':'#875DE5','boshqa':'#64748B'};
  el.innerHTML=
    '<div style="font-size:15px;font-weight:700;color:var(--t2);margin-bottom:12px;letter-spacing:.5px">📅 BUGUNGI JADVAL</div>'+
    (res.jadval||[]).map(function(v){
      var rang=turRang[v.tur]||'var(--g)';
      return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd)">'+
        '<div style="font-size:15px;font-weight:700;color:'+rang+';white-space:nowrap;width:42px">'+v.soat+'</div>'+
        '<div style="font-size:20px">'+v.emoji+'</div>'+
        '<div style="flex:1;font-size:15px;color:var(--text)">'+v.vazifa+'</div>'+
        '<button onclick="addAiTask(\''+v.soat+'\',\''+v.emoji+'\',\''+v.vazifa.replace(/'/g,"\\'")+'\')" '+
          'style="background:rgba(30,140,140,.1);border:1px solid var(--g);color:var(--g);padding:4px 10px;border-radius:8px;font-size:13.5px;cursor:pointer;white-space:nowrap">+ Reja</button>'+
      '</div>';
    }).join('')+
    (res.maslahat?'<div style="background:rgba(30,140,140,.08);border-radius:14px;padding:14px;margin-top:14px;border:1px solid rgba(30,140,140,.2)">'+
      '<div style="font-size:13.5px;font-weight:700;color:var(--g);margin-bottom:6px">💡 MASLAHAT</div>'+
      '<div style="font-size:15px;color:var(--text);line-height:1.6">'+res.maslahat+'</div>'+
    '</div>':'');
}

function addAiTask(soat, emoji, vazifa){
  rejaQosh({id:Date.now(), name:emoji+' '+vazifa, text:emoji+' '+vazifa,
            done:false, start:soat, time:soat, date:bugunKun(), icon:emoji});
  showNotif('✅','"'+vazifa+'" rejaga qo\'shildi!');
}
/* ==================================================================
   MISSIYA ENDI SIZNING ODATLARINGIZDAN CHIQADI      07.09.2026

   Ilgari missiyalar qat'iy yozib qo'yilgan edi: "Bir odatingni
   bajarsang bas", "10 ta squat qil". Ilova sizning haqiqiy
   odatlaringizni biladi, lekin ishlatmasdi \u2014 shuning uchun
   missiya begona va ma'nosiz tuyulardi.

   Endi u bugungi holatga qaraydi: qaysi odat qolgan, qaysi
   namoz o'qilmagan, suv yetmadimi. Aniq ish nomini aytadi.
   ================================================================== */
var DEFAULT_MISSIONS = [
  {id:1,text:'Bir odatingni bajar',emoji:'🔥',ball:10},
  {id:2,text:'Kamida bir namoz o\'qi',emoji:'🕌',ball:15},
  {id:3,text:'10 daqiqa harakat qil',emoji:'💪',ball:8},
];

function missiyaYarat(){
  var bugun = bugunKun(), chiq = [], id = 1;

  /* 1. Bajarilmagan odatlardan eng uzun seriyalisi \u2014 uni
        yo'qotish eng og'ir, shuning uchun eng qimmatli. */
  try{
    var qolgan = (state.odatlar||[]).filter(function(o){ return !(o.hist && o.hist[bugun]); });
    qolgan.sort(function(a,b){ return (b.streak||0) - (a.streak||0); });
    qolgan.slice(0,2).forEach(function(o){
      var s = o.streak||0;
      chiq.push({
        id:id++, emoji:o.icon||'\uD83D\uDD25',
        text:o.name + (s>=3 ? ' \u2014 ' + s + ' kunlik seriya' : ''),
        ball: s>=7 ? 20 : 10
      });
    });
  }catch(e){}

  /* 2. O'qilmagan namoz */
  try{
    var nz = (state.din && state.din.namoz && state.din.namoz[bugun]) || {};
    var yoq = NAMOZLAR_LIST.filter(function(v){ return v.id!=='tahajjud' && !nz[v.id]; });
    if(yoq.length){
      chiq.push({ id:id++, emoji:'\uD83D\uDD4C',
        text: yoq.length===1 ? yoq[0].nom + ' namozini o\'qi'
                             : 'Qolgan ' + yoq.length + ' vaqt namozni o\'qi',
        ball: 15 });
    }
  }catch(e){}

  /* 3. Suv */
  try{
    var sv = Math.round(((S.g('i_suv')||{})[bugun]||0)/250);
    if(sv < 8) chiq.push({ id:id++, emoji:'\uD83D\uDCA7',
      text:'Yana ' + (8-sv) + ' stakan suv ich', ball:8 });
  }catch(e){}

  /* 4. Bugungi rejadan biri */
  try{
    var rj = ((state.reja && state.reja.bugun && state.reja.bugun[bugun]) || [])
             .filter(function(r){ return !r.done; });
    if(rj.length) chiq.push({ id:id++, emoji:rj[0].icon||'\uD83D\uDCCB',
      text:rj[0].name + (rj[0].start ? ' \u00b7 ' + rj[0].start : ''), ball:10 });
  }catch(e){}

  /* 5. Kundalik */
  try{
    var bugungiYozuv = getJurnalData().some(function(j){
      return String(j.date||'').slice(0,10)===bugun;
    });
    if(!bugungiYozuv) chiq.push({ id:id++, emoji:'\uD83D\uDCD3',
      text:'Kundalikka bir qator yoz', ball:10 });
  }catch(e){}

  if(!chiq.length){
    return DEFAULT_MISSIONS.map(function(m){ return Object.assign({}, m, {done:false}); });
  }
  return chiq.slice(0,4).map(function(m){ return Object.assign({}, m, {done:false}); });
}

function openMissionModal(){
  renderMissions();
  openM('mission-modal');
}

function renderMissions(){
  var today=bugunKun();
  var mdata=S.g('i_missions')||{};
  var todayM=mdata[today];

  var list=document.getElementById('mission-list');
  if(!list)return;

  if(!todayM||!todayM.items||!todayM.items.length){
    list.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2)">'+
      '<div style="font-size:48px;margin-bottom:12px">🎯</div>'+
      '<div style="font-size:15px;font-weight:700">Bugun uchun missiyalar yo\'q</div>'+
      '<div style="font-size:14px;margin-top:6px">AI missiya yaratish uchun tugmani bosing</div>'+
    '</div>';
    todayM={items:missiyaYarat()};
    mdata[today]=todayM; S.s('i_missions',mdata);
    renderMissions(); return;
  }

  var done=todayM.items.filter(function(m){return m.done;}).length;
  var total=todayM.items.length;
  var pct=Math.round(done/total*100);

  list.innerHTML=
    '<div style="background:linear-gradient(135deg,rgba(30,140,140,.22),rgba(30,140,140,.09));border:1px solid rgba(30,140,140,.22);border-radius:16px;padding:16px;margin-bottom:14px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
        '<div style="font-size:15px;font-weight:700;color:var(--text)">'+done+'/'+total+' missiya</div>'+
        '<div style="font-size:15px;font-weight:800;color:#DBBE24">+'+todayM.items.reduce(function(s,m){return s+(m.done?m.ball:0);},0)+' ball</div>'+
      '</div>'+
      '<div style="background:rgba(30,140,140,.14);border-radius:6px;height:6px">'+
        '<div style="background:linear-gradient(90deg,#DBBE24,#DB9725);height:6px;border-radius:6px;width:'+pct+'%;transition:width .5s"></div>'+
      '</div>'+
    '</div>'+
    todayM.items.map(function(m,i){
      return '<div onclick="toggleMission('+i+')" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--card);border-radius:16px;margin-bottom:10px;border:2px solid '+(m.done?'var(--g)':'var(--bd)')+';cursor:pointer;transition:all .25s;box-shadow:var(--shadow)">'+
        '<div style="font-size:32px">'+m.emoji+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-size:15px;font-weight:700;color:var(--text);'+(m.done?'text-decoration:line-through;opacity:.6':'')+'">'+esc(m.text)+'</div>'+
          '<div style="font-size:14px;color:var(--g);margin-top:2px;font-weight:700">+'+m.ball+' ball</div>'+
        '</div>'+
        '<div style="width:28px;height:28px;border-radius:50%;border:2px solid '+(m.done?'var(--g)':'var(--bd)')+';background:'+(m.done?'var(--g)':'transparent')+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px">'+
          (m.done?'✓':'')+
        '</div>'+
      '</div>';
    }).join('');
}

function toggleMission(i){
  var today=bugunKun();
  var mdata=S.g('i_missions')||{};
  var m=mdata[today];
  if(!m||!m.items)return;
  var wasD=m.items[i].done;
  m.items[i].done=!wasD;
  if(!wasD) addBall(m.items[i].ball,'Missiya');
  S.s('i_missions',mdata);
  renderMissions();
  if(!wasD){
    showNotif('🎯 Bajarildi!',m.items[i].text);
    if(typeof konfettiYog==='function') konfettiYog();
  }
  var badge=document.getElementById('mission-badge');
  if(badge){
    var done=m.items.filter(function(x){return x.done;}).length;
    badge.textContent=done+'/'+m.items.length+' Missiya';
  }
}

function genMissions(){
  var btn=document.getElementById('mission-gen-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Yuklanmoqda...';}

  var odatlar=(S.g('i_odatlar')||[]).map(function(o){return o.name;}).slice(0,5).join(', ');
  var jins=S.g('i_jins')||'erkak';
  var today=new Date();
  var dayName=['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'][today.getDay()];

  if(!AI_READY){
    if(btn){btn.disabled=false;btn.textContent='🔄 Yangi missiyalar olish';}
    showNotif('🤖 AI hali ulanmagan','Missiyalar uchun AI proxy sozlash kerak');
    return;
  }

  aiFetch('missiya', {
      model:'claude-sonnet-4-6', max_tokens:600,
      system:'Sen motivatsion yordamchisan. Faqat JSON javob ber.',
      messages:[{role:'user',content:
        'Bugun '+dayName+' kuni uchun 3 ta maxsus missiya ber. Jins: '+jins+
        (odatlar?'. Odatlar: '+odatlar:'')+
        '. Har bir missiya qisqa, aniq va bajariladigan bo\'lsin. '+
        'JSON: {"missions":[{"text":"...","emoji":"...","ball":10},...]} Faqat JSON. O\'zbek tilida.'
      }]
    })
  .then(function(r){return r.json();})
  .then(function(d){
    if(btn){btn.disabled=false;btn.textContent='🔄 Yangi missiyalar olish';}
    var text=(d.content&&d.content[0]&&d.content[0].text)||'';
    var jm=text.match(/\{[\s\S]*\}/);
    if(!jm){showNotif('⚠️','Xato'); return;}
    try{
      var res=JSON.parse(jm[0]);
      var today2=bugunKun();
      var mdata=S.g('i_missions')||{};
      mdata[today2]={items:res.missions.map(function(m,i){return {id:i,text:m.text,emoji:m.emoji,ball:m.ball||10,done:false};})};
      S.s('i_missions',mdata);
      renderMissions();
      showNotif('✅','Yangi missiyalar tayyor!');
    }catch(e){showNotif('⚠️','Xato');}
  })
  .catch(function(){
    if(btn){btn.disabled=false;btn.textContent='🔄 Yangi missiyalar olish';}
    showNotif('❌','Internet kerak');
  });
}
/* Reyting tugmasi: guruh bo'lsa to'g'ridan-to'g'ri Oila -> Birga ga */
function reytingOch(){
  try{
    if(_guruhlar && _guruhlar.length){
      showPage('oila');
      setTimeout(function(){
        try{
          var b=document.getElementById('oila-body');
          if(b){ b.setAttribute('data-tab','bulut'); renderOila(); }
        }catch(e){}
      },80);
      return;
    }
  }catch(e){}
  openLeaderModal();
}

function openLeaderModal(){
  renderLeader();
  openM('leader-modal');
}

function renderLeader(){
  var list=document.getElementById('leader-list');
  if(!list)return;
  list.innerHTML='<div style="text-align:center;padding:24px;color:var(--t2)">Yuklanmoqda...</div>';

  var myBall=S.g('i_ball')||0;
  var myName=(S.g('i_profil')||{}).name||'Siz';

  if(!window.BULUT || !window.BULUT.rpc){
    list.innerHTML=_leaderBosh(myBall);
    return;
  }

  window.BULUT.rpc('mening_reytingim').then(function(r){
    var g=(r && r.data && r.data.guruhlar) ? r.data.guruhlar : [];
    if(!g.length){ list.innerHTML=_leaderBosh(myBall); return; }

    var GT={oila:'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67',dost:'\uD83E\uDD1D',sport:'\uD83C\uDFC3',ish:'\uD83D\uDCBC'};
    var medal=['\uD83E\uDD47','\uD83E\uDD48','\uD83E\uDD49'];

    list.innerHTML =
      '<div style="font-size:14px;color:var(--t2);margin-bottom:14px;text-align:center;line-height:1.6">' +
        'Guruhlaringizdagi o\'rningiz \u00b7 oxirgi 7 kun</div>' +
      g.map(function(x){
        var top=(x.top||[]);
        var eng=(top[0] && top[0].ball) || 1;
        return '<div class="card" style="margin-bottom:12px;padding:14px">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
            '<span style="font-size:17px">'+(GT[x.turi]||GT.oila)+'</span>' +
            '<div style="flex:1"><div style="font-size:15px;font-weight:800">'+esc(x.nom)+'</div>' +
            '<div style="font-size:13.5px;color:var(--t2)">'+x.jami+' a\'zo</div></div>' +
            '<div style="text-align:right">' +
              '<div style="font-size:22px;font-weight:900;color:'+(x.orin<=3?'#DBBE24':'var(--g)')+'">'+x.orin+'</div>' +
              '<div style="font-size:12px;color:var(--t2)">o\'rin</div>' +
            '</div>' +
          '</div>' +
          top.map(function(t,i){
            var w=Math.min(100,Math.round((t.ball||0)/eng*100));
            return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0'+(t.menmi?';font-weight:700':'')+'">' +
              '<span style="width:22px">'+(medal[i]||'')+'</span>' +
              '<span style="flex:1;font-size:15px">'+esc(t.ism||'\u2014')+(t.menmi?' <span style="font-size:12px;color:var(--g)">(siz)</span>':'')+'</span>' +
              '<div style="width:60px;background:var(--bd);height:5px;border-radius:3px;overflow:hidden">' +
                '<div style="background:linear-gradient(90deg,#DBBE24,#DB9725);height:5px;width:'+w+'%"></div></div>' +
              '<span style="font-size:15px;font-weight:800;width:38px;text-align:right">'+(t.ball||0)+'</span>' +
            '</div>';
          }).join('') +
          (x.orin>3 ? '<div style="text-align:center;color:var(--t2);letter-spacing:3px;font-size:15px">\u00b7\u00b7\u00b7</div>' +
            '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-weight:700">' +
              '<span style="width:22px;color:var(--t2);font-size:14px">'+x.orin+'</span>' +
              '<span style="flex:1;font-size:15px">'+myName+' <span style="font-size:12px;color:var(--g)">(siz)</span></span>' +
              '<span style="font-size:15px;font-weight:800">'+x.mening_ball+'</span>' +
            '</div>' : '') +
        '</div>';
      }).join('');
  }).catch(function(){ list.innerHTML=_leaderBosh(myBall); });
}

function _leaderBosh(myBall){
  return '<div style="text-align:center;padding:26px 18px">' +
    '<div style="font-size:42px;margin-bottom:10px">\uD83C\uDFC6</div>' +
    '<div style="font-size:16px;font-weight:800;margin-bottom:8px">Sizning ballingiz: '+myBall+'</div>' +
    '<div style="font-size:15px;color:var(--t2);line-height:1.7;margin-bottom:16px">' +
      'Reyting guruhda ishlaydi. Oila bo\'limidan guruh yarating yoki kod bilan qo\'shiling \u2014 keyin kim nechanchi o\'rinda ekani shu yerda ko\'rinadi.</div>' +
    '<button onclick="closeM(\'leader-modal\');showPage(\'oila\');" class="btn btn-g btn-block">Oila bo\'limiga o\'tish</button>' +
  '</div>';
}
function copyLeaderLink(){
  var myBall=S.g('i_ball')||0;
  var myName=(S.g('i_profil')||{}).name||'Foydalanuvchi';
  var link='https://kroffams.github.io/Intizom/?join='+encodeURIComponent(myName)+'&ball='+myBall;
  if(navigator.clipboard){
    navigator.clipboard.writeText(link).then(function(){showNotif('✅','Link nusxalandi!');});
  } else {
    showNotif('📋',link);
  }
}
var RATSION_DATA = {
  yoqotish: {
    erkak: {
      kaloriya: 1800,
      program: [
        {nom:'Oqsil va sabzavot', nonushta:'2 ta tuxum + bodring + choy (shakar yo\'q)', tushlik:'Tovuq ko\'krak (150g) + qaynatilgan sabzavot', kechki:'Baliq (130g) + yashil salat', maslahat:'Suv: 2.5L. Qand va un mahsulotlaridan uzoq bo\'ling.'},
        {nom:'Past kaloriyali kun', nonushta:'Suli bo\'tqa (250ml sut) + 1 olmog\'iz', tushlik:'Turkiya go\'shti (130g) + jigarrang guruch (100g)', kechki:'Qaynatilgan tuxum (2ta) + pomidor salati', maslahat:'Kechki ovqatni 19:00 gacha yeng. Shakarli ichimliklarni to\'xtating.'},
        {nom:'Detoks kuni', nonushta:'Smoothie: tarvuz + limon + zanjabil', tushlik:'Yashil salat + mol go\'shti (100g)', kechki:'Baliq sho\'rva + sabzavot', maslahat:'Bugun 3L suv iching. Tuz miqdorini kamaytiring.'},
        {nom:'Yuqori oqsil', nonushta:'3 ta tuxum omlet + pomidor', tushlik:'Tovuq + nohot (150g) + salat', kechki:'Kefir (200ml) + ko\'k bodring', maslahat:'Har 3 soatda kichik porsiya yeng. Och qolmang.'},
        {nom:'Yog\' yoqish', nonushta:'Grechka bo\'tqa + 1 tuxum', tushlik:'Mol go\'shti (120g) + pechene sabzavot', kechki:'Suzma (200g) + yashil olma', maslahat:'Ovqatdan 30 daqiqa oldin 1 stakan suv iching.'},
        {nom:'Sog\'lom yog\'lar', nonushta:'Avokado tostu (bug\'doy non) + tuxum', tushlik:'Losos (120g) + yashil salat', kechki:'Tvorog + yong\'oq (20g)', maslahat:'Omega-3 uchun haftada 2-3 marta baliq yeng.'},
        {nom:'Yuqori tolali', nonushta:'Zig\'ir urug\'i + qovoq + kefir smoothie', tushlik:'Nohot sho\'rva + bug\'doy noni (1 bo\'lak)', kechki:'Sabzavot salati + zaytun moyi', maslahat:'Tola hazm tizimini yaxshilaydi. Ko\'proq sabzavot yeng.'},
      ]
    },
    ayol: {
      kaloriya: 1400,
      program: [
        {nom:'Yengil boshlang\'ich', nonushta:'Yulaf (40g) + rezavor meva + yong\'oq', tushlik:'Tovuq ko\'krak (120g) + sabzavot', kechki:'Kefir (200ml) + bodring', maslahat:'Suv: 2L. Kichik porsiyalarda yeng, lekin tez-tez.'},
        {nom:'Detoks', nonushta:'Limonli iliq suv + 2 tuxum', tushlik:'Yashil salat + baliq (100g)', kechki:'Suzma (150g) + yashil olma', maslahat:'Qand va oq un mahsulotlarini to\'xtating.'},
        {nom:'Oqsilga boy', nonushta:'Tvorog (150g) + banan', tushlik:'Tovuq (120g) + jigarrang guruch (80g)', kechki:'Baliq (100g) + sabzavot sho\'rva', maslahat:'Ovqat vaqtlarini o\'zgartirmang. Rejimga rioya qiling.'},
        {nom:'Sabzavot kuni', nonushta:'Smoothie: shpinat + kiwi + suv', tushlik:'Sabzavot taom + qaynatilgan tuxum (2ta)', kechki:'Pomidor sho\'rva + bug\'doy noni (1 bo\'lak)', maslahat:'Sabzavotlar kaloriya kamligi bilan to\'ydirishadi.'},
        {nom:'Dengiz mahsulotlari', nonushta:'Tuxum + pomidor omlet', tushlik:'Krevetka (120g) + yashil salat', kechki:'Kalam manti (bugsiz) + kefir', maslahat:'Dengiz mahsulotlari yod va rux manbasi.'},
        {nom:'Past uglevod', nonushta:'2 tuxum + avokado (yarmisi)', tushlik:'Mol go\'shti (100g) + sabzavot', kechki:'Tvorog (150g) + yong\'oq (15g)', maslahat:'Bugun non va guruchdan tiyiling.'},
        {nom:'Muvozanat', nonushta:'Yulaf (30g) + qovoq urug\'i', tushlik:'Baliq (100g) + sabzavot + guruch (60g)', kechki:'Kefir (200ml) + olma', maslahat:'Uzoq muddatli natija uchun izchillik muhim.'},
      ]
    }
  },
  massa: {
    erkak: {
      kaloriya: 3000,
      program: [
        {nom:'Yuqori kaloriya', nonushta:'5 tuxum omlet + suli bo\'tqa + banan + sut', tushlik:'Mol go\'shti (250g) + guruch (200g) + non', kechki:'Tovuq (200g) + makaron + zeytun moyi', maslahat:'Har 2-3 soatda yeng. Uxlashdan oldin protein shake.'},
        {nom:'Ko\'p oqsil', nonushta:'Tvorog (250g) + tabiiy asal + yong\'oq', tushlik:'Losos (200g) + guruch (200g) + salat', kechki:'Tovuq (200g) + nohot + sabzavot', maslahat:'Kunlik oqsil: 2g x kg vazn. Suv: 3L.'},
        {nom:'Uglevod yuklanish', nonushta:'4 tuxum + kartoshka (200g) + non', tushlik:'Go\'sht (200g) + makaron (200g)', kechki:'Baliq (150g) + guruch (150g) + tuxum', maslahat:'Trenirovkadan oldin uglevod yeng.'},
        {nom:'Sog\'lom massa', nonushta:'Smoothie: sut + banan + yulaf + protein', tushlik:'Tovuq ko\'krak (250g) + qovoq + guruch', kechki:'Mol go\'shti (200g) + qaynatilgan sabzavot', maslahat:'Yog\' to\'plashni oldini olish uchun shirin ichimliklar ichimang.'},
        {nom:'Yuqori energiya', nonushta:'Blinchik (4ta) + asal + sut', tushlik:'Go\'sht sho\'rva + non + salat', kechki:'Tovuq (200g) + makaron + cheese', maslahat:'Kaloriya profitsitini saqlang: +300-500 kcal.'},
        {nom:'Oqsil va yog\'', nonushta:'Yulaf + yong\'oq yog\'i + 3 tuxum', tushlik:'Losos (200g) + sabzavot + zeytun yog\'i', kechki:'Tvorog (300g) + yong\'oq + asal', maslahat:'Sog\'lom yog\'lar testosteron oshiradi.'},
        {nom:'Maksimal kaloriya', nonushta:'5 tuxum + kartoshka + pishloq', tushlik:'Go\'sht (300g) + guruch (250g) + non', kechki:'Tovuq (200g) + makaron + cheese + tuxum', maslahat:'Uxlashdan 1 soat oldin tvorog yeng.'},
      ]
    },
    ayol: {
      kaloriya: 2200,
      program: [
        {nom:'Energiya va chiroyli qomat', nonushta:'Yulaf (60g) + banan + yong\'oq + sut', tushlik:'Tovuq (150g) + guruch (150g) + sabzavot', kechki:'Baliq (130g) + sweet potato + salat', maslahat:'Suv: 2.5L. Sog\'lom uglevod manbalarini tanlang.'},
        {nom:'Oqsilga boy', nonushta:'3 tuxum + pomidor + bug\'doy non', tushlik:'Nohot taom (200g) + sabzavot', kechki:'Tovuq (150g) + sabzavot sho\'rva', maslahat:'Oqsil mushak tiklanishini tezlashtiradi.'},
        {nom:'Sog\'lom yog\'lar', nonushta:'Avokado + 2 tuxum + limon sharbati', tushlik:'Losos (130g) + yashil salat + zeytun yog\'i', kechki:'Tvorog (200g) + yong\'oq (25g)', maslahat:'Omega-3 teri va sochni yaxshilaydi.'},
        {nom:'Ko\'p uglevod', nonushta:'Banan smoothie + yulaf', tushlik:'Tovuq (150g) + makaron (150g)', kechki:'Baliq (120g) + guruch (120g)', maslahat:'Trenirovkadan 1 soat oldin uglevod yeng.'},
        {nom:'Vitamin kuni', nonushta:'Meva salatasi + tvorog (150g)', tushlik:'Sabzavot sho\'rva + tovuq (130g)', kechki:'Shpinat salati + tuxum (2ta) + zeytun yog\'i', maslahat:'Rangli sabzavotlar vitaminlarga boy.'},
        {nom:'Kuchli nonushta', nonushta:'4 ta tuxum omlet + pomidor + pishloq + non', tushlik:'Tovuq (130g) + guruch (120g)', kechki:'Kefir (250ml) + yong\'oq (20g)', maslahat:'Nonushtani o\'tkazib yubormang — kun davomida energiya beradi.'},
        {nom:'Dam olish kuni', nonushta:'Yulaf + rezavor meva', tushlik:'Yengil salat + baliq (100g)', kechki:'Sabzavot sho\'rva + tvorog', maslahat:'Dam olish kuni kamroq yeng, lekin sifatli.'},
      ]
    }
  },
  sogom: {
    erkak: {
      kaloriya: 2200,
      program: [
        {nom:'Muvozanatli ovqatlanish', nonushta:'Yulaf + 2 tuxum + meva', tushlik:'Tovuq (150g) + sabzavot + guruch', kechki:'Baliq (130g) + salat', maslahat:'Suv: 2L. Har kuni sabzavot va meva yeng.'},
        {nom:'Sog\'lom yurak', nonushta:'Yulaf + yong\'oq + rezavor', tushlik:'Losos (130g) + yashil salat', kechki:'Go\'sht (130g) + sabzavot', maslahat:'Qizil go\'shtni haftada 2 martadan ko\'p yemang.'},
        {nom:'Immunitet', nonushta:'Limonli iliq suv + tuxum + sabzavot', tushlik:'Tovuq sho\'rva + sabzavot + non', kechki:'Baliq (120g) + asal + limon choy', maslahat:'C vitamini uchun: limon, kiwi, qalampir.'},
        {nom:'Energiya', nonushta:'Banan + yulaf + sut', tushlik:'Go\'sht (140g) + guruch + sabzavot', kechki:'Tvorog (200g) + rezavor meva', maslahat:'Qand o\'rniga tabiiy shirinliklar: xurmo, asal, banan.'},
        {nom:'Hazm tizimi', nonushta:'Kefir + mevalix sharbat', tushlik:'Sabzavot sho\'rva + non + salat', kechki:'Yengil baliq + qaynatilgan sabzavot', maslahat:'Fermentlangan mahsulotlar: kefir, suzma.'},
        {nom:'Suyak va mushak', nonushta:'Sut (250ml) + yulaf + tuxum', tushlik:'Tvorog (200g) + qaymoq + meva', kechki:'Baliq (130g) + pishloq + salat', maslahat:'Kaltsiy: sut mahsulotlari, baliq. D vitamini: quyosh.'},
        {nom:'Antioxidantlar', nonushta:'Yashil choy + meva salatasi', tushlik:'Tovuq (130g) + sabzavot + zeytun yog\'i', kechki:'Sabzavot sho\'rva + yong\'oq', maslahat:'Qovoq, shpinat, brokkolini ko\'proq yeng.'},
      ]
    },
    ayol: {
      kaloriya: 1800,
      program: [
        {nom:'Ayol salomatligi', nonushta:'Yulaf + rezavor + yong\'oq + kefir', tushlik:'Tovuq (120g) + sabzavot + guruch (80g)', kechki:'Baliq (100g) + yashil salat', maslahat:'Temir uchun: qoq meva, nohot, mol go\'shti.'},
        {nom:'Gormonal muvozanat', nonushta:'Zig\'ir urugʼi smoothie + banan', tushlik:'Losos (120g) + sabzavot + zeytun yog\'i', kechki:'Tvorog (150g) + yong\'oq', maslahat:'Zig\'ir urugʼi estrogen muvozanatini saqlaydi.'},
        {nom:'Teri va soch', nonushta:'Avokado + 2 tuxum + limon', tushlik:'Baliq (120g) + shpinat salati', kechki:'Tvorog (150g) + rezavor meva', maslahat:'Biotin (B7): tuxum, yong\'oq, sabzavot.'},
        {nom:'Kalsiy kuni', nonushta:'Sut (250ml) + yulaf + yong\'oq', tushlik:'Pishloq (50g) + sabzavot salati', kechki:'Kefir (250ml) + olma', maslahat:'Suyak mustahkamligi uchun: sut, pishloq, kefir.'},
        {nom:'Detoks', nonushta:'Iliq limon suv + sabzavot smoothie', tushlik:'Yashil salat + baliq (100g)', kechki:'Sabzavot sho\'rva + bodring', maslahat:'Jigar tozalash: limon, zanjabil, bodring.'},
        {nom:'Ichki go\'zallik', nonushta:'Kollagen: baliq sho\'rva yoki tovuq', tushlik:'Tovuq (120g) + qaynatilgan sabzavot', kechki:'Tvorog (150g) + yong\'oq (15g)', maslahat:'Kollagen: teri va bo\'g\'imlar uchun muhim.'},
        {nom:'Muvozanat', nonushta:'Yulaf + meva + yong\'oq', tushlik:'Baliq (120g) + guruch (80g) + salat', kechki:'Kefir (200ml) + olma', maslahat:'Izchillik eng muhim omil.'},
      ]
    }
  },
  relief: {
    erkak: {
      kaloriya: 2000,
      program: [
        {nom:'Qomat uchun', nonushta:'5 tuxum oqsili + yulaf (50g)', tushlik:'Tovuq ko\'krak (200g) + sabzavot (qovurilmagan)', kechki:'Baliq (150g) + yashil salat (yog\'siz)', maslahat:'Tuz kamaytiring: suvni chiqaradi. Suv: 3L.'},
        {nom:'Yog\' yoqish', nonushta:'3 tuxum + avokado (yarmisi)', tushlik:'Mol go\'shti (180g) + sabzavot', kechki:'Tovuq (150g) + sabzavot sho\'rva', maslahat:'Uglevod miqdorini kamaytiring, oqsilni oshiring.'},
        {nom:'Mushak ko\'rsatish', nonushta:'Tvorog (200g) + yong\'oq', tushlik:'Losos (180g) + yashil sabzavot', kechki:'Tovuq (180g) + bodring + pomidor', maslahat:'Kechki ovqatda uglevod yemang.'},
        {nom:'Quruq massa', nonushta:'Omlet (3 tuxum) + shpinat', tushlik:'Tovuq (200g) + brokoli', kechki:'Baliq (150g) + kefir (200ml)', maslahat:'Trenirovkadan keyin 30 daqiqa ichida oqsil yeng.'},
        {nom:'Kesish', nonushta:'2 tuxum + 2 tuxum oqsili + pomidor', tushlik:'Krevetka (200g) + salat', kechki:'Tvorog (200g) + bodring', maslahat:'Non, guruch, makaron — minimal miqdorda.'},
        {nom:'Tana tarifidagi', nonushta:'Yulaf (40g) + 3 tuxum', tushlik:'Go\'sht (200g) + sabzavot', kechki:'Baliq (150g) + kefir', maslahat:'Glikemik indeksi past mahsulotlarni tanlang.'},
        {nom:'Final hafta', nonushta:'5 tuxum oqsili + yulaf (30g)', tushlik:'Tovuq (200g) + shpinat + pomidor', kechki:'Tvorog (200g) + bodring', maslahat:'Oxirgi haftada tuz va uglevodni minimallang.'},
      ]
    },
    ayol: {
      kaloriya: 1600,
      program: [
        {nom:'Chiroyli qomat', nonushta:'2 tuxum oqsili + 1 tuxum + yulaf (30g)', tushlik:'Tovuq (130g) + yashil sabzavot', kechki:'Baliq (120g) + bodring salati', maslahat:'Suv: 2.5L. Tuz miqdorini kamaytiring.'},
        {nom:'Ingichka bel', nonushta:'Kefir (200ml) + bodring + tuxum', tushlik:'Krevetka (150g) + yashil salat', kechki:'Tvorog (150g) + bodring', maslahat:'Kechki ovqatni 18:00 gacha yeng.'},
        {nom:'Yog\' yoqish', nonushta:'3 tuxum + shpinat omlet', tushlik:'Tovuq (130g) + brokoli + karnabahar', kechki:'Baliq (120g) + limon sharbati', maslahat:'Shakar va oq un mahsulotlaridan voz keching.'},
        {nom:'Mushak tonusi', nonushta:'Yulaf (30g) + 2 tuxum', tushlik:'Losos (120g) + sabzavot', kechki:'Tvorog (150g) + yong\'oq (15g)', maslahat:'Oqsil mushak tonusini saqlaydi.'},
        {nom:'Hafif detoks', nonushta:'Limonli suv + smoothie', tushlik:'Sabzavot sho\'rva + tovuq (100g)', kechki:'Kefir (200ml) + olma', maslahat:'Bugun un mahsulotlarini to\'xtating.'},
        {nom:'Reljef', nonushta:'2 tuxum + avokado (yarmisi)', tushlik:'Tovuq (130g) + yashil salat', kechki:'Baliq (120g) + bodring', maslahat:'Kardioda 30-40 daqiqa. Past intensivlik.'},
        {nom:'Natija', nonushta:'Yulaf (30g) + tuxum (2ta)', tushlik:'Go\'sht (130g) + sabzavot', kechki:'Tvorog (150g) + bodring', maslahat:'Izchillik natijani beradi. Davom eting!'},
      ]
    }
  }
};

var MASLAHATLAR_30 = [
  'Ertalab uyg\'onib 1 stakan iliq suv iching',
  'Nonushtani o\'tkazib yubormang — metabolizm uchun muhim',
  'Kechki ovqatni uxlashdan 3 soat oldin yeng',
  'Kuniga kamida 2L sof suv iching',
  'Choy va qahvani shakar qo\'shmay iching',
  'Gazli ichimliklar o\'rniga limonli suv iching',
  'Ovqatni sekin va chaynab yeng',
  'Kichik porsiyalarda tez-tez yeng (3-5 marta)',
  'Tungi och qolmang — kefir yoki olma yeng',
  'Tuz miqdorini kamaytiring',
  'Qovurilgan ovqat o\'rniga qaynatilgan yeng',
  'Har kuni 1 ta meva yeng',
  'Sabzavot miqdorini oshiring',
  'Oqsil har bir taomda bo\'lsin',
  'Spirt va sigaret — asosiy dushman',
  'Uxlashdan oldin ekranga qaramang',
  'Kuniga 7-8 soat uxlang — metabolizm uchun muhim',
  'Stress — yog\' to\'plashning asosiy sababi. Meditatsiya qiling',
  'Trenirovkadan keyin 30 daqiqa oqsil yeng',
  'Hafta oxirida ham rejimni buzmang',
  'Ovqatlanish kundaligini yuring',
  'Ovqat vaqtida telefonga qarashni to\'xtating',
  'Oshxona og\'irliklaridan foydalaning',
  'Muzlatgich to\'la sog\'lom ovqat bo\'lsin',
  'Tayyor ovqat o\'rniga uyda pishiring',
  'Har kuni 10 daqiqa quyosh nuri oling',
  'Yogurt va kefir ichak sog\'lig\'i uchun',
  'Qovoq urug\'i va yong\'oq — sog\'lom snack',
  'Xurmo va rezavor meva — tabiiy shirinlik',
  'Sabot — natija 30 kunda emas, 90 kunda ko\'rinadi',
];
var _kalImgB64 = null;
var _kalImgMime = 'image/jpeg';
var _kalRec = null;

function openKaloriyaScaner(){
  openM('kaloriya-modal');
  renderKalHistory();
}

function closeKaloriyaScaner(){
  closeM('kaloriya-modal');
}

function resetKalScaner(){
  _kalImgB64 = null;
  document.getElementById('kal-preview-wrap').style.display='none';
  document.getElementById('kal-upload-zone').style.display='block';
  document.getElementById('kal-result').style.display='none';
  document.getElementById('kal-file-inp').value='';
}

function onKalFileSelect(inp){
  var file = inp.files[0];
  if(!file) return;
  _kalImgMime = file.type || 'image/jpeg';
  var reader = new FileReader();
  reader.onload = function(e){
    var dataUrl = e.target.result;
    _kalImgB64 = dataUrl.split(',')[1];
    document.getElementById('kal-preview-img').src = dataUrl;
    document.getElementById('kal-preview-wrap').style.display='block';
    document.getElementById('kal-upload-zone').style.display='none';
    document.getElementById('kal-result').style.display='none';
  };
  reader.readAsDataURL(file);
}

function openKalMicro(){
  if(_isIOS()&&_isStandalonePWA()){
    var _f=document.getElementById('kal-text-inp');
    if(_f){try{_f.focus();}catch(e){}}
    showNotif('🎤 Ovoz bilan yozish','Klaviaturadagi 🎤 (mikrofon) ni bosib gapiring');
    return;
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ showNotif('😔','Brauzer ovozni qo\'llab-quvvatlamaydi'); return; }
  var btn = document.getElementById('kal-mic-btn');
  if(_kalRec){ _kalRec.stop(); _kalRec=null; if(btn)btn.textContent='🎤'; return; }
  _kalRec = new SR();
  _kalRec.lang='ru-RU';
  _kalRec.onresult=function(e){
    var t=e.results[0][0].transcript;
    document.getElementById('kal-text-inp').value=t;
  };
  _kalRec.onend=function(){ _kalRec=null; if(btn)btn.textContent='🎤'; };
  _kalRec.onstart=function(){ if(btn)btn.textContent='🔴'; };
  _kalRec.start();
}

function runKaloriyaAnaliz(){
  var textVal = (document.getElementById('kal-text-inp').value||'').trim();
  if(!_kalImgB64 && !textVal){
    showNotif('⚠️','Rasm yuklang yoki ovqat nomini yozing');
    return;
  }

  document.getElementById('kal-loading').style.display='block';
  document.getElementById('kal-result').style.display='none';
  document.getElementById('kal-scan-btn').disabled=true;

  // AI proxy ulanmagan bo'lsa — matndan offline hisoblaymiz (internet xatosi chiqmasin)
  if(!AI_READY){
    document.getElementById('kal-loading').style.display='none';
    document.getElementById('kal-scan-btn').disabled=false;
    if(textVal){
      showKalResult(calcOfflineKal(textVal));
      showNotif('📊 Hisoblandi','Mahalliy baza · rasm tahlili uchun AI proxy kerak');
    } else {
      showNotif('📷 Rasm uchun AI kerak','Hozircha ovqat nomini yozing (mas: 2 tuxum, non)');
    }
    return;
  }

  var isFileProtocol = window.location.protocol==='file:';
  if(isFileProtocol){
    setTimeout(function(){
      document.getElementById('kal-loading').style.display='none';
      document.getElementById('kal-scan-btn').disabled=false;
      var result;
      if(_kalImgB64 && !textVal){
        result = {
          items:[{nom:'Ko\'rinayotgan ovqat',gramm:200,kcal:120,oqsil:2,uglevod:28,yog:0}],
          total_kcal:120,total_oqsil:2,total_uglevod:28,total_yog:0,
          maslahat:'Rasm tahlili uchun GitHub Pages da oching (https://). Matnda yozsangiz hozir hisoblash mumkin.'
        };
      } else {
        result = calcOfflineKal(textVal);
      }
      showKalResult(result);
      if(!_kalImgB64) showNotif('📊 Hisoblandi','Mahalliy ma\'lumotlar bazasidan');
      else showNotif('📸 Rasm yuklandi','Aniq tahlil uchun GitHub Pages da ishlating');
    }, 600);
    return;
  }
  var messages = [];
  if(_kalImgB64){
    messages.push({
      role:'user',
      content:[
        {type:'image',source:{type:'base64',media_type:_kalImgMime,data:_kalImgB64}},
        {type:'text',text:'Bu ovqat rasmini tahlil qil. Ko\'rinayotgan barcha mahsulotni aniqla, grammi va kaloriyasini hisoblash. JSON formatda javob ber:\n{"items":[{"nom":"...","gramm":100,"kcal":150,"oqsil":10,"uglevod":20,"yog":5}],"total_kcal":300,"total_oqsil":10,"total_uglevod":20,"total_yog":5,"maslahat":"..."}\nFaqat JSON, boshqa hech narsa yozma.'}
      ]
    });
  } else {
    messages.push({
      role:'user',
      content:'Bu ovqatni tahlil qil: "'+textVal+'"\nHar bir mahsulotni aniqla va porsiyasini hisobga ol. JSON formatda javob ber:\n{"items":[{"nom":"...","gramm":100,"kcal":150,"oqsil":10,"uglevod":20,"yog":5}],"total_kcal":300,"total_oqsil":10,"total_uglevod":20,"total_yog":5,"maslahat":"..."}\nFaqat JSON, boshqa hech narsa yozma.'
    });
  }

  /* XATO TUZATILDI (07.09.2026): so'rovda VAQT CHEGARASI yo'q edi.
     Server javob bermasa fetch tugamaydi, .catch ham ishlamaydi \u2014
     natijada "AI tahlil qilyapti..." abadiy turib qolardi va
     foydalanuvchi nima bo'layotganini bilmasdi.
     Endi rasm uchun 45, matn uchun 25 soniya kutiladi. */
  var _kalCtrl = (typeof AbortController!=='undefined') ? new AbortController() : null;
  var _kalMuddat = _kalImgB64 ? 45000 : 25000;
  var _kalSoat = setTimeout(function(){
    if(_kalCtrl) _kalCtrl.abort();
  }, _kalMuddat);

  aiFetch('kaloriya', {
      model:'claude-sonnet-4-6',
      max_tokens:1000,
      system:'Sen ovqat va kaloriya mutaxassisisan. Foydalanuvchi o\'zbek tilida yozadi, sen ham o\'zbek tilida javob berasan. Rasm ko\'rsatilsa uni tahlil qil. Faqat JSON format.',
      messages:messages
    }, {signal:_kalCtrl?_kalCtrl.signal:undefined})
  .then(function(r){ clearTimeout(_kalSoat); return r.json(); })
  .then(function(d){
    document.getElementById('kal-loading').style.display='none';
    document.getElementById('kal-scan-btn').disabled=false;
    var text=(d.content&&d.content[0]&&d.content[0].text)||'';
    var jsonMatch=text.match(/\{[\s\S]*\}/);
    if(!jsonMatch){
      if(textVal){showKalResult(calcOfflineKal(textVal));return;}
      showNotif('⚠️','Tahlil qilib bo\'lmadi. Qayta urinib ko\'ring');
      return;
    }
    try{ showKalResult(JSON.parse(jsonMatch[0])); }
    catch(e){
      if(textVal) showKalResult(calcOfflineKal(textVal));
      else showNotif('⚠️','Natijani o\'qib bo\'lmadi');
    }
  })
  .catch(function(e){
    clearTimeout(_kalSoat);
    document.getElementById('kal-loading').style.display='none';
    document.getElementById('kal-scan-btn').disabled=false;
    var kechikdi = e && (e.name==='AbortError');
    if(textVal){
      showKalResult(calcOfflineKal(textVal));
      showNotif(kechikdi?'\u23F1 Javob kelmadi':'\uD83D\uDCCA Offline rejim',
                kechikdi?'Mahalliy baza bo\'yicha hisoblandi'
                       :'Internet yo\'q \u2014 mahalliy hisoblandi');
    } else {
      showNotif(kechikdi?'\u23F1 Javob kelmadi':'\u274C Ulanmadi',
                kechikdi?'Qayta urinib ko\'ring yoki ovqat nomini yozing'
                       :'Rasm tahlili uchun internet kerak');
    }
  });
}
var KAL_DB = {
  'olma':       {kcal:52,  oqsil:0.3, uglevod:14, yog:0.2, birlik:150},
  'banan':      {kcal:89,  oqsil:1.1, uglevod:23, yog:0.3, birlik:120},
  'tarvuz':     {kcal:30,  oqsil:0.6, uglevod:7.6,yog:0.2, birlik:300},
  'uzum':       {kcal:67,  oqsil:0.6, uglevod:17, yog:0.4, birlik:150},
  'shaftoli':   {kcal:39,  oqsil:0.9, uglevod:9.5,yog:0.3, birlik:150},
  'gilos':      {kcal:50,  oqsil:1.0, uglevod:12, yog:0.3, birlik:100},
  'o\'rik':      {kcal:48,  oqsil:1.4, uglevod:11, yog:0.4, birlik:100},
  'limon':      {kcal:29,  oqsil:1.1, uglevod:9,  yog:0.3, birlik:50},
  'anor':       {kcal:83,  oqsil:1.7, uglevod:19, yog:1.2, birlik:200},
  'mandarin':   {kcal:53,  oqsil:0.8, uglevod:13, yog:0.3, birlik:100},
  'apelsin':    {kcal:47,  oqsil:0.9, uglevod:12, yog:0.1, birlik:150},
  'kiwi':       {kcal:61,  oqsil:1.1, uglevod:15, yog:0.5, birlik:80},
  'qulupnay':   {kcal:32,  oqsil:0.7, uglevod:8,  yog:0.3, birlik:100},
  'rezavor':    {kcal:57,  oqsil:1.4, uglevod:14, yog:0.5, birlik:100},
  'nok':        {kcal:57,  oqsil:0.4, uglevod:15, yog:0.1, birlik:150},
  'xurmo':      {kcal:277, oqsil:1.8, uglevod:75, yog:0.2, birlik:30},
  'pomidor':    {kcal:18,  oqsil:0.9, uglevod:3.9,yog:0.2, birlik:100},
  'bodring':    {kcal:15,  oqsil:0.7, uglevod:3.6,yog:0.1, birlik:100},
  'sabzi':      {kcal:41,  oqsil:0.9, uglevod:10, yog:0.2, birlik:100},
  'karam':      {kcal:25,  oqsil:1.3, uglevod:5.8,yog:0.1, birlik:150},
  'piyoz':      {kcal:40,  oqsil:1.1, uglevod:9.3,yog:0.1, birlik:80},
  'sarimsoq':   {kcal:149, oqsil:6.4, uglevod:33, yog:0.5, birlik:10},
  'kartoshka':  {kcal:77,  oqsil:2.0, uglevod:17, yog:0.1, birlik:150},
  'shpinat':    {kcal:23,  oqsil:2.9, uglevod:3.6,yog:0.4, birlik:100},
  'brokoli':    {kcal:34,  oqsil:2.8, uglevod:7,  yog:0.4, birlik:150},
  'guruch':     {kcal:130, oqsil:2.7, uglevod:28, yog:0.3, birlik:200},
  'makaron':    {kcal:131, oqsil:5.0, uglevod:25, yog:1.1, birlik:200},
  'non':        {kcal:265, oqsil:9.0, uglevod:49, yog:3.2, birlik:50},
  'yulaf':      {kcal:68,  oqsil:2.4, uglevod:12, yog:1.4, birlik:200},
  'grechka':    {kcal:92,  oqsil:3.4, uglevod:17, yog:0.6, birlik:200},
  'non bo\'tqa': {kcal:88,  oqsil:3.0, uglevod:17, yog:0.9, birlik:200},
  'tovuq':      {kcal:165, oqsil:31,  uglevod:0,  yog:3.6, birlik:150},
  'mol go\'shti':{kcal:250, oqsil:26,  uglevod:0,  yog:17,  birlik:150},
  'losos':      {kcal:208, oqsil:20,  uglevod:0,  yog:13,  birlik:150},
  'tuna':       {kcal:132, oqsil:28,  uglevod:0,  yog:1.0, birlik:150},
  'krevetka':   {kcal:99,  oqsil:24,  uglevod:0,  yog:0.3, birlik:150},
  'tuxum':      {kcal:155, oqsil:13,  uglevod:1.1,yog:11,  birlik:60},
  'sut':        {kcal:42,  oqsil:3.4, uglevod:5.0,yog:1.0, birlik:250},
  'kefir':      {kcal:41,  oqsil:3.3, uglevod:4.7,yog:1.0, birlik:250},
  'tvorog':     {kcal:98,  oqsil:11,  uglevod:3.4,yog:4.3, birlik:150},
  'pishloq':    {kcal:402, oqsil:25,  uglevod:1.3,yog:33,  birlik:50},
  'qaymoq':     {kcal:198, oqsil:2.8, uglevod:3.7,yog:20,  birlik:100},
  'yong\'oq':   {kcal:654, oqsil:15,  uglevod:14, yog:65,  birlik:30},
  'bodom':      {kcal:579, oqsil:21,  uglevod:22, yog:50,  birlik:30},
  'avokado':    {kcal:160, oqsil:2.0, uglevod:9,  yog:15,  birlik:100},
  'zeytun yog\'i':{kcal:884,oqsil:0, uglevod:0,  yog:100, birlik:10},
  'asal':       {kcal:304, oqsil:0.3, uglevod:82, yog:0,   birlik:20},
};

function calcOfflineKal(text){
  var t = text.toLowerCase();
  var items = [];
  var totalKcal=0,totalP=0,totalC=0,totalF=0;

  Object.keys(KAL_DB).forEach(function(key){
    if(!t.includes(key)) return;
    var db = KAL_DB[key];
    var gramm = db.birlik; // default porsiya
    var gMatch = t.match(new RegExp('(\\d+)\\s*(?:g|gr|gramm)\\s*'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    var gMatch2 = t.match(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*(\\d+)\\s*(?:g|gr|gramm)'));
    if(gMatch) gramm = parseInt(gMatch[1]);
    else if(gMatch2) gramm = parseInt(gMatch2[1]);
    else {
      var taMatch = t.match(new RegExp('(\\d+)\\s*ta\\s*'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
      var taMatch2 = t.match(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*(\\d+)\\s*ta'));
      if(taMatch) gramm = db.birlik * parseInt(taMatch[1]);
      else if(taMatch2) gramm = db.birlik * parseInt(taMatch2[1]);
    }

    var ratio = gramm/100;
    var kcal  = Math.round(db.kcal*ratio);
    var oqsil = +(db.oqsil*ratio).toFixed(1);
    var ugl   = +(db.uglevod*ratio).toFixed(1);
    var yog   = +(db.yog*ratio).toFixed(1);
    items.push({nom:key.charAt(0).toUpperCase()+key.slice(1), gramm:Math.round(gramm), kcal:kcal, oqsil:oqsil, uglevod:ugl, yog:yog});
    totalKcal+=kcal; totalP+=oqsil; totalC+=ugl; totalF+=yog;
  });

  if(!items.length){
    return {
      items:[{nom:text, gramm:150, kcal:200, oqsil:10, uglevod:25, yog:5}],
      total_kcal:200, total_oqsil:10, total_uglevod:25, total_yog:5,
      maslahat:'Aniqroq yozing — masalan: "150g tovuq, 200g guruch, olma"'
    };
  }

  var maslahat = totalKcal<300 ? 'Yengil ovqat — dietaga mos.' :
                 totalKcal<600 ? 'Muvozanatli porsiya.' :
                 'Yuqori kaloriyali — faol bo\'ling!';

  return {
    items:items,
    total_kcal:Math.round(totalKcal),
    total_oqsil:+totalP.toFixed(1),
    total_uglevod:+totalC.toFixed(1),
    total_yog:+totalF.toFixed(1),
    maslahat:maslahat
  };
}

function showKalResult(r){
  document.getElementById('kal-result').style.display='block';
  document.getElementById('kal-total-kcal').textContent = r.total_kcal||0;
  document.getElementById('kal-protein').textContent   = (r.total_oqsil||0)+'g';
  document.getElementById('kal-carb').textContent      = (r.total_uglevod||0)+'g';
  document.getElementById('kal-fat').textContent       = (r.total_yog||0)+'g';
  var mainEl = document.getElementById('kal-result-main');
  var offBadge = r.offline ? '<div style="display:inline-block;background:rgba(255,255,255,.2);color:#fff;padding:3px 10px;border-radius:12px;font-size:12.5px;font-weight:700;margin-bottom:8px">📴 OFFLINE HISOB</div><br>' : '';
  var kcal = r.total_kcal||0;
  if(kcal < 300)      mainEl.style.background='linear-gradient(135deg,#116C55,#166B6B)';
  else if(kcal < 600) mainEl.style.background='linear-gradient(135deg,#DB9725,#DE7831)';
  else                mainEl.style.background='linear-gradient(135deg,#E35050,#DC2626)';

  document.getElementById('kal-result-main').innerHTML =
    offBadge+
    '<div style="font-size:15px;color:rgba(255,255,255,.7);margin-bottom:4px">Umumiy kaloriya</div>'+
    '<div style="font-size:48px;font-weight:900;color:#fff;line-height:1">'+(r.total_kcal||0)+'</div>'+
    '<div style="font-size:15px;color:rgba(255,255,255,.7)">kcal</div>';
  var items = r.items||[];
  document.getElementById('kal-items-list').innerHTML =
    '<div style="font-size:14px;font-weight:700;color:var(--t2);margin-bottom:10px;letter-spacing:.5px">📋 TARKIB</div>'+
    items.map(function(it){
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd)">'+
        '<div>'+
          '<div style="font-size:15px;font-weight:700;color:var(--text)">'+esc(it.nom)+'</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">'+(it.gramm||'?')+'g · oqsil: '+(it.oqsil||0)+'g · yog: '+(it.yog||0)+'g</div>'+
        '</div>'+
        '<div style="font-size:15px;font-weight:800;color:var(--g)">'+(it.kcal||0)+' kcal</div>'+
      '</div>';
    }).join('');
  var adv = document.getElementById('kal-advice');
  if(r.maslahat){ adv.innerHTML='💡 <strong>Maslahat:</strong> '+r.maslahat; adv.style.display='block'; }
  else adv.style.display='none';
  document.getElementById('kal-result').scrollIntoView({behavior:'smooth',block:'start'});
}

function saveKalToHistory(){
  var kcal = parseInt(document.getElementById('kal-total-kcal').textContent)||0;
  var text = document.getElementById('kal-text-inp').value||'Ovqat';
  if(!kcal){ showNotif('⚠️','Avval tahlil qiling'); return; }
  var today = bugunKun();
  var hist  = S.g('i_kal_hist')||{};
  if(!hist[today]) hist[today]=[];
  hist[today].push({
    nom: text||'Ovqat',
    kcal: kcal,
    protein: parseInt(document.getElementById('kal-protein').textContent)||0,
    carb:    parseInt(document.getElementById('kal-carb').textContent)||0,
    fat:     parseInt(document.getElementById('kal-fat').textContent)||0,
    time:    new Date().toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'})
  });
  S.s('i_kal_hist', hist);
  renderKalHistory();
  showNotif('✅ Saqlandi!', kcal+' kcal tarixga qo\'shildi');
}

function renderKalHistory(){
  var today = bugunKun();
  var hist  = S.g('i_kal_hist')||{};
  var list  = hist[today]||[];
  var listEl= document.getElementById('kal-history-list');
  var totalEl=document.getElementById('kal-daily-num');
  if(!listEl) return;

  var total = list.reduce(function(a,b){return a+(b.kcal||0);},0);
  if(totalEl) totalEl.textContent = total+' kcal';

  if(!list.length){
    listEl.innerHTML='<div style="text-align:center;padding:12px;color:var(--t2);font-size:15px">Hali hech narsa qo\'shilmagan</div>';
    return;
  }
  var _n   = kunlikNorma();
  var goal = _n.kcal;
  var pct  = Math.min(100, Math.round(total/goal*100));
  var barColor = pct<60?'var(--g)':pct<85?'#DB9725':'#E35050';

  listEl.innerHTML =
    '<div style="margin-bottom:10px">'+
      '<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--t2);margin-bottom:4px">'+
        '<span>0</span><span style="font-weight:700;color:'+barColor+'">'+pct+'%</span><span>'+goal+' kcal</span>'+
      '</div>'+
      '<div style="font-size:12.5px;color:var(--t2);text-align:center;margin-bottom:4px">'+
        (_n.taxminiy ? 'Umumiy norma - aniq hisob uchun Sport bo\'limidan vazn va bo\'yingizni kiriting'
                     : 'Sizning normangiz: '+_n.izoh + (_n.chegara ? ' (eng past xavfsiz daraja)' : ''))+
      '</div>'+
      '<div style="background:var(--bd);border-radius:6px;height:8px">'+
        '<div style="background:'+barColor+';height:8px;border-radius:6px;width:'+pct+'%;transition:width .5s"></div>'+
      '</div>'+
    '</div>'+
    list.slice().reverse().map(function(it){
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd)">'+
        '<div>'+
          '<div style="font-size:15px;font-weight:700;color:var(--text)">'+esc(it.nom)+'</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">'+esc(it.time)+'</div>'+
        '</div>'+
        '<div style="font-size:15px;font-weight:800;color:var(--g)">'+it.kcal+' kcal</div>'+
      '</div>';
    }).join('');
}
function getRatsionSettings(){
  return {
    jins: S.g('i_ratsion_jins') || null,
    maqsad: S.g('i_ratsion_maqsad') || null,
    start: S.g('i_ratsion_start') || null,
  };
}

function setRatsionJins(j){
  S.s('i_ratsion_jins', j);
  ['erkak','ayol'].forEach(function(x){
    var el = document.getElementById('r-'+x+'-btn');
    if(!el) return;
    if(x===j){el.style.background='var(--g)';el.style.color='#fff';el.style.borderColor='var(--g)';}
    else{el.style.background='var(--bg)';el.style.color='var(--t2)';el.style.borderColor='var(--bd)';}
  });
}

function setRatsionMaqsad(m){
  S.s('i_ratsion_maqsad', m);
  ['yoqot','massa','sogom','relief'].forEach(function(x){
    var el = document.getElementById('r-'+x+'-btn');
    if(!el) return;
    var key = x === 'yoqot' ? 'yoqotish' : x === 'sogom' ? 'sogom' : x;
    if(key===m){el.style.background='var(--g)';el.style.color='#fff';el.style.borderColor='var(--g)';}
    else{el.style.background='var(--bg)';el.style.color='var(--t2)';el.style.borderColor='var(--bd)';}
  });
}

function startRatsionDastur(){
  var s = getRatsionSettings();
  if(!s.jins){showNotif('⚠️ Xato','Jins tanlang');return;}
  if(!s.maqsad){showNotif('⚠️ Xato','Maqsad tanlang');return;}
  S.s('i_ratsion_start', bugunKun());
  renderRatsion();
  showNotif('🥗 Dastur boshlandi!','30 kunlik ratsion tayyor');
  konfetti();
}
var FOOD_SVG_B64 = {
  'yulaf': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRjNFMCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkUwQjIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImJvd2wiIGN4PSI1MCUiIGN5PSI2MCUiIHI9IjUwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGNURFQjMiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRDI2OTFFIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNiZykiLz4KICA8IS0tIFBsYXRlL0Jvd2wgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIwMCIgcng9IjE4MCIgcnk9IjYwIiBmaWxsPSIjRThENUIwIiBvcGFjaXR5PSIwLjQiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTg1IiByeD0iMTYwIiByeT0iNTUiIGZpbGw9InVybCgjYm93bCkiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTY1IiByeD0iMTQwIiByeT0iNDUiIGZpbGw9IiNGNURFQjMiLz4KICA8IS0tIE9hdG1lYWwgdGV4dHVyZSAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTYwIiByeD0iMTIwIiByeT0iMzUiIGZpbGw9IiNENEE4NUMiIG9wYWNpdHk9IjAuNiIvPgogIDxjaXJjbGUgY3g9IjI3MCIgY3k9IjE1NSIgcj0iOCIgZmlsbD0iI0M4OTU2QyIgb3BhY2l0eT0iMC43Ii8+CiAgPGNpcmNsZSBjeD0iMzAwIiBjeT0iMTUwIiByPSI5IiBmaWxsPSIjQkY4QzVBIiBvcGFjaXR5PSIwLjciLz4KICA8Y2lyY2xlIGN4PSIzMzAiIGN5PSIxNTgiIHI9IjciIGZpbGw9IiNDODk1NkMiIG9wYWNpdHk9IjAuNyIvPgogIDxjaXJjbGUgY3g9IjI4NSIgY3k9IjE2OCIgcj0iNiIgZmlsbD0iI0JGOEM1QSIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMzE1IiBjeT0iMTY1IiByPSI4IiBmaWxsPSIjQzg5NTZDIiBvcGFjaXR5PSIwLjYiLz4KICA8IS0tIEJlcnJpZXMgLS0+CiAgPGNpcmNsZSBjeD0iMjU1IiBjeT0iMTQ4IiByPSIxMCIgZmlsbD0iIzlDMjc4NSIvPgogIDxjaXJjbGUgY3g9IjI1OCIgY3k9IjE0NSIgcj0iNCIgZmlsbD0iI0M0NEFBMCIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMzQ1IiBjeT0iMTUyIiByPSIxMCIgZmlsbD0iI0MwMzkyQiIvPgogIDxjaXJjbGUgY3g9IjM0OCIgY3k9IjE0OSIgcj0iNCIgZmlsbD0iI0U3NEMzQyIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMjgwIiBjeT0iMTQyIiByPSI4IiBmaWxsPSIjOEU0NEFEIi8+CiAgPGNpcmNsZSBjeD0iMzIwIiBjeT0iMTQ1IiByPSI5IiBmaWxsPSIjQzAzOTJCIi8+CiAgPCEtLSBOdXRzIC0tPgogIDxlbGxpcHNlIGN4PSIyOTUiIGN5PSIxNzgiIHJ4PSI4IiByeT0iNSIgZmlsbD0iIzhCNjkxNCIgdHJhbnNmb3JtPSJyb3RhdGUoLTIwLDI5NSwxNzgpIi8+CiAgPGVsbGlwc2UgY3g9IjMxOCIgY3k9IjE3NSIgcng9IjciIHJ5PSI0IiBmaWxsPSIjN0E1QzBGIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSwzMTgsMTc1KSIvPgogIDwhLS0gU3RlYW0gLS0+CiAgPHBhdGggZD0iTTI3NSwxMjAgUTI3MCwxMDUgMjc1LDkwIFEyODAsNzUgMjc1LDYwIiBzdHJva2U9IiNENEE4NUMiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMzAwLDExNSBRMjk1LDEwMCAzMDAsODUgUTMwNSw3MCAzMDAsNTUiIHN0cm9rZT0iI0Q0QTg1QyIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0zMjUsMTIwIFEzMjAsMTA1IDMyNSw5MCBRMzMwLDc1IDMyNSw2MCIgc3Ryb2tlPSIjRDRBODVDIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==',
  'tovuq': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRjhFMSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGM0U1QUIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDwhLS0gUGxhdGUgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIyMCIgcng9IjIwMCIgcnk9IjU1IiBmaWxsPSIjRThFOEU4IiBvcGFjaXR5PSIwLjUiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMjA1IiByeD0iMTg1IiByeT0iNTAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KICA8IS0tIENoaWNrZW4gYnJlYXN0IC0tPgogIDxwYXRoIGQ9Ik0xODAsMTgwIFEyMjAsMTIwIDMwMCwxMzAgUTM4MCwxMjAgNDIwLDE4MCBRNDAwLDIyMCAzMDAsMjI1IFEyMDAsMjIwIDE4MCwxODBaIiBmaWxsPSIjQzg3ODNBIi8+CiAgPHBhdGggZD0iTTE5MCwxNzggUTIyNSwxMzAgMzAwLDEzOCBRMzc1LDEzMCA0MTAsMTc4IFEzOTUsMjEwIDMwMCwyMTUgUTIwNSwyMTAgMTkwLDE3OFoiIGZpbGw9IiNENDg5NEEiLz4KICA8IS0tIEdyaWxsIG1hcmtzIC0tPgogIDxwYXRoIGQ9Ik0yMjAsMTYwIFEyNjAsMTUwIDMwMCwxNTUgUTM0MCwxNTAgMzgwLDE2MCIgc3Ryb2tlPSIjQTA1MjJEIiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBhdGggZD0iTTIxNSwxNzUgUTI1NSwxNjUgMzAwLDE3MCBRMzQ1LDE2NSAzODUsMTc1IiBzdHJva2U9IiM4QjQ1MTMiIHN0cm9rZS13aWR0aD0iNSIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMjI1LDE5MCBRMjY1LDE4MiAzMDAsMTg1IFEzMzUsMTgyIDM3NSwxOTAiIHN0cm9rZT0iI0EwNTIyRCIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDwhLS0gSGVyYnMgLS0+CiAgPGVsbGlwc2UgY3g9IjI2MCIgY3k9IjE0OCIgcng9IjEyIiByeT0iNSIgZmlsbD0iIzJFN0QzMiIgdHJhbnNmb3JtPSJyb3RhdGUoLTMwLDI2MCwxNDgpIi8+CiAgPGVsbGlwc2UgY3g9IjM0MCIgY3k9IjE0NSIgcng9IjEwIiByeT0iNCIgZmlsbD0iIzM4OEUzQyIgdHJhbnNmb3JtPSJyb3RhdGUoMjUsMzQwLDE0NSkiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTQyIiByeD0iOCIgcnk9IjQiIGZpbGw9IiMyRTdEMzIiIHRyYW5zZm9ybT0icm90YXRlKC0xMCwzMDAsMTQyKSIvPgogIDwhLS0gVmVnZXRhYmxlcyBvbiBzaWRlIC0tPgogIDxjaXJjbGUgY3g9IjE1NSIgY3k9IjE5NSIgcj0iMTgiIGZpbGw9IiM0Q0FGNTAiLz4KICA8Y2lyY2xlIGN4PSIxNTUiIGN5PSIxOTUiIHI9IjEyIiBmaWxsPSIjNjZCQjZBIi8+CiAgPGNpcmNsZSBjeD0iNDQ1IiBjeT0iMTk1IiByPSIxNSIgZmlsbD0iI0ZGNzA0MyIvPgogIDxwYXRoIGQ9Ik00NDAsMTg1IFE0NTAsMTc1IDQ1NSwxODUgUTQ1MCwxOTUgNDQwLDE5NVoiIGZpbGw9IiNGRjU3MjIiLz4KPC9zdmc+',
  'salat': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0U4RjVFOSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNDOEU2QzkiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDwhLS0gQm93bCBzaGFkb3cgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIzMCIgcng9IjE4NSIgcnk9IjQwIiBmaWxsPSIjNENBRjUwIiBvcGFjaXR5PSIwLjE1Ii8+CiAgPCEtLSBCb3dsIC0tPgogIDxwYXRoIGQ9Ik0xMTUsMTYwIFExMTUsMjYwIDMwMCwyNjggUTQ4NSwyNjAgNDg1LDE2MFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KICA8cGF0aCBkPSJNMTIwLDE2MCBRMTIwLDI1NSAzMDAsMjYyIFE0ODAsMjU1IDQ4MCwxNjBaIiBmaWxsPSIjRjFGOEU5Ii8+CiAgPCEtLSBMZXR0dWNlIGxheWVycyAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTY1IiByeD0iMTU1IiByeT0iMzAiIGZpbGw9IiM4MUM3ODQiLz4KICA8IS0tIEdyZWVucyAtLT4KICA8cGF0aCBkPSJNMTYwLDE1NSBRMTgwLDEzMCAyMDAsMTQ1IFExODUsMTY1IDE2NSwxNjJaIiBmaWxsPSIjNENBRjUwIi8+CiAgPHBhdGggZD0iTTE5MCwxNDggUTIxNSwxMjUgMjM1LDE0MCBRMjIwLDE2MCAxOTUsMTU4WiIgZmlsbD0iIzQzQTA0NyIvPgogIDxwYXRoIGQ9Ik0yNDAsMTQ1IFEyNjUsMTI1IDI4MCwxNDAgUTI2NSwxNTggMjQyLDE1NVoiIGZpbGw9IiM2NkJCNkEiLz4KICA8cGF0aCBkPSJNMzEwLDE0MyBRMzM1LDEyMCAzNTUsMTM4IFEzNDAsMTU3IDMxNSwxNTRaIiBmaWxsPSIjNENBRjUwIi8+CiAgPHBhdGggZD0iTTM1NSwxNDggUTM3OCwxMjggMzk4LDE0MiBRMzgyLDE2MiAzNTgsMTYwWiIgZmlsbD0iIzM4OEUzQyIvPgogIDxwYXRoIGQ9Ik0zOTUsMTU1IFE0MTUsMTM1IDQzMCwxNDggUTQxOCwxNjYgMzk3LDE2NFoiIGZpbGw9IiM0M0EwNDciLz4KICA8IS0tIFRvbWF0b2VzIC0tPgogIDxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1OCIgcj0iMTgiIGZpbGw9IiNFNTM5MzUiLz4KICA8Y2lyY2xlIGN4PSIyNTMiIGN5PSIxNTUiIHI9IjciIGZpbGw9IiNFRjUzNTAiIG9wYWNpdHk9IjAuNiIvPgogIDxwYXRoIGQ9Ik0yNDYsMTQxIFEyNTAsMTM1IDI1NCwxNDEiIHN0cm9rZT0iIzJFN0QzMiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPGNpcmNsZSBjeD0iMzYwIiBjeT0iMTU1IiByPSIxNiIgZmlsbD0iI0U1MzkzNSIvPgogIDxjaXJjbGUgY3g9IjM2MyIgY3k9IjE1MiIgcj0iNiIgZmlsbD0iI0VGNTM1MCIgb3BhY2l0eT0iMC42Ii8+CiAgPCEtLSBDdWN1bWJlciAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTYwIiByeD0iMjIiIHJ5PSIxNCIgZmlsbD0iIzY2QkI2QSIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1LDMwMCwxNjApIi8+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjE2MCIgcng9IjE3IiByeT0iMTAiIGZpbGw9IiM4MUM3ODQiIHRyYW5zZm9ybT0icm90YXRlKC0xNSwzMDAsMTYwKSIvPgogIDwhLS0gRHJlc3NpbmcgZHJpenpsZSAtLT4KICA8cGF0aCBkPSJNMjAwLDE0OCBRMjIwLDE1NSAyNDAsMTQ4IFEyNjAsMTQyIDI4MCwxNTAgUTMwMCwxNTggMzIwLDE0OCBRMzQwLDEzOCAzNjAsMTQ4IiBzdHJva2U9IiNGREQ4MzUiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC43IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+',
  'baliq': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0UzRjJGRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNCQkRFRkIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImZpc2giIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkY4QTY1Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNTcyMiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+CiAgPCEtLSBQbGF0ZSAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMjI1IiByeD0iMTk1IiByeT0iNTAiIGZpbGw9IiNFMEUwRTAiIG9wYWNpdHk9IjAuNCIvPgogIDxlbGxpcHNlIGN4PSIzMDAiIGN5PSIyMTAiIHJ4PSIxODAiIHJ5PSI0NSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuODUiLz4KICA8IS0tIFNhbG1vbiBmaWxsZXQgLS0+CiAgPHBhdGggZD0iTTE0MCwxOTAgUTE2MCwxNTAgMzAwLDE0NSBRNDQwLDE1MCA0NjAsMTkwIFE0NDAsMjE1IDMwMCwyMjAgUTE2MCwyMTUgMTQwLDE5MFoiIGZpbGw9InVybCgjZmlzaCkiLz4KICA8cGF0aCBkPSJNMTUwLDE4OCBRMTcwLDE1NSAzMDAsMTUwIFE0MzAsMTU1IDQ1MCwxODggUTQzMiwyMDggMzAwLDIxMyBRMTY4LDIwOCAxNTAsMTg4WiIgZmlsbD0iI0ZGNzA0MyIvPgogIDwhLS0gU2FsbW9uIHRleHR1cmUvbGluZXMgLS0+CiAgPHBhdGggZD0iTTIwMCwxNjAgUTI1MCwxNTUgMzAwLDE1NyBRMzUwLDE1NSA0MDAsMTYwIiBzdHJva2U9IiNFNjRBMTkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41Ii8+CiAgPHBhdGggZD0iTTE4NSwxNzUgUTI0MCwxNjggMzAwLDE3MCBRMzYwLDE2OCA0MTUsMTc1IiBzdHJva2U9IiNEODQzMTUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC40Ii8+CiAgPHBhdGggZD0iTTE3NSwxODggUTIzNSwxODIgMzAwLDE4NCBRMzY1LDE4MiA0MjUsMTg4IiBzdHJva2U9IiNCRjM2MEMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4zIi8+CiAgPCEtLSBXaGl0ZSBmYXQgbGluZXMgLS0+CiAgPHBhdGggZD0iTTIyMCwxNTggUTI2MCwxNTMgMzAwLDE1NSBRMzQwLDE1MyAzODAsMTU4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNCIvPgogIDxwYXRoIGQ9Ik0yMTAsMTcyIFEyNTUsMTY3IDMwMCwxNjkgUTM0NSwxNjcgMzkwLDE3MiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjM1Ii8+CiAgPCEtLSBMZW1vbiBzbGljZXMgLS0+CiAgPGNpcmNsZSBjeD0iMTcwIiBjeT0iMjAwIiByPSIyMiIgZmlsbD0iI0ZGRjE3NiIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjIwMCIgcj0iMTgiIGZpbGw9IiNGRkVFNTgiLz4KICA8bGluZSB4MT0iMTQ4IiB5MT0iMjAwIiB4Mj0iMTkyIiB5Mj0iMjAwIiBzdHJva2U9IiNGOUE4MjUiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjciLz4KICA8bGluZSB4MT0iMTcwIiB5MT0iMTc4IiB4Mj0iMTcwIiB5Mj0iMjIyIiBzdHJva2U9IiNGOUE4MjUiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjciLz4KICA8bGluZSB4MT0iMTU0IiB5MT0iMTg0IiB4Mj0iMTg2IiB5Mj0iMjE2IiBzdHJva2U9IiNGOUE4MjUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC41Ii8+CiAgPGxpbmUgeDE9IjE4NiIgeTE9IjE4NCIgeDI9IjE1NCIgeTI9IjIxNiIgc3Ryb2tlPSIjRjlBODI1IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIvPgogIDwhLS0gSGVyYnMgb24gdG9wIC0tPgogIDxlbGxpcHNlIGN4PSIyODAiIGN5PSIxNTIiIHJ4PSIxNCIgcnk9IjUiIGZpbGw9IiMzODhFM0MiIHRyYW5zZm9ybT0icm90YXRlKC0yMCwyODAsMTUyKSIvPgogIDxlbGxpcHNlIGN4PSIzMTUiIGN5PSIxNDkiIHJ4PSIxMiIgcnk9IjQiIGZpbGw9IiMyRTdEMzIiIHRyYW5zZm9ybT0icm90YXRlKDE1LDMxNSwxNDkpIi8+CiAgPGVsbGlwc2UgY3g9IjM0MCIgY3k9IjE1NSIgcng9IjEwIiByeT0iNCIgZmlsbD0iIzQzQTA0NyIgdHJhbnNmb3JtPSJyb3RhdGUoLTEwLDM0MCwxNTUpIi8+Cjwvc3ZnPg==',
  'default': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRjlDNCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGMEY0QzMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDwhLS0gUGxhdGUgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIyNSIgcng9IjE4NSIgcnk9IjQ4IiBmaWxsPSIjRTBFMEUwIiBvcGFjaXR5PSIwLjQiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMjEwIiByeD0iMTcwIiByeT0iNDMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjg1Ii8+CiAgPCEtLSBGb29kIHBpbGUgKGdlbmVyaWMpIC0tPgogIDxlbGxpcHNlIGN4PSIzMDAiIGN5PSIxODUiIHJ4PSIxMzAiIHJ5PSI0MiIgZmlsbD0iI0E1RDZBNyIvPgogIDxlbGxpcHNlIGN4PSIyODAiIGN5PSIxNzgiIHJ4PSIzNSIgcnk9IjIyIiBmaWxsPSIjRUY5QTlBIi8+CiAgPGVsbGlwc2UgY3g9IjMyMCIgY3k9IjE3NSIgcng9IjI4IiByeT0iMTgiIGZpbGw9IiNGRkNDODAiLz4KICA8Y2lyY2xlIGN4PSIyNTUiIGN5PSIxODIiIHI9IjE4IiBmaWxsPSIjODBERUVBIi8+CiAgPGNpcmNsZSBjeD0iMzQ1IiBjeT0iMTgwIiByPSIxNiIgZmlsbD0iI0NFOTNEOCIvPgogIDwhLS0gR2FybmlzaCAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTYyIiByeD0iNTAiIHJ5PSIxMiIgZmlsbD0iI0E1RDZBNyIgb3BhY2l0eT0iMC43Ii8+Cjwvc3ZnPg==',
  'tuxum': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkRFNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRjlDNCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIyNSIgcng9IjE4NSIgcnk9IjQ1IiBmaWxsPSIjRTBFMEUwIiBvcGFjaXR5PSIwLjM1Ii8+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIxMCIgcng9IjE3MCIgcnk9IjQwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CiAgPCEtLSBQYW4gLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIwMCIgcng9IjE2NSIgcnk9IjM4IiBmaWxsPSIjNDI0MjQyIiBvcGFjaXR5PSIwLjE1Ii8+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjE5NSIgcng9IjE1NSIgcnk9IjM1IiBmaWxsPSIjNjE2MTYxIiBvcGFjaXR5PSIwLjIiLz4KICA8IS0tIEVnZyB3aGl0ZSAtLT4KICA8cGF0aCBkPSJNMjIwLDE3NSBRMjQwLDE1NSAyNzAsMTY1IFEyODUsMTU1IDMwMCwxNTggUTMxNSwxNTAgMzMwLDE2MyBRMzYwLDE1MiAzODAsMTcyIFEzOTAsMTkwIDM3NSwyMDAgUTM0MCwyMTUgMzAwLDIxMiBRMjYwLDIxNSAyMjUsMjAwIFEyMDgsMTkwIDIyMCwxNzVaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45NSIvPgogIDwhLS0gWW9sayAxIC0tPgogIDxjaXJjbGUgY3g9IjI3NSIgY3k9IjE3OCIgcj0iMjgiIGZpbGw9IiNGRkIzMDAiLz4KICA8Y2lyY2xlIGN4PSIyNzUiIGN5PSIxNzgiIHI9IjI0IiBmaWxsPSIjRkZDMTA3Ii8+CiAgPGNpcmNsZSBjeD0iMjY4IiBjeT0iMTcyIiByPSI4IiBmaWxsPSIjRkZENTRGIiBvcGFjaXR5PSIwLjUiLz4KICA8IS0tIFlvbGsgMiAtLT4KICA8Y2lyY2xlIGN4PSIzMzUiIGN5PSIxNzUiIHI9IjI1IiBmaWxsPSIjRkY4RjAwIi8+CiAgPGNpcmNsZSBjeD0iMzM1IiBjeT0iMTc1IiByPSIyMSIgZmlsbD0iI0ZGQTAwMCIvPgogIDxjaXJjbGUgY3g9IjMyOCIgY3k9IjE2OSIgcj0iNyIgZmlsbD0iI0ZGRDU0RiIgb3BhY2l0eT0iMC40Ii8+CiAgPCEtLSBQZXBwZXIgLS0+CiAgPGNpcmNsZSBjeD0iMjUwIiBjeT0iMTk1IiByPSIzIiBmaWxsPSIjMjEyMTIxIiBvcGFjaXR5PSIwLjUiLz4KICA8Y2lyY2xlIGN4PSIyNjAiIGN5PSIyMDAiIHI9IjIuNSIgZmlsbD0iIzIxMjEyMSIgb3BhY2l0eT0iMC40Ii8+CiAgPGNpcmNsZSBjeD0iMzU1IiBjeT0iMTkzIiByPSIzIiBmaWxsPSIjMjEyMTIxIiBvcGFjaXR5PSIwLjUiLz4KICA8IS0tIEhlcmJzIC0tPgogIDxlbGxpcHNlIGN4PSIyOTUiIGN5PSIxNjIiIHJ4PSIxMCIgcnk9IjQiIGZpbGw9IiM0Q0FGNTAiIHRyYW5zZm9ybT0icm90YXRlKC0xNSwyOTUsMTYyKSIvPgogIDxlbGxpcHNlIGN4PSIzMTUiIGN5PSIxNTgiIHJ4PSI4IiByeT0iMyIgZmlsbD0iIzM4OEUzQyIgdHJhbnNmb3JtPSJyb3RhdGUoMjAsMzE1LDE1OCkiLz4KPC9zdmc+',
  'smoothie': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZDRTRFQyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0Y4QkJEOSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZHJpbmsiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0U5MUU2MyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0FEMTQ1NyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+CiAgPCEtLSBHbGFzcyBzaGFkb3cgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjI1NSIgcng9IjY1IiByeT0iMTUiIGZpbGw9IiNBRDE0NTciIG9wYWNpdHk9IjAuMiIvPgogIDwhLS0gR2xhc3MgYm9keSAtLT4KICA8cGF0aCBkPSJNMjQwLDgwIEwyNTUsMjQ1IFEzMDAsMjYwIDM0NSwyNDUgTDM2MCw4MFoiIGZpbGw9InVybCgjZHJpbmspIiBvcGFjaXR5PSIwLjkiLz4KICA8cGF0aCBkPSJNMjQzLDgwIEwyNTgsMjQwIFEzMDAsMjUzIDM0MiwyNDAgTDM1Nyw4MFoiIGZpbGw9IiNGMDYyOTIiIG9wYWNpdHk9IjAuNCIvPgogIDwhLS0gR2xhc3MgaGlnaGxpZ2h0IC0tPgogIDxwYXRoIGQ9Ik0yNDgsOTAgTDI2MCwyMzUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgb3BhY2l0eT0iMC4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPCEtLSBHbGFzcyBvdXRsaW5lIC0tPgogIDxwYXRoIGQ9Ik0yNDAsODAgTDI1NSwyNDUgUTMwMCwyNjAgMzQ1LDI0NSBMMzYwLDgwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIiBvcGFjaXR5PSIwLjUiLz4KICA8IS0tIEZydWl0cyBmbG9hdGluZyAtLT4KICA8Y2lyY2xlIGN4PSIyODUiIGN5PSIxNDAiIHI9IjE0IiBmaWxsPSIjRDMyRjJGIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIzMTUiIGN5PSIxNTUiIHI9IjEyIiBmaWxsPSIjNkExQjlBIiBvcGFjaXR5PSIwLjciLz4KICA8Y2lyY2xlIGN4PSIyOTgiIGN5PSIxNzAiIHI9IjEwIiBmaWxsPSIjRDMyRjJGIiBvcGFjaXR5PSIwLjYiLz4KICA8IS0tIFN0cmF3IC0tPgogIDxyZWN0IHg9IjMxOCIgeT0iNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIyMDAiIHJ4PSI1IiBmaWxsPSIjRjQ4RkIxIiBvcGFjaXR5PSIwLjgiLz4KICA8cmVjdCB4PSIzMTkiIHk9IjUxIiB3aWR0aD0iNCIgaGVpZ2h0PSIyMDAiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+CiAgPCEtLSBGcnVpdCBvbiByaW0gLS0+CiAgPGNpcmNsZSBjeD0iMzQ4IiBjeT0iODIiIHI9IjE4IiBmaWxsPSIjNENBRjUwIi8+CiAgPHBhdGggZD0iTTMzNSw3NSBRMzQ4LDYwIDM2MSw3NSIgZmlsbD0iIzRDQUY1MCIvPgogIDxjaXJjbGUgY3g9IjM0OCIgY3k9IjgyIiByPSIxMiIgZmlsbD0iIzY2QkI2QSIvPgogIDwhLS0gQnViYmxlcyAtLT4KICA8Y2lyY2xlIGN4PSIyNzIiIGN5PSIyMDAiIHI9IjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSIzMTAiIGN5PSIyMTAiIHI9IjQiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjI1Ii8+CiAgPGNpcmNsZSBjeD0iMzMwIiBjeT0iMTk1IiByPSIzIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+Cjwvc3ZnPg==',
  'gosht': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZCRTlFNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQ0NCQyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjIzMCIgcng9IjE5MCIgcnk9IjQ4IiBmaWxsPSIjQkRCREJEIiBvcGFjaXR5PSIwLjMiLz4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMjE1IiByeD0iMTc1IiByeT0iNDMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjg1Ii8+CiAgPCEtLSBTdGVhayAtLT4KICA8cGF0aCBkPSJNMTU1LDE4NSBRMTc1LDE0NSAyNDAsMTQwIFEzMDAsMTM1IDM2MCwxNDAgUTQyNSwxNDUgNDQ1LDE4NSBRNDMwLDIyMCAzNjAsMjI1IFEzMDAsMjI4IDI0MCwyMjUgUTE3MCwyMjAgMTU1LDE4NVoiIGZpbGw9IiM1RDJBMEMiLz4KICA8cGF0aCBkPSJNMTYzLDE4MyBRMTgzLDE0OCAyNDMsMTQzIFEzMDAsMTM4IDM1NywxNDMgUTQxNywxNDggNDM3LDE4MyBRNDIzLDIxNSAzNTcsMjIwIFEzMDAsMjIzIDI0MywyMjAgUTE3NywyMTUgMTYzLDE4M1oiIGZpbGw9IiM3QjNBMTUiLz4KICA8cGF0aCBkPSJNMTcyLDE4MSBRMTkyLDE1MiAyNDgsMTQ3IFEzMDAsMTQyIDM1MiwxNDcgUTQwOCwxNTIgNDI4LDE4MSBRNDE1LDIxMCAzNTIsMjE1IFEzMDAsMjE4IDI0OCwyMTUgUTE4NSwyMTAgMTcyLDE4MVoiIGZpbGw9IiM4QjQ1MTMiLz4KICA8IS0tIEdyaWxsIGxpbmVzIC0tPgogIDxwYXRoIGQ9Ik0yMTAsMTYwIFEyNTUsMTUzIDMwMCwxNTYgUTM0NSwxNTMgMzkwLDE2MCIgc3Ryb2tlPSIjNEExQTA1IiBzdHJva2Utd2lkdGg9IjciIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBhdGggZD0iTTIwMywxNzcgUTI1MCwxNzAgMzAwLDE3MyBRMzUwLDE3MCAzOTcsMTc3IiBzdHJva2U9IiMzRDE1MDUiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMjEwLDE5NCBRMjU1LDE4OCAzMDAsMTkwIFEzNDUsMTg4IDM5MCwxOTQiIHN0cm9rZT0iIzRBMUEwNSIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDwhLS0gQ3J1c3QgaGlnaGxpZ2h0IC0tPgogIDxwYXRoIGQ9Ik0xNzUsMTgwIFExODAsMTYwIDIwMCwxNTAgUTIyMCwxNDIgMjUwLDE0MCIgc3Ryb2tlPSIjQzA2MjNBIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNSIvPgogIDwhLS0gSGVyYnMgZ2FybmlzaCAtLT4KICA8ZWxsaXBzZSBjeD0iMjAwIiBjeT0iMTQ4IiByeD0iMTUiIHJ5PSI1IiBmaWxsPSIjMkU3RDMyIiB0cmFuc2Zvcm09InJvdGF0ZSgtMjUsMjAwLDE0OCkiLz4KICA8ZWxsaXBzZSBjeD0iNDAwIiBjeT0iMTQ4IiByeD0iMTMiIHJ5PSI1IiBmaWxsPSIjMzg4RTNDIiB0cmFuc2Zvcm09InJvdGF0ZSgyMCw0MDAsMTQ4KSIvPgogIDxlbGxpcHNlIGN4PSIzMDAiIGN5PSIxNDIiIHJ4PSIxMiIgcnk9IjQiIGZpbGw9IiMxQjVFMjAiIHRyYW5zZm9ybT0icm90YXRlKC01LDMwMCwxNDIpIi8+CiAgPCEtLSBTYXVjZSBkcml6emxlIC0tPgogIDxwYXRoIGQ9Ik0yNDAsMTQ4IFEyNzAsMTU1IDMwMCwxNTAgUTMzMCwxNDUgMzYwLDE1MiIgc3Ryb2tlPSIjOEIwMDAwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==',
  'kefir': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNjAwIDMwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0UzRjJGRCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0JCREVGQiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+CiAgPCEtLSBHbGFzcyBzaGFkb3cgLS0+CiAgPGVsbGlwc2UgY3g9IjMwMCIgY3k9IjI1OCIgcng9IjcwIiByeT0iMTYiIGZpbGw9IiMxNTY1QzAiIG9wYWNpdHk9IjAuMTUiLz4KICA8IS0tIEdsYXNzIC0tPgogIDxwYXRoIGQ9Ik0yNDIsNzUgUTIzOCwyNTAgMzAwLDI2MiBRMzYyLDI1MCAzNTgsNzVaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CiAgPHBhdGggZD0iTTI0OCw4MCBRMjQ0LDI0NSAzMDAsMjU2IFEzNTYsMjQ1IDM1Miw4MFoiIGZpbGw9IiNFM0YyRkQiIG9wYWNpdHk9IjAuNyIvPgogIDwhLS0gTWlsay9rZWZpciBjb250ZW50IC0tPgogIDxwYXRoIGQ9Ik0yNDksMTA1IFEyNDYsMjQ1IDMwMCwyNTYgUTM1NCwyNDUgMzUxLDEwNVoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjk1Ii8+CiAgPCEtLSBGb2FtIG9uIHRvcCAtLT4KICA8ZWxsaXBzZSBjeD0iMzAwIiBjeT0iMTA4IiByeD0iNTAiIHJ5PSIxMiIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIyODAiIGN5PSIxMDUiIHI9IjgiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMjk1IiBjeT0iMTAyIiByPSIxMCIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIzMTIiIGN5PSIxMDQiIHI9IjkiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMzI1IiBjeT0iMTA3IiByPSI3IiBmaWxsPSJ3aGl0ZSIvPgogIDwhLS0gQnViYmxlcyBpbnNpZGUgLS0+CiAgPGNpcmNsZSBjeD0iMjc1IiBjeT0iMTYwIiByPSI2IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMzE1IiBjeT0iMTgwIiByPSI1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+CiAgPGNpcmNsZSBjeD0iMjkwIiBjeT0iMjAwIiByPSI0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC40Ii8+CiAgPGNpcmNsZSBjeD0iMzMwIiBjeT0iMTUwIiByPSI0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+CiAgPCEtLSBHbGFzcyBoaWdobGlnaHQgLS0+CiAgPHBhdGggZD0iTTI1Myw5MCBMMjU0LDI0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2IiBvcGFjaXR5PSIwLjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDwhLS0gR2xhc3Mgb3V0bGluZSAtLT4KICA8cGF0aCBkPSJNMjQyLDc1IFEyMzgsMjUwIDMwMCwyNjIgUTM2MiwyNTAgMzU4LDc1WiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTBDQUY5IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+',
};

function getFoodImgUrl(text){
  var t = text.toLowerCase();
  if(t.includes('omlet'))                         return FOOD_SVG_B64.tuxum||FOOD_SVG_B64.default;
  if(t.includes('tuxum'))                         return FOOD_SVG_B64.tuxum||FOOD_SVG_B64.default;
  if(t.includes('yulaf')||t.includes('suli'))     return FOOD_SVG_B64.yulaf||FOOD_SVG_B64.default;
  if(t.includes('smoothie'))                      return FOOD_SVG_B64.smoothie||FOOD_SVG_B64.default;
  if(t.includes('avokado'))                       return FOOD_SVG_B64.salat||FOOD_SVG_B64.default;
  if(t.includes('tvorog')||t.includes('suzma'))   return FOOD_SVG_B64.default;
  if(t.includes('kefir'))                         return FOOD_SVG_B64.kefir||FOOD_SVG_B64.default;
  if(t.includes('banan'))                         return FOOD_SVG_B64.smoothie||FOOD_SVG_B64.default;
  if(t.includes('losos'))                         return FOOD_SVG_B64.baliq||FOOD_SVG_B64.default;
  if(t.includes('krevetka'))                      return FOOD_SVG_B64.baliq||FOOD_SVG_B64.default;
  if(t.includes("sho'rva"))                       return FOOD_SVG_B64.default;
  if(t.includes('tovuq'))                         return FOOD_SVG_B64.tovuq||FOOD_SVG_B64.default;
  if(t.includes("go'sht"))                        return FOOD_SVG_B64.gosht||FOOD_SVG_B64.default;
  if(t.includes('salat')||t.includes('sabzavot')) return FOOD_SVG_B64.salat||FOOD_SVG_B64.default;
  if(t.includes('baliq'))                         return FOOD_SVG_B64.baliq||FOOD_SVG_B64.default;
  return FOOD_SVG_B64.default;
}
/* FOOD_IMG_MAP va Unsplash getFoodImgUrl olib tashlandi — offline SVG ikonkalar ishlatiladi */
/* Haqiqiy ovqat fotosi — taom nomidagi kalit so'z bo'yicha (LoremFlickr). SVG zaxira sifatida qoladi. */
function getFoodPhoto(text){
  var t=(text||'').toLowerCase();
  var tag='healthy,food,meal', lock=10;
  if(t.indexOf('omlet')>=0||t.indexOf('tuxum')>=0){tag='omelette,eggs,breakfast';lock=21;}
  else if(t.indexOf('yulaf')>=0||t.indexOf('suli')>=0||t.indexOf("bo'tqa")>=0){tag='oatmeal,porridge,breakfast';lock=22;}
  else if(t.indexOf('smoothie')>=0){tag='smoothie,drink';lock=23;}
  else if(t.indexOf('kefir')>=0){tag='yogurt,drink';lock=24;}
  else if(t.indexOf('banan')>=0){tag='banana,smoothie,fruit';lock=25;}
  else if(t.indexOf('tvorog')>=0||t.indexOf('suzma')>=0){tag='cottage,cheese,bowl';lock=26;}
  else if(t.indexOf('avokado')>=0){tag='avocado,toast,food';lock=27;}
  else if(t.indexOf('losos')>=0||t.indexOf('baliq')>=0){tag='grilled,salmon,plate';lock=28;}
  else if(t.indexOf('krevetka')>=0){tag='shrimp,seafood,plate';lock=29;}
  else if(t.indexOf("sho'rva")>=0){tag='soup,bowl';lock=30;}
  else if(t.indexOf('tovuq')>=0){tag='grilled,chicken,plate';lock=31;}
  else if(t.indexOf("go'sht")>=0||t.indexOf('mol ')>=0){tag='steak,beef,plate';lock=32;}
  else if(t.indexOf('salat')>=0||t.indexOf('sabzavot')>=0){tag='salad,vegetables,bowl';lock=33;}
  else if(t.indexOf('guruch')>=0||t.indexOf('makaron')>=0){tag='rice,chicken,plate';lock=34;}
  return 'https://loremflickr.com/600/300/'+tag+'?lock='+lock;
}
var MEAL_COLORS = {
  'NONUSHTA':    {top:'#DE7831',bot:'#DB9725',badge:'rgba(255,107,53,.9)'},
  'TUSHLIK':     {top:'#1FA4BB',bot:'#1E8C8C',badge:'rgba(14,165,233,.9)'},
  'KECHKI OVQAT':{top:'#7F46E1',bot:'#E35199',badge:'rgba(124,58,237,.9)'},
};

/* === Qo'shimcha kunlik menyular (kunlik almashinuvni boyitadi) === */
try{var _p_yoqotish_erkak=RATSION_DATA.yoqotish&&RATSION_DATA.yoqotish.erkak&&RATSION_DATA.yoqotish.erkak.program;if(_p_yoqotish_erkak)[].push.apply(_p_yoqotish_erkak,[{"nom": "Yengil oqsil", "nonushta": "Omlet (2 tuxum) + ko'kat", "tushlik": "Tovuq filesi (130g) + bug'langan brokkoli", "kechki": "Tvorog (150g) + bodring", "maslahat": "Kuniga 2L suv. Shirinlikdan voz keching."}, {"nom": "Baliq kuni", "nonushta": "Yulaf (30g) + olma", "tushlik": "Baliq (150g) + yashil salat", "kechki": "Kefir (200ml) + chiya urug'i", "maslahat": "Baliq oqsil va omega-3 manbai."}, {"nom": "Sabzavotli", "nonushta": "2 tuxum + pomidor-bodring", "tushlik": "Mol go'shti (100g) + bug'langan sabzavot", "kechki": "Sabzavot sho'rva + ko'kat", "maslahat": "Kechki ovqat 19:00 gacha."}, {"nom": "Nohotli detoks", "nonushta": "Smoothie: ismaloq + olma + suv", "tushlik": "Nohot salati + tovuq (100g)", "kechki": "Suzma (150g) + yashil olma", "maslahat": "Tola to'ydiradi, kaloriya kam."}, {"nom": "Past uglevod", "nonushta": "Tvorog (150g) + yong'oq (10g)", "tushlik": "Tovuq (130g) + karam salati", "kechki": "Qaynatilgan tuxum (2ta) + pomidor", "maslahat": "Un va shakardan tiyiling."}, {"nom": "Yashil kun", "nonushta": "Smoothie: bodring + limon + zanjabil", "tushlik": "Yashil salat + baliq (100g)", "kechki": "Sabzavot taom + kefir", "maslahat": "Tuz miqdorini kamaytiring."}, {"nom": "Tovuqli yengil", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Tovuq filesi (140g) + brokkoli", "kechki": "Tvorog (120g) + chiya", "maslahat": "Har 3-4 soatda kichik porsiya."}, {"nom": "Mevasiz shirin", "nonushta": "Yulaf (30g) + dolchin", "tushlik": "Hind tovug'i (130g) + sabzavot", "kechki": "Baliq (100g) + yashil salat", "maslahat": "Shakar o'rniga dolchin/vanil."}]);}catch(e){}
try{var _p_yoqotish_ayol=RATSION_DATA.yoqotish&&RATSION_DATA.yoqotish.ayol&&RATSION_DATA.yoqotish.ayol.program;if(_p_yoqotish_ayol)[].push.apply(_p_yoqotish_ayol,[{"nom": "Yengil oqsil", "nonushta": "Omlet (2 tuxum) + ko'kat", "tushlik": "Tovuq filesi (130g) + bug'langan brokkoli", "kechki": "Tvorog (150g) + bodring", "maslahat": "Kuniga 2L suv. Shirinlikdan voz keching."}, {"nom": "Baliq kuni", "nonushta": "Yulaf (30g) + olma", "tushlik": "Baliq (150g) + yashil salat", "kechki": "Kefir (200ml) + chiya urug'i", "maslahat": "Baliq oqsil va omega-3 manbai."}, {"nom": "Sabzavotli", "nonushta": "2 tuxum + pomidor-bodring", "tushlik": "Mol go'shti (100g) + bug'langan sabzavot", "kechki": "Sabzavot sho'rva + ko'kat", "maslahat": "Kechki ovqat 19:00 gacha."}, {"nom": "Nohotli detoks", "nonushta": "Smoothie: ismaloq + olma + suv", "tushlik": "Nohot salati + tovuq (100g)", "kechki": "Suzma (150g) + yashil olma", "maslahat": "Tola to'ydiradi, kaloriya kam."}, {"nom": "Past uglevod", "nonushta": "Tvorog (150g) + yong'oq (10g)", "tushlik": "Tovuq (130g) + karam salati", "kechki": "Qaynatilgan tuxum (2ta) + pomidor", "maslahat": "Un va shakardan tiyiling."}, {"nom": "Yashil kun", "nonushta": "Smoothie: bodring + limon + zanjabil", "tushlik": "Yashil salat + baliq (100g)", "kechki": "Sabzavot taom + kefir", "maslahat": "Tuz miqdorini kamaytiring."}, {"nom": "Tovuqli yengil", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Tovuq filesi (140g) + brokkoli", "kechki": "Tvorog (120g) + chiya", "maslahat": "Har 3-4 soatda kichik porsiya."}, {"nom": "Mevasiz shirin", "nonushta": "Yulaf (30g) + dolchin", "tushlik": "Hind tovug'i (130g) + sabzavot", "kechki": "Baliq (100g) + yashil salat", "maslahat": "Shakar o'rniga dolchin/vanil."}]);}catch(e){}
try{var _p_massa_erkak=RATSION_DATA.massa&&RATSION_DATA.massa.erkak&&RATSION_DATA.massa.erkak.program;if(_p_massa_erkak)[].push.apply(_p_massa_erkak,[{"nom": "Kuch kuni", "nonushta": "Omlet (4 tuxum) + yulaf (60g) + banan", "tushlik": "Mol go'shti (200g) + guruch (200g) + salat", "kechki": "Tovuq (200g) + makaron (150g)", "maslahat": "Har 2-3 soatda yeng. Suv 3L."}, {"nom": "Oqsil bombasi", "nonushta": "Tvorog (250g) + asal + yong'oq", "tushlik": "Losos (200g) + kartoshka pyure (200g)", "kechki": "Tovuq (200g) + nohot + sabzavot", "maslahat": "Oqsil: 2g x kg vazn."}, {"nom": "Uglevod yuklash", "nonushta": "5 tuxum + suli bo'tqa + sut", "tushlik": "Go'sht (200g) + makaron (200g)", "kechki": "Baliq (150g) + guruch (150g)", "maslahat": "Mashqdan oldin uglevod yeng."}, {"nom": "Smoothie kuni", "nonushta": "Smoothie: sut + banan + yulaf + yong'oq yog'i", "tushlik": "Tovuq (220g) + guruch (200g) + avokado", "kechki": "Mol go'shti (180g) + sabzavot", "maslahat": "Suyuq kaloriya ham hisoblanadi."}, {"nom": "Energiya", "nonushta": "Blinchik (4ta) + asal + tvorog", "tushlik": "Go'sht sho'rva + non + salat", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Profitsit +400-500 kcal."}, {"nom": "Dengiz va guruch", "nonushta": "Omlet (4 tuxum) + non + avokado", "tushlik": "Krevetka (200g) + guruch (200g)", "kechki": "Losos (180g) + sabzavot + tuxum", "maslahat": "Yod va rux mushak uchun foydali."}, {"nom": "Maksimal", "nonushta": "5 tuxum + kartoshka + pishloq + non", "tushlik": "Go'sht (250g) + guruch (250g)", "kechki": "Tovuq (200g) + makaron + tuxum", "maslahat": "Uxlashdan oldin tvorog yeng."}, {"nom": "Tovuqli kuch", "nonushta": "Tvorog (200g) + banan + yong'oq", "tushlik": "Tovuq (250g) + jigarrang guruch (200g) + sabzavot", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Mashqdan keyin oqsil + uglevod."}]);}catch(e){}
try{var _p_massa_ayol=RATSION_DATA.massa&&RATSION_DATA.massa.ayol&&RATSION_DATA.massa.ayol.program;if(_p_massa_ayol)[].push.apply(_p_massa_ayol,[{"nom": "Kuch kuni", "nonushta": "Omlet (4 tuxum) + yulaf (60g) + banan", "tushlik": "Mol go'shti (200g) + guruch (200g) + salat", "kechki": "Tovuq (200g) + makaron (150g)", "maslahat": "Har 2-3 soatda yeng. Suv 3L."}, {"nom": "Oqsil bombasi", "nonushta": "Tvorog (250g) + asal + yong'oq", "tushlik": "Losos (200g) + kartoshka pyure (200g)", "kechki": "Tovuq (200g) + nohot + sabzavot", "maslahat": "Oqsil: 2g x kg vazn."}, {"nom": "Uglevod yuklash", "nonushta": "5 tuxum + suli bo'tqa + sut", "tushlik": "Go'sht (200g) + makaron (200g)", "kechki": "Baliq (150g) + guruch (150g)", "maslahat": "Mashqdan oldin uglevod yeng."}, {"nom": "Smoothie kuni", "nonushta": "Smoothie: sut + banan + yulaf + yong'oq yog'i", "tushlik": "Tovuq (220g) + guruch (200g) + avokado", "kechki": "Mol go'shti (180g) + sabzavot", "maslahat": "Suyuq kaloriya ham hisoblanadi."}, {"nom": "Energiya", "nonushta": "Blinchik (4ta) + asal + tvorog", "tushlik": "Go'sht sho'rva + non + salat", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Profitsit +400-500 kcal."}, {"nom": "Dengiz va guruch", "nonushta": "Omlet (4 tuxum) + non + avokado", "tushlik": "Krevetka (200g) + guruch (200g)", "kechki": "Losos (180g) + sabzavot + tuxum", "maslahat": "Yod va rux mushak uchun foydali."}, {"nom": "Maksimal", "nonushta": "5 tuxum + kartoshka + pishloq + non", "tushlik": "Go'sht (250g) + guruch (250g)", "kechki": "Tovuq (200g) + makaron + tuxum", "maslahat": "Uxlashdan oldin tvorog yeng."}, {"nom": "Tovuqli kuch", "nonushta": "Tvorog (200g) + banan + yong'oq", "tushlik": "Tovuq (250g) + jigarrang guruch (200g) + sabzavot", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Mashqdan keyin oqsil + uglevod."}]);}catch(e){}
try{var _p_sogom_erkak=RATSION_DATA.sogom&&RATSION_DATA.sogom.erkak&&RATSION_DATA.sogom.erkak.program;if(_p_sogom_erkak)[].push.apply(_p_sogom_erkak,[{"nom": "Muvozanat", "nonushta": "Yulaf (40g) + meva + yong'oq", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Rang-barang ovqatlaning."}, {"nom": "O'rta yer dengizi", "nonushta": "Avokado tost + tuxum", "tushlik": "Losos (130g) + bulg'ur + salat", "kechki": "Tvorog (150g) + yong'oq", "maslahat": "Zaytun moyi sog'lom yog' manbai."}, {"nom": "Tola kuni", "nonushta": "Smoothie: ismaloq + kiwi + chiya", "tushlik": "Nohot taom + sabzavot + tovuq (120g)", "kechki": "Sabzavot sho'rva + non (1 bo'lak)", "maslahat": "Tola hazmni yaxshilaydi."}, {"nom": "Tuxumli", "nonushta": "Omlet (2-3 tuxum) + pomidor + non", "tushlik": "Tovuq (150g) + kartoshka + salat", "kechki": "Kefir (200ml) + olma + yong'oq", "maslahat": "Tabiiy mahsulotlarni tanlang."}, {"nom": "Baliq va guruch", "nonushta": "Yulaf (40g) + banan", "tushlik": "Baliq (140g) + guruch (120g) + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Haftada 2-3 marta baliq yeng."}, {"nom": "Yengil va to'yimli", "nonushta": "Tvorog (150g) + meva", "tushlik": "Tovuq (150g) + grechka (120g) + sabzavot", "kechki": "Yashil salat + tuxum (2ta)", "maslahat": "Porsiyani me'yorida saqlang."}, {"nom": "Sabzavot va oqsil", "nonushta": "Omlet + ismaloq + non", "tushlik": "Mol go'shti (130g) + sabzavot + guruch (100g)", "kechki": "Kefir + bodring + yong'oq", "maslahat": "Sekin uglevodlarni tanlang."}, {"nom": "Smoothie ertalab", "nonushta": "Smoothie: sut + banan + yulaf", "tushlik": "Tovuq (150g) + bulg'ur + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Nonushtani o'tkazib yubormang."}]);}catch(e){}
try{var _p_sogom_ayol=RATSION_DATA.sogom&&RATSION_DATA.sogom.ayol&&RATSION_DATA.sogom.ayol.program;if(_p_sogom_ayol)[].push.apply(_p_sogom_ayol,[{"nom": "Muvozanat", "nonushta": "Yulaf (40g) + meva + yong'oq", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Rang-barang ovqatlaning."}, {"nom": "O'rta yer dengizi", "nonushta": "Avokado tost + tuxum", "tushlik": "Losos (130g) + bulg'ur + salat", "kechki": "Tvorog (150g) + yong'oq", "maslahat": "Zaytun moyi sog'lom yog' manbai."}, {"nom": "Tola kuni", "nonushta": "Smoothie: ismaloq + kiwi + chiya", "tushlik": "Nohot taom + sabzavot + tovuq (120g)", "kechki": "Sabzavot sho'rva + non (1 bo'lak)", "maslahat": "Tola hazmni yaxshilaydi."}, {"nom": "Tuxumli", "nonushta": "Omlet (2-3 tuxum) + pomidor + non", "tushlik": "Tovuq (150g) + kartoshka + salat", "kechki": "Kefir (200ml) + olma + yong'oq", "maslahat": "Tabiiy mahsulotlarni tanlang."}, {"nom": "Baliq va guruch", "nonushta": "Yulaf (40g) + banan", "tushlik": "Baliq (140g) + guruch (120g) + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Haftada 2-3 marta baliq yeng."}, {"nom": "Yengil va to'yimli", "nonushta": "Tvorog (150g) + meva", "tushlik": "Tovuq (150g) + grechka (120g) + sabzavot", "kechki": "Yashil salat + tuxum (2ta)", "maslahat": "Porsiyani me'yorida saqlang."}, {"nom": "Sabzavot va oqsil", "nonushta": "Omlet + ismaloq + non", "tushlik": "Mol go'shti (130g) + sabzavot + guruch (100g)", "kechki": "Kefir + bodring + yong'oq", "maslahat": "Sekin uglevodlarni tanlang."}, {"nom": "Smoothie ertalab", "nonushta": "Smoothie: sut + banan + yulaf", "tushlik": "Tovuq (150g) + bulg'ur + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Nonushtani o'tkazib yubormang."}]);}catch(e){}
try{var _p_relief_erkak=RATSION_DATA.relief&&RATSION_DATA.relief.erkak&&RATSION_DATA.relief.erkak.program;if(_p_relief_erkak)[].push.apply(_p_relief_erkak,[{"nom": "Toza relief", "nonushta": "Omlet (3 oq + 1 tuxum) + ko'kat", "tushlik": "Tovuq filesi (150g) + brokkoli", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuz va shakarni kamaytiring."}, {"nom": "Past yog'", "nonushta": "Yulaf (40g) + oq tvorog", "tushlik": "Hind tovug'i (150g) + sabzavot", "kechki": "Suzma (150g) + bodring", "maslahat": "Suv 2.5-3L. Toza ovqat."}, {"nom": "Quruq massa", "nonushta": "Tvorog (200g) + chiya", "tushlik": "Tovuq (160g) + jigarrang guruch (100g) + salat", "kechki": "Baliq (130g) + brokkoli", "maslahat": "Oqsil yuqori, yog' past."}, {"nom": "Dengiz relief", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Krevetka (150g) + yashil salat", "kechki": "Tvorog (150g) + yong'oq (10g)", "maslahat": "Yengil va oqsilga boy."}, {"nom": "Yashil cut", "nonushta": "Smoothie: ismaloq + olma", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (80g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Oqsil kuni", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Mol go'shti (130g) + sabzavot", "kechki": "Suzma (200g) + yashil olma", "maslahat": "Har 3 soatda kichik porsiya."}, {"nom": "Baliqli relief", "nonushta": "Tvorog (150g) + chiya + meva", "tushlik": "Losos (140g) + brokkoli + guruch (80g)", "kechki": "Tovuq (120g) + salat", "maslahat": "Omega-3 + oqsil kombinatsiyasi."}, {"nom": "Yengil quruq", "nonushta": "Yulaf (30g) + oq tvorog", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Kechqurun uglevodni kamaytiring."}]);}catch(e){}
try{var _p_relief_ayol=RATSION_DATA.relief&&RATSION_DATA.relief.ayol&&RATSION_DATA.relief.ayol.program;if(_p_relief_ayol)[].push.apply(_p_relief_ayol,[{"nom": "Toza relief", "nonushta": "Omlet (3 oq + 1 tuxum) + ko'kat", "tushlik": "Tovuq filesi (150g) + brokkoli", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuz va shakarni kamaytiring."}, {"nom": "Past yog'", "nonushta": "Yulaf (40g) + oq tvorog", "tushlik": "Hind tovug'i (150g) + sabzavot", "kechki": "Suzma (150g) + bodring", "maslahat": "Suv 2.5-3L. Toza ovqat."}, {"nom": "Quruq massa", "nonushta": "Tvorog (200g) + chiya", "tushlik": "Tovuq (160g) + jigarrang guruch (100g) + salat", "kechki": "Baliq (130g) + brokkoli", "maslahat": "Oqsil yuqori, yog' past."}, {"nom": "Dengiz relief", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Krevetka (150g) + yashil salat", "kechki": "Tvorog (150g) + yong'oq (10g)", "maslahat": "Yengil va oqsilga boy."}, {"nom": "Yashil cut", "nonushta": "Smoothie: ismaloq + olma", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (80g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Oqsil kuni", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Mol go'shti (130g) + sabzavot", "kechki": "Suzma (200g) + yashil olma", "maslahat": "Har 3 soatda kichik porsiya."}, {"nom": "Baliqli relief", "nonushta": "Tvorog (150g) + chiya + meva", "tushlik": "Losos (140g) + brokkoli + guruch (80g)", "kechki": "Tovuq (120g) + salat", "maslahat": "Omega-3 + oqsil kombinatsiyasi."}, {"nom": "Yengil quruq", "nonushta": "Yulaf (30g) + oq tvorog", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Kechqurun uglevodni kamaytiring."}]);}catch(e){}
/* === Foydali kokteyllar (retseptlar bilan) === */
var KOKTEYLLAR=[{"nom": "Yashil energiya", "emoji": "🥬", "mahsulotlar": "1 hovuch ismaloq, 1 olma, 1/2 bodring, 1/2 limon sharbati, 200ml suv", "tayyorlash": "Hammasini blenderda 30-40 soniya aralashtiring, muz qo'shing.", "foyda": "Vitamin va detoks, kam kaloriya", "kcal": 90}, {"nom": "Banan-yong'oq protein", "emoji": "🍌", "mahsulotlar": "1 banan, 250ml sut, 2 osh qoshiq yulaf, 1 ch.q yong'oq yog'i, 1 ch.q asal", "tayyorlash": "Blenderda silliq bo'lguncha aralashtiring.", "foyda": "Mushak tiklanishi uchun, mashqdan keyin", "kcal": 280}, {"nom": "Qulupnay-kefir", "emoji": "🍓", "mahsulotlar": "6-7 qulupnay, 200ml kefir, 1 ch.q chiya, 1 ch.q asal", "tayyorlash": "Aralashtiring, 5 daqiqa chiya bo'kishini kuting.", "foyda": "Probiotik, hazm uchun foydali", "kcal": 160}, {"nom": "Tarvuz-yalpiz", "emoji": "🍉", "mahsulotlar": "2 stakan tarvuz, 5-6 barg yalpiz, 1/2 limon, muz", "tayyorlash": "Blenderda aralashtirib, sovuq iching.", "foyda": "Tetiklashtiruvchi, gidratsiya", "kcal": 70}, {"nom": "Avokado smuzi", "emoji": "🥑", "mahsulotlar": "1/2 avokado, 250ml sut, 1/2 banan, 1 ch.q asal", "tayyorlash": "Silliq bo'lguncha blenderda urib oling.", "foyda": "Sog'lom yog' va to'yimlilik", "kcal": 260}, {"nom": "Sabzi-apelsin", "emoji": "🥕", "mahsulotlar": "1 sabzi, 1 apelsin, kichik bo'lak zanjabil, 100ml suv", "tayyorlash": "Sharbat siqib yoki blenderda aralashtiring.", "foyda": "Beta-karotin, immunitet", "kcal": 110}, {"nom": "Tvorog-meva", "emoji": "🥛", "mahsulotlar": "150g tvorog, 1/2 banan, 150ml sut, 1 ch.q asal", "tayyorlash": "Blenderda aralashtiring.", "foyda": "Yuqori oqsil, to'yimli", "kcal": 230}, {"nom": "Kiwi-ismaloq detoks", "emoji": "🥝", "mahsulotlar": "2 kiwi, 1 hovuch ismaloq, 1 olma, 200ml suv", "tayyorlash": "Aralashtirib, darrov iching.", "foyda": "C vitamini, antioksidant", "kcal": 100}, {"nom": "Kakao-banan", "emoji": "🍫", "mahsulotlar": "1 banan, 250ml sut, 1 ch.q kakao, 1 ch.q yong'oq yog'i, muz", "tayyorlash": "Blenderda silliq qiling.", "foyda": "Mashqdan keyin energiya", "kcal": 270}, {"nom": "Limonli zanjabil", "emoji": "🍋", "mahsulotlar": "250ml iliq suv, 1/2 limon, kichik zanjabil, 1 ch.q asal", "tayyorlash": "Zanjabilni maydalab, suvga qo'shing, limon va asal aralashtiring.", "foyda": "Immunitet va hazmga yordam", "kcal": 40}, {"nom": "Anor-rezavor", "emoji": "🍇", "mahsulotlar": "100ml anor sharbati, 5 qulupnay, 1 hovuch maymunjon, 100ml suv", "tayyorlash": "Blenderda aralashtiring.", "foyda": "Kuchli antioksidant", "kcal": 120}, {"nom": "Bodring-yalpiz suv", "emoji": "🥒", "mahsulotlar": "1/2 bodring, 5 barg yalpiz, 1/2 limon, 400ml suv", "tayyorlash": "Bo'laklarni suvga soling, 1-2 soat sovutgichda saqlang.", "foyda": "Gidratsiya, kam kaloriya", "kcal": 20}];

function openKokteyllar(){
  var modal=document.getElementById('kokteyl-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='kokteyl-modal'; modal.className='moverlay';
    modal.innerHTML='<div class="modal" style="padding:0;border-radius:28px 28px 0 0;overflow:hidden">'+
      '<div style="background:linear-gradient(135deg,#116C55,#166B6B);padding:18px 20px 14px">'+
        '<div class="mhandle" style="background:rgba(255,255,255,.3)"></div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">'+
          '<div style="font-size:18px;font-weight:800;color:#fff">🍹 Foydali kokteyllar</div>'+
          '<button onclick="closeM(\'kokteyl-modal\')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer">✕</button>'+
        '</div>'+
        '<div style="font-size:13.5px;color:rgba(255,255,255,.7);margin-top:4px">Smuzi va sog\'lom ichimliklar — uyda tayyorlang</div>'+
      '</div>'+
      '<div style="padding:16px;overflow-y:auto;max-height:80vh" id="kokteyl-body"></div>'+
    '</div>';
    modal.onclick=function(e){if(e.target===modal)closeM('kokteyl-modal');};
    document.body.appendChild(modal);
  }
  var body=document.getElementById('kokteyl-body');
  body.innerHTML=(typeof KOKTEYLLAR!=='undefined'?KOKTEYLLAR:[]).map(function(k){
    return '<div style="background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:14px;margin-bottom:12px;box-shadow:var(--shadow)">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
        '<div style="font-size:26px">'+k.emoji+'</div>'+
        '<div style="font-size:15px;font-weight:800;color:var(--text)">'+k.nom+'</div>'+
        (k.kcal?'<div style="margin-left:auto;font-size:13.5px;font-weight:700;color:var(--g);background:rgba(30,140,140,.1);padding:3px 9px;border-radius:10px">'+k.kcal+' kcal</div>':'')+
      '</div>'+
      '<div style="font-size:14px;color:var(--t2);margin-bottom:6px;line-height:1.5"><b style="color:var(--text)">Tarkibi:</b> '+k.mahsulotlar+'</div>'+
      '<div style="font-size:14px;color:var(--t2);margin-bottom:6px;line-height:1.5"><b style="color:var(--text)">Tayyorlash:</b> '+k.tayyorlash+'</div>'+
      '<div style="font-size:14px;color:var(--g)">✅ '+k.foyda+'</div>'+
    '</div>';
  }).join('');
  openM('kokteyl-modal');
}

function getMealCard(icon, label, color, text){
  var photoUrl = getFoodPhoto(text);
  var svgUrl  = getFoodImgUrl(text);
  var mc      = MEAL_COLORS[label] || {top:'#374151',bot:'#1F2937',badge:'rgba(55,65,81,.9)'};
  var uid     = 'mcard-' + Math.random().toString(36).substr(2,6);

  return (
    '<div style="border-radius:22px;overflow:hidden;margin-bottom:16px;box-shadow:0 10px 40px rgba(0,0,0,.18)">' +
      '<div id="'+uid+'" style="position:relative;height:190px;overflow:hidden;background:linear-gradient(135deg,'+mc.top+','+mc.bot+')">' +
        '<img src="'+svgUrl+'" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">' +
        '<img src="'+photoUrl+'"' +
          ' loading="lazy"' +
          ' style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:opacity .4s;opacity:0"' +
          ' onload="this.style.opacity=1"' +
          ' onerror="this.remove()">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.6) 100%)"></div>' +
        '<div style="position:absolute;top:12px;left:12px;background:'+mc.badge+';backdrop-filter:blur(8px);color:#fff;padding:5px 13px;border-radius:20px;font-size:13.5px;font-weight:800;letter-spacing:.5px">'+icon+' '+label+'</div>' +
        '<div style="position:absolute;bottom:12px;left:14px;right:14px">' +
          '<div style="font-size:15px;font-weight:700;color:#fff;line-height:1.5;text-shadow:0 1px 8px rgba(0,0,0,.5)">'+text+'</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

/* === 30 kunga yetkazish: qo'shimcha menyular (takrorlanmaslik uchun) === */
try{var _x_yoqotish_erkak=RATSION_DATA.yoqotish&&RATSION_DATA.yoqotish.erkak&&RATSION_DATA.yoqotish.erkak.program;if(_x_yoqotish_erkak)[].push.apply(_x_yoqotish_erkak,[{"nom": "Yengil start", "nonushta": "Suzma (150g) + bodring", "tushlik": "Tovuq (130g) + yashil salat", "kechki": "Sabzavot sho'rva", "maslahat": "Ertalab 1 stakan iliq suv iching."}, {"nom": "Tuxumli yengil", "nonushta": "2 qaynatilgan tuxum + pomidor", "tushlik": "Baliq (140g) + brokkoli", "kechki": "Kefir (200ml)", "maslahat": "Kechki ovqat 19:00 gacha."}, {"nom": "Yashil detoks", "nonushta": "Smoothie: ismaloq + olma + suv", "tushlik": "Tovuq (120g) + karam salati", "kechki": "Suzma (120g) + yashil olma", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Baliqli kun", "nonushta": "Yulaf (30g) + olma", "tushlik": "Losos (130g) + yashil salat", "kechki": "Tvorog (120g) + bodring", "maslahat": "Omega-3 metabolizmni qo'llaydi."}, {"nom": "Past kaloriya", "nonushta": "Oq omlet (3 oq) + ko'kat", "tushlik": "Tovuq (130g) + bug'langan sabzavot", "kechki": "Yashil salat + tuxum (1ta)", "maslahat": "Sekin chaynang, to'yim signali kechikadi."}, {"nom": "Tolaga boy", "nonushta": "Chia puding + ozroq meva", "tushlik": "Nohot salati + tovuq (100g)", "kechki": "Sabzavot ragu", "maslahat": "Tola uzoq to'ydiradi."}, {"nom": "Sabzavot kuni", "nonushta": "2 tuxum + bodring-pomidor", "tushlik": "Mol go'shti (100g) + sabzavot", "kechki": "Sabzavot sho'rva + ko'kat", "maslahat": "Tuz miqdorini kamaytiring."}, {"nom": "Kefirli", "nonushta": "Kefir (200ml) + chia", "tushlik": "Tovuq (130g) + grechka (60g)", "kechki": "Suzma (150g)", "maslahat": "Probiotiklar hazmga foydali."}, {"nom": "Limonli yangilik", "nonushta": "Smoothie: bodring + limon + zanjabil", "tushlik": "Baliq (130g) + yashil salat", "kechki": "Tvorog (120g) + yong'oq (5g)", "maslahat": "Achchiq-nordon ishtahani kamaytiradi."}, {"nom": "Yengil oqsil", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Hind tovug'i (130g) + brokkoli", "kechki": "Kefir (200ml) + olma", "maslahat": "Har ovqatda oqsil bo'lsin."}, {"nom": "Tvorogli", "nonushta": "Tvorog (150g) + dolchin", "tushlik": "Tovuq (130g) + karam salati", "kechki": "Qaynatilgan tuxum (2ta) + pomidor", "maslahat": "Shakar o'rniga dolchin ishlating."}, {"nom": "Dengiz yengili", "nonushta": "Oq omlet + pomidor", "tushlik": "Krevetka (130g) + yashil salat", "kechki": "Suzma (150g) + bodring", "maslahat": "Dengiz mahsuloti — kam yog', ko'p oqsil."}, {"nom": "Olma-yulaf", "nonushta": "Yulaf (30g) + olma + dolchin", "tushlik": "Tovuq (130g) + sabzavot", "kechki": "Kefir (200ml)", "maslahat": "Mevani ertalab iste'mol qiling."}, {"nom": "Toza ovqat", "nonushta": "2 tuxum + avokado (1/4)", "tushlik": "Baliq (140g) + yashil salat", "kechki": "Suzma (120g) + ko'kat", "maslahat": "Qayta ishlangan mahsulotlardan saqlaning."}, {"nom": "Yakuniy yengil", "nonushta": "Smoothie: kefir + ismaloq + olma", "tushlik": "Tovuq (130g) + bug'langan sabzavot", "kechki": "Yashil salat + tuxum (1ta)", "maslahat": "Kuniga 2-2.5L suv iching."}]);}catch(e){}
try{var _x_yoqotish_ayol=RATSION_DATA.yoqotish&&RATSION_DATA.yoqotish.ayol&&RATSION_DATA.yoqotish.ayol.program;if(_x_yoqotish_ayol)[].push.apply(_x_yoqotish_ayol,[{"nom": "Yengil start", "nonushta": "Suzma (150g) + bodring", "tushlik": "Tovuq (130g) + yashil salat", "kechki": "Sabzavot sho'rva", "maslahat": "Ertalab 1 stakan iliq suv iching."}, {"nom": "Tuxumli yengil", "nonushta": "2 qaynatilgan tuxum + pomidor", "tushlik": "Baliq (140g) + brokkoli", "kechki": "Kefir (200ml)", "maslahat": "Kechki ovqat 19:00 gacha."}, {"nom": "Yashil detoks", "nonushta": "Smoothie: ismaloq + olma + suv", "tushlik": "Tovuq (120g) + karam salati", "kechki": "Suzma (120g) + yashil olma", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Baliqli kun", "nonushta": "Yulaf (30g) + olma", "tushlik": "Losos (130g) + yashil salat", "kechki": "Tvorog (120g) + bodring", "maslahat": "Omega-3 metabolizmni qo'llaydi."}, {"nom": "Past kaloriya", "nonushta": "Oq omlet (3 oq) + ko'kat", "tushlik": "Tovuq (130g) + bug'langan sabzavot", "kechki": "Yashil salat + tuxum (1ta)", "maslahat": "Sekin chaynang, to'yim signali kechikadi."}, {"nom": "Tolaga boy", "nonushta": "Chia puding + ozroq meva", "tushlik": "Nohot salati + tovuq (100g)", "kechki": "Sabzavot ragu", "maslahat": "Tola uzoq to'ydiradi."}, {"nom": "Sabzavot kuni", "nonushta": "2 tuxum + bodring-pomidor", "tushlik": "Mol go'shti (100g) + sabzavot", "kechki": "Sabzavot sho'rva + ko'kat", "maslahat": "Tuz miqdorini kamaytiring."}, {"nom": "Kefirli", "nonushta": "Kefir (200ml) + chia", "tushlik": "Tovuq (130g) + grechka (60g)", "kechki": "Suzma (150g)", "maslahat": "Probiotiklar hazmga foydali."}, {"nom": "Limonli yangilik", "nonushta": "Smoothie: bodring + limon + zanjabil", "tushlik": "Baliq (130g) + yashil salat", "kechki": "Tvorog (120g) + yong'oq (5g)", "maslahat": "Achchiq-nordon ishtahani kamaytiradi."}, {"nom": "Yengil oqsil", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Hind tovug'i (130g) + brokkoli", "kechki": "Kefir (200ml) + olma", "maslahat": "Har ovqatda oqsil bo'lsin."}, {"nom": "Tvorogli", "nonushta": "Tvorog (150g) + dolchin", "tushlik": "Tovuq (130g) + karam salati", "kechki": "Qaynatilgan tuxum (2ta) + pomidor", "maslahat": "Shakar o'rniga dolchin ishlating."}, {"nom": "Dengiz yengili", "nonushta": "Oq omlet + pomidor", "tushlik": "Krevetka (130g) + yashil salat", "kechki": "Suzma (150g) + bodring", "maslahat": "Dengiz mahsuloti — kam yog', ko'p oqsil."}, {"nom": "Olma-yulaf", "nonushta": "Yulaf (30g) + olma + dolchin", "tushlik": "Tovuq (130g) + sabzavot", "kechki": "Kefir (200ml)", "maslahat": "Mevani ertalab iste'mol qiling."}, {"nom": "Toza ovqat", "nonushta": "2 tuxum + avokado (1/4)", "tushlik": "Baliq (140g) + yashil salat", "kechki": "Suzma (120g) + ko'kat", "maslahat": "Qayta ishlangan mahsulotlardan saqlaning."}, {"nom": "Yakuniy yengil", "nonushta": "Smoothie: kefir + ismaloq + olma", "tushlik": "Tovuq (130g) + bug'langan sabzavot", "kechki": "Yashil salat + tuxum (1ta)", "maslahat": "Kuniga 2-2.5L suv iching."}]);}catch(e){}
try{var _x_massa_erkak=RATSION_DATA.massa&&RATSION_DATA.massa.erkak&&RATSION_DATA.massa.erkak.program;if(_x_massa_erkak)[].push.apply(_x_massa_erkak,[{"nom": "Katta start", "nonushta": "Omlet (4 tuxum) + yulaf (60g) + banan", "tushlik": "Mol go'shti (200g) + guruch (200g)", "kechki": "Tovuq (200g) + makaron (150g)", "maslahat": "Har 2-3 soatda yeng."}, {"nom": "Oqsil zarbasi", "nonushta": "Tvorog (250g) + asal + yong'oq", "tushlik": "Losos (200g) + kartoshka (200g)", "kechki": "Tovuq (200g) + nohot", "maslahat": "Oqsil: ~2g x tana vazni."}, {"nom": "Uglevod kuni", "nonushta": "5 tuxum + suli bo'tqa + sut", "tushlik": "Go'sht (200g) + makaron (200g)", "kechki": "Baliq (150g) + guruch (150g)", "maslahat": "Mashqdan oldin uglevod yeng."}, {"nom": "Smoothie massa", "nonushta": "Smoothie: sut + banan + yulaf + yong'oq yog'i", "tushlik": "Tovuq (220g) + guruch (200g) + avokado", "kechki": "Mol go'shti (180g) + sabzavot", "maslahat": "Suyuq kaloriya ham hisobga olinadi."}, {"nom": "Energiya", "nonushta": "Blinchik (4ta) + asal + tvorog", "tushlik": "Go'sht sho'rva + non + salat", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Kunlik profitsit +400 kcal."}, {"nom": "Dengiz va guruch", "nonushta": "Omlet (4 tuxum) + non + avokado", "tushlik": "Krevetka (200g) + guruch (200g)", "kechki": "Losos (180g) + tuxum (2ta)", "maslahat": "Rux va yod mushak uchun foydali."}, {"nom": "Maksimal", "nonushta": "5 tuxum + kartoshka + pishloq", "tushlik": "Go'sht (250g) + guruch (250g)", "kechki": "Tovuq (200g) + makaron", "maslahat": "Uxlashdan oldin tvorog yeng."}, {"nom": "Banan-yong'oq", "nonushta": "Yulaf (70g) + banan + yong'oq yog'i", "tushlik": "Tovuq (220g) + jigarrang guruch (200g)", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Sog'lom yog'lar kaloriyani oshiradi."}, {"nom": "Pishloqli", "nonushta": "Omlet (4 tuxum) + pishloq + non", "tushlik": "Go'sht (200g) + grechka (180g)", "kechki": "Tovuq (200g) + sabzavot + guruch (100g)", "maslahat": "Kun davomida 5-6 ovqat."}, {"nom": "Losos kuni", "nonushta": "Tvorog (200g) + asal + banan", "tushlik": "Losos (200g) + guruch (200g)", "kechki": "Tovuq (180g) + makaron", "maslahat": "Omega-3 tiklanishni tezlashtiradi."}, {"nom": "Tovuq-guruch", "nonushta": "5 tuxum + non + avokado", "tushlik": "Tovuq (250g) + guruch (250g)", "kechki": "Mol go'shti (180g) + kartoshka pyure", "maslahat": "Mashqdan keyin oqsil + uglevod."}, {"nom": "To'yimli kun", "nonushta": "Suli bo'tqa (70g) + sut + meva", "tushlik": "Go'sht (200g) + makaron (200g) + salat", "kechki": "Tovuq (200g) + nohot", "maslahat": "Ovqatni o'tkazib yubormang."}, {"nom": "Yong'oqli", "nonushta": "Tvorog (250g) + yong'oq + asal", "tushlik": "Tovuq (220g) + guruch (200g)", "kechki": "Baliq (180g) + kartoshka", "maslahat": "Bir hovuch yong'oq = qo'shimcha energiya."}, {"nom": "Go'shtli kuch", "nonushta": "Omlet (5 tuxum) + non", "tushlik": "Mol go'shti (220g) + guruch (220g)", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Qizil go'sht — temir manbai."}, {"nom": "Yakuniy massa", "nonushta": "Smoothie: sut + banan + yulaf + tvorog", "tushlik": "Tovuq (230g) + guruch (220g) + avokado", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Doimiy profitsit + uyqu = o'sish."}]);}catch(e){}
try{var _x_massa_ayol=RATSION_DATA.massa&&RATSION_DATA.massa.ayol&&RATSION_DATA.massa.ayol.program;if(_x_massa_ayol)[].push.apply(_x_massa_ayol,[{"nom": "Katta start", "nonushta": "Omlet (4 tuxum) + yulaf (60g) + banan", "tushlik": "Mol go'shti (200g) + guruch (200g)", "kechki": "Tovuq (200g) + makaron (150g)", "maslahat": "Har 2-3 soatda yeng."}, {"nom": "Oqsil zarbasi", "nonushta": "Tvorog (250g) + asal + yong'oq", "tushlik": "Losos (200g) + kartoshka (200g)", "kechki": "Tovuq (200g) + nohot", "maslahat": "Oqsil: ~2g x tana vazni."}, {"nom": "Uglevod kuni", "nonushta": "5 tuxum + suli bo'tqa + sut", "tushlik": "Go'sht (200g) + makaron (200g)", "kechki": "Baliq (150g) + guruch (150g)", "maslahat": "Mashqdan oldin uglevod yeng."}, {"nom": "Smoothie massa", "nonushta": "Smoothie: sut + banan + yulaf + yong'oq yog'i", "tushlik": "Tovuq (220g) + guruch (200g) + avokado", "kechki": "Mol go'shti (180g) + sabzavot", "maslahat": "Suyuq kaloriya ham hisobga olinadi."}, {"nom": "Energiya", "nonushta": "Blinchik (4ta) + asal + tvorog", "tushlik": "Go'sht sho'rva + non + salat", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Kunlik profitsit +400 kcal."}, {"nom": "Dengiz va guruch", "nonushta": "Omlet (4 tuxum) + non + avokado", "tushlik": "Krevetka (200g) + guruch (200g)", "kechki": "Losos (180g) + tuxum (2ta)", "maslahat": "Rux va yod mushak uchun foydali."}, {"nom": "Maksimal", "nonushta": "5 tuxum + kartoshka + pishloq", "tushlik": "Go'sht (250g) + guruch (250g)", "kechki": "Tovuq (200g) + makaron", "maslahat": "Uxlashdan oldin tvorog yeng."}, {"nom": "Banan-yong'oq", "nonushta": "Yulaf (70g) + banan + yong'oq yog'i", "tushlik": "Tovuq (220g) + jigarrang guruch (200g)", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Sog'lom yog'lar kaloriyani oshiradi."}, {"nom": "Pishloqli", "nonushta": "Omlet (4 tuxum) + pishloq + non", "tushlik": "Go'sht (200g) + grechka (180g)", "kechki": "Tovuq (200g) + sabzavot + guruch (100g)", "maslahat": "Kun davomida 5-6 ovqat."}, {"nom": "Losos kuni", "nonushta": "Tvorog (200g) + asal + banan", "tushlik": "Losos (200g) + guruch (200g)", "kechki": "Tovuq (180g) + makaron", "maslahat": "Omega-3 tiklanishni tezlashtiradi."}, {"nom": "Tovuq-guruch", "nonushta": "5 tuxum + non + avokado", "tushlik": "Tovuq (250g) + guruch (250g)", "kechki": "Mol go'shti (180g) + kartoshka pyure", "maslahat": "Mashqdan keyin oqsil + uglevod."}, {"nom": "To'yimli kun", "nonushta": "Suli bo'tqa (70g) + sut + meva", "tushlik": "Go'sht (200g) + makaron (200g) + salat", "kechki": "Tovuq (200g) + nohot", "maslahat": "Ovqatni o'tkazib yubormang."}, {"nom": "Yong'oqli", "nonushta": "Tvorog (250g) + yong'oq + asal", "tushlik": "Tovuq (220g) + guruch (200g)", "kechki": "Baliq (180g) + kartoshka", "maslahat": "Bir hovuch yong'oq = qo'shimcha energiya."}, {"nom": "Go'shtli kuch", "nonushta": "Omlet (5 tuxum) + non", "tushlik": "Mol go'shti (220g) + guruch (220g)", "kechki": "Tovuq (200g) + makaron + pishloq", "maslahat": "Qizil go'sht — temir manbai."}, {"nom": "Yakuniy massa", "nonushta": "Smoothie: sut + banan + yulaf + tvorog", "tushlik": "Tovuq (230g) + guruch (220g) + avokado", "kechki": "Mol go'shti (180g) + kartoshka", "maslahat": "Doimiy profitsit + uyqu = o'sish."}]);}catch(e){}
try{var _x_sogom_erkak=RATSION_DATA.sogom&&RATSION_DATA.sogom.erkak&&RATSION_DATA.sogom.erkak.program;if(_x_sogom_erkak)[].push.apply(_x_sogom_erkak,[{"nom": "Muvozanat", "nonushta": "Yulaf (40g) + meva + yong'oq", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Rang-barang ovqatlaning."}, {"nom": "O'rta yer dengizi", "nonushta": "Avokado tost + tuxum", "tushlik": "Losos (130g) + bulg'ur + salat", "kechki": "Tvorog (150g) + yong'oq", "maslahat": "Zaytun moyini tanlang."}, {"nom": "Tola kuni", "nonushta": "Smoothie: ismaloq + kiwi + chia", "tushlik": "Nohot taom + tovuq (120g)", "kechki": "Sabzavot sho'rva + non (1 bo'lak)", "maslahat": "Tola hazmni yaxshilaydi."}, {"nom": "Tuxumli", "nonushta": "Omlet (2-3 tuxum) + pomidor + non", "tushlik": "Tovuq (150g) + kartoshka + salat", "kechki": "Kefir (200ml) + olma", "maslahat": "Tabiiy mahsulotlarni tanlang."}, {"nom": "Baliq va guruch", "nonushta": "Yulaf (40g) + banan", "tushlik": "Baliq (140g) + guruch (120g) + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Haftada 2-3 marta baliq yeng."}, {"nom": "Yengil to'yimli", "nonushta": "Tvorog (150g) + meva", "tushlik": "Tovuq (150g) + grechka (120g)", "kechki": "Yashil salat + tuxum (2ta)", "maslahat": "Porsiyani me'yorida saqlang."}, {"nom": "Sabzavot-oqsil", "nonushta": "Omlet + ismaloq + non", "tushlik": "Mol go'shti (130g) + sabzavot + guruch (100g)", "kechki": "Kefir + bodring", "maslahat": "Sekin uglevodlarni tanlang."}, {"nom": "Smoothie ertalab", "nonushta": "Smoothie: sut + banan + yulaf", "tushlik": "Tovuq (150g) + bulg'ur + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Nonushtani o'tkazib yubormang."}, {"nom": "Rangli salat", "nonushta": "2 tuxum + avokado + non", "tushlik": "Tovuq (150g) + rangli salat + guruch (100g)", "kechki": "Suzma (150g) + yong'oq", "maslahat": "Tarelkangizning yarmi sabzavot bo'lsin."}, {"nom": "Yong'oqli kun", "nonushta": "Yulaf (40g) + yong'oq + meva", "tushlik": "Baliq (140g) + bulg'ur + salat", "kechki": "Kefir (200ml) + olma", "maslahat": "Bir hovuch yong'oq — yurakka foydali."}, {"nom": "Tovuq-sabzavot", "nonushta": "Omlet (2 tuxum) + pomidor", "tushlik": "Tovuq (150g) + sabzavot + guruch (110g)", "kechki": "Tvorog (150g) + bodring", "maslahat": "Mavsumiy sabzavot afzal."}, {"nom": "Dengiz kuni", "nonushta": "Avokado tost + tuxum", "tushlik": "Krevetka (150g) + bulg'ur + salat", "kechki": "Suzma (150g) + meva", "maslahat": "Dengiz mahsuloti — yengil oqsil."}, {"nom": "Bulg'urli", "nonushta": "Tvorog (150g) + meva + chia", "tushlik": "Tovuq (150g) + bulg'ur + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "To'liq donli mahsulotlarni tanlang."}, {"nom": "Yumshoq kun", "nonushta": "Yulaf (40g) + sut + banan", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Kefir + yong'oq + olma", "maslahat": "Kuniga 7-8 soat uxlang."}, {"nom": "Yakuniy muvozanat", "nonushta": "Omlet + ismaloq + non", "tushlik": "Baliq (140g) + bulg'ur + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Muntazamlik — sog'liq kaliti."}]);}catch(e){}
try{var _x_sogom_ayol=RATSION_DATA.sogom&&RATSION_DATA.sogom.ayol&&RATSION_DATA.sogom.ayol.program;if(_x_sogom_ayol)[].push.apply(_x_sogom_ayol,[{"nom": "Muvozanat", "nonushta": "Yulaf (40g) + meva + yong'oq", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Rang-barang ovqatlaning."}, {"nom": "O'rta yer dengizi", "nonushta": "Avokado tost + tuxum", "tushlik": "Losos (130g) + bulg'ur + salat", "kechki": "Tvorog (150g) + yong'oq", "maslahat": "Zaytun moyini tanlang."}, {"nom": "Tola kuni", "nonushta": "Smoothie: ismaloq + kiwi + chia", "tushlik": "Nohot taom + tovuq (120g)", "kechki": "Sabzavot sho'rva + non (1 bo'lak)", "maslahat": "Tola hazmni yaxshilaydi."}, {"nom": "Tuxumli", "nonushta": "Omlet (2-3 tuxum) + pomidor + non", "tushlik": "Tovuq (150g) + kartoshka + salat", "kechki": "Kefir (200ml) + olma", "maslahat": "Tabiiy mahsulotlarni tanlang."}, {"nom": "Baliq va guruch", "nonushta": "Yulaf (40g) + banan", "tushlik": "Baliq (140g) + guruch (120g) + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Haftada 2-3 marta baliq yeng."}, {"nom": "Yengil to'yimli", "nonushta": "Tvorog (150g) + meva", "tushlik": "Tovuq (150g) + grechka (120g)", "kechki": "Yashil salat + tuxum (2ta)", "maslahat": "Porsiyani me'yorida saqlang."}, {"nom": "Sabzavot-oqsil", "nonushta": "Omlet + ismaloq + non", "tushlik": "Mol go'shti (130g) + sabzavot + guruch (100g)", "kechki": "Kefir + bodring", "maslahat": "Sekin uglevodlarni tanlang."}, {"nom": "Smoothie ertalab", "nonushta": "Smoothie: sut + banan + yulaf", "tushlik": "Tovuq (150g) + bulg'ur + salat", "kechki": "Baliq (120g) + sabzavot", "maslahat": "Nonushtani o'tkazib yubormang."}, {"nom": "Rangli salat", "nonushta": "2 tuxum + avokado + non", "tushlik": "Tovuq (150g) + rangli salat + guruch (100g)", "kechki": "Suzma (150g) + yong'oq", "maslahat": "Tarelkangizning yarmi sabzavot bo'lsin."}, {"nom": "Yong'oqli kun", "nonushta": "Yulaf (40g) + yong'oq + meva", "tushlik": "Baliq (140g) + bulg'ur + salat", "kechki": "Kefir (200ml) + olma", "maslahat": "Bir hovuch yong'oq — yurakka foydali."}, {"nom": "Tovuq-sabzavot", "nonushta": "Omlet (2 tuxum) + pomidor", "tushlik": "Tovuq (150g) + sabzavot + guruch (110g)", "kechki": "Tvorog (150g) + bodring", "maslahat": "Mavsumiy sabzavot afzal."}, {"nom": "Dengiz kuni", "nonushta": "Avokado tost + tuxum", "tushlik": "Krevetka (150g) + bulg'ur + salat", "kechki": "Suzma (150g) + meva", "maslahat": "Dengiz mahsuloti — yengil oqsil."}, {"nom": "Bulg'urli", "nonushta": "Tvorog (150g) + meva + chia", "tushlik": "Tovuq (150g) + bulg'ur + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "To'liq donli mahsulotlarni tanlang."}, {"nom": "Yumshoq kun", "nonushta": "Yulaf (40g) + sut + banan", "tushlik": "Tovuq (150g) + guruch (120g) + salat", "kechki": "Kefir + yong'oq + olma", "maslahat": "Kuniga 7-8 soat uxlang."}, {"nom": "Yakuniy muvozanat", "nonushta": "Omlet + ismaloq + non", "tushlik": "Baliq (140g) + bulg'ur + brokkoli", "kechki": "Suzma (150g) + meva", "maslahat": "Muntazamlik — sog'liq kaliti."}]);}catch(e){}
try{var _x_relief_erkak=RATSION_DATA.relief&&RATSION_DATA.relief.erkak&&RATSION_DATA.relief.erkak.program;if(_x_relief_erkak)[].push.apply(_x_relief_erkak,[{"nom": "Toza relief", "nonushta": "Omlet (3 oq + 1 tuxum) + ko'kat", "tushlik": "Tovuq filesi (150g) + brokkoli", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuz va shakarni kamaytiring."}, {"nom": "Past yog'", "nonushta": "Yulaf (40g) + oq tvorog", "tushlik": "Hind tovug'i (150g) + sabzavot", "kechki": "Suzma (150g) + bodring", "maslahat": "Suv 2.5-3L. Toza ovqat."}, {"nom": "Quruq massa", "nonushta": "Tvorog (200g) + chia", "tushlik": "Tovuq (160g) + jigarrang guruch (100g)", "kechki": "Baliq (130g) + brokkoli", "maslahat": "Oqsil yuqori, yog' past."}, {"nom": "Dengiz relief", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Krevetka (150g) + yashil salat", "kechki": "Tvorog (150g) + yong'oq (10g)", "maslahat": "Yengil va oqsilga boy."}, {"nom": "Yashil cut", "nonushta": "Smoothie: ismaloq + olma", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (80g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Oqsil kuni", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Mol go'shti (130g) + sabzavot", "kechki": "Suzma (200g) + yashil olma", "maslahat": "Har 3 soatda kichik porsiya."}, {"nom": "Baliqli relief", "nonushta": "Tvorog (150g) + chia + meva", "tushlik": "Losos (140g) + brokkoli + guruch (80g)", "kechki": "Tovuq (120g) + salat", "maslahat": "Omega-3 + oqsil kombinatsiyasi."}, {"nom": "Yengil quruq", "nonushta": "Yulaf (30g) + oq tvorog", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Kechqurun uglevodni kamaytiring."}, {"nom": "Oq tuxum", "nonushta": "Oq omlet (5 oq) + ko'kat", "tushlik": "Hind tovug'i (150g) + brokkoli + guruch (70g)", "kechki": "Suzma (180g) + bodring", "maslahat": "Sarig'ini kamaytirib, oqsilni oshiring."}, {"nom": "Tovuq-brokkoli", "nonushta": "Tvorog (180g) + chia", "tushlik": "Tovuq (160g) + brokkoli + bulg'ur (70g)", "kechki": "Baliq (120g) + salat", "maslahat": "Brokkoli — kam kaloriya, ko'p tola."}, {"nom": "Suzmali", "nonushta": "Suzma (200g) + yashil olma", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuzsiz pishirishga harakat qiling."}, {"nom": "Dengiz cut", "nonushta": "Oq omlet + ismaloq", "tushlik": "Krevetka (160g) + yashil salat + guruch (70g)", "kechki": "Tvorog (150g) + bodring", "maslahat": "Yog'siz pishirish usulini tanlang."}, {"nom": "Past kaloriya cut", "nonushta": "Tvorog (150g) + chia", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (70g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Porsiyani nazorat qiling."}, {"nom": "Yashil oqsil", "nonushta": "Smoothie: ismaloq + kefir + olma", "tushlik": "Tovuq (160g) + brokkoli", "kechki": "Suzma (180g) + bodring", "maslahat": "Yashil sabzavot to'ydiradi."}, {"nom": "Yakuniy relief", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Losos (140g) + sabzavot + guruch (70g)", "kechki": "Tvorog (150g) + yashil olma", "maslahat": "Mashq + toza ovqat = natija."}]);}catch(e){}
try{var _x_relief_ayol=RATSION_DATA.relief&&RATSION_DATA.relief.ayol&&RATSION_DATA.relief.ayol.program;if(_x_relief_ayol)[].push.apply(_x_relief_ayol,[{"nom": "Toza relief", "nonushta": "Omlet (3 oq + 1 tuxum) + ko'kat", "tushlik": "Tovuq filesi (150g) + brokkoli", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuz va shakarni kamaytiring."}, {"nom": "Past yog'", "nonushta": "Yulaf (40g) + oq tvorog", "tushlik": "Hind tovug'i (150g) + sabzavot", "kechki": "Suzma (150g) + bodring", "maslahat": "Suv 2.5-3L. Toza ovqat."}, {"nom": "Quruq massa", "nonushta": "Tvorog (200g) + chia", "tushlik": "Tovuq (160g) + jigarrang guruch (100g)", "kechki": "Baliq (130g) + brokkoli", "maslahat": "Oqsil yuqori, yog' past."}, {"nom": "Dengiz relief", "nonushta": "Omlet (2 tuxum) + ismaloq", "tushlik": "Krevetka (150g) + yashil salat", "kechki": "Tvorog (150g) + yong'oq (10g)", "maslahat": "Yengil va oqsilga boy."}, {"nom": "Yashil cut", "nonushta": "Smoothie: ismaloq + olma", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (80g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Tez uglevodlardan voz keching."}, {"nom": "Oqsil kuni", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Mol go'shti (130g) + sabzavot", "kechki": "Suzma (200g) + yashil olma", "maslahat": "Har 3 soatda kichik porsiya."}, {"nom": "Baliqli relief", "nonushta": "Tvorog (150g) + chia + meva", "tushlik": "Losos (140g) + brokkoli + guruch (80g)", "kechki": "Tovuq (120g) + salat", "maslahat": "Omega-3 + oqsil kombinatsiyasi."}, {"nom": "Yengil quruq", "nonushta": "Yulaf (30g) + oq tvorog", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Kechqurun uglevodni kamaytiring."}, {"nom": "Oq tuxum", "nonushta": "Oq omlet (5 oq) + ko'kat", "tushlik": "Hind tovug'i (150g) + brokkoli + guruch (70g)", "kechki": "Suzma (180g) + bodring", "maslahat": "Sarig'ini kamaytirib, oqsilni oshiring."}, {"nom": "Tovuq-brokkoli", "nonushta": "Tvorog (180g) + chia", "tushlik": "Tovuq (160g) + brokkoli + bulg'ur (70g)", "kechki": "Baliq (120g) + salat", "maslahat": "Brokkoli — kam kaloriya, ko'p tola."}, {"nom": "Suzmali", "nonushta": "Suzma (200g) + yashil olma", "tushlik": "Tovuq (150g) + sabzavot", "kechki": "Baliq (120g) + yashil salat", "maslahat": "Tuzsiz pishirishga harakat qiling."}, {"nom": "Dengiz cut", "nonushta": "Oq omlet + ismaloq", "tushlik": "Krevetka (160g) + yashil salat + guruch (70g)", "kechki": "Tvorog (150g) + bodring", "maslahat": "Yog'siz pishirish usulini tanlang."}, {"nom": "Past kaloriya cut", "nonushta": "Tvorog (150g) + chia", "tushlik": "Tovuq (150g) + sabzavot + bulg'ur (70g)", "kechki": "Baliq (120g) + karam salati", "maslahat": "Porsiyani nazorat qiling."}, {"nom": "Yashil oqsil", "nonushta": "Smoothie: ismaloq + kefir + olma", "tushlik": "Tovuq (160g) + brokkoli", "kechki": "Suzma (180g) + bodring", "maslahat": "Yashil sabzavot to'ydiradi."}, {"nom": "Yakuniy relief", "nonushta": "Oq omlet (4 oq) + pomidor", "tushlik": "Losos (140g) + sabzavot + guruch (70g)", "kechki": "Tvorog (150g) + yashil olma", "maslahat": "Mashq + toza ovqat = natija."}]);}catch(e){}
function renderRatsion(){
  var sozEl = document.getElementById('ratsion-sozlama');
  var mainEl = document.getElementById('ratsion-main');
  if(!sozEl || !mainEl) return;

  var s = getRatsionSettings();

  if(!s.jins || !s.maqsad || !s.start){
    sozEl.style.display = 'block';
    mainEl.innerHTML = '';
    if(s.jins) setRatsionJins(s.jins);
    if(s.maqsad) setRatsionMaqsad(s.maqsad);
    return;
  }

  sozEl.style.display = 'none';

  var startDate = new Date(s.start);
  var today = new Date();
  var kunRaqam = Math.floor((today - startDate) / 86400000) + 1;
  if(kunRaqam > 30) kunRaqam = 30;
  if(kunRaqam < 1) kunRaqam = 1;

  var data = RATSION_DATA[s.maqsad];
  if(!data){mainEl.innerHTML='<div class="empty">Ma\'lumot topilmadi</div>';return;}

  var jinsData = data[s.jins];
  if(!jinsData){mainEl.innerHTML='<div class="empty">Ma\'lumot topilmadi</div>';return;}

  var dayIdx = (kunRaqam-1) % jinsData.program.length;
  var kun = jinsData.program[dayIdx];
  var maslahat = MASLAHATLAR_30[(kunRaqam-1) % MASLAHATLAR_30.length];

  var maqsadNom = {yoqotish:'Vazn yo\'qotish',massa:'Massa olish',sogom:'Sog\'lom turmush',relief:'Relief/Qomat'};
  var jinsNom = {erkak:'Erkak',ayol:'Ayol'};
  var pct = Math.round(kunRaqam/30*100);

  mainEl.innerHTML =
    '<div style="background:linear-gradient(135deg,#1a1a3e,#2d2d6b);border-radius:20px;padding:18px;margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div><div style="font-size:13.5px;color:rgba(255,255,255,.6)">'+jinsNom[s.jins]+' · '+maqsadNom[s.maqsad]+'</div>' +
        '<div style="font-size:22px;font-weight:800;color:#fff">'+kunRaqam+' / 30 kun</div></div>' +
        '<div style="text-align:right"><div style="font-size:24px;font-weight:800;color:#DBBE24">'+pct+'%</div>' +
        '<div style="font-size:12.5px;color:rgba(255,255,255,.6)">'+jinsData.kaloriya+' kcal/kun</div></div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,.15);border-radius:6px;height:6px">' +
        '<div style="background:linear-gradient(90deg,#DBBE24,#DB9725);height:6px;border-radius:6px;width:'+pct+'%;transition:width .5s"></div>' +
      '</div>' +
      '<button onclick="resetRatsion()" style="margin-top:10px;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.6);border-radius:8px;padding:4px 10px;font-size:13.5px;cursor:pointer">🔄 Qayta boshlash</button>' +
    '</div>' +
    '<div class="card" style="margin-bottom:12px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' +
        '<div style="font-size:20px">🍽️</div>' +
        '<div><div class="sec-title" style="margin-bottom:0">'+kun.nom+'</div>' +
        '<div style="font-size:13.5px;color:var(--t2)">'+kunRaqam+'-kun ratsioni</div></div>' +
      '</div>' +
      getMealCard('☀️','NONUSHTA','#DB9725',kun.nonushta) +
      getMealCard('🌤️','TUSHLIK','#4F86E2',kun.tushlik) +
      getMealCard('🌙','KECHKI OVQAT','#875DE5',kun.kechki) +
    '</div>' +
    '<button onclick="openKokteyllar()" style="width:100%;background:linear-gradient(135deg,#116C55,#166B6B);color:#fff;border:none;padding:14px;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:12px;box-shadow:0 6px 18px rgba(15,110,86,.3)">🍹 Foydali kokteyllar (retseptlar)</button>' +
    '<div class="card" style="background:linear-gradient(135deg,rgba(30,140,140,.1),rgba(0,168,126,.05));border:1.5px solid rgba(30,140,140,.3)">' +
      '<div style="display:flex;gap:10px;align-items:flex-start">' +
        '<div style="font-size:24px">💡</div>' +
        '<div><div style="font-size:13.5px;font-weight:700;color:var(--g);margin-bottom:4px">BUGUNGI MASLAHAT</div>' +
        '<div style="font-size:15px;color:var(--text);line-height:1.5">'+maslahat+'</div></div>' +
      '</div>' +
    '</div>';
}

function resetRatsion(){
  S.s('i_ratsion_start', null);
  S.s('i_ratsion_jins', null);
  S.s('i_ratsion_maqsad', null);
  renderRatsion();
}
if(typeof renders !== 'undefined') renders['ratsion'] = renderRatsion;
// ════════════════════════════════════════════
// 📚 KITOB TRACKER
// ════════════════════════════════════════════
function addKitob(){
  try{
    var nomEl=document.getElementById('kitob-nom');
    var muallifEl=document.getElementById('kitob-muallif');
    var sahifaEl=document.getElementById('kitob-sahifa');
    var holatEl=document.getElementById('kitob-holat');
    if(!nomEl){showNotif('❌','Forma topilmadi');return;}
    var nom=(nomEl.value||'').trim();
    var muallif=(muallifEl?muallifEl.value||'':'').trim();
    var sahifa=parseInt(sahifaEl?sahifaEl.value||'0':'0')||0;
    var holat=holatEl?holatEl.value||'oqilyapti':'oqilyapti';
    if(!nom){showNotif('⚠️','Kitob nomini kiriting');return;}
    var kitoblar=S.g('i_kitoblar')||[];
    kitoblar.push({
      id:Date.now(),
      nom:nom,
      muallif:muallif,
      sahifa:sahifa,
      holat:holat,
      oqilgan:0,
      date:new Date().toISOString()
    });
    S.s('i_kitoblar',kitoblar);
    nomEl.value='';
    if(muallifEl)muallifEl.value='';
    if(sahifaEl)sahifaEl.value='';
    renderKitobList();
    showNotif('✅','"'+nom+'" qo\'shildi!');
  }catch(e){
    showNotif('❌','Xato: '+e.message);
  }
}

function renderKitobList(){
  try{ renderKitobXulosa(); }catch(e){}
  try{ renderKitobTavsiya(); }catch(e){}
  var el=document.getElementById('kitob-list');
  var statEl=document.getElementById('kitob-yil-stat');
  if(!el)return;
  var kitoblar=S.g('i_kitoblar')||[];
  var yilTugadi=kitoblar.filter(function(k){
    return k.holat==='tugadi'&&new Date(k.date).getFullYear()===new Date().getFullYear();
  }).length;
  if(statEl) statEl.textContent='Bu yil: '+yilTugadi+' ta kitob';
  if(!kitoblar.length){el.innerHTML='<div class="empty">📚<br><br>Kitob qo\'shilmagan</div>';return;}
  var holatEmoji={oqilyapti:'📖',rejada:'📋',tugadi:'✅'};
  var holatRang={oqilyapti:'#875DE5',rejada:'#DB9725',tugadi:'#1E8C8C'};
  el.innerHTML=kitoblar.slice().reverse().map(function(k){
    var pct=k.sahifa?Math.round(k.oqilgan/k.sahifa*100):0;
    // Qidiruv URLlari
    var ytUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(k.nom+(k.muallif?' '+k.muallif:'')+' audiobook uzbek');
    var ytEnUrl='https://www.youtube.com/results?search_query='+encodeURIComponent((k.nom)+(k.muallif?' '+k.muallif:'')+' full audiobook');
    var libUrl='https://librivox.org/search?q='+encodeURIComponent(k.nom)+'&search_form=advanced&search_language=Uzbek';
    return '<div style="background:var(--card);border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:var(--shadow);border-left:4px solid '+holatRang[k.holat]+'">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'+
        '<div style="flex:1">'+
          '<div style="font-size:15px;font-weight:700;color:var(--text)">'+holatEmoji[k.holat]+' '+esc(k.nom)+'</div>'+
          (k.muallif?'<div style="font-size:13.5px;color:var(--t2);margin-top:2px">✍️ '+k.muallif+'</div>':'')+
        '</div>'+
        '<button onclick="deleteKitob('+k.id+')" style="background:none;border:none;color:var(--t2);cursor:pointer;font-size:16px;padding:4px">🗑</button>'+
      '</div>'+
      // Progress
      (k.sahifa?
        '<div style="margin-bottom:10px">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+
            '<div style="flex:1;background:var(--bd);border-radius:4px;height:6px">'+
              '<div style="background:'+holatRang[k.holat]+';height:6px;border-radius:4px;width:'+pct+'%"></div>'+
            '</div>'+
            '<span style="font-size:13.5px;color:var(--t2);white-space:nowrap">'+k.oqilgan+'/'+k.sahifa+' bet ('+pct+'%)</span>'+
          '</div>'+
          '<input type="range" min="0" max="'+k.sahifa+'" value="'+k.oqilgan+'" '+
            'onchange="updateKitobProgress('+k.id+',this.value)" '+
            'style="width:100%;accent-color:'+holatRang[k.holat]+';cursor:pointer">'+
        '</div>':'')+
      // Audio tugmalar
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<a href="'+ytUrl+'" target="_blank" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:#FF000015;border:1.5px solid #FF0000;color:#FF0000;text-decoration:none;font-size:14px;font-weight:700">'+
          '<svg width="14" height="10" viewBox="0 0 14 10"><path d="M13.5 1.5s-.1-1-0.6-1.4c-.6-.6-1.2-.6-1.5-.7C9.7-.1 7-.1 7-.1s-2.7 0-4.4.2C2.3.2 1.7.3 1.1.8.6 1.2.5 2.2.5 2.2S.4 3.3.4 4.5v1.1c0 1.1.1 2.3.1 2.3s.1 1 .6 1.4c.6.6 1.3.6 1.7.6C4.1 10 7 10 7 10s2.7 0 4.4-.2c.3 0 .9-.1 1.5-.6.5-.4.6-1.4.6-1.4s.1-1.1.1-2.3V4.5c0-1.1-.1-2.3-.1-3zm-8.2 4.7V2.8l4 1.7-4 1.7z" fill="#FF0000"/></svg>'+
          'YT O\'zbek'+
        '</a>'+
        '<a href="'+ytEnUrl+'" target="_blank" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:#FF000015;border:1.5px solid #FF0000;color:#FF0000;text-decoration:none;font-size:14px;font-weight:700">'+
          '<svg width="14" height="10" viewBox="0 0 14 10"><path d="M13.5 1.5s-.1-1-0.6-1.4c-.6-.6-1.2-.6-1.5-.7C9.7-.1 7-.1 7-.1s-2.7 0-4.4.2C2.3.2 1.7.3 1.1.8.6 1.2.5 2.2.5 2.2S.4 3.3.4 4.5v1.1c0 1.1.1 2.3.1 2.3s.1 1 .6 1.4c.6.6 1.3.6 1.7.6C4.1 10 7 10 7 10s2.7 0 4.4-.2c.3 0 .9-.1 1.5-.6.5-.4.6-1.4.6-1.4s.1-1.1.1-2.3V4.5c0-1.1-.1-2.3-.1-3zm-8.2 4.7V2.8l4 1.7-4 1.7z" fill="#FF0000"/></svg>'+
          'YT English'+
        '</a>'+
        '<a href="'+libUrl+'" target="_blank" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:rgba(139,92,246,.1);border:1.5px solid #8B5CF6;color:#8B5CF6;text-decoration:none;font-size:14px;font-weight:700">'+
          '🎙️ LibriVox'+
        '</a>'+
        '<button onclick="aiKitobTavsiya(\''+k.nom.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:rgba(30,140,140,.1);border:1.5px solid var(--g);color:var(--g);font-size:14px;font-weight:700;cursor:pointer">'+
          '🤖 AI xulosa'+
        '</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

// AI kitob xulosa
function kitobPDF(){
  var tEl=document.getElementById('kai-title'); var bEl=document.getElementById('kai-body');
  var title=tEl?tEl.textContent:'Kitob';
  var body=bEl?bEl.innerHTML:'';
  if(!body || body.indexOf('AI tahlil qilmoqda')>-1 || body.indexOf('AI hali ulanmagan')>-1){
    showNotif('⚠️','Avval kitob matni tayyor bo\'lsin'); return;
  }
  var w=window.open('','_blank');
  if(!w){ showNotif('⚠️','Brauzer yangi oynani blokladi'); return; }
  w.document.write('<!doctype html><html lang="uz"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+title+'</title>'+
    '<style>body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;line-height:1.65;padding:30px 26px;max-width:760px;margin:0 auto}'+
    'h1{font-size:22px;margin:0 0 18px;color:#116C55}*{max-width:100%}'+
    'div{margin-bottom:6px}@media print{body{padding:0}}</style></head><body>'+
    '<h1>'+title+'</h1>'+body+
    '<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>'+
    '</body></html>');
  w.document.close();
}

function aiKitobTavsiya(nom){
  // Modal yaratamiz
  var modal=document.getElementById('kitob-ai-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='kitob-ai-modal';
    modal.className='moverlay';
    modal.innerHTML='<div class="modal" style="padding:0;border-radius:28px 28px 0 0;overflow:hidden">'+
      '<div style="background:linear-gradient(135deg,#875DE5,#6062E5);padding:18px 20px 14px">'+
        '<div class="mhandle" style="background:rgba(255,255,255,.3)"></div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">'+
          '<div id="kai-title" style="font-size:18px;font-weight:800;color:#fff"></div>'+
          '<div style="display:flex;gap:8px;align-items:center">'+
          '<button onclick="kitobPDF()" style="background:rgba(255,255,255,.2);border:none;color:#fff;height:32px;padding:0 12px;border-radius:16px;font-size:14px;font-weight:700;cursor:pointer">📄 PDF</button>'+
          '<button onclick="closeM(\'kitob-ai-modal\')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer">✕</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div style="padding:20px;overflow-y:auto;max-height:82vh">'+
        '<div id="kai-body"></div>'+
      '</div>'+
    '</div>';
    modal.onclick=function(e){if(e.target===modal)closeM('kitob-ai-modal');};
    document.body.appendChild(modal);
  }
  document.getElementById('kai-title').textContent='📚 '+nom;
  document.getElementById('kai-body').innerHTML=
    '<div style="text-align:center;padding:20px">'+
      '<div style="font-size:36px;animation:spin 1s linear infinite">⚙️</div>'+
      '<div style="font-size:15px;color:var(--t2);margin-top:10px">AI tahlil qilmoqda...</div>'+
    '</div>';
  openM('kitob-ai-modal');

  if(!AI_READY){
    document.getElementById('kai-body').innerHTML=
      '<div style="text-align:center;padding:24px;color:var(--t2)">'+
        '<div style="font-size:40px;margin-bottom:10px">🤖</div>'+
        '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">AI hali ulanmagan</div>'+
        '<div style="font-size:15px;line-height:1.6">Kitob tavsiyasi uchun AI proxy sozlanishi kerak. Hozircha kitobni internetdan qidirib ko\'rishingiz mumkin.</div>'+
      '</div>';
    return;
  }

  aiFetch('kitob', {
      model:'claude-sonnet-4-6', max_tokens:1200,
      system:'Sen kitob mutaxassisisisan. O\'zbek tilida qisqa va foydali javob ber.',
      messages:[{role:'user',content:
        '"'+nom+'" kitobi haqida quyidagilarni yoz:\n'+
        '1. Asosiy g\'oya (2-3 jumlа)\n'+
        '2. Eng muhim 5 ta dars\n'+
        '3. Kim o\'qishi kerak\n'+
        '4. Eng yodda qoladigan gap (iqtibos)\n\n'+
        'Qisqa, aniq, motivatsion yoz. O\'zbek tilida.'
      }]
    })
  .then(function(r){return r.json();})
  .then(function(d){
    var text=(d.content&&d.content[0]&&d.content[0].text)||'Javob olinmadi';
    // Markdown ni oddiy HTML ga o'girish
    text=text
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/^#{1,3}\s(.+)$/gm,'<div style="font-size:15px;font-weight:700;color:var(--g);margin:14px 0 6px">$1</div>')
      .replace(/^\d+\.\s(.+)$/gm,'<div style="padding:8px 0 4px;border-bottom:1px solid var(--bd);font-size:15px;color:var(--text)"><span style="color:var(--g);font-weight:700">• </span>$1</div>')
      .replace(/\n\n/g,'<br>');

    var ytUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(nom+' audiokitob o\'zbek tili');
    var ytEnUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(nom+' audiobook full');

    document.getElementById('kai-body').innerHTML=
      '<div style="font-size:15px;line-height:1.7;color:var(--text);margin-bottom:20px">'+text+'</div>'+
      '<div style="font-size:15px;font-weight:700;color:var(--t2);margin-bottom:12px;letter-spacing:.5px">🎧 AUDIOKITOB TOPISH</div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
        '<a href="'+ytUrl+'" target="_blank" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#FF000012;border:1.5px solid #FF0000;text-decoration:none">'+
          '<div style="width:40px;height:40px;border-radius:10px;background:#FF0000;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+
            '<svg width="18" height="14" viewBox="0 0 14 10"><path d="M13.5 1.5s-.1-1-0.6-1.4c-.6-.6-1.2-.6-1.5-.7C9.7-.1 7-.1 7-.1s-2.7 0-4.4.2C2.3.2 1.7.3 1.1.8.6 1.2.5 2.2.5 2.2S.4 3.3.4 4.5v1.1c0 1.1.1 2.3.1 2.3s.1 1 .6 1.4c.6.6 1.3.6 1.7.6C4.1 10 7 10 7 10s2.7 0 4.4-.2c.3 0 .9-.1 1.5-.6.5-.4.6-1.4.6-1.4s.1-1.1.1-2.3V4.5c0-1.1-.1-2.3-.1-3zm-8.2 4.7V2.8l4 1.7-4 1.7z" fill="white"/></svg>'+
          '</div>'+
          '<div><div style="font-size:15px;font-weight:700;color:#FF0000">YouTube — O\'zbek tilida</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">'+nom+' audiokitob o\'zbek</div></div>'+
        '</a>'+
        '<a href="'+ytEnUrl+'" target="_blank" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#FF000012;border:1.5px solid #FF0000;text-decoration:none">'+
          '<div style="width:40px;height:40px;border-radius:10px;background:#FF0000;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+
            '<svg width="18" height="14" viewBox="0 0 14 10"><path d="M13.5 1.5s-.1-1-0.6-1.4c-.6-.6-1.2-.6-1.5-.7C9.7-.1 7-.1 7-.1s-2.7 0-4.4.2C2.3.2 1.7.3 1.1.8.6 1.2.5 2.2.5 2.2S.4 3.3.4 4.5v1.1c0 1.1.1 2.3.1 2.3s.1 1 .6 1.4c.6.6 1.3.6 1.7.6C4.1 10 7 10 7 10s2.7 0 4.4-.2c.3 0 .9-.1 1.5-.6.5-.4.6-1.4.6-1.4s.1-1.1.1-2.3V4.5c0-1.1-.1-2.3-.1-3zm-8.2 4.7V2.8l4 1.7-4 1.7z" fill="white"/></svg>'+
          '</div>'+
          '<div><div style="font-size:15px;font-weight:700;color:#FF0000">YouTube — English Full</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">'+nom+' full audiobook</div></div>'+
        '</a>'+
        '<a href="https://librivox.org/search?q='+encodeURIComponent(nom)+'&search_form=advanced" target="_blank" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:rgba(139,92,246,.08);border:1.5px solid #8B5CF6;text-decoration:none">'+
          '<div style="width:40px;height:40px;border-radius:10px;background:#8B5CF6;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">🎙️</div>'+
          '<div><div style="font-size:15px;font-weight:700;color:#875DE5">LibriVox — Bepul</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">1000+ bepul audiokitob</div></div>'+
        '</a>'+
        '<a href="https://archive.org/search?query='+encodeURIComponent(nom)+'&and[]=mediatype%3A%22audio%22" target="_blank" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:rgba(30,136,229,.08);border:1.5px solid #3B82F6;text-decoration:none">'+
          '<div style="width:40px;height:40px;border-radius:10px;background:#3B82F6;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">🏛️</div>'+
          '<div><div style="font-size:15px;font-weight:700;color:#4F86E2">Archive.org — Bepul</div>'+
          '<div style="font-size:13.5px;color:var(--t2)">Millionlab bepul audio</div></div>'+
        '</a>'+
      '</div>';
  })
  .catch(function(){
    var ytUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(nom+' audiokitob');
    document.getElementById('kai-body').innerHTML=
      '<div style="text-align:center;padding:16px;color:var(--t2);margin-bottom:16px">Internet yo\'q — to\'g\'ridan qidiring</div>'+
      '<a href="'+ytUrl+'" target="_blank" style="display:block;padding:14px;border-radius:16px;background:#FF000012;border:1.5px solid #FF0000;text-decoration:none;text-align:center;font-size:15px;font-weight:700;color:#FF0000">▶️ YouTube da qidirish</a>';
  });
}

function updateKitobProgress(id,val){
  var kitoblar=S.g('i_kitoblar')||[];
  kitoblar.forEach(function(k){
    if(k.id===id){
      k.oqilgan=parseInt(val);
      if(k.sahifa&&k.oqilgan>=k.sahifa) k.holat='tugadi';
    }
  });
  S.s('i_kitoblar',kitoblar);
  addBall(1,'Kitob');
}

function deleteKitob(id){
  S.s('i_kitoblar',(S.g('i_kitoblar')||[]).filter(function(k){return k.id!==id;}));
  renderKitobList();
}

// ════════════════════════════════════════════
// 🗣️ TIL O'RGANISH — Inglizcha so'zlar
// ════════════════════════════════════════════
var ENG_SOZLAR = [
  {uz:'Maqsad',en:'Goal',tr:'[goʊl]'},       {uz:'Iroda',en:'Willpower',tr:'[ˈwɪlˌpaʊər]'},
  {uz:'Intizom',en:'Discipline',tr:'[ˈdɪsɪplɪn]'}, {uz:'Muvaffaqiyat',en:'Success',tr:'[səkˈses]'},
  {uz:'Sogʻliq',en:'Health',tr:'[helθ]'},    {uz:'Baxt',en:'Happiness',tr:'[ˈhæpɪnəs]'},
  {uz:'Sabr',en:'Patience',tr:'[ˈpeɪʃəns]'}, {uz:'Ishonch',en:'Trust',tr:'[trʌst]'},
  {uz:'Rahmat',en:'Gratitude',tr:'[ˈɡrætɪtuːd]'}, {uz:'Kuch',en:'Strength',tr:'[streŋθ]'},
  {uz:'Ilm',en:'Knowledge',tr:'[ˈnɒlɪdʒ]'}, {uz:'Aql',en:'Mind',tr:'[maɪnd]'},
  {uz:'Yurak',en:'Heart',tr:'[hɑːrt]'},     {uz:'Ruh',en:'Spirit',tr:'[ˈspɪrɪt]'},
  {uz:'Orzу',en:'Dream',tr:'[driːm]'},       {uz:'Harakat',en:'Action',tr:'[ˈækʃən]'},
  {uz:'Natija',en:'Result',tr:'[rɪˈzʌlt]'}, {uz:'O\'sish',en:'Growth',tr:'[ɡroʊθ]'},
  {uz:'Mehnat',en:'Effort',tr:'[ˈefərt]'},   {uz:'Vaqt',en:'Time',tr:'[taɪm]'},
  {uz:'Oila',en:'Family',tr:'[ˈfæməli]'},   {uz:'Do\'st',en:'Friend',tr:'[frend]'},
  {uz:'Hayot',en:'Life',tr:'[laɪf]'},        {uz:'Dunyo',en:'World',tr:'[wɜːrld]'},
  {uz:'Ulug\'',en:'Great',tr:'[ɡreɪt]'},     {uz:'Yangi',en:'New',tr:'[njuː]'},
  {uz:'Bugun',en:'Today',tr:'[təˈdeɪ]'},    {uz:'Erta',en:'Tomorrow',tr:'[təˈmɒroʊ]'},
  {uz:'Sevgi',en:'Love',tr:'[lʌv]'},         {uz:'Umid',en:'Hope',tr:'[hoʊp]'},
];

var _tilFlipped={};

function renderTilBugun(){
  var el=document.getElementById('til-bugun-card');
  if(!el)return;
  var today=bugunKun();
  var learned=S.g('i_til_learned')||{};
  var streakData=S.g('i_til_streak')||{last:'',count:0};
  var tilTotal=Object.keys(learned).length;
  // Streak
  if(streakData.last===today){/* ok */}
  else if(streakData.last===kechaKun()){
    // kecha ham o'rgangan — streak davom
  } else {streakData.count=0;}
  document.getElementById('til-total').textContent=tilTotal;
  document.getElementById('til-streak').textContent=streakData.count;
  // Bugungi so'zlar (10 ta, kun raqamiga qarab)
  var dayIdx=Math.floor(Date.now()/86400000)%Math.floor(ENG_SOZLAR.length/10);
  var bugunSozlar=ENG_SOZLAR.slice(dayIdx*10,(dayIdx+1)*10);
  document.getElementById('til-bugun-ct').textContent=bugunSozlar.filter(function(s){return learned[s.en];}).length;
  _tilFlipped={};
  el.innerHTML='<div style="font-size:15px;font-weight:700;color:var(--t2);margin-bottom:12px;letter-spacing:.5px">📅 BUGUNGI 10 SO\'Z</div>'+
    bugunSozlar.map(function(s,i){
      var isLearned=!!learned[s.en];
      return '<div onclick="flipTilCard(\'tilcard-'+i+'\')" id="tilcard-'+i+'" style="background:var(--card);border-radius:16px;padding:16px;margin-bottom:8px;border:1.5px solid '+(isLearned?'var(--g)':'var(--bd)')+';cursor:pointer;box-shadow:var(--shadow);transition:all .2s">'+
        '<div class="tilcard-front-'+i+'">'+
          '<div style="display:flex;justify-content:space-between;align-items:center">'+
            '<div>'+
              '<div style="font-size:18px;font-weight:800;color:var(--text)">'+s.en+'</div>'+
              '<div style="font-size:14px;color:var(--t2)">'+s.tr+'</div>'+
            '</div>'+
            '<div style="font-size:14px;color:var(--t2)">🔄 bosing</div>'+
          '</div>'+
        '</div>'+
        '<div class="tilcard-back-'+i+'" style="display:none">'+
          '<div style="font-size:16px;font-weight:700;color:var(--g);margin-bottom:8px">🇺🇿 '+s.uz+'</div>'+
          (isLearned
            ? '<div style="color:var(--g);font-size:15px;font-weight:700">✅ O\'rgandim!</div>'
            : '<button onclick="event.stopPropagation();learnSoz(\''+s.en+'\')" style="padding:8px 16px;border-radius:10px;background:var(--g);color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer">✅ O\'rgandim</button>')+
        '</div>'+
      '</div>';
    }).join('');
}

function flipTilCard(id){
  var card=document.getElementById(id);
  if(!card)return;
  var idx=id.split('-')[1];
  var front=card.querySelector('.tilcard-front-'+idx);
  var back=card.querySelector('.tilcard-back-'+idx);
  if(!front||!back)return;
  var isFlipped=_tilFlipped[id];
  _tilFlipped[id]=!isFlipped;
  front.style.display=isFlipped?'block':'none';
  back.style.display=isFlipped?'none':'block';
}

function learnSoz(en){
  var learned=S.g('i_til_learned')||{};
  learned[en]=true;
  S.s('i_til_learned',learned);
  var streakData=S.g('i_til_streak')||{last:'',count:0};
  var today=bugunKun();
  if(streakData.last!==today){streakData.last=today;streakData.count++;}
  S.s('i_til_streak',streakData);
  addBall(2,'Til o\'rganish');
  renderTilBugun();
  showNotif('✅','O\'rganildi!');
}

function tilYangiSoz(){renderTilBugun();}


/* ==================================================================
   KITOBLAR — intizom uchun tayyor tavsiya ro'yxati (14.09.2026)
   Yig'iladigan karta #kitob-tavsiya (kitob-modal ichida). "+ Qo'shish"
   kitobni 'rejada' holatida ro'yxatga qo'shadi.
   ================================================================== */
var KITOB_TAVSIYA = [
  {nom:'Atom odatlar',                         muallif:'James Clear',        sahifa:320, izoh:'Kichik odatlar — katta natija'},
  {nom:'Odat kuchi',                           muallif:'Charles Duhigg',     sahifa:400, izoh:'Odat qanday paydo bo\'ladi va o\'zgaradi'},
  {nom:'Chuqur ish (Deep Work)',               muallif:'Cal Newport',        sahifa:300, izoh:'Chalg\'imasdan diqqat bilan ishlash'},
  {nom:'Yutuqli insonlarning 7 ko\'nikmasi',   muallif:'Stephen R. Covey',   sahifa:430, izoh:'Shaxsiy samaradorlik asoslari'},
  {nom:'Ertalabki mo\'jiza (Miracle Morning)', muallif:'Hal Elrod',          sahifa:200, izoh:'Kunni erta va tartibli boshlash'},
  {nom:'Qurbaqani ye (Eat That Frog)',         muallif:'Brian Tracy',        sahifa:140, izoh:'Eng muhim ishni birinchi qilish'},
  {nom:'Iroda kuchi (Willpower)',              muallif:'Roy Baumeister',     sahifa:300, izoh:'O\'zini boshqarish ilmiy asosda'},
  {nom:'Intizom — erkinlikdir',                muallif:'Jocko Willink',      sahifa:200, izoh:'Qat\'iy tartib va mas\'uliyat'},
  {nom:'Fikrlash haqida fikrlash',             muallif:'Daniel Kahneman',    sahifa:500, izoh:'Qaror qabul qilish xatolari'},
  {nom:'Essensializm',                         muallif:'Greg McKeown',       sahifa:260, izoh:'Kamroq, lekin yaxshiroq'},
  {nom:'Mahorat (Mastery)',                    muallif:'Robert Greene',      sahifa:350, izoh:'Uzoq yo\'lda ustoz bo\'lish'},
  {nom:'Hayot mazmuni izlab',                  muallif:'Viktor Frankl',      sahifa:180, izoh:'Qiyinchilikda ma\'no topish'}
];
function renderKitobTavsiya(){
  var el=document.getElementById('kitob-tavsiya');
  if(!el) return;
  var bor=(S.g('i_kitoblar')||[]).map(function(k){ return (k.nom||'').toLowerCase(); });
  var ochiq=!!el._ochiq;
  var qator=KITOB_TAVSIYA.map(function(k,i){
    var qoshilgan=bor.indexOf(k.nom.toLowerCase())>=0;
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bd)">'+
      '<div style="flex:1;min-width:0">'+
        '<div style="font-size:14px;font-weight:600;color:var(--text)">'+esc(k.nom)+'</div>'+
        '<div style="font-size:12.5px;color:var(--t2)">'+esc(k.muallif)+' · '+k.sahifa+' bet · '+esc(k.izoh)+'</div>'+
      '</div>'+
      (qoshilgan
        ? '<span style="font-size:12px;color:#1E8C8C;font-weight:700;white-space:nowrap">✓ ro\'yxatda</span>'
        : '<button onclick="kitobTavsiyaQosh('+i+')" style="background:var(--g);color:#fff;border:none;border-radius:10px;padding:6px 10px;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap">+ Qo\'shish</button>')+
    '</div>';
  }).join('');
  el.innerHTML='<div style="background:var(--card);border-radius:18px;padding:12px 14px;box-shadow:var(--shadow)">'+
    '<div onclick="var p=this.parentNode.parentNode;p._ochiq=!p._ochiq;renderKitobTavsiya()" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">'+
      '<div style="font-size:14.5px;font-weight:700;color:var(--text)">🎯 Intizom uchun tavsiya · '+KITOB_TAVSIYA.length+' ta</div>'+
      '<span style="color:var(--t2);font-size:13px">'+(ochiq?'▲':'▼')+'</span>'+
    '</div>'+
    (ochiq?'<div style="margin-top:6px">'+qator+'</div>':'')+
  '</div>';
}
function kitobTavsiyaQosh(i){
  var k=KITOB_TAVSIYA[i]; if(!k) return;
  var kitoblar=S.g('i_kitoblar')||[];
  if(kitoblar.some(function(x){ return (x.nom||'').toLowerCase()===k.nom.toLowerCase(); })){ showNotif('📚','Bu kitob allaqachon ro\'yxatda'); return; }
  kitoblar.push({id:Date.now(), nom:k.nom, muallif:k.muallif, sahifa:k.sahifa, holat:'rejada', oqilgan:0, date:new Date().toISOString()});
  S.s('i_kitoblar',kitoblar);
  showNotif('📋 Rejaga qo\'shildi', k.nom);
  try{ renderKitobList(); }catch(e){}
}

/* ==================================================================
   BOSH SAHIFA KO'RSATKICHLARI — kun siri preview va avatar darajasi
   (avval initGame ichida edi; 14.09.2026 dan shu yerda)
   ================================================================== */
function proBoshKorsat(){
  try{
    var today2=Math.floor(Date.now()/86400000);
    var sir=KUN_SIRLAR[today2%KUN_SIRLAR.length];
    var prev=document.getElementById('kun-sir-preview');
    if(prev&&sir)prev.textContent=sir.sir.slice(0,60)+'...';
    var ball=S.g('i_ball')||0;
    var lidx=0;for(var li=0;li<AVATAR_LEVELS.length;li++){if(ball>=AVATAR_LEVELS[li].min)lidx=li;}
    var lev=AVATAR_LEVELS[lidx];
    var avD=document.getElementById('avatar-display');if(avD&&lev)avD.textContent=lev.emoji;
    var avL=document.getElementById('avatar-level-lbl');if(avL)avL.textContent='Daraja: '+(lidx+1);
  }catch(e){ console.warn('proBoshKorsat:',e); }
}

/* --- Modul yuklandi: haqiqiy funksiyalar o'rinbosarlarni almashtirdi,
       endi PRO qulfini qayta o'raymiz va bosh sahifani yangilaymiz --- */
(function(){
  try{ if(typeof proModulOralar==='function') proModulOralar(); }catch(e){ console.error('proModulOralar:',e); }
  proBoshKorsat();
  try{ if(document.getElementById('kitob-modal')&&document.getElementById('kitob-modal').classList.contains('open')) renderKitobList(); }catch(e){}
})();
