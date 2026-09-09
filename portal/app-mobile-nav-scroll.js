(()=>{
'use strict';

const MOBILE_NAV_SCROLL_VERSION='2026-09-09b';
const MOBILE_BREAKPOINT=780;

function ensureStyles(){
  if(document.querySelector('#aidme-mobile-nav-scroll-style'))return;
  const style=document.createElement('style');style.id='aidme-mobile-nav-scroll-style';
  style.textContent=`
    @media(max-width:${MOBILE_BREAKPOINT}px){
      .sidebar{touch-action:pan-x pan-y!important;overscroll-behavior-x:contain!important}
      .sidebar nav{touch-action:pan-x!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important}
      .sidebar nav .nav-item{touch-action:pan-x!important;-webkit-user-select:none;user-select:none}
    }
  `;
  document.head.appendChild(style);
}
function install(){
  ensureStyles();
  const nav=document.querySelector('.sidebar nav'),surface=nav?.closest('.sidebar')||nav;
  if(!nav||!surface||surface.dataset.aidmeHorizontalTouch==='1')return;
  surface.dataset.aidmeHorizontalTouch='1';
  let start=null,suppressClickUntil=0;
  const reset=()=>{start=null};
  surface.addEventListener('touchstart',event=>{
    reset();
    if(window.innerWidth>MOBILE_BREAKPOINT||event.touches.length!==1)return;
    const t=event.touches[0];
    start={x:t.clientX,y:t.clientY,left:nav.scrollLeft,moved:false,insideNav:nav.contains(event.target)};
  },{passive:true,capture:true});
  surface.addEventListener('touchmove',event=>{
    if(!start||event.touches.length!==1)return;
    const t=event.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
    if(Math.abs(dx)>=8&&Math.abs(dx)>Math.abs(dy)*1.05)start.moved=true;
    // Native kinetic scrolling already handles gestures that start on the nav itself.
    // When the same horizontal gesture starts in an otherwise quiet part of the top-menu
    // surface, mirror the movement into the nav scroll position so the whole bar feels draggable.
    if(start.moved&&!start.insideNav)nav.scrollLeft=start.left-dx;
  },{passive:true,capture:true});
  surface.addEventListener('touchend',event=>{
    if(!start||event.changedTouches.length!==1){reset();return}
    const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y,moved=start.moved&&Math.abs(dx)>=10&&Math.abs(dx)>Math.abs(dy)*1.05;
    reset();
    if(moved)suppressClickUntil=performance.now()+450;
  },{passive:true,capture:true});
  surface.addEventListener('touchcancel',reset,{passive:true,capture:true});
  surface.addEventListener('click',event=>{
    if(performance.now()>suppressClickUntil)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  },{capture:true});
}

install();
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(install,0));
window.addEventListener('pageshow',()=>setTimeout(install,30));
})();
