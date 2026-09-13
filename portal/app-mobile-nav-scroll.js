(()=>{
'use strict';

const MOBILE_NAV_SCROLL_VERSION='2026-09-13b';
const MOBILE_BREAKPOINT=780;

function ensureStyles(){
  if(document.querySelector('#aidme-mobile-nav-scroll-style'))return;
  const style=document.createElement('style');style.id='aidme-mobile-nav-scroll-style';
  style.textContent=`
    @media(max-width:${MOBILE_BREAKPOINT}px){
      .sidebar{touch-action:pan-y!important;overscroll-behavior-x:contain!important}
      .sidebar nav{touch-action:pan-y!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;scroll-behavior:smooth;transition:transform .14s ease}
      .sidebar nav .nav-item{touch-action:pan-y!important;-webkit-user-select:none;user-select:none;transition:transform .14s ease,opacity .14s ease}
      .sidebar.aidme-nav-dragging nav{scroll-behavior:auto!important;transform:translate3d(0,0,0)}
      .sidebar.aidme-nav-dragging .nav-item.active{transform:scale(1.018)}
      .sidebar.aidme-nav-settle .nav-item.active{transform:translateY(-1px) scale(1.012)}
    }
    @media(prefers-reduced-motion:reduce){.sidebar nav,.sidebar nav .nav-item{transition:none!important;scroll-behavior:auto!important}}
  `;
  document.head.appendChild(style);
}
function install(){
  ensureStyles();
  const nav=document.querySelector('.sidebar nav'),surface=nav?.closest('.sidebar')||nav;
  if(!nav||!surface||surface.dataset.aidmeHorizontalPointer==='3')return;
  surface.dataset.aidmeHorizontalPointer='3';
  let drag=null,suppressClickUntil=0,settleTimer=null;
  const reset=()=>{drag=null;surface.classList.remove('aidme-nav-dragging')};
  const begin=(event)=>{
    reset();
    if(window.innerWidth>MOBILE_BREAKPOINT||event.pointerType!=='touch'||!event.isPrimary)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastT:performance.now(),left:nav.scrollLeft,horizontal:false,moved:false,velocity:0};
    try{surface.setPointerCapture(event.pointerId)}catch{}
  };
  const move=(event)=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.horizontal&&Math.abs(dx)>=5&&Math.abs(dx)>Math.abs(dy)*1.03){drag.horizontal=true;surface.classList.add('aidme-nav-dragging')}
    if(!drag.horizontal)return;
    if(event.cancelable)event.preventDefault();
    const now=performance.now(),dt=Math.max(1,now-drag.lastT);drag.velocity=(event.clientX-drag.lastX)/dt;drag.lastX=event.clientX;drag.lastT=now;
    drag.moved=drag.moved||Math.abs(dx)>=8;
    nav.scrollLeft=drag.left-dx;
  };
  const end=(event)=>{
    if(!drag||event.pointerId!==drag.id){reset();return}
    const snapshot=drag,dx=event.clientX-snapshot.x,dy=event.clientY-snapshot.y,moved=snapshot.moved&&Math.abs(dx)>=10&&Math.abs(dx)>Math.abs(dy)*1.03;
    reset();
    try{surface.releasePointerCapture(event.pointerId)}catch{}
    if(!moved)return;
    suppressClickUntil=performance.now()+450;
    const max=Math.max(0,nav.scrollWidth-nav.clientWidth),momentum=Math.max(-1.1,Math.min(1.1,snapshot.velocity))*110;
    const target=Math.max(0,Math.min(max,nav.scrollLeft-momentum));
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)nav.scrollTo({left:target,behavior:'smooth'});else nav.scrollLeft=target;
    surface.classList.add('aidme-nav-settle');clearTimeout(settleTimer);settleTimer=setTimeout(()=>surface.classList.remove('aidme-nav-settle'),170);
  };
  surface.addEventListener('pointerdown',begin,{capture:true});
  surface.addEventListener('pointermove',move,{capture:true});
  surface.addEventListener('pointerup',end,{capture:true});
  surface.addEventListener('pointercancel',reset,{capture:true});
  surface.addEventListener('click',event=>{if(performance.now()>suppressClickUntil)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()},{capture:true});
}
install();
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(install,0));
window.addEventListener('pageshow',()=>setTimeout(install,30));
})();
