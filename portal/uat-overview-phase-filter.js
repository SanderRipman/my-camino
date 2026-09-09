(()=>{
'use strict';

const UAT_OVERVIEW_PHASE_FILTER_VERSION='2026-09-09a';
const PHASES=['VÍA','SER','VIDA','ny VÍA'];
const OPEN_STATUSES=new Set(['OPEN','IN_PROGRESS','WAITING']);
let overviewPhase='ALL';
let applying=false;
let restoreQueued=false;

function staffPortal(){try{return !!document.querySelector('#mainNav')&&typeof isStaff==='function'&&isStaff()}catch{return false}}
function aggregateOnly(){try{return !!window.AidMeRoleLens?.aggregateOnly?.()}catch{return false}}
function accessibleParticipants(){try{return Array.isArray(participants)?participants:[]}catch{return[]}}
function accessibleTasks(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function phaseOf(p){
  if(!p)return null;
  try{return stageLabel(p.stage||'VIA')}catch{
    const raw=String(p.stage||'VIA').toUpperCase();
    return raw==='SER'?'SER':raw==='VIDA'?'VIDA':raw==='NEW_VIA'?'ny VÍA':'VÍA';
  }
}
function phaseParticipants(phase=overviewPhase){return phase==='ALL'?accessibleParticipants():accessibleParticipants().filter(p=>phaseOf(p)===phase)}
function participantForTask(task){return accessibleParticipants().find(p=>String(p.id)===String(task?.participant_id))||null}
function participantForRow(row){
  const id=String(row?.dataset?.taskId||'');
  if(id){const task=accessibleTasks().find(t=>String(t.id)===id);const p=participantForTask(task);if(p)return p}
  const text=String(row?.textContent||'');
  return accessibleParticipants().find(p=>p?.code_name&&text.includes(p.code_name))||null;
}
function canFilter(){return staffPortal()&&!aggregateOnly()&&accessibleParticipants().length>0}
function counts(){const out={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};for(const p of accessibleParticipants()){const phase=phaseOf(p);if(phase in out)out[phase]++}return out}
function escapeLocal(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}

function ensureStyles(){
  if(document.querySelector('#uat-overview-phase-filter-style'))return;
  const style=document.createElement('style');style.id='uat-overview-phase-filter-style';style.textContent=`
    #view-overview .compact-process{position:relative}
    #view-overview .uat-overview-filter-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:2px 0 12px}
    #view-overview .uat-overview-filter-reset{appearance:none;background:#efeee8;border:1px solid #d6d5cd;color:#526065;border-radius:999px;padding:6px 10px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
    #view-overview .uat-overview-filter-reset[aria-pressed="true"]{background:#e8eeeb;border-color:#aebfba;color:#173f3b}
    #journeyMini .uat-overview-phase-step{display:grid;grid-template-columns:minmax(72px,auto) 1fr auto;gap:10px;align-items:center;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}
    #journeyMini .uat-overview-phase-step:focus-visible{outline:3px solid rgba(200,164,93,.55);outline-offset:3px}
    #journeyMini .uat-overview-phase-step.uat-filter-selected{border-color:#17685e;box-shadow:0 0 0 2px rgba(23,104,94,.09);background:#eef4f1}
    #journeyMini .uat-overview-phase-step.uat-filter-selected small{color:#365e59}
    #journeyMini .uat-process-count{justify-self:end;min-width:28px;text-align:center;background:#efeee8;border-color:#d6d5cd;color:#526065;font-weight:800}
    #view-overview .uat-filter-empty{display:none;margin:10px 0 0;color:#68757a;font-size:14px}
    #view-overview.uat-overview-phase-filtered .uat-filter-empty{display:block}
    .uat-context-phase-pill{background:#efeee8!important;border-color:#d6d5cd!important;color:#526065!important;font-weight:800!important}
    @media(max-width:600px){
      #journeyMini .uat-overview-phase-step{grid-template-columns:minmax(62px,auto) 1fr auto;gap:7px}
      #journeyMini .uat-overview-phase-step small{font-size:13px;line-height:1.25}
      #journeyMini .uat-process-count{min-width:26px;padding-inline:7px}
    }
  `;document.head.appendChild(style);
}

function processHost(){return document.querySelector('#journeyMini')}
function processCard(){return processHost()?.closest('.compact-process')||null}
function ensureProcessControls(){
  if(!staffPortal())return;
  const host=processHost(),card=processCard();if(!host||!card)return;
  const steps=[...host.querySelectorAll('.process-step')];if(steps.length<PHASES.length)return;
  const phaseCounts=counts(),interactive=canFilter();
  let head=card.querySelector('.uat-overview-filter-head');
  if(!head){
    head=document.createElement('div');head.className='uat-overview-filter-head';
    head.innerHTML='<small data-uat-overview-filter-label>Generell status · alle tilgjengelige faser</small><button type="button" class="uat-overview-filter-reset" aria-pressed="true">Generell oversikt</button>';
    host.insertAdjacentElement('beforebegin',head);
    head.querySelector('button').addEventListener('click',()=>setOverviewPhase('ALL',{scroll:false}));
  }
  const label=head.querySelector('[data-uat-overview-filter-label]'),reset=head.querySelector('.uat-overview-filter-reset');
  if(label)label.textContent=overviewPhase==='ALL'?'Generell status · alle tilgjengelige faser':`Viser ${overviewPhase} · kun innen din eksisterende tilgang`;
  if(reset)reset.setAttribute('aria-pressed',overviewPhase==='ALL'?'true':'false');
  steps.slice(0,PHASES.length).forEach((step,i)=>{
    const phase=PHASES[i];step.classList.remove('done','current');step.classList.add('uat-overview-phase-step');step.dataset.uatOverviewPhase=phase;
    step.classList.toggle('uat-filter-selected',overviewPhase===phase);
    step.setAttribute('aria-pressed',overviewPhase===phase?'true':'false');
    if(interactive){step.setAttribute('role','button');step.tabIndex=0;step.setAttribute('aria-label',`Vis Oversikt for ${phase}`)}else{step.removeAttribute('role');step.removeAttribute('tabindex');step.removeAttribute('aria-label')}
    let count=step.querySelector('.uat-process-count');if(!count){count=document.createElement('span');count.className='pill uat-process-count';count.setAttribute('aria-label',`Tilgjengelige deltakere i ${phase}`);step.appendChild(count)}count.textContent=String(phaseCounts[phase]||0);
    if(step.dataset.uatOverviewPhaseBound!=='1'){
      step.dataset.uatOverviewPhaseBound='1';
      const choose=()=>{if(canFilter())setOverviewPhase(phase,{scroll:true})};
      step.addEventListener('click',choose);step.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&canFilter()){e.preventDefault();choose()}});
    }
  });
  let empty=card.querySelector('.uat-filter-empty');if(!empty){empty=document.createElement('p');empty.className='uat-filter-empty';empty.textContent='Ingen tilgjengelige deltakere eller oppgaver i denne fasen.';card.appendChild(empty)}
}

function filteredParticipantIds(){return new Set(phaseParticipants().map(p=>String(p.id)))}
function filteredOpenTasks(){
  if(overviewPhase==='ALL')return accessibleTasks().filter(t=>OPEN_STATUSES.has(t.status));
  const ids=filteredParticipantIds();return accessibleTasks().filter(t=>OPEN_STATUSES.has(t.status)&&t.participant_id&&ids.has(String(t.participant_id)));
}
function taskIsOverdue(t){try{return !!t?.due_at&&OPEN_STATUSES.has(t.status)&&new Date(t.due_at)<new Date()}catch{return false}}
function taskSeverity(t){try{return typeof severity==='function'?severity(t):String(t?.severity||'GREEN').toUpperCase()}catch{return String(t?.severity||'GREEN').toUpperCase()}}

function applyMetrics(){
  if(overviewPhase==='ALL')return;
  const people=phaseParticipants(),open=filteredOpenTasks();
  const set=(id,value)=>{const el=document.querySelector(id);if(el)el.textContent=String(value)};
  set('#metricOpen',open.length);set('#metricRed',open.filter(t=>taskSeverity(t)==='RED'||taskIsOverdue(t)).length);set('#metricYellow',open.filter(t=>taskSeverity(t)==='YELLOW'&&!taskIsOverdue(t)).length);set('#metricParticipants',people.length);
  const mix=document.querySelector('#metricPhaseMix');if(mix)mix.textContent=`${overviewPhase} · innen tilgjengelig scope`;
}
function applyTaskRows(){
  if(overviewPhase==='ALL')return;
  const rows=[...document.querySelectorAll('#priorityQueue .task-row')];let shown=0;
  for(const row of rows){const p=participantForRow(row),match=!!p&&phaseOf(p)===overviewPhase;row.hidden=!match;row.dataset.uatOverviewPhaseHidden=match?'0':'1';if(match)shown++}
  const host=document.querySelector('#priorityQueue');if(host){let empty=host.querySelector('[data-uat-overview-queue-empty]');if(!empty){empty=document.createElement('p');empty.dataset.uatOverviewQueueEmpty='1';empty.textContent='Ingen oppgaver i valgt fase.';host.appendChild(empty)}empty.hidden=shown>0}
}
function applyPulseRows(){
  if(overviewPhase==='ALL')return;
  const rows=[...document.querySelectorAll('#groupPulse .pulse-row')];let shown=0;
  for(const row of rows){const code=row.querySelector('b')?.textContent?.trim(),p=accessibleParticipants().find(x=>x.code_name===code),match=!!p&&phaseOf(p)===overviewPhase;row.hidden=!match;row.dataset.uatOverviewPhaseHidden=match?'0':'1';if(match)shown++}
  const host=document.querySelector('#groupPulse');if(host){let empty=host.querySelector('[data-uat-overview-pulse-empty]');if(!empty){empty=document.createElement('p');empty.dataset.uatOverviewPulseEmpty='1';empty.textContent='Ingen deltakere med pulsdata i valgt fase.';host.appendChild(empty)}empty.hidden=shown>0}
}
function applyChart(){
  if(overviewPhase==='ALL'||aggregateOnly())return;
  try{
    if(typeof participantSeries!=='function'||typeof drawChart!=='function')return;
    const ids=filteredParticipantIds(),series=participantSeries('agency',30).filter(s=>ids.has(String(s.id))).slice(0,3);
    drawChart(document.querySelector('#overviewChart'),series);
    const legend=document.querySelector('#overviewLegend');if(legend)legend.innerHTML=series.map(s=>`<span class="legend-item"><i class="legend-swatch" style="background:${s.color}"></i>${escapeLocal(s.label)}</span>`).join('');
  }catch{}
}
function applyEmptyState(){
  const view=document.querySelector('#view-overview');if(!view)return;
  const empty=phaseParticipants().length===0&&filteredOpenTasks().length===0;
  view.classList.toggle('uat-overview-phase-filtered',overviewPhase!=='ALL'&&empty);
}
function applyFilteredOverview(){if(overviewPhase==='ALL'||!canFilter())return;applyMetrics();applyTaskRows();applyPulseRows();applyChart();applyEmptyState()}

function clearFilteredDom(){
  document.querySelectorAll('[data-uat-overview-phase-hidden]').forEach(el=>{el.hidden=false;el.removeAttribute('data-uat-overview-phase-hidden')});
  document.querySelectorAll('[data-uat-overview-queue-empty],[data-uat-overview-pulse-empty]').forEach(el=>el.remove());
  document.querySelector('#view-overview')?.classList.remove('uat-overview-phase-filtered');
}
function restoreGeneral(){
  clearFilteredDom();
  if(restoreQueued)return;restoreQueued=true;
  setTimeout(()=>{restoreQueued=false;try{if(typeof renderAll==='function')renderAll()}catch{}},0);
}
function setOverviewPhase(phase,{scroll=false}={}){
  const next=PHASES.includes(phase)?phase:'ALL';if(next===overviewPhase&&next!=='ALL')overviewPhase='ALL';else overviewPhase=next;
  if(overviewPhase==='ALL')restoreGeneral();else{clearFilteredDom();apply()}
  if(scroll&&overviewPhase!=='ALL')setTimeout(()=>document.querySelector('#view-overview .metric-grid')?.scrollIntoView({behavior:'smooth',block:'start'}),20);
}

function apply(){
  if(applying)return;applying=true;
  try{ensureStyles();ensureProcessControls();applyFilteredOverview()}finally{applying=false}
}

const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(apply,30)});observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));window.addEventListener('pageshow',()=>setTimeout(apply,30));
[0,140,360,800,1500].forEach(ms=>setTimeout(apply,ms));
})();
