(()=>{
'use strict';

const CHROME_VERSION='2026-09-05b';

function normalizeStandaloneNav(){
  const sidebar=document.querySelector('.sidebar');
  if(!sidebar||document.querySelector('#mainNav'))return;
  const nav=sidebar.querySelector('nav');
  if(!nav||nav.dataset.standaloneChrome===CHROME_VERSION)return;

  /* Do not destructively collapse the menu here. navigation-ia.js restores the
     last role-aware portal navigation from same-origin sessionStorage. Keeping
     the static menu intact avoids the visible three-item flash and preserves
     typography/spacing while the shared shell loads. */
  const active=nav.querySelector('.nav-item.active,[aria-current="page"]');
  if(active){active.classList.add('standalone-current');active.setAttribute('aria-current','page')}
  nav.dataset.standaloneChrome=CHROME_VERSION;
  nav.setAttribute('aria-label','Navigasjon og gjeldende arbeidsflate');
  sidebar.dataset.standaloneChrome=CHROME_VERSION;
}

normalizeStandaloneNav();
})();
