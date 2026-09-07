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
})();
