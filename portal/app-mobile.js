(()=>{
'use strict';

const MOBILE_UX_VERSION='2026-09-05e';
const MOBILE_BREAKPOINT=780;
const COLLAPSE_AFTER=84;
const RESTORE_AT=20;
const NAVIGATION_IA_VERSION='2026-09-05e';
const WORKDAY_CHROME_VERSION='2026-09-05e';

function addMobileStyles(){
  if(document.querySelector('link[data-aidme-mobile]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=`./mobile.css?v=${MOBILE_UX_VERSION}`;link.dataset.aidmeMobile='1';document.head.appendChild(link);
}
function clearLegacyNavigationSnapshots(){
  try{['aidme:navigation-snapshot:v1','aidme:navigation-snapshot:v2','aidme:navigation-snapshot:v3'].forEach(key=>sessionStorage.removeItem(key))}catch{}
}
function addWorkdayChrome(){
  if(!document.querySelector('link[data-aidme-workday-mobile]')){
    const link=document.createElement('link');link.rel='stylesheet';link.href=`./workday-mobile.css?v=${WORKDAY_CHROME_VERSION}`;link.dataset.aidmeWorkdayMobile='1';document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-aidme-workday-chrome]')){
    const script=document.createElement('script');script.src=`./app-workday-chrome.js?v=${WORKDAY_CHROME_VERSION}`;script.dataset.aidmeWorkdayChrome='1';document.head.appendChild(script);
  }
}
function addNavigationIa(){
  clearLegacyNavigationSnapshots();
  if(document.querySelector('script[data-aidme-navigation-ia]'))return;
  const script=document.createElement('script');script.src=`./navigation-ia.js?v=${NAVIGATION_IA_VERSION}`;script.dataset.aidmeNavigationIa='1';document.head.appendChild(script);
}
function installMobileNavAutoHide(){
  const sidebar=document.querySelector('.sidebar');if(!sidebar||sidebar.dataset.mobileAutoHide)return;
  sidebar.dataset.mobileAutoHide='1';const nav=sidebar.querySelector('nav');
  let ticking=false,userScrollSeen=false,lastY=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
  const reveal=()=>{sidebar.classList.remove('mobile-nav-hidden');sidebar.removeAttribute('aria-hidden')};
  const conceal=()=>{sidebar.classList.add('mobile-nav-hidden');sidebar.setAttribute('aria-hidden','true')};
  const activeIsOverview=active=>{
    if(!active)return false;
    if(active.dataset?.view==='overview')return true;
    const label=active.querySelector('b')?.textContent?.trim();
    const href=active.getAttribute('href')||'';
    return label==='Oversikt'||href==='./'||href.endsWith('/portal/')||href.endsWith('/portal');
  };
  const centerActive=({smooth=true}={})=>{
    if(window.innerWidth>MOBILE_BREAKPOINT||!nav)return;
    const active=nav.querySelector('.nav-item.active,[aria-current="page"]');if(!active)return;
    const left=activeIsOverview(active)?0:Math.max(0,active.offsetLeft-(nav.clientWidth-active.offsetWidth)/2);
    nav.scrollTo({left,behavior:smooth?'smooth':'auto'});
  };
  const apply=()=>{
    ticking=false;if(window.innerWidth>MOBILE_BREAKPOINT){reveal();return}
    const y=Math.max(0,window.scrollY||document.documentElement.scrollTop||0),focusInside=sidebar.contains(document.activeElement),movingUp=y<lastY-2,movingDown=y>lastY+2;
    if(!userScrollSeen||y<=RESTORE_AT||focusInside||movingUp)reveal();else if(movingDown&&y>=COLLAPSE_AFTER)conceal();lastY=y;
  };
  const schedule=()=>{if(ticking)return;ticking=true;requestAnimationFrame(apply)};
  const resetAndReveal=()=>{userScrollSeen=false;lastY=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);reveal();requestAnimationFrame(()=>centerActive({smooth:false}))};
  window.addEventListener('scroll',()=>{userScrollSeen=true;schedule()},{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',resetAndReveal);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resetAndReveal()});
  document.addEventListener('aidme:navigation-normalized',()=>window.setTimeout(()=>centerActive({smooth:false}),0));
  sidebar.addEventListener('focusin',schedule);
  nav?.addEventListener('click',()=>{if(window.innerWidth<=MOBILE_BREAKPOINT){reveal();window.setTimeout(()=>centerActive(),0)}});
  if(typeof show==='function'){
    const mobileShow=show;
    show=function(name){mobileShow(name);if(window.innerWidth<=MOBILE_BREAKPOINT){reveal();window.setTimeout(()=>centerActive(),0)}};
  }
  resetAndReveal();
}

addMobileStyles();addWorkdayChrome();addNavigationIa();installMobileNavAutoHide();
})();
