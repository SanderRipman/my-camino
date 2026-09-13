(()=>{
'use strict';

const PHYSICAL_MOBILE_UX_VERSION='2026-09-13b';
const BREAKPOINT=780;
const AXIS_RATIO=1.05;
const LOCK_AT=9;
const COMMIT_MIN=58;
const VELOCITY_COMMIT=.34;
const BLOCKED='input,textarea,select,[contenteditable="true"],dialog,.task-dialog,.runner-card,.chart-frame,canvas,.participant-chips,[data-no-swipe]';
const PHASE_COPY={
  'VÍA':'Før · retning og avklaring',
  'SER':'Under · erfaring og trygghet',
  'VIDA':'Etter · handling hjemme',
  'ny VÍA':'Neste retning'
};
let contentGesture=null,navGesture=null,suppressContentClickUntil=0,suppressNavClickUntil=0;

function mobile(){return window.innerWidth<=BREAKPOINT}
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function host(){return document.querySelector('#appView .workspace,.app-shell .workspace')}
function nav(){return document.querySelector('.sidebar nav')}
function sidebar(){return document.querySelector('.sidebar')}
function activeView(){return host()?.querySelector('.view.active')||null}
function activeItem(){return nav()?.querySelector('.nav-item.active[data-view],[aria-current="page"][data-view]')||null}
function blocked(target){return !!target?.closest?.(BLOCKED)}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function visiblePrimaryItems(){const n=nav();if(!n)return[];return [...n.querySelectorAll('.nav-item[data-view]')].filter(item=>{if(item.classList.contains('hidden')||item.classList.contains('nav-mobile-secondary')||item.classList.contains('nav-ia-demoted'))return false;const name=item.dataset.view,target=document.querySelector(`#view-${name}`),style=getComputedStyle(item);return !!target&&style.display!=='none'&&style.visibility!=='hidden'})}
function clearViewInline(view){if(!view)return;for(const key of ['transition','transform','opacity','willChange','position','top','left','width','zIndex','pointerEvents'])view.style[key]='';view.classList.remove('aidme-flow-preview')}
function animate(view,keyframes,options){if(!view||reducedMotion()||typeof view.animate!=='function')return Promise.resolve();const animation=view.animate(keyframes,{fill:'both',...options});return animation.finished.catch(()=>{}).finally(()=>animation.cancel())}
function itemCenter(item){return item?item.offsetLeft+item.offsetWidth/2:0}
function marker(){return document.querySelector('#aidmeFluidNavMarker')}
function ensureMarker(){const n=nav(),s=sidebar();if(!mobile()||!n||!s)return null;let m=marker();if(!m){m=document.createElement('span');m.id='aidmeFluidNavMarker';m.className='aidme-fluid-nav-marker';m.setAttribute('aria-hidden','true');n.prepend(m)}s.classList.add('aidme-fluid-marker-on');syncMarker(false);return m}
function setMarkerX(x,animateIt=false){const m=ensureMarker();if(!m)return;m.style.transition=animateIt&&!reducedMotion()?'transform 240ms cubic-bezier(.16,1,.3,1)':'none';m.style.transform=`translate3d(${Math.round(x-30)}px,-50%,0)`}
function syncMarker(animateIt=true){const item=activeItem();if(item)setMarkerX(itemCenter(item),animateIt)}
function interpolateMarker(from,to,progress){if(!from||!to)return;const x=itemCenter(from)+(itemCenter(to)-itemCenter(from))*clamp(progress,0,1);setMarkerX(x,false)}
function selectedPhase(step){return step.classList.contains('phase-selected')||step.getAttribute('aria-pressed')==='true'}
function enhanceProcessAccordion(){if(!mobile())return;const root=document.querySelector('#journeyMini');if(!root)return;root.classList.add('aidme-process-accordion');for(const step of root.querySelectorAll('.process-step')){const ph=step.dataset.phaseWorkspace||step.querySelector('b,strong,span')?.textContent?.trim();if(!PHASE_COPY[ph])continue;step.dataset.aidmeProcessAccordion='1';step.setAttribute('aria-expanded',selectedPhase(step)?'true':'false');let small=step.querySelector('small');if(!small){small=document.createElement('small');step.appendChild(small)}small.classList.add('aidme-phase-subtitle');small.textContent=PHASE_COPY[ph];let chevron=step.querySelector('.aidme-phase-chevron');if(!chevron){chevron=document.createElement('span');chevron.className='aidme-phase-chevron';chevron.setAttribute('aria-hidden','true');step.appendChild(chevron)}chevron.textContent=selectedPhase(step)?'−':'+';let body=step.querySelector('.aidme-phase-expand');if(!body){body=document.createElement('div');body.className='aidme-phase-expand';step.appendChild(body)}body.innerHTML=selectedPhase(step)?`<span>Viser ${ph} i oversikt, deltakere og oppgaver.</span><strong>Trykk igjen for generell oversikt.</strong>`:`<span>Trykk for å fokusere arbeidsflaten på ${ph}.</span>`}}

function ensureStyles(){if(document.querySelector('#aidme-physical-mobile-style-v2'))return;const style=document.createElement('style');style.id='aidme-physical-mobile-style-v2';style.textContent=`
 @media(max-width:${BREAKPOINT}px){
  .sidebar,.sidebar nav,.sidebar nav .nav-item{touch-action:pan-y!important}
  .sidebar nav{position:relative!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;scroll-behavior:auto!important}
  .sidebar.aidme-fluid-marker-on .nav-item.active::before,.sidebar.aidme-fluid-marker-on .nav-item[aria-current="page"]::before,.sidebar.aidme-fluid-marker-on .nav-item.active::after,.sidebar.aidme-fluid-marker-on .nav-item[aria-current="page"]::after{content:none!important;display:none!important}
  .aidme-fluid-nav-marker{position:absolute;left:0;top:50%;width:60px;height:60px;z-index:0;pointer-events:none;background-image:url('/vida/assets/AIDME_Logo-original-web.webp'),radial-gradient(circle,rgba(46,105,99,.54) 0%,rgba(32,82,78,.40) 55%,rgba(14,49,48,0) 74%);background-position:center,center;background-size:60px 60px,56px 56px;background-repeat:no-repeat;opacity:.42;filter:saturate(.73) brightness(.78) contrast(1.02);will-change:transform}
  .sidebar .nav-item{position:relative!important;z-index:1!important}
  #appView .workspace,.app-shell .workspace{touch-action:pan-y;overflow-x:clip;position:relative}
  .view.aidme-flow-preview{display:block!important;visibility:visible!important;pointer-events:none!important}
  #view-overview .compact-process,#view-participants .section-head,#view-tasks .panel-card,#view-tasks .task-filter-row{min-width:0;max-width:100%}
  .phase-workspace-head{min-width:0!important;max-width:100%!important;white-space:normal!important;flex-wrap:wrap!important;align-items:center!important}
  .phase-workspace-head [data-phase-label]{min-width:0!important;white-space:normal!important;flex:1 1 150px!important}
  .phase-workspace-reset{max-width:100%!important;white-space:normal!important;text-align:center!important}
  #journeyMini.aidme-process-accordion{display:flex!important;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:8px!important;overflow:visible!important;padding:0!important}
  #journeyMini.aidme-process-accordion .process-step{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto!important;grid-template-rows:auto auto auto!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:2px 8px!important;align-items:center!important;padding:11px 12px!important;white-space:normal!important;overflow:hidden!important;border-radius:12px!important;text-align:left!important}
  #journeyMini.aidme-process-accordion .process-step>b,#journeyMini.aidme-process-accordion .process-step>strong,#journeyMini.aidme-process-accordion .process-step>span:not(.phase-count):not(.aidme-phase-chevron){grid-column:1;grid-row:1;min-width:0!important;font-size:14px!important;line-height:1.15!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
  #journeyMini.aidme-process-accordion .phase-count{grid-column:2;grid-row:1;margin:0!important;min-width:25px!important;justify-self:end}
  #journeyMini.aidme-process-accordion .aidme-phase-chevron{grid-column:3;grid-row:1;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(18,63,61,.06);font-size:18px;line-height:1;color:#365754;font-weight:700}
  #journeyMini.aidme-process-accordion .aidme-phase-subtitle{grid-column:1/4;grid-row:2;margin:1px 0 0!important;font-size:11px!important;line-height:1.25!important;color:#657176!important;white-space:normal!important}
  #journeyMini.aidme-process-accordion .aidme-phase-expand{grid-column:1/4;grid-row:3;display:grid;gap:2px;max-height:0;opacity:0;overflow:hidden;margin-top:0;transition:max-height 280ms cubic-bezier(.16,1,.3,1),opacity 180ms ease,margin-top 220ms ease;font-size:11px;line-height:1.35;color:#53636a}
  #journeyMini.aidme-process-accordion .process-step.phase-selected .aidme-phase-expand{max-height:72px;opacity:1;margin-top:7px}
  #journeyMini.aidme-process-accordion .aidme-phase-expand strong{font-size:10px;color:#17685e}
  .aidme-focus-controls{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow:visible!important;gap:7px!important;padding-bottom:0!important}
  .aidme-focus-controls label{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;align-items:center!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:7px!important}
  .aidme-focus-controls select{width:100%!important;max-width:100%!important;min-width:0!important}
  .aidme-focus-controls .chip{justify-self:start!important;max-width:100%!important;white-space:normal!important}
  .aidme-focus-note{max-width:100%!important;white-space:normal!important;line-height:1.35!important}
  #view-tasks .task-filter-row{display:flex!important;flex-wrap:wrap!important;gap:7px!important;overflow:visible!important}
  #view-tasks .task-filter-row>.aidme-focus-controls{flex:1 0 100%!important}
  .phase-workspace-links{max-width:100%!important}.phase-workspace-links .ghost{max-width:100%!important;white-space:normal!important;text-align:center!important}
 }
 @media(prefers-reduced-motion:reduce){#appView .workspace .view,.app-shell .workspace .view,.aidme-fluid-nav-marker,#journeyMini .aidme-phase-expand{transition:none!important}}
`;document.head.appendChild(style)}

function stopLegacyContentTouch(event){if(!mobile())return;const h=host();if(!h||!h.contains(event.target)||blocked(event.target))return;event.stopPropagation()}
function cleanupPreview(state){if(!state)return;clearViewInline(state.current);if(state.nextView)clearViewInline(state.nextView)}
function adjacentFor(direction){const items=visiblePrimaryItems(),active=activeItem(),index=items.indexOf(active);if(index<0)return null;const next=items[direction<0?index+1:index-1];if(!next)return null;const nextView=document.querySelector(`#view-${next.dataset.view}`);return nextView?{item:next,view:nextView}:null}
function prepareAdjacent(state,direction){if(state.direction===direction&&state.nextView)return;cleanupPreview({current:null,nextView:state.nextView});state.direction=direction;const adjacent=adjacentFor(direction);state.nextItem=adjacent?.item||null;state.nextView=adjacent?.view||null;if(!state.nextView)return;const current=state.current,width=state.width;state.nextView.classList.add('aidme-flow-preview');state.nextView.style.position='absolute';state.nextView.style.top=`${current.offsetTop}px`;state.nextView.style.left='0';state.nextView.style.width='100%';state.nextView.style.zIndex='1';state.nextView.style.willChange='transform';state.current.style.position='relative';state.current.style.zIndex='2';state.current.style.willChange='transform';const start=direction<0?width:-width;state.nextView.style.transform=`translate3d(${start}px,0,0)`}
function settleBack(state){if(!state)return Promise.resolve();const current=state.current,next=state.nextView,width=state.width,direction=state.direction||-1;syncMarker(true);if(reducedMotion()){cleanupPreview(state);return Promise.resolve()}const jobs=[animate(current,[{transform:current.style.transform||'translate3d(0,0,0)'},{transform:'translate3d(0,0,0)'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'})];if(next)jobs.push(animate(next,[{transform:next.style.transform||'translate3d(0,0,0)'},{transform:`translate3d(${direction<0?width:-width}px,0,0)`}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'}));return Promise.all(jobs).finally(()=>cleanupPreview(state))}
function commitSwipe(state){const current=state.current,next=state.nextView,item=state.nextItem,width=state.width,direction=state.direction;if(!next||!item){settleBack(state);return}const currentFrom=current.style.transform||'translate3d(0,0,0)',nextFrom=next.style.transform||`translate3d(${direction<0?width:-width}px,0,0)`,currentTo=`translate3d(${direction<0?-width:width}px,0,0)`;setMarkerX(itemCenter(item),true);const finish=()=>{const name=item.dataset.view;if(name&&typeof show==='function')show(name);cleanupPreview(state);syncMarker(false);enhanceProcessAccordion()};if(reducedMotion()){finish();return}Promise.all([animate(current,[{transform:currentFrom},{transform:currentTo}],{duration:230,easing:'cubic-bezier(.2,.72,.25,1)'}),animate(next,[{transform:nextFrom},{transform:'translate3d(0,0,0)'}],{duration:230,easing:'cubic-bezier(.2,.72,.25,1)'})]).then(finish)}
function beginContent(event){if(!mobile()||event.pointerType!=='touch'||!event.isPrimary||event.target?.closest?.('.sidebar'))return;const h=host();if(!h||!h.contains(event.target)||blocked(event.target)||document.querySelector('#taskDialog')?.open)return;const current=activeView(),fromItem=activeItem();if(!current||!fromItem)return;contentGesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastT:performance.now(),startedAt:performance.now(),horizontal:false,velocity:0,current,fromItem,nextItem:null,nextView:null,direction:0,width:Math.max(280,h.clientWidth||window.innerWidth)};try{h.setPointerCapture(event.pointerId)}catch{}}
function moveContent(event){const g=contentGesture;if(!g||event.pointerId!==g.id)return;const dx=event.clientX-g.startX,dy=event.clientY-g.startY;if(!g.horizontal&&Math.abs(dx)>=LOCK_AT&&Math.abs(dx)>Math.abs(dy)*AXIS_RATIO)g.horizontal=true;if(!g.horizontal)return;if(event.cancelable)event.preventDefault();event.stopPropagation();const direction=dx<0?-1:1;prepareAdjacent(g,direction);const now=performance.now(),dt=Math.max(1,now-g.lastT),instant=(event.clientX-g.lastX)/dt;g.velocity=g.velocity*.55+instant*.45;g.lastX=event.clientX;g.lastT=now;const max=g.nextView?g.width:g.width*.12,visual=clamp(dx*.94,-max,max);g.current.style.transition='none';g.current.style.transform=`translate3d(${visual}px,0,0)`;if(g.nextView){const start=direction<0?g.width:-g.width;g.nextView.style.transition='none';g.nextView.style.transform=`translate3d(${start+visual}px,0,0)`;interpolateMarker(g.fromItem,g.nextItem,Math.min(1,Math.abs(visual)/(g.width*.55)))}}
function endContent(event){const g=contentGesture;if(!g||event.pointerId!==g.id)return;contentGesture=null;try{host()?.releasePointerCapture(event.pointerId)}catch{}const dx=event.clientX-g.startX,dy=event.clientY-g.startY,duration=performance.now()-g.startedAt,axis=Math.abs(dx)>Math.abs(dy)*AXIS_RATIO,commit=g.horizontal&&axis&&duration<1500&&!!g.nextView&&(Math.abs(dx)>=COMMIT_MIN||Math.abs(g.velocity)>=VELOCITY_COMMIT);if(!commit){settleBack(g);return}suppressContentClickUntil=performance.now()+520;commitSwipe(g)}
function cancelContent(){if(!contentGesture)return;const g=contentGesture;contentGesture=null;settleBack(g)}

function beginNav(event){if(!mobile()||event.pointerType!=='touch'||!event.isPrimary)return;const n=nav(),s=sidebar();if(!n||!s||!n.contains(event.target))return;navGesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastT:performance.now(),left:n.scrollLeft,horizontal:false,moved:false,velocity:0};try{s.setPointerCapture(event.pointerId)}catch{}}
function moveNav(event){const g=navGesture,n=nav();if(!g||!n||event.pointerId!==g.id)return;const dx=event.clientX-g.startX,dy=event.clientY-g.startY;if(!g.horizontal&&Math.abs(dx)>=5&&Math.abs(dx)>Math.abs(dy)*1.03)g.horizontal=true;if(!g.horizontal)return;if(event.cancelable)event.preventDefault();event.stopPropagation();const now=performance.now(),dt=Math.max(1,now-g.lastT);g.velocity=(event.clientX-g.lastX)/dt;g.lastX=event.clientX;g.lastT=now;g.moved=Math.abs(dx)>=8;n.scrollLeft=g.left-dx}
function endNav(event){const g=navGesture,n=nav(),s=sidebar();if(!g||!n||event.pointerId!==g.id){navGesture=null;return}navGesture=null;try{s?.releasePointerCapture(event.pointerId)}catch{}const dx=event.clientX-g.startX,dy=event.clientY-g.startY,moved=g.moved&&Math.abs(dx)>=10&&Math.abs(dx)>Math.abs(dy)*1.03;if(!moved)return;suppressNavClickUntil=performance.now()+450;const max=Math.max(0,n.scrollWidth-n.clientWidth),momentum=clamp(g.velocity,-1.1,1.1)*110,target=clamp(n.scrollLeft-momentum,0,max);n.scrollTo({left:target,behavior:reducedMotion()?'auto':'smooth'})}
function cancelNav(){navGesture=null}
function suppressGhostClick(event){const now=performance.now();if(now<=suppressNavClickUntil&&event.target?.closest?.('.sidebar nav')){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();return}if(now<=suppressContentClickUntil&&host()?.contains(event.target)){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}}

function wrapShow(){if(typeof show!=='function'||show.__aidmeFluidSwipe)return;const prior=show;const wrapped=function(name){prior(name);requestAnimationFrame(()=>{syncMarker(true);enhanceProcessAccordion()})};wrapped.__aidmeFluidSwipe=true;show=wrapped}
function refresh(){ensureStyles();ensureMarker();enhanceProcessAccordion();wrapShow()}

ensureStyles();refresh();
for(const type of ['touchstart','touchmove','touchend','touchcancel'])document.addEventListener(type,stopLegacyContentTouch,{capture:true,passive:true});
document.addEventListener('pointerdown',event=>{beginNav(event);beginContent(event)},{capture:true});
document.addEventListener('pointermove',event=>{moveNav(event);moveContent(event)},{capture:true,passive:false});
document.addEventListener('pointerup',event=>{endNav(event);endContent(event)},{capture:true});
document.addEventListener('pointercancel',()=>{cancelNav();cancelContent()},{capture:true});
document.addEventListener('click',suppressGhostClick,{capture:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(refresh,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(refresh,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(enhanceProcessAccordion,0));
window.addEventListener('resize',()=>setTimeout(refresh,0),{passive:true});
window.addEventListener('pageshow',()=>setTimeout(refresh,30));
})();