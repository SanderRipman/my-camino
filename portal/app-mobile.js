(()=>{
'use strict';

const MOBILE_UX_VERSION='2026-08-18a';
const MOBILE_BREAKPOINT=780;
const COLLAPSE_AFTER=84;
const RESTORE_AT=20;
const NAVIGATION_IA_VERSION='2026-09-02a';

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

  let ticking=false;
  const apply=()=>{
    ticking=false;
    if(window.innerWidth>MOBILE_BREAKPOINT){
      sidebar.classList.remove('mobile-nav-hidden');
      sidebar.removeAttribute('aria-hidden');
      return;
    }

    const y=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
    const focusInside=sidebar.contains(document.activeElement);
    if(y<=RESTORE_AT||focusInside){
      sidebar.classList.remove('mobile-nav-hidden');
      sidebar.removeAttribute('aria-hidden');
    }else if(y>=COLLAPSE_AFTER){
      sidebar.classList.add('mobile-nav-hidden');
      sidebar.setAttribute('aria-hidden','true');
    }
  };

  const schedule=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(apply);
  };

  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  sidebar.addEventListener('focusin',schedule);

  // View changes normally return to the top; make the navigation visible immediately.
  document.querySelector('#mainNav')?.addEventListener('click',()=>{
    if(window.innerWidth<=MOBILE_BREAKPOINT){
      sidebar.classList.remove('mobile-nav-hidden');
      sidebar.removeAttribute('aria-hidden');
    }
  });

  apply();
}

addMobileStyles();
addNavigationIa();
installMobileNavAutoHide();
})();
