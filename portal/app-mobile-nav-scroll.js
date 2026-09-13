(()=>{
'use strict';

const MOBILE_NAV_SCROLL_VERSION='2026-09-13c';
const MOBILE_BREAKPOINT=780;
const AXIS_RATIO=1.05;
const LOCK_AT=8;
const MOVE_AT=10;

function ensureStyles(){
  if(document.querySelector('#aidme-mobile-nav-scroll-style'))return;
  const style=document.createElement('style');style.id='aidme-mobile-nav-scroll-style';
  style.textContent=`
    @media(max-width:${MOBILE_BREAKPOINT}px){
      .sidebar,.sidebar nav,.sidebar nav .nav-item{touch-action:pan-y!important}
      .sidebar{overscroll-behavior-x:contain!important}
      .sidebar nav{-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important}
      .sidebar nav .nav-item{-webkit-user-select:none;user-select:none}
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
    start={x:t.clientX,y:t.clientY,left:nav.scrollLeft,horizontal:false,moved:false};
  },{passive:true,capture:true});
  surface.addEventListener('touchmove',event=>{
    if(!start||event.touches.length!==1)return;
    const t=event.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
    if(!start.horizontal&&Math.abs(dx)>=LOCK_AT&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO)start.horizontal=true;
    if(!start.horizontal)return;
    if(event.cancelable)event.preventDefault();
    start.moved=Math.abs(dx)>=MOVE_AT;
    nav.scrollLeft=start.left-dx;
  },{passive:false,capture:true});
  surface.addEventListener('touchend',event=>{
    if(!start||event.changedTouches.length!==1){reset();return}
    const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
    const moved=start.horizontal&&start.moved&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO;
    reset();
    if(moved)suppressClickUntil=performance.now()+500;
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
