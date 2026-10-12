(()=>{
'use strict';

const MOBILE_FLUID_VERSION='2026-09-17c';
const BREAKPOINT=780;
const AXIS_RATIO=1.05;
const LOCK_AT=8;
const COMMIT_MIN=56;
const VELOCITY_COMMIT=.34;
const BLOCKED='input[type="range"],input[type="file"],[contenteditable="true"],dialog,.task-dialog,.chart-frame,canvas,.participant-chips,[data-no-swipe]';
const PHASE_COPY={
  'VÍA':'Før · retning og avklaring',
  'SER':'Under · erfaring og trygghet',
  'VIDA':'Etter · handling hjemme',
  'ny VÍA':'Neste retning'
};
let gesture=null,suppressClickUntil=0;

document.documentElement.dataset.mobileGestureOwner=MOBILE_FLUID_VERSION;

function mobile(){return window.innerWidth<=BREAKPOINT}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function host(){return document.querySelector('#appView .workspace,.app-shell .workspace')}
function nav(){return document.querySelector('.sidebar nav')}
function sidebar(){return document.querySelector('.sidebar')}
function activeItem(){return nav()?.querySelector('.nav-item.active[data-view],[aria-current="page"][data-view]')||null}
function blocked(target){return !!target?.closest?.(BLOCKED)}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function visiblePrimaryItems(){
  const n=nav();if(!n)return[];
  return [...n.querySelectorAll('.nav-item[data-view]')].filter(item=>{
    const target=document.querySelector(`#view-${item.dataset.view}`),style=getComputedStyle(item),rect=item.getBoundingClientRect();
    return !!target&&style.display!=='none'&&style.visibility!=='hidden'&&Number(rect.width)>0&&Number(rect.height)>0;
  });
}
function marker(){return document.querySelector('#aidmeFluidNavMarker')}
function ensureMarker(){const s=sidebar();if(!mobile()||!s)return null;let m=marker();if(!m){m=document.createElement('span');m.id='aidmeFluidNavMarker';m.className='aidme-fluid-nav-marker';m.setAttribute('aria-hidden','true');s.appendChild(m)}s.classList.add('aidme-fluid-marker-on');return m}
function markerPoint(item){const s=sidebar();if(!item||!s)return null;const ir=item.getBoundingClientRect(),sr=s.getBoundingClientRect();return{x:ir.left-sr.left+ir.width/2,y:ir.top-sr.top+ir.height/2}}
function setMarkerPoint(point,animateIt=false){const m=ensureMarker();if(!m||!point)return;m.style.transition=animateIt&&!reducedMotion()?'transform 180ms cubic-bezier(.16,1,.3,1)':'none';m.style.transform=`translate3d(${Math.round(point.x-30)}px,${Math.round(point.y-30)}px,0)`}
function syncMarker(animateIt=false){const item=activeItem(),point=markerPoint(item);if(point)setMarkerPoint(point,animateIt)}
function interpolateMarker(from,to,progress){const a=markerPoint(from),b=markerPoint(to);if(!a||!b)return;const p=clamp(progress,0,1);setMarkerPoint({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p},false)}

function enhanceProcessAccordion(){if(!mobile())return;const root=document.querySelector('#journeyMini');if(!root)return;root.classList.add('aidme-process-accordion');for(const step of root.querySelectorAll('.process-step')){const ph=step.dataset.phaseWorkspace||step.querySelector('b,strong,span')?.textContent?.trim();if(!PHASE_COPY[ph])continue;step.dataset.aidmeProcessAccordion='1';step.removeAttribute('aria-expanded');let small=step.querySelector('small.aidme-phase-subtitle');if(!small){small=document.createElement('small');small.className='aidme-phase-subtitle';step.appendChild(small)}small.textContent=PHASE_COPY[ph];step.querySelector('.aidme-phase-chevron')?.remove();step.querySelector('.aidme-phase-expand')?.remove()}}

function ensureStyles(){if(document.querySelector('#aidme-mobile-fluid-style'))return;const style=document.createElement('style');style.id='aidme-mobile-fluid-style';style.textContent=`
 @media(max-width:${BREAKPOINT}px){
  .sidebar{position:sticky!important;overflow:hidden!important}
  .sidebar,.sidebar nav,.sidebar nav .nav-item{touch-action:pan-x pan-y!important}
  .sidebar nav{position:relative!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;scroll-behavior:auto!important}
  .sidebar.aidme-fluid-marker-on .nav-item.active::before,.sidebar.aidme-fluid-marker-on .nav-item[aria-current="page"]::before,.sidebar.aidme-fluid-marker-on .nav-item.active::after,.sidebar.aidme-fluid-marker-on .nav-item[aria-current="page"]::after{content:none!important;display:none!important}
  .aidme-fluid-nav-marker{position:absolute;left:0;top:0;width:60px;height:60px;z-index:0;pointer-events:none;background-image:url('/vida/assets/AIDME_Logo-original-web.webp'),radial-gradient(circle,rgba(46,105,99,.54) 0%,rgba(32,82,78,.40) 55%,rgba(14,49,48,0) 74%);background-position:center,center;background-size:60px 60px,56px 56px;background-repeat:no-repeat;opacity:.42;filter:saturate(.73) brightness(.78) contrast(1.02);will-change:transform}
  .sidebar .nav-item{position:relative!important;z-index:1!important}
  #appView .workspace,.app-shell .workspace{touch-action:pan-y;overflow-x:clip;position:relative}
  #view-overview .compact-process,#view-participants .section-head,#view-tasks .panel-card,#view-tasks .task-filter-row{min-width:0;max-width:100%}
  #view-overview .compact-process>h3{white-space:nowrap!important;font-size:clamp(21px,5.7vw,30px)!important;line-height:1.08!important;letter-spacing:-.025em!important}
  .phase-workspace-head{min-width:0!important;max-width:100%!important;white-space:normal!important;flex-wrap:nowrap!important;align-items:center!important;margin:2px 0 7px!important}
  .phase-workspace-head [data-phase-label]{min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;flex:1 1 auto!important}
  .phase-workspace-reset{max-width:150px!important;white-space:nowrap!important;text-align:center!important;padding:6px 9px!important}
  #journeyMini.aidme-process-accordion{display:flex!important;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:6px!important;overflow:visible!important;padding:0!important}
  #journeyMini.aidme-process-accordion .process-step{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;grid-template-rows:auto!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:48px!important;gap:8px!important;align-items:center!important;padding:8px 10px!important;white-space:nowrap!important;overflow:hidden!important;border-radius:12px!important;text-align:left!important}
  #journeyMini.aidme-process-accordion .process-step>b,#journeyMini.aidme-process-accordion .process-step>strong,#journeyMini.aidme-process-accordion .process-step>span:not(.phase-count){grid-column:1;grid-row:1;min-width:0!important;font-size:18px!important;line-height:1.05!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
  #journeyMini.aidme-process-accordion .aidme-phase-subtitle{grid-column:2;grid-row:1;margin:0!important;min-width:0!important;font-size:12px!important;line-height:1.2!important;color:#657176!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  #journeyMini.aidme-process-accordion .phase-count{grid-column:3;grid-row:1;margin:0!important;min-width:25px!important;justify-self:end}
  .aidme-focus-controls{display:flex!important;align-items:center!important;justify-content:flex-end!important;flex-wrap:wrap!important;width:auto!important;max-width:240px!important;min-width:0!important;overflow:visible!important;gap:6px!important;margin:2px 0 6px auto!important;padding:0!important}
  .aidme-focus-controls label{display:block!important;flex:1 1 170px!important;width:auto!important;max-width:220px!important;min-width:150px!important;margin:0!important;font-size:0!important;line-height:0!important;color:transparent!important}
  .aidme-focus-controls select{width:100%!important;max-width:220px!important;min-width:0!important;min-height:40px!important;padding:7px 34px 7px 11px!important;border-radius:12px!important;font-size:14px!important;line-height:1.2!important;color:#1f2f35!important}
  .aidme-focus-controls .chip{justify-self:start!important;max-width:220px!important;min-height:40px!important;white-space:nowrap!important}
  .aidme-focus-note{display:none!important}
  #view-tasks .task-filter-row{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:7px!important;overflow:visible!important}
  #view-tasks .task-filter-row>.aidme-focus-controls{flex:1 1 180px!important;max-width:220px!important;margin:0 0 0 auto!important}
  #view-participants .section-head>.aidme-focus-controls{margin-top:-2px!important;margin-bottom:2px!important}
  .phase-workspace-links{max-width:100%!important}.phase-workspace-links .ghost{max-width:100%!important;white-space:normal!important;text-align:center!important}
 }
 @media(max-width:390px){
  #view-overview .compact-process>h3{font-size:20px!important;letter-spacing:-.035em!important}
  #view-tasks .task-filter-row{flex-wrap:wrap!important}
  #view-tasks .task-filter-row>.aidme-focus-controls{flex:1 0 100%!important;max-width:210px!important;margin-left:auto!important}
 }
 @media(prefers-reduced-motion:reduce){.aidme-fluid-nav-marker{transition:none!important}}
`;document.head.appendChild(style)}

function adjacentFor(direction){
  const items=visiblePrimaryItems(),active=activeItem(),index=items.indexOf(active);if(index<0)return null;
  const next=items[direction<0?index+1:index-1];if(!next)return null;
  const view=document.querySelector(`#view-${next.dataset.view}`);return view?{item:next,view}:null;
}
function settleBack(){syncMarker(true)}
function commitContent(g){
  const next=g.nextItem?{item:g.nextItem,view:document.querySelector(`#view-${g.nextItem.dataset.view}`)}:adjacentFor(g.direction);
  if(!next?.item||!next?.view){settleBack();return}
  suppressClickUntil=performance.now()+420;
  setMarkerPoint(markerPoint(next.item),true);
  if(window.scrollY||window.scrollX)window.scrollTo({top:0,left:0,behavior:'auto'});
  next.item.click();
  requestAnimationFrame(()=>{syncMarker(false);enhanceProcessAccordion()});
}

function installNavGesture(){const n=nav();if(!n||n.dataset.aidmeFluidNavNative==='1')return;n.dataset.aidmeFluidNavNative='1';n.addEventListener('scroll',()=>syncMarker(false),{passive:true})}

function begin(event){
  if(!mobile()||event.touches?.length!==1)return;
  const target=event.target,n=nav(),h=host();if(n?.contains(target))return;
  if(!h||!h.contains(target)||blocked(target)||document.querySelector('#taskDialog')?.open)return;
  const fromItem=activeItem();if(!fromItem)return;
  gesture={zone:'content',x:event.touches[0].clientX,y:event.touches[0].clientY,lastX:event.touches[0].clientX,lastT:performance.now(),startedAt:performance.now(),horizontal:false,velocity:0,fromItem,nextItem:null,direction:0};
  event.stopPropagation();
}
function move(event){
  const g=gesture;if(!g||event.touches?.length!==1)return;
  const touch=event.touches[0],dx=touch.clientX-g.x,dy=touch.clientY-g.y;
  if(!g.horizontal&&Math.abs(dx)>=LOCK_AT&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO)g.horizontal=true;
  event.stopPropagation();if(!g.horizontal)return;if(event.cancelable)event.preventDefault();
  const now=performance.now(),dt=Math.max(1,now-g.lastT),instant=(touch.clientX-g.lastX)/dt;g.velocity=g.velocity*.55+instant*.45;g.lastX=touch.clientX;g.lastT=now;
  const direction=dx<0?-1:1,adjacent=adjacentFor(direction);g.direction=direction;g.nextItem=adjacent?.item||null;
  if(g.nextItem)interpolateMarker(g.fromItem,g.nextItem,Math.min(1,Math.abs(dx)/Math.max(120,window.innerWidth*.45)));
}
function end(event){
  const g=gesture;if(!g)return;gesture=null;event.stopPropagation();
  const touch=event.changedTouches?.[0];if(!touch){settleBack();return}
  const dx=touch.clientX-g.x,dy=touch.clientY-g.y,axis=Math.abs(dx)>Math.abs(dy)*AXIS_RATIO,duration=performance.now()-g.startedAt;
  const commit=g.horizontal&&axis&&duration<1500&&!!g.nextItem&&(Math.abs(dx)>=COMMIT_MIN||Math.abs(g.velocity)>=VELOCITY_COMMIT);
  if(!commit){settleBack();return}commitContent(g);
}
function cancel(){gesture=null;settleBack()}
function suppressGhostClick(event){if(performance.now()>suppressClickUntil)return;const h=host();if(h?.contains(event.target)){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}}

function wrapShow(){if(typeof show!=='function'||show.__aidmeMobileFluid)return;const prior=show;const wrapped=function(name){prior(name);requestAnimationFrame(()=>{syncMarker(false);enhanceProcessAccordion()})};wrapped.__aidmeMobileFluid=true;show=wrapped}
function refresh(){if(!mobile())return;document.documentElement.dataset.mobileGestureOwner=MOBILE_FLUID_VERSION;ensureStyles();ensureMarker();installNavGesture();syncMarker(false);enhanceProcessAccordion();wrapShow()}

ensureStyles();refresh();
document.addEventListener('touchstart',begin,{capture:true,passive:true});
document.addEventListener('touchmove',move,{capture:true,passive:false});
document.addEventListener('touchend',end,{capture:true,passive:true});
document.addEventListener('touchcancel',cancel,{capture:true,passive:true});
document.addEventListener('click',suppressGhostClick,{capture:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(refresh,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(refresh,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(enhanceProcessAccordion,0));
window.addEventListener('resize',()=>setTimeout(refresh,0),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(refresh,30));
})();