(()=>{
'use strict';

// Deliberately responsive mobile swipe between adjacent primary portal views.
// It is navigation-only: no data/auth behavior and no swipe while a form control
// or modal dialog is in active use.
const MAX_MS=1100;
const MIN_X=38;
const LOCK_X=18;
const AXIS_RATIO=1.12;
const EDGE_GUARD=12;
const BLOCKED='input,textarea,select,[contenteditable="true"],dialog[open],.task-dialog[open],.runner-card input,.runner-card textarea,.runner-card select,.chart-frame,canvas,.participant-chips';
let start=null,locked=false,suppressClickUntil=0;

function mobile(){return window.innerWidth<=780}
function visiblePrimary(){
  const nav=document.querySelector('#mainNav');if(!nav)return[];
  return [...nav.querySelectorAll('.nav-item[data-view]')].filter(item=>{
    if(item.classList.contains('hidden')||item.classList.contains('nav-mobile-secondary')||item.classList.contains('nav-ia-demoted'))return false;
    return getComputedStyle(item).display!=='none';
  });
}
function blockedTarget(target){return !!target?.closest?.(BLOCKED)}
function reset(){start=null;locked=false}
function currentPoint(event){return event.touches?.[0]||event.changedTouches?.[0]||null}

const host=document.querySelector('#appView');
if(!host)return;

host.addEventListener('touchstart',event=>{
  reset();
  if(!mobile()||document.querySelector('#taskDialog')?.open||event.touches.length!==1||blockedTarget(event.target))return;
  const touch=currentPoint(event),width=window.innerWidth;if(!touch)return;
  if(touch.clientX<EDGE_GUARD||touch.clientX>width-EDGE_GUARD)return;
  start={x:touch.clientX,y:touch.clientY,t:performance.now(),target:event.target};
},{passive:true,capture:true});

host.addEventListener('touchmove',event=>{
  if(!start||!mobile()||event.touches.length!==1)return;
  const touch=currentPoint(event);if(!touch)return;
  const dx=touch.clientX-start.x,dy=touch.clientY-start.y;
  if(!locked&&Math.abs(dx)>=LOCK_X&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO)locked=true;
  if(locked&&event.cancelable)event.preventDefault();
},{passive:false,capture:true});

host.addEventListener('touchend',event=>{
  if(!start||!mobile()||event.changedTouches.length!==1){reset();return}
  const touch=currentPoint(event),snapshot=start;reset();if(!touch)return;
  const dx=touch.clientX-snapshot.x,dy=touch.clientY-snapshot.y,dt=performance.now()-snapshot.t;
  if(dt>MAX_MS||Math.abs(dx)<MIN_X||Math.abs(dx)<Math.abs(dy)*AXIS_RATIO)return;
  const items=visiblePrimary();if(items.length<2)return;
  const active=document.querySelector('#mainNav .nav-item.active[data-view]');
  const index=items.indexOf(active);if(index<0)return;
  const nextIndex=dx<0?index+1:index-1,next=items[nextIndex];if(!next)return;
  suppressClickUntil=performance.now()+500;
  next.click();
},{passive:true,capture:true});

host.addEventListener('touchcancel',reset,{passive:true,capture:true});
// A swipe can begin on an otherwise clickable card/link. Suppress only the
// synthetic click immediately following a recognized swipe.
host.addEventListener('click',event=>{
  if(performance.now()>suppressClickUntil)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
},{capture:true});
})();
