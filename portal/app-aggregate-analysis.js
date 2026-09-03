(()=>{
'use strict';

let aggregatePilotId=null;
let aggregateAnalysisRequest=0;
let aggregateOverviewRequest=0;
const aggregateMetricLabels={agency:'Egenkraft',belonging:'Tilhørighet',direction:'Retning / veivalg'};

function aggregateAnalysisOnly(){return !!window.AidMeRoleLens?.aggregateOnly?.()}
function ensureAggregateAnalysisStyle(){
  if(document.querySelector('#aggregate-analysis-style'))return;
  const style=document.createElement('style');style.id='aggregate-analysis-style';style.textContent=`
    .aggregate-analysis-note{border:1px solid #ddd6c8;border-radius:14px;padding:12px 14px;background:#fffdf8;line-height:1.45}
    .aggregate-analysis-note strong{display:block;margin-bottom:3px}
    .aggregate-analysis-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .aggregate-analysis-meta span{font-size:12px;border:1px solid #ddd6c8;border-radius:999px;padding:5px 9px;background:#fff}
  `;document.head.appendChild(style);
}
function hideLegacyAnalysisUx(){
  if(!aggregateAnalysisOnly())return;
  ['analysisMeta','analysisState','analysisLegend'].forEach(id=>{const el=document.querySelector(`#${id}`);if(el){el.innerHTML='';el.textContent='';el.classList.add('hidden')}});
}
function ensureAggregatePilotSelect(pilots,selectedId){
  const controls=document.querySelector('#view-analysis .analysis-controls');if(!controls)return;
  let label=document.querySelector('#aggregatePilotLabel');
  if(!label){label=document.createElement('label');label.id='aggregatePilotLabel';label.innerHTML='<span>Pilot</span><select id="aggregatePilot"></select>';controls.prepend(label)}
  const select=label.querySelector('select');
  select.innerHTML=(pilots||[]).map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.name||p.route_name||'Pilot')}</option>`).join('');
  if(selectedId)select.value=selectedId;
  if(!select.dataset.bound){select.dataset.bound='1';select.addEventListener('change',()=>{aggregatePilotId=select.value;renderAnalysis()})}
  label.classList.toggle('hidden',(pilots||[]).length<2);
}
function adaptAggregateAnalysisPresentation(){
  ensureAggregateAnalysisStyle();
  hideLegacyAnalysisUx();
  const view=document.querySelector('#view-analysis');if(!view)return;
  const heading=view.querySelector('.section-head h2');if(heading)heading.textContent='Aggregert utvikling og læring';
  const intro=view.querySelector('.section-head p:last-child');if(intro)intro.textContent='Se anonymiserte mønstre på pilotnivå. En liten pilot kan vise gjennomførbarhet, deltakeropplevelse og utvikling over tid – ikke bevise at programmet alene skapte endringen.';
  const eyebrow=view.querySelector('.section-head .eyebrow');if(eyebrow)eyebrow.textContent='Aggregert/anonymisert · ikke diagnoser';
  const metric=document.querySelector('#analysisMetric');
  if(metric){const current=aggregateMetricLabels[metric.value]?metric.value:'agency';metric.innerHTML=Object.entries(aggregateMetricLabels).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');metric.value=current}
  const average=document.querySelector('#showAverage');if(average){average.checked=true;average.closest('label')?.classList.add('hidden')}
}
function aggregateStatusHost(){return document.querySelector('#analysisParticipants')}
function aggregateSummaryHost(){
  let host=document.querySelector('#aggregateAnalysisSummary');
  if(host)return host;
  const chart=document.querySelector('#analysisChart')?.closest('.chart-frame');if(!chart)return null;
  host=document.createElement('div');host.id='aggregateAnalysisSummary';host.style.marginTop='12px';chart.insertAdjacentElement('afterend',host);return host;
}
function renderAggregateEmpty(text){
  hideLegacyAnalysisUx();
  drawChart(document.querySelector('#analysisChart'),[]);
  const host=aggregateStatusHost();if(host)host.innerHTML=`<div class="aggregate-analysis-note"><strong>Aggregert visning</strong>${escapeHtml(text)}</div>`;
  const summary=aggregateSummaryHost();if(summary)summary.innerHTML='';
}
async function invokeAggregate(metric='agency',days=30){
  return client.functions.invoke('aggregate-analysis',{body:{metric,days,pilotId:aggregatePilotId}})
}
async function renderAggregateAnalysis(){
  adaptAggregateAnalysisPresentation();
  const metric=document.querySelector('#analysisMetric')?.value||'agency';
  const days=Number(document.querySelector('#analysisPeriod')?.value||30);
  const host=aggregateStatusHost();if(host)host.innerHTML='<div class="aggregate-analysis-note">Henter aggregert pilotdata…</div>';
  const request=++aggregateAnalysisRequest;
  const {data,error}=await invokeAggregate(metric,days);
  if(request!==aggregateAnalysisRequest)return;
  if(error||data?.error){renderAggregateEmpty('Aggregert analyse kunne ikke åpnes med denne tilgangen.');return}
  aggregatePilotId=data?.pilot?.id||aggregatePilotId;
  ensureAggregatePilotSelect(data?.pilots||[],aggregatePilotId);
  const points=(data?.points||[]).map(p=>({date:p.date,value:Number(p.value)}));
  const label=aggregateMetricLabels[metric]||metric;
  hideLegacyAnalysisUx();
  drawChart(document.querySelector('#analysisChart'),points.length?[{label:'Gruppesnitt',dashed:false,values:points}]:[]);
  if(host){
    host.innerHTML=`<div class="aggregate-analysis-note"><strong>${escapeHtml(data?.pilot?.name||'Pilot')} · ${escapeHtml(label)}</strong>Ingen individuelle deltakere vises. Måledatoer med færre enn ${Number(data?.minGroupSize||3)} bidrag skjules.<div class="aggregate-analysis-meta"><span>${Number(data?.cohortSize||0)} deltakere i pilot</span><span>${points.length} aggregerte måledatoer</span>${Number(data?.suppressedDates||0)?`<span>${Number(data.suppressedDates)} datoer skjult</span>`:''}</div></div>`;
  }
  const summary=aggregateSummaryHost();
  if(summary)summary.innerHTML=points.length?'':'<div class="aggregate-analysis-note"><strong>Ingen visbare gruppemålinger i perioden</strong>Prøv en lengre periode. Systemet lager ikke kunstige eller interpolerte verdier.</div>';
}
async function renderAggregateOverview(){
  const canvas=document.querySelector('#overviewChart');if(!canvas)return;
  const request=++aggregateOverviewRequest;
  const {data,error}=await invokeAggregate('agency',30);
  if(request!==aggregateOverviewRequest)return;
  if(error||data?.error){drawChart(canvas,[]);const legend=document.querySelector('#overviewLegend');if(legend)legend.innerHTML='<span class="privacy-note">Aggregert utvikling kunne ikke åpnes.</span>';return}
  aggregatePilotId=data?.pilot?.id||aggregatePilotId;
  const points=(data?.points||[]).map(p=>({date:p.date,value:Number(p.value)}));
  drawChart(canvas,points.length?[{label:'Egenkraft · gruppesnitt',dashed:false,values:points}]:[]);
  const legend=document.querySelector('#overviewLegend');
  if(legend)legend.innerHTML=points.length?`<span class="legend-item">Egenkraft · gruppesnitt · ${points.length} måledatoer</span>`:'<span class="privacy-note">Ingen visbare gruppemålinger siste 30 dager.</span>';
}

const aggregateBaseRenderAnalysis=renderAnalysis;
renderAnalysis=function(){if(!aggregateAnalysisOnly())return aggregateBaseRenderAnalysis();return renderAggregateAnalysis()};
const aggregateBaseRenderOverviewChart=renderOverviewChart;
renderOverviewChart=function(){if(!aggregateAnalysisOnly())return aggregateBaseRenderOverviewChart();return renderAggregateOverview()};

['analysisMetric','analysisPeriod'].forEach(id=>document.querySelector(`#${id}`)?.addEventListener('change',()=>{if(aggregateAnalysisOnly())setTimeout(renderAggregateAnalysis,25)}));
window.addEventListener('resize',()=>{if(aggregateAnalysisOnly()&&document.querySelector('#view-analysis')?.classList.contains('active'))setTimeout(renderAggregateAnalysis,180)});

const VIEW_STATE_PREFIX='aidme:portal-view:v1';
let restoringPortalView=false;
function viewStateKey(){const uid=session?.user?.id;return uid?`${VIEW_STATE_PREFIX}:${uid}`:null}
function viewExistsAndAllowed(name){
  if(!name||!document.querySelector(`#view-${name}`))return false;
  const nav=document.querySelector(`.nav-item[data-view="${name}"]`);
  if(nav&&(nav.classList.contains('hidden')||nav.hidden||getComputedStyle(nav).display==='none'))return false;
  return true;
}
function savePortalView(name){
  const key=viewStateKey();if(!key||restoringPortalView||!viewExistsAndAllowed(name))return;
  try{sessionStorage.setItem(key,name)}catch{}
}
function restorePortalView(){
  const key=viewStateKey();if(!key)return;
  const params=new URLSearchParams(location.search);
  if(params.get('returnTask')||params.get('returnView')||document.querySelector('#authReturnNotice'))return;
  let name='';try{name=sessionStorage.getItem(key)||''}catch{}
  if(!name||name==='overview'||!viewExistsAndAllowed(name))return;
  restoringPortalView=true;
  try{show(name)}finally{restoringPortalView=false}
}
const persistentBaseShow=show;
show=function(name){const result=persistentBaseShow(name);savePortalView(name);return result};

setTimeout(()=>{
  restorePortalView();
  if(!aggregateAnalysisOnly())return;
  hideLegacyAnalysisUx();
  if(document.querySelector('#view-analysis')?.classList.contains('active'))renderAnalysis();
  if(document.querySelector('#view-overview')?.classList.contains('active'))renderOverviewChart();
},360);

})();
