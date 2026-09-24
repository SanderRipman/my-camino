(()=>{
'use strict';

const SHOWCASE_START='2027-05-03';
const SHOWCASE_END='2027-05-20';
const SHOWCASE_METRICS=Object.freeze({
  agency:'Egenkraft',
  belonging:'Tilhørighet',
  direction:'Retning / veivalg',
  mood:'Stemning',
  stress:'Stress',
  energy:'Energi',
  sleep:'Søvnkvalitet'
});
const SHOWCASE_COLORS=Object.freeze({agency:'#123f3d',belonging:'#b48736',direction:'#405f7d',mood:'#6e8f88',stress:'#8f6653',energy:'#2f6d58',sleep:'#7b617d'});
const ALIASES=Object.freeze({
  'DEMO-VIA-01':'Ingrid Demo','DEMO-SER-02':'Martin Demo','DEMO-VIDA-03':'Eva Demo','QA-ROLE-VIA-01':'Daniel Demo',
  'DEMO-STRESS-SER':'Sofia Demo','DEMO-STRESS-GO':'Henrik Demo','DEMO-STRESS-VIDA':'Aisha Demo','DEMO-SHOW-KARI':'Kari Demo','DEMO-STRESS-NYVIA':'Thomas Demo'
});
let showcasePilotId=null,showcaseSnapshot=null,snapshotPromise=null,phaseFilter='ALL',wrappersInstalled=false;

function demoOrigin(){const h=location.hostname;return h==='demo.aidme.no'||h==='mycamino-demo.netlify.app'||h.endsWith('--mycamino-demo.netlify.app')}
function eligible(){try{return demoOrigin()&&assurance?.currentLevel==='aal2'&&hasRole('system_admin')&&window.AidMeRoleLens?.demoSystemAdminAggregate?.()}catch{return false}}
function esc(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}}
function friendlyName(code){return ALIASES[String(code||'').trim()]||String(code||'Demo-deltaker')}
function friendlyTaskTitle(title){return String(title||'Oppgave').replace(/Ny interesse\s*[–-]\s*triage/gi,'Ny interesse – første avklaring')}
function fmtDate(v){if(!v)return'Ingen frist';try{return new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v))}catch{return String(v)}}
function stagePhase(stage){const s=String(stage||'VIA').toUpperCase();if(s==='SER')return'SER';if(s==='VIDA')return'VIDA';if(s==='NEW_VIA')return'NEW_VIA';return'VIA'}
function phaseLabel(p){return p==='NEW_VIA'?'ny VÍA':p==='VIA'?'VÍA':p}
function phaseRank(p){return({VIA:0,SER:1,VIDA:2,NEW_VIA:3})[p]??9}
function severityLabel(s){s=String(s||'GREEN').toUpperCase();return s==='RED'?'Kritisk':s==='YELLOW'?'Avklar':'Normal'}
function statusLabel(s){return({OPEN:'Åpen',IN_PROGRESS:'I gang',WAITING:'Venter',DONE:'Ferdig'})[String(s||'OPEN').toUpperCase()]||String(s||'')}

function ensureStyle(){
  if(document.querySelector('#demo-showcase-hotfix-style'))return;
  const s=document.createElement('style');s.id='demo-showcase-hotfix-style';s.textContent=`
    .demo-showcase-task-intro{padding:12px 14px;margin:0 0 12px;border:1px solid rgba(200,164,93,.42);border-radius:14px;background:rgba(200,164,93,.08);font-size:13px;line-height:1.45;color:#47575b}
    .demo-showcase-phase-filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
    .demo-showcase-phase-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:18px 2px 8px;padding-bottom:6px;border-bottom:1px solid #dedbd2}
    .demo-showcase-phase-title:first-of-type{margin-top:4px}.demo-showcase-phase-title b{font-size:15px;color:#123f3d}.demo-showcase-phase-title span{font-size:11px;color:#6b777b}
    .demo-showcase-task-row small{line-height:1.35}.demo-showcase-task-row .task-meta{align-items:flex-end}
    .demo-showcase-chart-note{margin:8px 0 0;font-size:12px;color:#657379;line-height:1.4}
    .demo-showcase-chart-legend{display:flex;gap:8px 14px;flex-wrap:wrap;margin-top:10px}.demo-showcase-chart-legend span{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#34444a}.demo-showcase-chart-legend i{width:22px;border-top:3px solid currentColor}
    #view-analysis.demo-showcase-analysis .analysis-controls{grid-template-columns:1fr 1fr}#view-analysis.demo-showcase-analysis .toggle-label{display:none!important}
    #view-analysis.demo-showcase-analysis .chart-frame{height:320px!important;min-height:320px!important;padding:8px!important}
    @media(max-width:700px){#view-analysis.demo-showcase-analysis .chart-frame{height:292px!important;min-height:292px!important}.demo-showcase-task-row{grid-template-columns:auto 1fr!important}.demo-showcase-task-row .task-meta{grid-column:2;flex-direction:row!important;align-items:center!important;flex-wrap:wrap}}
  `;document.head.appendChild(s)
}

function inShowcaseWindow(point){const d=String(point?.date||'');return d>=SHOWCASE_START&&d<=SHOWCASE_END}
async function metricData(metric){
  const body={metric,days:30};if(showcasePilotId)body.pilotId=showcasePilotId;
  const {data,error}=await client.functions.invoke('aggregate-analysis',{body});
  if(error||data?.error)throw new Error(data?.error||'AGGREGATE_FAILED');
  if(data?.pilot?.id)showcasePilotId=data.pilot.id;
  const points=(data?.points||[]).filter(inShowcaseWindow).map(p=>({date:String(p.date),value:Number(p.value),n:Number(p.n||0)})).filter(p=>Number.isFinite(p.value));
  return{data,points};
}
function drawShowcaseChart(canvas,series,{compact=false}={}){
  if(!canvas)return;const frame=canvas.parentElement,rect=(frame||canvas).getBoundingClientRect();if(rect.width<80){setTimeout(()=>drawShowcaseChart(canvas,series,{compact}),80);return}
  const w=Math.max(280,Math.floor(rect.width-(frame?16:0))),h=compact?(window.innerWidth<=700?210:235):(window.innerWidth<=700?278:320),dpr=Math.min(2.25,Math.max(1,window.devicePixelRatio||1));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.setProperty('width','100%','important');canvas.style.setProperty('height',`${h}px`,'important');
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const pad={l:38,r:12,t:14,b:34},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
  ctx.font='600 11px system-ui';ctx.textBaseline='middle';ctx.textAlign='right';for(let tick=0;tick<=10;tick+=2){const py=pad.t+ch*(1-tick/10);ctx.strokeStyle='#d6dad7';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(w-pad.r,py);ctx.stroke();ctx.fillStyle='#536268';ctx.fillText(String(tick),pad.l-8,py)}
  const dates=[...new Set(series.flatMap(s=>s.values.map(v=>v.date)))].sort();if(!dates.length){ctx.textAlign='left';ctx.fillStyle='#536268';ctx.font='650 13px system-ui';ctx.fillText('Ingen visbare demomålinger.',pad.l,pad.t+24);return}
  const x=d=>pad.l+(dates.length===1?cw/2:cw*dates.indexOf(d)/(dates.length-1)),y=v=>pad.t+ch*(1-Math.max(0,Math.min(10,Number(v)))/10);
  series.forEach(s=>{const color=s.color||'#123f3d';ctx.strokeStyle=color;ctx.lineWidth=3;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();s.values.forEach((v,i)=>{const px=x(v.date),py=y(v.value);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();s.values.forEach(v=>{const px=x(v.date),py=y(v.value);ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,3.4,0,Math.PI*2);ctx.fill()})});
  ctx.fillStyle='#536268';ctx.font='600 10px system-ui';ctx.textBaseline='alphabetic';dates.forEach((d,i)=>{if(dates.length>6&&i!==0&&i!==dates.length-1&&i%2)return;const dt=new Date(`${d}T12:00:00`),label=new Intl.DateTimeFormat('nb-NO',{day:'numeric',month:'short'}).format(dt);ctx.textAlign=i===0?'left':i===dates.length-1?'right':'center';ctx.fillText(label,x(d),h-8)})
}
async function renderShowcaseOverview(){
  if(!eligible())return false;ensureStyle();const canvas=document.querySelector('#overviewChart'),legend=document.querySelector('#overviewLegend');if(!canvas||!legend)return false;
  try{const [agency,belonging,direction]=await Promise.all(['agency','belonging','direction'].map(metricData));const sets=[['agency',agency],['belonging',belonging],['direction',direction]].filter(([,r])=>r.points.length);const series=sets.map(([m,r])=>({label:SHOWCASE_METRICS[m],color:SHOWCASE_COLORS[m],values:r.points}));drawShowcaseChart(canvas,series,{compact:true});legend.className='chart-legend demo-showcase-chart-legend';legend.innerHTML=series.map(s=>`<span style="color:${s.color}"><i></i><em style="font-style:normal;color:#34444a">${esc(s.label)}</em></span>`).join('');const old=canvas.parentElement?.querySelector('.chart-readout');if(old)old.remove();return true}catch{drawShowcaseChart(canvas,[],{compact:true});legend.innerHTML='<span class="privacy-note">Kunne ikke hente syntetisk demodata akkurat nå.</span>';return false}
}
function prepareAnalysisControls(){
  const view=document.querySelector('#view-analysis');if(!view)return;view.classList.add('demo-showcase-analysis');
  const metric=document.querySelector('#analysisMetric');if(metric){const current=SHOWCASE_METRICS[metric.value]?metric.value:'belonging';metric.innerHTML=Object.entries(SHOWCASE_METRICS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('');metric.value=current}
  const period=document.querySelector('#analysisPeriod');if(period){period.innerHTML='<option value="30">Mai 2027 · demoforløpet</option>';period.value='30'}
  const average=document.querySelector('#showAverage');average?.closest('label')?.classList.add('hidden');
}
async function renderShowcaseAnalysis(){
  if(!eligible())return false;ensureStyle();prepareAnalysisControls();const metric=document.querySelector('#analysisMetric')?.value||'belonging',canvas=document.querySelector('#analysisChart'),host=document.querySelector('#analysisParticipants');if(!canvas||!host)return false;
  host.innerHTML='<div class="aggregate-analysis-note">Henter lagrede demomålinger…</div>';
  try{const {data,points}=await metricData(metric);drawShowcaseChart(canvas,points.length?[{label:SHOWCASE_METRICS[metric],color:SHOWCASE_COLORS[metric],values:points}]:[],{compact:false});host.innerHTML=`<div class="aggregate-analysis-note"><strong>${esc(data?.pilot?.name||'Camino Portugués · Demo 2027')} · ${esc(SHOWCASE_METRICS[metric])}</strong>Lagrede, syntetiske gruppemålinger. Ingen individuelle deltakere vises.<div class="aggregate-analysis-meta"><span>${Number(data?.cohortSize||8)} deltakere</span><span>${points.length} måledatoer</span><span>3. mai → 18. mai 2027</span></div></div>`;document.querySelector('#aggregateAnalysisSummary')?.replaceChildren();return true}catch{host.innerHTML='<div class="aggregate-analysis-note"><strong>Kunne ikke hente demomålingen.</strong>Prøv et annet mål eller last siden på nytt.</div>';drawShowcaseChart(canvas,[],{compact:false});return false}
}

async function snapshot(){
  if(showcaseSnapshot)return showcaseSnapshot;if(snapshotPromise)return snapshotPromise;
  snapshotPromise=(async()=>{const ids=Array.isArray(participants)?participants.map(p=>p.id).filter(Boolean):[];let r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}});if(r.error||r.data?.error){await client.functions.invoke('uat-overview-command',{body:{action:'ACTIVATE',reason:'Demovisning – syntetisk oppgaveoversikt i alle faser'}});r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}})}if(r.error||r.data?.error)throw new Error(r.data?.error||'UAT_SNAPSHOT_FAILED');showcaseSnapshot=r.data;return showcaseSnapshot})().finally(()=>{snapshotPromise=null});return snapshotPromise
}
function taskPhase(task,participantMap){if(!task.participant_id)return'VIA';const p=participantMap.get(String(task.participant_id));return stagePhase(p?.stage)}
function taskParticipant(task,participantMap){const p=participantMap.get(String(task.participant_id));return p?friendlyName(p.code_name):'Program / mottak'}
function taskCard(task,participantMap,{live=false}={}){
  const phase=taskPhase(task,participantMap),sev=String(task.severity||'GREEN').toUpperCase(),name=taskParticipant(task,participantMap),id=String(task.id||'');
  return `<button type="button" class="task-row demo-showcase-task-row" ${live?`data-live-task-id="${esc(id)}"`:`data-showcase-task-id="${esc(id)}"`}><i class="task-dot ${esc(sev)}"></i><div><b>${esc(friendlyTaskTitle(task.title))}</b><small>${esc(name)} · ${esc(phaseLabel(phase))}</small></div><div class="task-meta"><span class="pill ${esc(sev)}">${esc(severityLabel(sev))}</span><span class="pill">${esc(fmtDate(task.due_at))}</span></div></button>`
}
function bindPhaseFilters(){document.querySelectorAll('[data-demo-phase]').forEach(b=>b.addEventListener('click',()=>{phaseFilter=b.dataset.demoPhase||'ALL';renderShowcaseTasks()}))}
function showTaskDetail(task,participantMap){
  const dialog=document.querySelector('#taskDialog');if(!dialog)return;const phase=taskPhase(task,participantMap),name=taskParticipant(task,participantMap),sev=String(task.severity||'GREEN').toUpperCase();
  const eyebrow=document.querySelector('#taskDialogEyebrow'),title=document.querySelector('#taskDialogTitle'),body=document.querySelector('#taskDialogBody');if(eyebrow)eyebrow.textContent=`${phaseLabel(phase)} · ${statusLabel(task.status)}`;if(title)title.textContent=friendlyTaskTitle(task.title);if(body)body.innerHTML=`<p>Dette er en syntetisk demooppgave i ${esc(phaseLabel(phase))}-fasen.</p><div class="task-context-grid"><div class="context-cell"><span>Deltaker</span><b>${esc(name)}</b></div><div class="context-cell"><span>Fase</span><b>${esc(phaseLabel(phase))}</b></div><div class="context-cell"><span>Status</span><b>${esc(statusLabel(task.status))}</b></div><div class="context-cell"><span>Prioritet</span><b>${esc(severityLabel(sev))}</b></div><div class="context-cell"><span>Frist</span><b>${esc(fmtDate(task.due_at))}</b></div><div class="context-cell"><span>Type</span><b>${esc(task.task_type||'Arbeidsoppgave')}</b></div></div><p class="privacy-note">Superbrukerens demovisning gir oversikt over syntetiske arbeidsflyter. Faglige endringer krever fortsatt riktig operativ rolle.</p>`;document.querySelector('#taskStart')?.classList.add('hidden');document.querySelector('#taskDone')?.classList.add('hidden');document.querySelector('#taskDialogMessage').textContent='';dialog.showModal()}
async function renderShowcaseTasks(){
  if(!eligible()||!document.querySelector('#view-tasks')?.classList.contains('active'))return false;ensureStyle();const list=document.querySelector('#taskList'),row=document.querySelector('#view-tasks .task-filter-row');if(!list||!row)return false;
  const heading=document.querySelector('#tasksHeading');if(heading)heading.textContent='Åpne oppgaver · alle faser';row.innerHTML=['ALL','VIA','SER','VIDA','NEW_VIA'].map(p=>`<button type="button" class="chip${phaseFilter===p?' active':''}" data-demo-phase="${p}">${p==='ALL'?'Alle faser':phaseLabel(p)}</button>`).join('');bindPhaseFilters();list.innerHTML='<div class="demo-showcase-task-intro">Henter syntetiske oppgaver fra hele VÍA → SER → VIDA → ny VÍA…</div>';
  try{const snap=await snapshot(),participantMap=new Map((snap.participants||[]).map(p=>[String(p.id),p]));const safe=(snap.tasks||[]).filter(t=>['OPEN','IN_PROGRESS','WAITING'].includes(String(t.status||'').toUpperCase()));const liveIntakes=(tasks||[]).filter(t=>!t.participant_id&&['OPEN','IN_PROGRESS','WAITING'].includes(String(t.status||'').toUpperCase())&&/interesse/i.test(String(t.title||''))).map(t=>({...t,__live:true}));let rows=[...liveIntakes,...safe].map(t=>({...t,__phase:taskPhase(t,participantMap)}));if(phaseFilter!=='ALL')rows=rows.filter(t=>t.__phase===phaseFilter);rows.sort((a,b)=>phaseRank(a.__phase)-phaseRank(b.__phase)||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));
    const counts=new Map();for(const t of rows)counts.set(t.__phase,(counts.get(t.__phase)||0)+1);let html='<div class="demo-showcase-task-intro"><strong>Demovisning:</strong> syntetiske arbeidsoppgaver på tvers av hele deltakerreisen. Tekniske tilgangsgrenser er fortsatt aktive.</div>';let current='';for(const t of rows){if(t.__phase!==current){current=t.__phase;html+=`<div class="demo-showcase-phase-title"><b>${esc(phaseLabel(current))}</b><span>${counts.get(current)||0} åpne</span></div>`}html+=taskCard(t,participantMap,{live:!!t.__live})}list.innerHTML=html||'<p>Ingen åpne syntetiske oppgaver i denne fasen.</p>';
    list.querySelectorAll('[data-showcase-task-id]').forEach(b=>b.addEventListener('click',()=>{const t=safe.find(x=>String(x.id)===String(b.dataset.showcaseTaskId));if(t)showTaskDetail(t,participantMap)}));list.querySelectorAll('[data-live-task-id]').forEach(b=>b.addEventListener('click',()=>openTask(b.dataset.liveTaskId)));
    const openAll=[...liveIntakes,...safe],red=openAll.filter(t=>String(t.severity).toUpperCase()==='RED').length,yellow=openAll.filter(t=>String(t.severity).toUpperCase()==='YELLOW').length;if(typeof navBadgeMarkup==='function'){const badge=document.querySelector('#badgeTasks');if(badge)badge.innerHTML=navBadgeMarkup(red,yellow)}return true
  }catch{list.innerHTML='<div class="demo-showcase-task-intro"><strong>Kunne ikke hente full demokø.</strong> Bekreft AAL2 og last siden på nytt.</div>';return false}
}

function polishVisibleCopy(){
  if(!eligible())return;document.querySelectorAll('#priorityQueue .task-row b,#taskList .task-row b').forEach(el=>{if(/Ny interesse\s*[–-]\s*triage/i.test(el.textContent||''))el.textContent=friendlyTaskTitle(el.textContent)});
}
function installWrappers(){
  if(wrappersInstalled||typeof renderAnalysis!=='function'||typeof renderOverviewChart!=='function'||typeof show!=='function')return;wrappersInstalled=true;
  const priorAnalysis=renderAnalysis;renderAnalysis=function(){if(eligible())return renderShowcaseAnalysis();return priorAnalysis()};
  const priorOverview=renderOverviewChart;renderOverviewChart=function(){if(eligible())return renderShowcaseOverview();return priorOverview()};
  const priorShow=show;show=function(name){const out=priorShow(name);if(eligible()){if(name==='analysis')setTimeout(renderShowcaseAnalysis,45);if(name==='overview')setTimeout(renderShowcaseOverview,45);if(name==='tasks')setTimeout(renderShowcaseTasks,60);setTimeout(polishVisibleCopy,70)}return out};
  ['analysisMetric','analysisPeriod'].forEach(id=>document.querySelector(`#${id}`)?.addEventListener('change',()=>{if(eligible())setTimeout(renderShowcaseAnalysis,70)}));
}
function apply(){if(!eligible())return;ensureStyle();installWrappers();prepareAnalysisControls();polishVisibleCopy();if(document.querySelector('#view-overview')?.classList.contains('active'))renderShowcaseOverview();if(document.querySelector('#view-analysis')?.classList.contains('active'))renderShowcaseAnalysis();if(document.querySelector('#view-tasks')?.classList.contains('active'))renderShowcaseTasks()}

const host=document.querySelector('#appView');if(host)new MutationObserver(()=>{polishVisibleCopy()}).observe(host,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,120));window.addEventListener('pageshow',()=>setTimeout(apply,220));window.addEventListener('resize',()=>{if(!eligible())return;if(document.querySelector('#view-analysis')?.classList.contains('active'))setTimeout(renderShowcaseAnalysis,160);if(document.querySelector('#view-overview')?.classList.contains('active'))setTimeout(renderShowcaseOverview,160)});
setTimeout(apply,650);setTimeout(()=>{wrappersInstalled=false;installWrappers();apply()},1400);
})();
