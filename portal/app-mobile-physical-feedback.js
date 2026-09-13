(()=>{
'use strict';

const PHYSICAL_MOBILE_UX_VERSION='2026-09-13a';
const BREAKPOINT=780;
const AXIS_RATIO=1.08;
const LOCK_AT=11;
const COMMIT_MIN=52;
const VELOCITY_COMMIT=.34;
const BLOCKED='input,textarea,select,[contenteditable="true"],dialog,.task-dialog,.runner-card,.chart-frame,canvas,.participant-chips,[data-no-swipe]';
let gesture=null,suppressClickUntil=0;

function mobile(){return window.innerWidth<=BREAKPOINT}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function host(){return document.querySelector('#appView .workspace,.app-shell .workspace')}
function nav(){return document.querySelector('.sidebar nav')}
function activeView(){return host()?.querySelector('.view.active')||null}
function primaryItems(){const n=nav();if(!n)return[];return [...n.querySelectorAll('.nav-item')].filter(item=>{if(item.classList.contains('hidden')||item.classList.contains('nav-mobile-secondary')||item.classList.contains('nav-ia-demoted'))return false;const style=getComputedStyle(item);return style.display!=='none'&&style.visibility!=='hidden'})}
function activeItem(){return nav()?.querySelector('.nav-item.active,[aria-current="page"]')||null}
function blocked(target){return !!target?.closest?.(BLOCKED)}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function clearInline(view){if(!view)return;view.style.transition='';view.style.transform='';view.style.opacity='';view.style.willChange=''}
function animate(view,keyframes,options){if(!view||reducedMotion()||typeof view.animate!=='function')return Promise.resolve();const animation=view.animate(keyframes,{fill:'both',...options});return animation.finished.catch(()=>{}).finally(()=>animation.cancel())}
function settleBack(view,fromX){if(!view){return Promise.resolve()}if(reducedMotion()){clearInline(view);return Promise.resolve()}view.style.willChange='transform,opacity';return animate(view,[{transform:`translate3d(${fromX}px,0,0)`,opacity:.97},{transform:'translate3d(0,0,0)',opacity:1}],{duration:330,easing:'cubic-bezier(.16,1,.3,1)'}).finally(()=>clearInline(view))}
function enterView(direction){const view=activeView();if(!view||reducedMotion())return;const from=direction<0?32:-32;view.animate([{transform:`translate3d(${from}px,0,0)`,opacity:.86},{transform:'translate3d(0,0,0)',opacity:1}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'})}
function navigateTo(next,direction,current,fromX,velocity){const width=Math.max(280,host()?.clientWidth||window.innerWidth),travel=clamp(72+Math.abs(velocity)*95,72,Math.min(126,width*.34)),toX=direction<0?-travel:travel;const finish=()=>{clearInline(current);next.click();window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>enterView(direction)))};if(reducedMotion()){finish();return}animate(current,[{transform:`translate3d(${fromX}px,0,0)`,opacity:.96},{transform:`translate3d(${toX}px,0,0)`,opacity:.72}],{duration:190,easing:'cubic-bezier(.22,.7,.25,1)'}).then(finish)}

function ensureStyles(){if(document.querySelector('#aidme-physical-mobile-style'))return;const style=document.createElement('style');style.id='aidme-physical-mobile-style';style.textContent=`
 @media(max-width:${BREAKPOINT}px){
  .sidebar,.sidebar nav,.sidebar nav .nav-item{touch-action:pan-x pan-y!important}
  .sidebar nav{scroll-behavior:smooth!important;scroll-snap-type:x proximity!important;scroll-padding-inline:8px!important;-webkit-overflow-scrolling:touch!important}
  #appView .workspace,.app-shell .workspace{touch-action:pan-y;overflow-x:clip}
  #view-overview .compact-process,#view-participants .section-head,#view-tasks .panel-card,#view-tasks .task-filter-row{min-width:0;max-width:100%}
  .phase-workspace-head{min-width:0!important;max-width:100%!important;white-space:normal!important;flex-wrap:wrap!important;align-items:center!important}
  .phase-workspace-head [data-phase-label]{min-width:0!important;white-space:normal!important;flex:1 1 150px!important}
  .phase-workspace-reset{max-width:100%!important;white-space:normal!important;text-align:center!important}
  #journeyMini{width:100%!important;max-width:100%!important;min-width:0!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important;overflow:visible!important;padding-bottom:0!important}
  #journeyMini .process-step{min-width:0!important;max-width:100%!important;padding:8px 5px!important;gap:3px!important;justify-content:center!important;overflow:hidden!important}
  #journeyMini .process-step>span:not(.phase-count),#journeyMini .process-step>b,#journeyMini .process-step>strong{min-width:0!important;max-width:100%!important;font-size:11px!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #journeyMini .phase-count{min-width:22px!important;padding:4px 6px!important;margin-left:auto!important}
  .aidme-focus-controls{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow:visible!important;gap:7px!important;padding-bottom:0!important}
  .aidme-focus-controls label{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:center!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:7px!important}
  .aidme-focus-controls select{width:100%!important;max-width:100%!important;min-width:0!important}
  .aidme-focus-controls .chip{justify-self:start!important;max-width:100%!important;white-space:normal!important}
  .aidme-focus-note{max-width:100%!important;white-space:normal!important;line-height:1.35!important}
  #view-tasks .task-filter-row{display:flex!important;flex-wrap:wrap!important;gap:7px!important;overflow:visible!important}
  #view-tasks .task-filter-row>.aidme-focus-controls{flex:1 0 100%!important}
  .phase-workspace-links{max-width:100%!important}
  .phase-workspace-links .ghost{max-width:100%!important;white-space:normal!important;text-align:center!important}
 }
 @media(max-width:470px){
  #journeyMini .process-step{flex-direction:column!important;align-items:center!important;padding:7px 3px!important}
  #journeyMini .phase-count{margin-left:0!important}
  #journeyMini .process-step>span:not(.phase-count),#journeyMini .process-step>b,#journeyMini .process-step>strong{font-size:10px!important}
 }
 @media(prefers-reduced-motion:reduce){#appView .workspace .view,.app-shell .workspace .view{transition:none!important}}
`;document.head.appendChild(style)}

function suppressLegacyNavPointer(event){if(!mobile())return;if(event.target?.closest?.('.sidebar'))event.stopPropagation()}
function suppressLegacyContentTouch(event){if(!mobile())return;const h=host();if(!h||!h.contains(event.target)||blocked(event.target))return;event.stopPropagation()}

function begin(event){if(!mobile()||event.pointerType!=='touch'||!event.isPrimary)return;const h=host();if(!h||!h.contains(event.target)||blocked(event.target)||document.querySelector('#taskDialog')?.open)return;const view=activeView();if(!view)return;gesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastT:performance.now(),startedAt:performance.now(),horizontal:false,moved:false,velocity:0,visualX:0,view};try{h.setPointerCapture(event.pointerId)}catch{}event.stopPropagation()}
function move(event){if(!gesture||event.pointerId!==gesture.id)return;const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;if(!gesture.horizontal&&Math.abs(dx)>=LOCK_AT&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO)gesture.horizontal=true;if(!gesture.horizontal)return;if(event.cancelable)event.preventDefault();event.stopPropagation();const now=performance.now(),dt=Math.max(1,now-gesture.lastT),instant=(event.clientX-gesture.lastX)/dt;gesture.velocity=gesture.velocity*.55+instant*.45;gesture.lastX=event.clientX;gesture.lastT=now;gesture.moved=gesture.moved||Math.abs(dx)>=14;const width=Math.max(280,host()?.clientWidth||window.innerWidth),visual=clamp(dx*.62,-width*.28,width*.28);gesture.visualX=visual;gesture.view.style.willChange='transform,opacity';gesture.view.style.transition='none';gesture.view.style.transform=`translate3d(${visual}px,0,0)`;gesture.view.style.opacity=String(1-Math.min(.07,Math.abs(visual)/width*.18))}
function end(event){if(!gesture||event.pointerId!==gesture.id)return;const snapshot=gesture;gesture=null;event.stopPropagation();try{host()?.releasePointerCapture(event.pointerId)}catch{}const dx=event.clientX-snapshot.startX,dy=event.clientY-snapshot.startY,duration=performance.now()-snapshot.startedAt,axis=Math.abs(dx)>Math.abs(dy)*AXIS_RATIO;if(!snapshot.horizontal||!axis||duration>1300){settleBack(snapshot.view,snapshot.visualX);return}const items=primaryItems(),active=activeItem(),index=items.indexOf(active),direction=dx<0?-1:1,next=index<0?null:items[direction<0?index+1:index-1],commit=(Math.abs(dx)>=COMMIT_MIN||Math.abs(snapshot.velocity)>=VELOCITY_COMMIT)&&!!next;if(!commit){settleBack(snapshot.view,snapshot.visualX);return}suppressClickUntil=performance.now()+520;navigateTo(next,direction,snapshot.view,snapshot.visualX,snapshot.velocity)}
function cancel(){if(!gesture)return;const snapshot=gesture;gesture=null;settleBack(snapshot.view,snapshot.visualX)}
function suppressGhostClick(event){if(performance.now()>suppressClickUntil)return;const h=host();if(!h||!h.contains(event.target))return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}

ensureStyles();
// The earlier nav prototype lives on .sidebar. Intercept only its pointerdown so
// browser-native kinetic horizontal scrolling can own the top menu again.
document.addEventListener('pointerdown',suppressLegacyNavPointer,{capture:true});
// The old shared swipe uses touch events on .workspace. Stop those at the
// document capture phase and replace them with the inertia-aware pointer gesture.
for(const type of ['touchstart','touchmove','touchend','touchcancel'])document.addEventListener(type,suppressLegacyContentTouch,{capture:true,passive:true});
document.addEventListener('pointerdown',begin,{capture:true});
document.addEventListener('pointermove',move,{capture:true,passive:false});
document.addEventListener('pointerup',end,{capture:true});
document.addEventListener('pointercancel',cancel,{capture:true});
document.addEventListener('click',suppressGhostClick,{capture:true});
})();
