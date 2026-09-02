(()=>{
'use strict';

const NAV_IA_VERSION='2026-09-02b';
const NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v1';
const NAV_SNAPSHOT_MAX_AGE_MS=2*60*60*1000;
const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');

function addStyles(){
  if(document.getElementById('aidme-navigation-ia-style'))return;
  const style=document.createElement('style');
  style.id='aidme-navigation-ia-style';
  style.textContent=`
    .sidebar{overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
    .nav-ia-demoted{display:none!important}
    .nav-item.nav-subitem{padding-left:30px;font-size:12px;opacity:.88}
    .nav-item.nav-subitem .nav-num{font-size:9px}
    .user-menu a.nav-ia-link{display:block;padding:10px 11px;border-radius:10px;color:inherit;text-decoration:none}
    .user-menu a.nav-ia-link:hover{background:#f0ece3}
    @media(max-width:780px){.sidebar{overflow-y:auto;-webkit-overflow-scrolling:touch}}
  `;
  document.head.appendChild(style);
}

function makeItem({href=null,num='',label='',active=false,sub=false}){
  const el=document.createElement(href?'a':'span');
  el.className=`nav-item${active?' active':''}${sub?' nav-subitem':''}`;
  if(href)el.href=href;
  if(active)el.setAttribute('aria-current','page');
  const marker=document.createElement('span');marker.className='nav-num';marker.textContent=num;
  const text=document.createElement('b');text.textContent=label;
  el.append(marker,text);
  return el;
}

const PAGE_META={
  'form-runner':{num:'06',label:'Skjema & rutiner'},
  intake:{num:'02+',label:'Interesse / VÍA'},
  owners:{num:'02A',label:'Ansvar / eiere'},
  'pilot-ops':{num:'SER',label:'Operativ dag'},
  notifications:{num:'N',label:'Varsler'},
  audit:{num:'07A',label:'Revisjon'},
  sos:{num:'10',label:'Hjelp & SOS'},
  guide:{num:'00',label:'Slik fungerer det'},
  onboarding:{num:'ONB',label:'Rolleintro'},
  'participant-profile':{num:'P',label:'Min profil'},
  admin:{num:'07',label:'Administrasjon'},
  crm:{num:'CRM',label:'Mini CRM'}
};

function navItemVisible(el){return !!el&&!el.classList.contains('hidden')&&!el.classList.contains('nav-ia-demoted')&&getComputedStyle(el).display!=='none'}
function navItemHref(el){const href=el.getAttribute('href');if(href)return href;const view=el.dataset.view;return view?`./#${view}`:null}
function persistMainSnapshot(nav){
  try{
    const items=[...nav.querySelectorAll('.nav-item')].filter(navItemVisible).map(el=>({num:el.querySelector('.nav-num')?.textContent?.trim()||'',label:el.querySelector('b')?.textContent?.trim()||'',href:navItemHref(el),sub:el.classList.contains('nav-subitem')})).filter(x=>x.label&&x.href);
    if(items.length>=3)sessionStorage.setItem(NAV_SNAPSHOT_KEY,JSON.stringify({createdAt:Date.now(),items}));
  }catch{}
}
function readMainSnapshot(){
  try{const raw=sessionStorage.getItem(NAV_SNAPSHOT_KEY);if(!raw)return null;const data=JSON.parse(raw);if(!data?.createdAt||Date.now()-data.createdAt>NAV_SNAPSHOT_MAX_AGE_MS||!Array.isArray(data.items)){sessionStorage.removeItem(NAV_SNAPSHOT_KEY);return null}return data}catch{return null}
}
function guideFromSnapshot(nav){
  const snapshot=readMainSnapshot();if(!snapshot?.items?.length)return false;
  const items=snapshot.items.map(item=>{const active=item.label==='Slik fungerer det'||String(item.href||'').includes('guide.html');return makeItem({href:active?null:item.href,num:item.num,label:item.label,active,sub:item.sub})});
  if(!items.some(el=>el.getAttribute('aria-current')==='page'))items.splice(Math.min(1,items.length),0,makeItem({num:'00',label:'Slik fungerer det',active:true}));
  nav.replaceChildren(...items);nav.dataset.navigationIa=NAV_IA_VERSION;nav.setAttribute('aria-label','Navigasjon og gjeldende arbeidsflate');return true;
}

function normalizeStandalone(){
  if(document.querySelector('#mainNav'))return false;
  const sidebar=document.querySelector('.sidebar');
  const nav=sidebar?.querySelector('nav');
  if(!nav)return false;
  if(page==='guide'&&guideFromSnapshot(nav))return true;

  const oldActive=nav.querySelector('.nav-item.active');
  const meta=PAGE_META[page]||{
    num:oldActive?.querySelector('.nav-num')?.textContent?.trim()||'•',
    label:oldActive?.querySelector('b')?.textContent?.trim()||document.querySelector('h1')?.textContent?.trim()||'Arbeidsflate'
  };

  const items=[];
  items.push(makeItem({href:'./',num:'01',label:'Oversikt'}));
  if(page==='guide')items.push(makeItem({num:'00',label:'Slik fungerer det',active:true}));
  else items.push(makeItem({href:'./guide.html',num:'00',label:'Slik fungerer det'}));

  if(page==='admin'){
    items.push(makeItem({num:'07',label:'Administrasjon',active:true}));
    items.push(makeItem({href:'./audit.html',num:'07A',label:'Revisjon',sub:true}));
  }else if(page==='audit'){
    items.push(makeItem({href:'./admin.html',num:'07',label:'Administrasjon'}));
    items.push(makeItem({num:'07A',label:'Revisjon',active:true,sub:true}));
  }else if(!['guide','sos'].includes(page)){
    items.push(makeItem({num:meta.num,label:meta.label,active:true}));
  }

  if(page==='sos')items.push(makeItem({num:'10',label:'Hjelp & SOS',active:true}));
  else items.push(makeItem({href:'./sos.html',num:'10',label:'Hjelp & SOS'}));

  nav.replaceChildren(...items);
  nav.dataset.navigationIa=NAV_IA_VERSION;
  nav.setAttribute('aria-label','Navigasjon og gjeldende arbeidsflate');
  return true;
}

function menuLink(menu,id,label,href){
  if(!menu)return null;
  let a=document.getElementById(id);
  if(!a){a=document.createElement('a');a.id=id;a.href=href;menu.insertBefore(a,menu.lastElementChild||null)}
  a.classList.add('nav-ia-link');a.textContent=label;
  return a;
}

function badgeCount(el){
  const raw=el?.querySelector('.nav-count')?.textContent?.trim();
  return /^\d+$/.test(raw||'')?Number(raw):0;
}

function mainNode(nav,key){
  if(key.startsWith('#'))return document.querySelector(key);
  return nav.querySelector(`.nav-item[data-view="${key}"]`);
}

function applyHashView(nav){
  const raw=location.hash.slice(1);if(!raw||!/^[a-z-]+$/.test(raw))return;
  const target=nav.querySelector(`.nav-item[data-view="${raw}"]`);if(!target||!navItemVisible(target))return;
  target.click();history.replaceState(null,'',location.pathname+location.search);
}

function normalizeMain(){
  const nav=document.querySelector('#mainNav');
  if(!nav)return false;
  const menu=document.querySelector('#userMenu');

  ['analysis','documents','settings'].forEach(view=>mainNode(nav,view)?.classList.add('nav-ia-demoted'));

  const demo=document.querySelector('#demoJourneyNav');
  const demoAllowed=!!demo&&!demo.classList.contains('hidden');
  ['#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'].forEach(sel=>document.querySelector(sel)?.classList.add('nav-ia-demoted'));

  const oldDocuments=menu?.querySelector('[data-view-target="documents"]');
  oldDocuments?.classList.add('nav-ia-demoted');
  const secureDocuments=document.querySelector('#userDocumentsLink');
  if(secureDocuments){secureDocuments.textContent='Mine dokumenter';secureDocuments.classList.add('nav-ia-link')}
  else menuLink(menu,'userDocumentsIa','Mine dokumenter','./documents.html');

  if(demoAllowed)menuLink(menu,'userDemoJourneyIa','Demo-reise (LAB)','./demo-journey.html');
  else document.querySelector('#userDemoJourneyIa')?.remove();

  const onboarding=document.querySelector('#onboardingNav');
  const onboardingCount=badgeCount(onboarding);
  const onboardingMenu=document.querySelector('#userOnboardingLink');
  if(onboardingMenu){onboardingMenu.textContent=onboardingCount?`Rolleintroduksjon (${onboardingCount})`:'Rolleintroduksjon';onboardingMenu.classList.add('nav-ia-link')}

  const notifications=document.querySelector('#notificationsNav');
  const unread=badgeCount(notifications);
  const notificationsMenu=document.querySelector('#userNotificationLink');
  if(notificationsMenu){notificationsMenu.textContent=unread?`Varsler (${unread})`:'Varsler';notificationsMenu.classList.add('nav-ia-link')}

  const guide=document.querySelector('#userGuideLink');if(guide)guide.classList.add('nav-ia-link');
  const sos=document.querySelector('#userSosLink');if(sos)sos.classList.add('nav-ia-link');

  const order=['overview','participants','#intakeNav','#ownersNav','tasks','checkin','forms','#pilotOpsNav','#adminLink','#crmNav','#guideNav','#sosNav'];
  order.map(key=>mainNode(nav,key)).filter(Boolean).forEach(el=>nav.appendChild(el));
  nav.dataset.navigationIa=NAV_IA_VERSION;
  persistMainSnapshot(nav);
  const guideNav=document.querySelector('#guideNav');if(guideNav&&!guideNav.dataset.snapshotBound){guideNav.dataset.snapshotBound='1';guideNav.addEventListener('click',()=>persistMainSnapshot(nav))}
  applyHashView(nav);
  return true;
}

function apply(){addStyles();if(!normalizeMain())normalizeStandalone()}

addStyles();
if(document.querySelector('#mainNav')){
  [140,320,700].forEach(delay=>window.setTimeout(apply,delay));
}else{
  apply();window.setTimeout(apply,120);
}
window.addEventListener('pageshow',()=>window.setTimeout(apply,0));
})();
