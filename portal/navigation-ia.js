(()=>{
'use strict';

const NAV_IA_VERSION='2026-09-05f';
const NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v5';
const NAV_SNAPSHOT_MAX_AGE_MS=2*60*60*1000;
const MOBILE_BREAKPOINT=780;
const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');
const mobile=()=>window.innerWidth<=MOBILE_BREAKPOINT;
const MOBILE_SECONDARY_LABELS=new Set(['Analyse','Dokumenter','Mine filer','Mine dokumenter','Skjema & rutiner','Varsler','Revisjon','Rolleintro','Rolleintroduksjon','Demo-reise','Demo-reise (LAB)','Administrasjon','Mini CRM']);

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
    @media(max-width:780px){
      .sidebar{overflow-y:auto;-webkit-overflow-scrolling:touch}
      .sidebar .nav-mobile-secondary{display:none!important}
      .sidebar .nav-item .nav-num{display:none!important}
    }
  `;
  document.head.appendChild(style);
}

function safeToneClasses(el){return [...(el?.classList||[])].filter(c=>['red','yellow','green','blue','nav-count-total'].includes(c))}
function snapshotBadges(el){return [...(el?.querySelectorAll?.('.nav-count')||[])].map(node=>({text:(node.textContent||'').trim(),classes:safeToneClasses(node),label:node.getAttribute('aria-label')||''})).filter(x=>/^\d+$/.test(x.text))}
function appendBadges(el,badges=[]){
  if(!badges.length)return;
  const host=document.createElement('i');host.className='nav-badges';
  for(const badge of badges){const span=document.createElement('span');span.className=['nav-count',...(Array.isArray(badge.classes)?badge.classes:[])].join(' ');span.textContent=String(badge.text||'');if(badge.label)span.setAttribute('aria-label',badge.label);host.appendChild(span)}
  el.appendChild(host);
}
function makeItem({href=null,num='',label='',active=false,sub=false,badges=[]}){
  const el=document.createElement(href?'a':'span');el.className=`nav-item${active?' active':''}${sub?' nav-subitem':''}`;
  if(href)el.href=href;if(active)el.setAttribute('aria-current','page');
  const marker=document.createElement('span');marker.className='nav-num';marker.textContent=num;
  const text=document.createElement('b');text.textContent=label;el.append(marker,text);appendBadges(el,badges);return el;
}

const PAGE_META={
  'form-runner':{num:'06',label:'Skjema & rutiner'},intake:{num:'02+',label:'Interesse / VÍA'},owners:{num:'02A',label:'Ansvar / eiere'},
  'pilot-ops':{num:'SER',label:'Operativ dag'},notifications:{num:'N',label:'Varsler'},audit:{num:'07A',label:'Revisjon'},sos:{num:'10',label:'Hjelp & SOS'},
  guide:{num:'00',label:'Slik fungerer det'},onboarding:{num:'00',label:'Slik fungerer det'},'participant-profile':{num:'P',label:'Profil'},admin:{num:'07',label:'Administrasjon'},crm:{num:'CRM',label:'Mini CRM'}
};
const SECONDARY_DIRECT_VIEWS=new Set(['forms','analysis','documents','settings']);

function navLabel(el){return el?.querySelector?.('b')?.textContent?.trim()||''}
function mobilePrimaryEligible(el){return !mobile()||!MOBILE_SECONDARY_LABELS.has(navLabel(el))}
function navItemVisible(el){return !!el&&!el.classList.contains('hidden')&&!el.classList.contains('nav-ia-demoted')&&!el.classList.contains('nav-mobile-secondary')&&mobilePrimaryEligible(el)&&getComputedStyle(el).display!=='none'}
function navItemHref(el){const href=el.getAttribute('href');if(href)return href;const view=el.dataset.view;return view?`./#${view}`:null}
function itemKey(item){return `${String(item.label||'').trim().toLowerCase()}|${String(item.href||'').replace(location.origin,'')}`}
function dedupeItems(items=[]){const seen=new Set();return items.filter(item=>{const key=itemKey(item);if(!item.label||!item.href||seen.has(key))return false;seen.add(key);return true})}
function overviewFirst(items=[]){return [...items].sort((a,b)=>Number(a.label!=='Oversikt')-Number(b.label!=='Oversikt'))}
function persistMainSnapshot(nav){
  try{
    let items=[...nav.querySelectorAll('.nav-item')].filter(navItemVisible).map(el=>({num:el.querySelector('.nav-num')?.textContent?.trim()||'',label:navLabel(el),href:navItemHref(el),sub:el.classList.contains('nav-subitem'),badges:snapshotBadges(el)}));
    items=overviewFirst(dedupeItems(items));
    if(items.length>=2)sessionStorage.setItem(NAV_SNAPSHOT_KEY,JSON.stringify({createdAt:Date.now(),items}));
  }catch{}
}
function readMainSnapshot(){
  try{const raw=sessionStorage.getItem(NAV_SNAPSHOT_KEY);if(!raw)return null;const data=JSON.parse(raw);if(!data?.createdAt||Date.now()-data.createdAt>NAV_SNAPSHOT_MAX_AGE_MS||!Array.isArray(data.items)){sessionStorage.removeItem(NAV_SNAPSHOT_KEY);return null}data.items=overviewFirst(dedupeItems(data.items.filter(item=>!mobile()||!MOBILE_SECONDARY_LABELS.has(item.label))));return data}catch{return null}
}
function hrefPage(href){if(!href)return'';try{const u=new URL(href,location.href),parts=u.pathname.split('/').filter(Boolean),last=parts.pop()||'index.html';if(!last.includes('.'))return'index';return last.replace('.html','')}catch{return''}}
function itemMatchesPage(item,currentPage,meta){if(!item)return false;if(currentPage==='onboarding')return item.label==='Slik fungerer det';if(hrefPage(item.href)===currentPage)return true;return !!meta&&item.label===meta.label}
function standaloneFromSnapshot(nav,meta){
  const snapshot=readMainSnapshot();if(!snapshot?.items?.length)return false;let found=false;
  const items=snapshot.items.map(item=>{const active=itemMatchesPage(item,page,meta);if(active)found=true;return makeItem({href:active?null:item.href,num:item.num,label:item.label,active,sub:item.sub,badges:item.badges})});
  if(!found&&meta&&page!=='onboarding'&&(!mobile()||!MOBILE_SECONDARY_LABELS.has(meta.label))){
    const current=makeItem({num:meta.num,label:meta.label,active:true});const helpIndex=items.findIndex(el=>navLabel(el)==='Hjelp & SOS');items.splice(helpIndex>=0?helpIndex:items.length,0,current);
  }
  nav.replaceChildren(...items);nav.dataset.navigationIa=NAV_IA_VERSION;nav.setAttribute('aria-label','Navigasjon og gjeldende arbeidsflate');return true;
}
function normalizeStandalone(){
  if(document.querySelector('#mainNav'))return false;
  const sidebar=document.querySelector('.sidebar'),nav=sidebar?.querySelector('nav');if(!nav)return false;
  const oldActive=nav.querySelector('.nav-item.active,[aria-current="page"]');
  const meta=PAGE_META[page]||{num:oldActive?.querySelector('.nav-num')?.textContent?.trim()||'•',label:navLabel(oldActive)||document.querySelector('h1')?.textContent?.trim()||'Arbeidsflate'};
  if(standaloneFromSnapshot(nav,meta))return true;
  const items=[makeItem({href:'./',num:'01',label:'Oversikt'})];
  if(['guide','onboarding'].includes(page))items.push(makeItem({num:'00',label:'Slik fungerer det',active:true}));else items.push(makeItem({href:'./guide.html',num:'00',label:'Slik fungerer det'}));
  if(!['guide','onboarding','sos'].includes(page)&&(!mobile()||!MOBILE_SECONDARY_LABELS.has(meta.label)))items.push(makeItem({num:meta.num,label:meta.label,active:true}));
  if(page==='sos')items.push(makeItem({num:'10',label:'Hjelp & SOS',active:true}));else items.push(makeItem({href:'./sos.html',num:'10',label:'Hjelp & SOS'}));
  nav.replaceChildren(...items);nav.dataset.navigationIa=NAV_IA_VERSION;nav.setAttribute('aria-label','Navigasjon og gjeldende arbeidsflate');return true;
}

function menuLink(menu,id,label,href){if(!menu)return null;let a=document.getElementById(id);if(!a){a=document.createElement('a');a.id=id;a.href=href;menu.insertBefore(a,menu.lastElementChild||null)}a.classList.add('nav-ia-link');a.textContent=label;return a}
function badgeCount(el){const raw=el?.querySelector('.nav-count')?.textContent?.trim();return /^\d+$/.test(raw||'')?Number(raw):0}
function mainNode(nav,key){if(key.startsWith('#'))return document.querySelector(key);return nav.querySelector(`.nav-item[data-view="${key}"]`)}
function setMobileSecondary(el,on=mobile()){if(el)el.classList.toggle('nav-mobile-secondary',!!on)}
function markSecondaryByLabel(nav){if(!mobile())return;for(const item of nav.querySelectorAll('.nav-item'))if(MOBILE_SECONDARY_LABELS.has(navLabel(item)))item.classList.add('nav-mobile-secondary')}
function applyHashView(nav){
  const raw=location.hash.slice(1);if(!raw||!/^[a-z-]+$/.test(raw))return;
  const target=nav.querySelector(`.nav-item[data-view="${raw}"]`);if(!target)return;
  if(!navItemVisible(target)&&!SECONDARY_DIRECT_VIEWS.has(raw))return;
  target.click();history.replaceState(null,'',location.pathname+location.search);
}
function normalizedEvent(){document.dispatchEvent(new CustomEvent('aidme:navigation-normalized',{detail:{page}}))}

function normalizeMain(){
  const nav=document.querySelector('#mainNav');if(!nav)return false;const menu=document.querySelector('#userMenu');
  ['analysis','documents'].forEach(view=>mainNode(nav,view)?.classList.add('nav-ia-demoted'));
  const settings=mainNode(nav,'settings');if(settings){settings.classList.toggle('nav-ia-demoted',!mobile());settings.classList.remove('nav-mobile-secondary')}
  const forms=mainNode(nav,'forms');setMobileSecondary(forms,true);
  const demo=document.querySelector('#demoJourneyNav'),demoAllowed=!!demo&&!demo.classList.contains('hidden');
  ['#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'].forEach(sel=>document.querySelector(sel)?.classList.add('nav-ia-demoted'));
  ['#adminLink','#crmNav'].forEach(sel=>setMobileSecondary(document.querySelector(sel),true));

  const oldDocuments=menu?.querySelector('[data-view-target="documents"]');oldDocuments?.classList.add('nav-ia-demoted');
  const secureDocuments=document.querySelector('#userDocumentsLink');if(secureDocuments){secureDocuments.textContent='Mine dokumenter';secureDocuments.classList.add('nav-ia-link')}else menuLink(menu,'userDocumentsIa','Mine dokumenter','./documents.html');
  if(demoAllowed)menuLink(menu,'userDemoJourneyIa','Demo-reise (LAB)','./demo-journey.html');else document.querySelector('#userDemoJourneyIa')?.remove();
  const onboarding=document.querySelector('#onboardingNav'),onboardingCount=badgeCount(onboarding),onboardingMenu=document.querySelector('#userOnboardingLink');if(onboardingMenu){onboardingMenu.textContent=onboardingCount?`Rolleintroduksjon (${onboardingCount})`:'Rolleintroduksjon';onboardingMenu.classList.add('nav-ia-link')}
  const notifications=document.querySelector('#notificationsNav'),unread=badgeCount(notifications),notificationsMenu=document.querySelector('#userNotificationLink');if(notificationsMenu){notificationsMenu.textContent=unread?`Varsler (${unread})`:'Varsler';notificationsMenu.classList.add('nav-ia-link')}
  const guide=document.querySelector('#userGuideLink');if(guide)guide.classList.add('nav-ia-link');const sos=document.querySelector('#userSosLink');if(sos)sos.classList.add('nav-ia-link');

  const primaryOrder=['overview','participants','#intakeNav','#ownersNav','tasks','checkin','#pilotOpsNav','#guideNav','#sosNav','settings'];
  const secondaryOrder=['forms','#adminLink','#crmNav','analysis','documents','#demoJourneyNav','#notificationsNav','#auditNav','#documentsCenterNav','#onboardingNav'];
  primaryOrder.map(key=>mainNode(nav,key)).filter(Boolean).forEach(el=>nav.appendChild(el));
  secondaryOrder.map(key=>mainNode(nav,key)).filter(Boolean).forEach(el=>nav.appendChild(el));
  markSecondaryByLabel(nav);
  nav.dataset.navigationIa=NAV_IA_VERSION;persistMainSnapshot(nav);
  if(!nav.dataset.snapshotBound){nav.dataset.snapshotBound='1';nav.addEventListener('click',()=>window.setTimeout(()=>persistMainSnapshot(nav),0),{capture:true})}
  applyHashView(nav);normalizedEvent();return true;
}
function apply(){addStyles();const main=normalizeMain();if(!main)normalizeStandalone();normalizedEvent()}

addStyles();
if(document.querySelector('#mainNav'))[120,300,700,1400].forEach(delay=>window.setTimeout(apply,delay));else{apply();window.setTimeout(apply,120)}
document.addEventListener('aidme:portal-rendered',()=>window.setTimeout(apply,0));
window.addEventListener('pageshow',()=>window.setTimeout(apply,0));
window.addEventListener('resize',()=>window.setTimeout(apply,80),{passive:true});
})();
