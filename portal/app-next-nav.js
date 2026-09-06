(()=>{
'use strict';

// Menu-level "Neste" cue is intentionally disabled. Guidance belongs in
// contextual task/action cards, not as another competing navigation signal.
document.querySelectorAll('#mainNav .nav-item.next-nav-cue').forEach(el=>el.classList.remove('next-nav-cue'));
document.querySelectorAll('#mainNav .nav-next-cue,#next-nav-cue-style').forEach(el=>el.remove());

// Navigation badges = compact attention signal. KPI cards = explanation/drilldown.
// The former mobile attention strip duplicated the same task state and is hidden.
if(!document.querySelector('#attention-strip-retired-style')){
  const style=document.createElement('style');style.id='attention-strip-retired-style';
  style.textContent='#mobileAttentionBar{display:none!important}';document.head.appendChild(style);
}
try{updateMobileAttention=()=>{}}catch{}

let metricRefreshToken=0;
async function renderConsistentParticipantMetric(){
  const token=++metricRefreshToken;
  try{
    const {data,error}=await client.from('participants').select('stage').eq('active',true);
    if(error||token!==metricRefreshToken||!Array.isArray(data))return;
    const buckets={via:0,ser:0,vida:0};
    for(const p of data){
      const raw=String(p?.stage||'').toUpperCase();
      if(['VIA','INTEREST','READY_FOR_GO','GO','GO_WITH_CONDITIONS','NEW_VIA'].includes(raw))buckets.via++;
      else if(raw==='SER')buckets.ser++;
      else if(raw==='VIDA')buckets.vida++;
    }
    const total=buckets.via+buckets.ser+buckets.vida;
    const metric=document.querySelector('#metricParticipants'),mix=document.querySelector('#metricPhaseMix');
    if(metric)metric.textContent=String(total);
    if(mix)mix.textContent=`VÍA ${buckets.via} · SER ${buckets.ser} · VIDA ${buckets.vida}`;
  }catch{}
}

if(typeof renderMetrics==='function'){
  const baseRenderMetrics=renderMetrics;
  renderMetrics=function(){baseRenderMetrics();renderConsistentParticipantMetric()};
}
if(typeof renderAll==='function'){
  const baseRenderAll=renderAll;
  renderAll=function(){const out=baseRenderAll();renderConsistentParticipantMetric();return out};
}
window.addEventListener('pageshow',renderConsistentParticipantMetric);
setTimeout(renderConsistentParticipantMetric,220);

// Final physical-QA swipe attempt. Keep it in this already-loaded presentation
// layer so there is no second dynamic-script/cache race. It is intentionally
// responsive, but still refuses gestures that start on actual form controls or
// while a task dialog is open.
const SWIPE_MIN_X=34;
const SWIPE_AXIS_RATIO=1.06;
const SWIPE_EDGE_GUARD=8;
const SWIPE_MAX_MS=950;
const SWIPE_BLOCKED='input,textarea,select,[contenteditable="true"],dialog,.task-dialog,.runner-card,.chart-frame,canvas,.participant-chips';
let swipeStart=null,swipeLocked=false,suppressClickUntil=0;
function swipeMobile(){return window.innerWidth<=780}
function swipePrimaryItems(){
  const nav=document.querySelector('#mainNav');if(!nav)return[];
  return [...nav.querySelectorAll('.nav-item[data-view]')].filter(item=>{
    if(item.classList.contains('hidden')||item.classList.contains('nav-mobile-secondary')||item.classList.contains('nav-ia-demoted'))return false;
    return getComputedStyle(item).display!=='none';
  });
}
function swipeBlockedTarget(target){return !!target?.closest?.(SWIPE_BLOCKED)}
function resetSwipe(){swipeStart=null;swipeLocked=false}
function installResponsiveSwipe(){
  const workspace=document.querySelector('#appView .workspace');
  if(!workspace||workspace.dataset.aidmeResponsiveSwipe==='1')return;
  workspace.dataset.aidmeResponsiveSwipe='1';
  workspace.addEventListener('touchstart',event=>{
    resetSwipe();
    if(!swipeMobile()||document.querySelector('#taskDialog')?.open||event.touches.length!==1||swipeBlockedTarget(event.target))return;
    const touch=event.touches[0],width=window.innerWidth;
    if(touch.clientX<SWIPE_EDGE_GUARD||touch.clientX>width-SWIPE_EDGE_GUARD)return;
    swipeStart={x:touch.clientX,y:touch.clientY,t:performance.now()};
  },{passive:true});
  workspace.addEventListener('touchmove',event=>{
    if(!swipeStart||event.touches.length!==1)return;
    const touch=event.touches[0],dx=touch.clientX-swipeStart.x,dy=touch.clientY-swipeStart.y;
    if(!swipeLocked&&Math.abs(dx)>=18&&Math.abs(dx)>Math.abs(dy)*SWIPE_AXIS_RATIO)swipeLocked=true;
    if(swipeLocked)event.preventDefault();
  },{passive:false});
  workspace.addEventListener('touchend',event=>{
    if(!swipeStart||!swipeMobile()||event.changedTouches.length!==1){resetSwipe();return}
    const touch=event.changedTouches[0],dx=touch.clientX-swipeStart.x,dy=touch.clientY-swipeStart.y,dt=performance.now()-swipeStart.t;
    const recognized=dt<=SWIPE_MAX_MS&&Math.abs(dx)>=SWIPE_MIN_X&&Math.abs(dx)>Math.abs(dy)*SWIPE_AXIS_RATIO;
    resetSwipe();if(!recognized)return;
    const items=swipePrimaryItems(),active=document.querySelector('#mainNav .nav-item.active[data-view]');
    const index=items.indexOf(active);if(index<0||items.length<2)return;
    const nextIndex=dx<0?index+1:index-1,next=items[nextIndex];if(!next)return;
    suppressClickUntil=performance.now()+420;
    next.click();
  },{passive:true});
  workspace.addEventListener('touchcancel',resetSwipe,{passive:true});
  workspace.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}
  },true);
}
installResponsiveSwipe();
window.addEventListener('pageshow',()=>setTimeout(installResponsiveSwipe,30));
document.addEventListener('aidme:portal-rendered',()=>setTimeout(installResponsiveSwipe,0));
})();
