(()=>{
'use strict';

const CHROME_VERSION='2026-08-24a';

function makeNavItem({href=null,num='',label='',active=false}){
  const el=document.createElement(href?'a':'span');
  el.className=`nav-item${active?' active standalone-current':''}`;
  if(href)el.href=href;
  if(active)el.setAttribute('aria-current','page');

  const marker=document.createElement('span');
  marker.className='nav-num';
  marker.textContent=num;

  const text=document.createElement('b');
  text.textContent=label;

  el.append(marker,text);
  return el;
}

function normalizeStandaloneNav(){
  const sidebar=document.querySelector('.sidebar');
  if(!sidebar||document.querySelector('#mainNav'))return;

  const nav=sidebar.querySelector('nav');
  if(!nav||nav.dataset.standaloneChrome===CHROME_VERSION)return;

  const active=nav.querySelector('.nav-item.active');
  const label=active?.querySelector('b')?.textContent?.trim()
    ||document.querySelector('.topbar h1')?.textContent?.trim()
    ||document.querySelector('h1')?.textContent?.trim()
    ||'Arbeidsflate';
  const num=active?.querySelector('.nav-num')?.textContent?.trim()||'•';

  nav.replaceChildren(
    makeNavItem({href:'./',num:'←',label:'Til portal'}),
    makeNavItem({num,label,active:true})
  );
  nav.dataset.standaloneChrome=CHROME_VERSION;
  nav.setAttribute('aria-label','Denne arbeidsflaten');
  sidebar.dataset.standaloneChrome=CHROME_VERSION;
}

normalizeStandaloneNav();
})();
