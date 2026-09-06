(()=>{
'use strict';

const MAX_MS=700;
const MIN_X=72;
const AXIS_RATIO=1.45;
const EDGE_GUARD=28;
const BLOCKED='input,textarea,select,button,a,label,[contenteditable="true"],dialog,.task-dialog,.runner-card,.chart-frame,canvas,.participant-chips';
let start=null;

function mobile(){return window.innerWidth<=780}
function visiblePrimary(){
  const nav=document.querySelector('#mainNav');if(!nav)return[];
  return [...nav.querySelectorAll('.nav-item[data-view]')].filter(item=>{
    if(item.classList.contains('hidden')||item.classList.contains('nav-mobile-secondary')||item.classList.contains('nav-ia-demoted'))return false;
    return getComputedStyle(item).display!=='none';
  });
}
function blockedTarget(target){return !!target?.closest?.(BLOCKED)}
function reset(){start=null}

const workspace=document.querySelector('#appView .workspace');
if(!workspace)return;
workspace.addEventListener('touchstart',event=>{
  reset();
  if(!mobile()||document.querySelector('#taskDialog')?.open||event.touches.length!==1||blockedTarget(event.target))return;
  const touch=event.touches[0],width=window.innerWidth;
  if(touch.clientX<EDGE_GUARD||touch.clientX>width-EDGE_GUARD)return;
  start={x:touch.clientX,y:touch.clientY,t:performance.now()};
},{passive:true});
workspace.addEventListener('touchend',event=>{
  if(!start||!mobile()||event.changedTouches.length!==1){reset();return}
  const touch=event.changedTouches[0],dx=touch.clientX-start.x,dy=touch.clientY-start.y,dt=performance.now()-start.t;reset();
  if(dt>MAX_MS||Math.abs(dx)<MIN_X||Math.abs(dx)<Math.abs(dy)*AXIS_RATIO)return;
  const items=visiblePrimary();if(items.length<2)return;
  const active=document.querySelector('#mainNav .nav-item.active[data-view]');
  const index=items.indexOf(active);if(index<0)return;
  const nextIndex=dx<0?index+1:index-1;
  const next=items[nextIndex];if(!next)return;
  next.click();
},{passive:true});
workspace.addEventListener('touchcancel',reset,{passive:true});
})();
