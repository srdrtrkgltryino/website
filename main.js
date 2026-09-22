/* Tryino shared front-end: i18n engine + nav/header/reveal behavior.
   Each page calls Tryino.init(pageDict, opts) with its own translation
   entries; common nav/footer/breadcrumb strings are merged in here so
   every page stays in sync without repeating them. */
window.Tryino = (function(){

  var commonDict = {
    "nav.about":      {en:"About",        tr:"Hakkımızda"},
    "nav.solutions":  {en:"Solutions",     tr:"Çözümler"},
    "nav.products":   {en:"Products",      tr:"Ürünler"},
    "nav.why":        {en:"Why Tryino",    tr:"Neden Tryino"},
    "nav.contact":    {en:"Contact",       tr:"İletişim"},
    "nav.cta":        {en:"Talk to Us",    tr:"Bize Ulaşın"},
    "footer.copy":    {en:"© 2026 Tryino. All rights reserved.", tr:"© 2026 Tryino. Tüm hakları saklıdır."},
    "bc.home":        {en:"Home",          tr:"Ana Sayfa"},
    "bc.solutions":   {en:"Solutions",     tr:"Çözümler"},
    "bc.products":    {en:"Products",      tr:"Ürünler"},
    "cta.band.title": {en:"Ready to talk it through?", tr:"Konuşmaya hazır mısın?"},
    "cta.band.p":     {en:"Tell us where you're starting from — we'll take it from there.", tr:"Nereden başladığını anlat, gerisini biz hallederiz."},
    "cta.band.btn":   {en:"Talk to Us",    tr:"Bize Ulaşın"},
    "go.details":     {en:"See details",   tr:"Detayları gör"}
  };

  var titles = {
    en: "Tryino — Microsoft Dynamics 365 & AI Cloud Partner",
    tr: "Tryino — Microsoft Dynamics 365 & AI Cloud Partner"
  };

  var state = { lang:'en', dict:{} };

  function applyLang(lang){
    state.lang = lang;
    document.documentElement.lang = lang;
    if(document.title) document.title = document.title; // no-op, page sets its own <title>
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var entry = state.dict[el.getAttribute('data-i18n')];
      if(entry && entry[lang]) el.innerHTML = entry[lang];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
      var entry = state.dict[el.getAttribute('data-i18n-placeholder')];
      if(entry && entry[lang]) el.setAttribute('placeholder', entry[lang]);
    });
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem('tryino-lang', lang); }catch(e){}
    document.dispatchEvent(new CustomEvent('tryino:lang', {detail:{lang:lang}}));
  }

  function savedLang(){
    try{
      var saved = localStorage.getItem('tryino-lang');
      if(saved === 'en' || saved === 'tr') return saved;
    }catch(e){}
    return null;
  }

  function guessFromBrowser(){
    return (navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en';
  }

  // Best-effort IP -> country lookup, used only on a visitor's very first page
  // (no saved preference yet) to pick Turkish for TR visitors and English for
  // everyone else. A manual EN/TR click always wins from then on — this never
  // runs again once something is saved. Fails silently and keeps the
  // browser-language guess already on screen if the lookup is slow or blocked.
  function refineLangByCountry(){
    if(!('fetch' in window)) return;
    var settled = false;
    var timer = setTimeout(function(){ settled = true; }, 2000);
    fetch('https://get.geojs.io/v1/ip/country.json').then(function(r){ return r.json(); }).then(function(data){
      if(settled) return;
      clearTimeout(timer);
      var country = data && data.country;
      if(!country) return;
      applyLang(country === 'TR' ? 'tr' : 'en');
    }).catch(function(){ clearTimeout(timer); });
  }

  function init(pageDict){
    state.dict = Object.assign({}, commonDict, pageDict || {});

    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      btn.addEventListener('click', function(){ applyLang(btn.getAttribute('data-lang')); });
    });

    var saved = savedLang();
    applyLang(saved || guessFromBrowser());
    if(!saved) refineLangByCountry();

    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobileNav');
    if(hamburger && mobileNav){
      hamburger.addEventListener('click', function(){
        var open = mobileNav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      mobileNav.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ mobileNav.classList.remove('open'); });
      });
    }

    var header = document.getElementById('site-header');
    if(header){
      window.addEventListener('scroll', function(){
        header.classList.toggle('scrolled', window.scrollY > 10);
      }, {passive:true});
    }

    if('IntersectionObserver' in window){
      var revealEls = document.querySelectorAll('.reveal');
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.remove('pending');
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, {threshold:0.1});
      revealEls.forEach(function(el){ el.classList.add('pending'); io.observe(el); });
      setTimeout(function(){
        document.querySelectorAll('.reveal.pending').forEach(function(el){
          el.classList.remove('pending');
          el.classList.add('visible');
        });
      }, 2500);
    }

    return { getLang: function(){ return state.lang; }, dict: state.dict, applyLang: applyLang };
  }

  return { init: init };
})();
