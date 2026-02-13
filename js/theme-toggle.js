// Theme toggle runtime: remove duplicate navbars, update navbar classes, persist choice, and respond to OS changes
function initThemeToggle(){
  // Remove duplicate navbars if any (keep first)
  const navs = document.querySelectorAll('nav.navbar');
  if(navs.length>1){
    for(let i=1;i<navs.length;i++) navs[i].remove();
  }
  const nav = document.querySelector('nav.navbar');
  const footer = document.getElementById('siteFooter');
  const btn = document.getElementById('themeToggle');

  function currentTheme(){ return document.documentElement.getAttribute('data-bs-theme') || 'light'; }
  function setNavbarClasses(t){
    if(!nav) return;
    if(t==='dark'){
      nav.classList.remove('navbar-light','bg-light');
      nav.classList.add('navbar-dark','bg-dark');
    } else {
      nav.classList.remove('navbar-dark','bg-dark');
      nav.classList.add('navbar-light','bg-light');
    }
  }
  function setFooterClasses(t){
    if(!footer) return;
    if(t==='dark'){
      footer.classList.remove('bg-light','text-dark');
      footer.classList.add('bg-dark','text-white');
    } else {
      footer.classList.remove('bg-dark','text-white');
      footer.classList.add('bg-light','text-dark');
    }
  }
  function updateButton(t){ if(!btn) return; btn.textContent = t==='dark' ? '☀ Light' : '☾ Dark'; btn.setAttribute('aria-pressed', t==='dark'); }
  function applyTheme(t){ document.documentElement.setAttribute('data-bs-theme', t); updateButton(t); setNavbarClasses(t); setFooterClasses(t); }

  const stored = localStorage.getItem('theme');
  const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  if(stored==='light' || stored==='dark'){
    applyTheme(stored);
  } else {
    const prefersDark = mql && mql.matches;
    // reflect OS preference until user chooses
    setNavbarClasses(prefersDark ? 'dark' : 'light');
    setFooterClasses(prefersDark ? 'dark' : 'light');
    updateButton(prefersDark ? 'dark' : 'light');
    if(mql){
      if(mql.addEventListener) mql.addEventListener('change', e => { if(!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light'); });
      else if(mql.addListener) mql.addListener(e => { if(!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light'); });
    }
  }

  if(btn){
    btn.addEventListener('click', ()=>{
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
}

// Wait for partials to load before initializing theme toggle
if(window.__partialsLoaded){
  initThemeToggle();
} else {
  document.addEventListener('partials:loaded', initThemeToggle, { once: true });
}
