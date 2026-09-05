(()=>{
'use strict';

const MOBILE_UX_VERSION='2026-09-05g';
const MOBILE_BREAKPOINT=780;
const COLLAPSE_AFTER=84;
const RESTORE_AT=20;
const NAVIGATION_IA_VERSION='2026-09-05f';
const WORKDAY_CHROME_VERSION='2026-09-05g';
const BRANDED_LOADER_MIN_MS=1250;

function installBrandedLoader(){
  const loader=document.querySelector('#loading');if(!loader||loader.dataset.aidmeBrandLoader)return;
  loader.dataset.aidmeBrandLoader='1';
  loader.setAttribute('aria-label','Ve. Sé. Vive.');
  loader.innerHTML='<div class="aidme-loader-motto" aria-hidden="true"><span>Ve.</span><span>Sé.</span><span>Vive.</span></div>';
  if(!document.querySelector('#aidme-loader-brand-style')){
    const style=document.createElement('style');style.id='aidme-loader-brand-style';
    style.textContent=`
      #loading.aidme-brand-loader,.loading[data-aidme-brand-loader="1"]{display:flex!important;align-items:center!important;justify-content:center!important;min-height:100vh!important;background:#f6f0e5!important;color:#17685e!important}
      #loading.aidme-brand-loader.hidden,.loading[data-aidme-brand-loader="1"].hidden{display:none!important}
      .aidme-loader-motto{display:flex;align-items:baseline;justify-content:center;gap:.34em;font-family:"Segoe Script","Brush Script MT","Lucida Handwriting",cursive;font-size:clamp(31px,9vw,48px);font-weight:700;letter-spacing:-.035em;color:#17685e;text-rendering:optimizeLegibility}
      .aidme-loader-motto span{display:inline-block;opacity:0;transform:translateY(7px) scale(.98);animation:aidmeMottoIn .34s cubic-bezier(.2,.72,.25,1) forwards}
      .aidme-loader-motto span:nth-child(2){animation-delay:.26s}.aidme-loader-motto span:nth-child(3){animation-delay:.52s}
      @keyframes aidmeMottoIn{to{opacity:1;transform:translateY(0) scale(1)}}
      @media(prefers-reduced-motion:reduce){.aidme-loader-motto span{animation:none!important;opacity:1!important;transform:none!important}}
    `;
    document.head.appendChild(style);
  }
  loader.classList.add('aidme-brand-loader');

  /* The first loadPortal() has already started when this extension is concatenated.
     Keep its brand moment visible just long enough for all three words to register. */
  const started=performance.now();let enforcing=false,timer=null;
  const observer=new MutationObserver(()=>{
    if(enforcing||!loader.classList.contains('hidden'))return;
    const remain=BRANDED_LOADER_MIN_MS-(performance.now()-started);if(remain<=0){observer.disconnect();return}
    enforcing=true;loader.classList.remove('hidden');clearTimeout(timer);timer=window.setTimeout(()=>{loader.classList.add('hidden');enforcing=false;observer.disconnect()},remain);
  });
  observer.observe(loader,{attributes:true,attributeFilter:['class']});
}
function wrapSubsequentPortalLoads(){
  if(typeof loadPortal!=='function'||loadPortal.__aidmeBrandedLoader)return;
  const original=loadPortal;
  const wrapped=async function(...args){
    const loader=document.querySelector('#loading');const started=performance.now();
    if(loader){loader.classList.add('aidme-brand-loader');loader.classList.remove('hidden')}
    const result=await original.apply(this,args);
    const remain=BRANDED_LOADER_MIN_MS-(performance.now()-started);
    if(loader&&remain>0){loader.classList.remove('hidden');await new Promise(resolve=>window.setTimeout(resolve,remain));loader.classList.add('hidden')}
    return result;
  };
  wrapped.__aidmeBrandedLoader=true;loadPortal=wrapped;
}
function addMobileStyles(){
  if(document.querySelector('link[data-aidme-mobile]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=`./mobile.css?v=${MOBILE_UX_VERSION}`;link.dataset.aidmeMobile='1';document.head.appendChild(link);
}
function clearLegacyNavigationSnapshots(){
  try{['aidme:navigation-snapshot:v1','aidme:navigation-snapshot:v2','aidme:navigation-snapshot:v3','aidme:navigation-snapshot:v4'].forEach(key=>sessionStorage.removeItem(key))}catch{}
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
    const label=active.querySelector('b')?.textContent?.trim();const href=active.getAttribute('href')||'';
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

installBrandedLoader();wrapSubsequentPortalLoads();addMobileStyles();addWorkdayChrome();addNavigationIa();installMobileNavAutoHide();
})();
