(function(){
  async function loadInclude(el){
    const url = el.getAttribute('data-include');
    try{
      const res = await fetch(url);
      if(!res.ok){ el.innerHTML = ''; return; }
      const html = await res.text();
      el.innerHTML = html;
      // execute inline scripts in the fetched HTML
      const scripts = el.querySelectorAll('script');
      for(const s of scripts){
        const ns = document.createElement('script');
        if(s.src){ ns.src = s.src; ns.defer = s.defer || false; document.head.appendChild(ns); }
        else { ns.textContent = s.textContent; document.head.appendChild(ns); }
        s.parentNode.removeChild(s);
      }
    }catch(e){ console.error('Include failed', url, e); }
  }

  async function init(){
    const includes = document.querySelectorAll('[data-include]');
    const tasks = Array.from(includes).map(loadInclude);
    await Promise.all(tasks);
    const y = document.getElementById('currentYear');
    if(y) y.textContent = new Date().getFullYear();
    window.__partialsLoaded = true;
    document.dispatchEvent(new Event('partials:loaded'));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
