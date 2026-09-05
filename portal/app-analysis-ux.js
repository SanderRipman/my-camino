(()=>{
'use strict';

const ANALYSIS_COLORS=['#0b4f4a','#8a5b00','#285c86','#8a3f3b','#3f6f62','#654b75'];
const ANALYSIS_DASHES=[[],[9,5],[3,4],[11,4,3,4],[7,3],[2,3]];
let analysisResizeWidth=0,analysisResizeFrame=0;

function analysisEnsureUx(){
  const canvas=document.querySelector('#analysisChart');
  const frame=canvas?.parentElement;
  if(!canvas||!frame)return null;
  let state=document.querySelector('#analysisState');
  if(!state){state=document.createElement('div');state.id='analysisState';state.className='analysis-state hidden';state.setAttribute('role','status');state.setAttribute('aria-live','polite');frame.insertAdjacentElement('beforebegin',state)}
  let meta=document.querySelector('#analysisMeta');
  if(!meta){meta=document.createElement('p');meta.id='analysisMeta';meta.className='analysis-meta';state.insertAdjacentElement('beforebegin',meta)}
  let legend=document.querySelector('#analysisLegend');
  if(!legend){legend=document.createElement('div');legend.id='analysisLegend';legend.className='analysis-legend';frame.insertAdjacentElement('afterend',legend)}
  if(!document.querySelector('#analysis-clarity-style')){
    const style=document.createElement('style');style.id='analysis-clarity-style';style.textContent=`
      .analysis-meta{margin:8px 0 10px;color:#45545b;font-size:12px;font-weight:650}
      .analysis-state{margin:8px 0 12px;padding:13px 14px;border:1px solid #d4c59f;border-radius:14px;background:#fffaf0;color:#4d493f;font-size:13px;line-height:1.45}
      .analysis-state strong{display:block;color:#14212b;margin-bottom:3px}
      .analysis-legend{display:flex;gap:8px 14px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid #dedbd2}
      .analysis-legend-item{display:flex;align-items:center;gap:7px;min-width:0;font-size:12px;color:#29373e;font-weight:700}
      .analysis-legend-line{display:inline-block;width:28px;flex:0 0 28px;border-top-width:3px;border-top-color:currentColor}
      #analysisParticipants .chip{display:inline-flex;align-items:center;gap:6px}
      #analysisParticipants .chip[data-has-data="false"]{opacity:.58}
      #analysisParticipants .chip .analysis-chip-count{font-size:9px;font-weight:850;opacity:.8}
      .analysis-card .chart-frame{min-height:300px;background:#fffdf8;border:1px solid #dedbd2;border-radius:16px;padding:6px;overflow:hidden}
      #overviewLegend .analysis-legend-item{font-size:11px;font-weight:650}
      #overviewLegend .analysis-legend-line{width:20px;flex-basis:20px}
      @media(max-width:700px){.analysis-card{padding:16px}.analysis-controls{grid-template-columns:1fr 1fr}.analysis-controls .toggle-label{grid-column:1/-1}.analysis-card .chart-frame{height:312px;min-height:312px}.analysis-legend-item{font-size:11px}}
    `;document.head.appendChild(style)
  }
  return{canvas,frame,state,meta,legend};
}
function analysisDateLabel(value){
  const d=new Date(`${value}T00:00:00`);if(Number.isNaN(d.getTime()))return String(value||'');
  return new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'2-digit'}).format(d);
}
function analysisDrawReadable(canvas,series){
  const frame=canvas.parentElement,rect=frame.getBoundingClientRect(),compact=canvas.id==='overviewChart';
  const w=Math.max(280,Math.floor(rect.width-12)),h=compact?(window.innerWidth<=700?220:260):(window.innerWidth<=700?300:360),dpr=Math.min(2.5,Math.max(1,window.devicePixelRatio||1));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.setProperty('width','100%','important');canvas.style.setProperty('height',`${h}px`,'important');
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const pad={l:38,r:14,t:16,b:34},cw=Math.max(1,w-pad.l-pad.r),ch=Math.max(1,h-pad.t-pad.b);
  ctx.font='600 11px system-ui';ctx.textBaseline='middle';ctx.textAlign='right';
  for(let tick=0;tick<=10;tick+=2){const py=pad.t+ch*(1-tick/10);ctx.strokeStyle=tick===0||tick===10?'#aeb7b4':'#d2d7d4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(w-pad.r,py);ctx.stroke();ctx.fillStyle='#3e4e55';ctx.fillText(String(tick),pad.l-8,py)}
  const dates=[...new Set(series.flatMap(s=>s.values.map(v=>v.date)))].sort();if(!dates.length)return;
  const x=d=>pad.l+(dates.length===1?cw/2:cw*dates.indexOf(d)/(dates.length-1)),y=v=>pad.t+ch*(1-Math.max(0,Math.min(10,Number(v)))/10);
  series.forEach((s,i)=>{const color=s.color||ANALYSIS_COLORS[i%ANALYSIS_COLORS.length],dash=s.dashed?[8,5]:ANALYSIS_DASHES[i%ANALYSIS_DASHES.length];ctx.strokeStyle=color;ctx.lineWidth=s.dashed?2.7:3.2;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();s.values.forEach((v,j)=>{const px=x(v.date),py=y(v.value);j?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();ctx.setLineDash([]);s.values.forEach(v=>{const px=x(v.date),py=y(v.value);ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(px,py,5.5,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,3.7,0,Math.PI*2);ctx.fill()})});
  const labelIdx=dates.length<=2?dates.map((_,i)=>i):[0,Math.floor((dates.length-1)/2),dates.length-1];ctx.textBaseline='alphabetic';ctx.fillStyle='#3e4e55';ctx.font='600 10px system-ui';labelIdx.forEach((idx,pos)=>{ctx.textAlign=pos===0?'left':pos===labelIdx.length-1?'right':'center';ctx.fillText(analysisDateLabel(dates[idx]),x(dates[idx]),h-8)})
}
function analysisAverage(selected){
  const dates=[...new Set(selected.flatMap(s=>s.values.map(v=>v.date)))].sort();
  return dates.map(date=>{const vals=selected.flatMap(s=>s.values.filter(v=>v.date===date).map(v=>v.value)).filter(Number.isFinite);return vals.length?{date,value:vals.reduce((a,b)=>a+b,0)/vals.length}:null}).filter(Boolean)
}
function renderReadableAnalysis(){
  const ux=analysisEnsureUx();if(!ux)return;
  const metric=document.querySelector('#analysisMetric')?.value||'agency',days=Number(document.querySelector('#analysisPeriod')?.value||30),all=participantSeries(metric,days).map((s,i)=>({...s,color:ANALYSIS_COLORS[i%ANALYSIS_COLORS.length]}));
  if(!analysisSelected.size&&all.length)all.slice(0,3).forEach(s=>analysisSelected.add(s.id));
  const byId=new Map(all.map(s=>[s.id,s]));
  document.querySelector('#analysisParticipants').innerHTML=participants.map(p=>{const count=byId.get(p.id)?.values.length||0;return `<button class="chip ${analysisSelected.has(p.id)?'active':''}" type="button" aria-pressed="${analysisSelected.has(p.id)}" data-analysis-id="${p.id}" data-has-data="${count>0}">${escapeHtml(p.code_name)} <span class="analysis-chip-count">${count}</span></button>`}).join('');
  document.querySelectorAll('[data-analysis-id]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.analysisId;analysisSelected.has(id)?analysisSelected.delete(id):analysisSelected.add(id);renderReadableAnalysis()}));
  const selected=all.filter(s=>analysisSelected.has(s.id)),pointCount=selected.reduce((n,s)=>n+s.values.length,0),metricLabel=document.querySelector('#analysisMetric')?.selectedOptions?.[0]?.textContent||'måling';
  ux.meta.textContent=`${metricLabel} · ${days} dager · ${selected.length} deltaker${selected.length===1?'':'e'} · ${pointCount} datapunkt${pointCount===1?'':'er'}`;
  if(!all.length){ux.state.innerHTML='<strong>Ingen registrerte målinger i valgt periode.</strong>Prøv en lengre periode eller en annen måling. Grafen lager ikke kunstige eller interpolerte verdier.';ux.state.classList.remove('hidden');ux.legend.innerHTML='';analysisDrawReadable(ux.canvas,[]);return}
  if(!selected.length){ux.state.innerHTML='<strong>De valgte deltakerne har ingen målinger for dette valget.</strong>Velg en deltaker med et tall ved navnet, eller endre måling/periode.';ux.state.classList.remove('hidden');ux.legend.innerHTML='';analysisDrawReadable(ux.canvas,[]);return}
  ux.state.classList.add('hidden');
  let plotted=[...selected];if(document.querySelector('#showAverage')?.checked){const avg=analysisAverage(selected);if(avg.length)plotted.push({label:'Gruppesnitt',color:'#111820',dashed:true,values:avg})}
  analysisDrawReadable(ux.canvas,plotted);
  ux.legend.innerHTML=plotted.map(s=>{const dashed=s.dashed?'dashed':'solid',count=s.values.length;return `<span class="analysis-legend-item"><i class="analysis-legend-line" style="color:${s.color};border-top-style:${dashed}"></i><span>${escapeHtml(s.label)} <small>(${count})</small></span></span>`}).join('');
}
function analysisAggregateOnly(){
  try{
    if(!isStaff())return false;
    const roles=new Set((accessGrants||[]).filter(activeGrant).map(g=>g.role_code));
    const operational=['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].some(role=>roles.has(role));
    return !operational&&['project_owner','observer','evaluator'].some(role=>roles.has(role));
  }catch{return false}
}
function renderReadableOverview(){
  analysisEnsureUx();
  const canvas=document.querySelector('#overviewChart'),legend=document.querySelector('#overviewLegend');if(!canvas||!legend)return;
  const series=participantSeries('agency',30).slice(0,3).map((s,i)=>({...s,color:ANALYSIS_COLORS[i%ANALYSIS_COLORS.length]}));
  analysisDrawReadable(canvas,series);
  legend.innerHTML=series.map((s,i)=>`<span class="analysis-legend-item"><i class="analysis-legend-line" style="color:${s.color};border-top-style:${ANALYSIS_DASHES[i%ANALYSIS_DASHES.length].length?'dashed':'solid'}"></i><span>${escapeHtml(s.label)}</span></span>`).join('');
}

const readableOverviewBase=renderOverviewChart;
renderOverviewChart=function(){
  if(!isStaff()||analysisAggregateOnly())return readableOverviewBase();
  return renderReadableOverview();
};
renderAnalysis=renderReadableAnalysis;
['analysisMetric','analysisPeriod','showAverage'].forEach(id=>document.querySelector(`#${id}`)?.addEventListener('change',()=>setTimeout(renderReadableAnalysis,0)));
window.addEventListener('orientationchange',()=>setTimeout(()=>{renderReadableAnalysis();if(document.querySelector('#view-overview')?.classList.contains('active'))renderOverviewChart()},120));
if('ResizeObserver'in window){const frame=document.querySelector('#analysisChart')?.parentElement;if(frame)new ResizeObserver(entries=>{const width=Math.round(entries[0]?.contentRect?.width||0);if(!width||Math.abs(width-analysisResizeWidth)<2)return;analysisResizeWidth=width;cancelAnimationFrame(analysisResizeFrame);analysisResizeFrame=requestAnimationFrame(()=>{if(document.querySelector('#view-analysis')?.classList.contains('active'))renderReadableAnalysis();if(document.querySelector('#view-overview')?.classList.contains('active'))renderOverviewChart()})}).observe(frame)}
setTimeout(()=>{if(document.querySelector('#view-analysis')?.classList.contains('active'))renderReadableAnalysis();if(document.querySelector('#view-overview')?.classList.contains('active'))renderOverviewChart()},260);
})();
