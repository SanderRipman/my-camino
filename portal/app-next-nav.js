(()=>{
'use strict';

// The experimental menu-level "Neste" cue is intentionally disabled.
// Guidance belongs in contextual task/action cards until a later IA pass.
document.querySelectorAll('#mainNav .nav-item.next-nav-cue').forEach(el=>el.classList.remove('next-nav-cue'));
document.querySelectorAll('#mainNav .nav-next-cue,#next-nav-cue-style').forEach(el=>el.remove());

// Remove the redundant mobile attention strip. Navigation badges remain the
// compact attention signal; KPI cards remain the explanatory/drilldown layer.
function removeAttentionStrip(){document.querySelector('#mobileAttentionBar')?.remove()}
try{updateMobileAttention=removeAttentionStrip}catch{}
removeAttentionStrip();

// Keep the overview participant total and phase mix mathematically consistent.
// NEW_VIA is a new VÍA cycle and is therefore grouped into VÍA in the compact KPI.
function renderConsistentParticipantMetric(){
  if(!Array.isArray(participants))return;
  const buckets={via:0,ser:0,vida:0};
  for(const p of participants){
    const raw=String(p?.stage||'').toUpperCase();
    if(['VIA','INTEREST','READY_FOR_GO','GO','GO_WITH_CONDITIONS','NEW_VIA'].includes(raw))buckets.via++;
    else if(raw==='SER')buckets.ser++;
    else if(raw==='VIDA')buckets.vida++;
  }
  const total=buckets.via+buckets.ser+buckets.vida;
  const metric=document.querySelector('#metricParticipants');
  const mix=document.querySelector('#metricPhaseMix');
  if(metric)metric.textContent=String(total);
  if(mix)mix.textContent=`VÍA ${buckets.via} · SER ${buckets.ser} · VIDA ${buckets.vida}`;
}

if(typeof renderMetrics==='function'){
  const baseRenderMetrics=renderMetrics;
  renderMetrics=function(){baseRenderMetrics();renderConsistentParticipantMetric();removeAttentionStrip()};
}
if(typeof renderAll==='function'){
  const baseRenderAll=renderAll;
  renderAll=function(){const out=baseRenderAll();renderConsistentParticipantMetric();removeAttentionStrip();return out};
}
window.addEventListener('pageshow',()=>{removeAttentionStrip();renderConsistentParticipantMetric()});
setTimeout(()=>{removeAttentionStrip();renderConsistentParticipantMetric()},220);
})();
