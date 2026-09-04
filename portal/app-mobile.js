(()=>{
'use strict';

const MOBILE_UX_VERSION='2026-09-04c';
const MOBILE_BREAKPOINT=780;
const COLLAPSE_AFTER=84;
const RESTORE_AT=20;
const NAVIGATION_IA_VERSION='2026-09-02b';

function addMobileStyles(){
  if(document.querySelector('link[data-aidme-mobile]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=`./mobile.css?v=${MOBILE_UX_VERSION}`;
  link.dataset.aidmeMobile='1';
  document.head.appendChild(link);
}

function addNavigationIa(){
  if(document.querySelector('script[data-aidme-navigation-ia]'))return;
  const script=document.createElement('script');
  script.src=`./navigation-ia.js?v=${NAVIGATION_IA_VERSION}`;
  script.dataset.aidmeNavigationIa='1';
  document.head.appendChild(script);
}

function installMobileNavAutoHide(){
  const sidebar=document.querySelector('.sidebar');
  if(!sidebar||sidebar.dataset.mobileAutoHide)return;
  sidebar.dataset.mobileAutoHide='1';
  const nav=sidebar.querySelector('nav');

  let ticking=false;
  let userScrollSeen=false;
  let lastY=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);

  const reveal=()=>{
    sidebar.classList.remove('mobile-nav-hidden');
    sidebar.removeAttribute('aria-hidden');
  };
  const conceal=()=>{
    sidebar.classList.add('mobile-nav-hidden');
    sidebar.setAttribute('aria-hidden','true');
  };
  const centerActive=({smooth=true}={})=>{
    if(window.innerWidth>MOBILE_BREAKPOINT||!nav)return;
    const active=nav.querySelector('.nav-item.active,[aria-current="page"]');
    if(!active)return;
    const left=Math.max(0,active.offsetLeft-(nav.clientWidth-active.offsetWidth)/2);
    nav.scrollTo({left,behavior:smooth?'smooth':'auto'});
  };
  const apply=()=>{
    ticking=false;
    if(window.innerWidth>MOBILE_BREAKPOINT){
      reveal();
      return;
    }

    const y=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
    const focusInside=sidebar.contains(document.activeElement);
    const movingUp=y<lastY-2;
    const movingDown=y>lastY+2;

    // Browser/auth restoration may resume the page below the top. Keep navigation visible
    // until the user actually scrolls; then reveal on upward motion and hide only while
    // deliberately moving down past the chrome threshold.
    if(!userScrollSeen||y<=RESTORE_AT||focusInside||movingUp){
      reveal();
    }else if(movingDown&&y>=COLLAPSE_AFTER){
      conceal();
    }
    lastY=y;
  };
  const schedule=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(apply);
  };
  const resetAndReveal=()=>{
    userScrollSeen=false;
    lastY=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
    reveal();
    requestAnimationFrame(()=>centerActive({smooth:false}));
  };

  window.addEventListener('scroll',()=>{userScrollSeen=true;schedule()},{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',resetAndReveal);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)resetAndReveal()});
  sidebar.addEventListener('focusin',schedule);

  nav?.addEventListener('click',()=>{
    if(window.innerWidth<=MOBILE_BREAKPOINT){
      reveal();
      window.setTimeout(()=>centerActive(),0);
    }
  });

  // Programmatic view changes (task return, auth return, shortcuts) should keep the active
  // mobile navigation item visible without changing any routing or authorization behavior.
  if(typeof show==='function'){
    const mobileShow=show;
    show=function(name){
      mobileShow(name);
      if(window.innerWidth<=MOBILE_BREAKPOINT){
        reveal();
        window.setTimeout(()=>centerActive(),0);
      }
    };
  }

  resetAndReveal();
}

addMobileStyles();
addNavigationIa();
installMobileNavAutoHide();
})();
