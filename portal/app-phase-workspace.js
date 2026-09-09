(()=>{
'use strict';

const PHASE_WORKSPACE_VERSION='2026-09-09c';
const PHASES=['VÍA','SER','VIDA','ny VÍA'];
const OPEN=new Set(['OPEN','IN_PROGRESS','WAITING']);
let selectedPhase='ALL';
let continuity=null;
let continuityLoading=false;
let applying=false;

function staff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function demoOrigin(){return location.hostname==='demo.aidme.no'||location.hostname.endsWith('--mycamino-demo.netlify.app')||location.hostname==='mycamino-demo.netlify.app'}
function aggregateOnly(){try{return !!window.AidMeRoleLens?.aggregateOnly?.()}catch{return false}}
function roles(){try{return new Set((accessGrants||[]).filter(activeGrant).map(g=>String(g.role_code||'')))}catch{return new Set()}}
function people(){try{return Array.isArray(participants)?participants:[]}catch{return[]}}
function work(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function openTask(t){return OPEN.has(String(t?.status||''))}
function taskKey(t){return String(t?.workflow_key||'').toLowerCase()}
function taskType(t){return String(t?.task_type||'').toUpperCase()}
function taskTitle(t){return String(t?.title||'').toLowerCase()}
function participantPhase(p){try{return stageLabel(p?.stage||'VIA')}catch{const s=String(p?.stage||'VIA').toUpperCase();return s==='SER'?'SER':s==='VIDA'?'VIDA':s==='NEW_VIA'?'ny VÍA':'VÍA'}}
function participantForTask(t){return people().find(p=>String(p.id)===String(t?.participant_id))||null}
function taskPhase(t){
  const k=taskKey(t),ty=taskType(t),x=taskTitle(t);
  if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate'].includes(k)||['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE'].includes(ty)||/interesse|vía|go.no.go|pilot.go|vida.eier/.test(x))return'VÍA';
  if(k.startsWith('ser_')||['SER_ADAPTATION','INCIDENT_FOLLOWUP'].includes(ty)||/etappe|videre vandring|ser /.test(x))return'SER';
  if((k.startsWith('vida_')&&!k.includes('new_via'))||ty==='VIDA_FOLLOWUP'||/72t|72 timer|14 dag|30 dag|90 dag/.test(x))return'VIDA';
  if(['new_via','new_via_review'].includes(k)||ty==='VIA_NEXT'||/ny vía|neste retning/.test(x))return'ny VÍA';
  const p=participantForTask(t);return p?participantPhase(p):null;
}
function needsClarification(t){
  const k=taskKey(t),ty=taskType(t),x=taskTitle(t);
  if(!openTask(t))return false;
  if(String(t.status).toUpperCase()==='WAITING')return true;
  if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate','ser_daily','ser_incident','vida_72h','new_via','new_via_review'].includes(k))return true;
  if(['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE','SER_ADAPTATION','INCIDENT_FOLLOWUP','VIDA_FOLLOWUP','VIA_NEXT'].includes(ty))return true;
  return /avklar|vurder|triage|vilkår|vida.eier|neste retning|handling mangler/.test(x);
}
window.AidMeAttentionSemantics=Object.assign({},window.AidMeAttentionSemantics||{},{taskNeedsClarification:needsClarification,taskPhase});

function overdue(t){return openTask(t)&&!!t?.due_at&&new Date(t.due_at)<new Date()}
function critical(t){try{return overdue(t)||severity(t)==='RED'}catch{return overdue(t)||String(t?.severity||'').toUpperCase()==='RED'}}
function actionable(t){
  const r=roles(),k=taskKey(t),ty=taskType(t),has=(...xs)=>xs.some(x=>r.has(x));
  if(k.startsWith('intake_triage:')||k==='via_first_contact')return has('program_lead','via_owner');
  if(['individual_go','go_conditions'].includes(k)||['VIA_REVIEW','GO_CONDITION'].includes(ty))return has('program_lead','via_owner','clinical_professional');
  if(['pilot_go','qa_project_program_gate'].includes(k)||ty==='VIDA_OWNER_GATE')return has('project_owner','program_lead','via_owner');
  if(k==='ser_incident'||ty==='INCIDENT_FOLLOWUP')return has('program_lead','ser_lead','logistics','clinical_professional');
  if(k==='ser_daily'||ty==='SER_ADAPTATION')return has('program_lead','ser_lead','logistics');
  if(k==='vida_72h'||ty==='VIDA_FOLLOWUP')return has('program_lead','vida_owner');
  if(['new_via','new_via_review'].includes(k)||ty==='VIA_NEXT')return has('program_lead','via_owner');
  return has('program_lead');
}
function localPhaseCounts(){const out={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};for(const p of people()){const ph=participantPhase(p);if(ph in out)out[ph]++}return out}
function phaseCounts(){const local=localPhaseCounts(),remote=continuity?.phase_counts||{};return Object.fromEntries(PHASES.map(p=>[p,Number(remote[p]??local[p]??0)]))}
function localOpen(phase=selectedPhase){return work().filter(t=>openTask(t)&&(phase==='ALL'||taskPhase(t)===phase))}
function clarificationCount(phase=selectedPhase){
  if(phase==='ALL'&&Number.isFinite(Number(continuity?.clarification_total)))return Number(continuity.clarification_total);
  const remote=Number(continuity?.clarifications_by_phase?.[phase]);
  if(phase!=='ALL'&&Number.isFinite(remote))return remote;
  return localOpen(phase).filter(needsClarification).length;
}
async function loadContinuity(){
  if(!demoOrigin()||!staff()||continuityLoading||continuity||assurance?.currentLevel!=='aal2')return;
  continuityLoading=true;
  try{const {data,error}=await client.functions.invoke('uat-continuity-command',{body:{action:'SNAPSHOT'}});if(!error&&data?.ok&&data?.guardrails?.aggregate_only)continuity=data}catch{}finally{continuityLoading=false;setTimeout(apply,0)}
}
function esc(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}

function ensureStyles(){
  if(document.querySelector('#aidme-phase-workspace-style'))return;
  const s=document.createElement('style');s.id='aidme-phase-workspace-style';s.textContent=`
    #overviewPhaseStrip,#taskPhaseFilter,#participantPhaseFilter{display:none!important}
    .participant-card .uat-phase-pill{display:none!important}
    .aidme-context-phase-pill{white-space:nowrap;margin-left:2px;background:#efeee8!important;border-color:#d6d5cd!important;color:#526065!important;font-weight:800!important}
    #view-overview .compact-process{position:relative}
    #view-overview .phase-workspace-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:2px 0 12px}
    #view-overview .phase-workspace-reset{appearance:none;background:#efeee8;border:1px solid #d6d5cd;color:#526065;border-radius:999px;padding:6px 10px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}
    #view-overview .phase-workspace-reset[aria-pressed="true"]{background:#e8eeeb;border-color:#aebfba;color:#173f3b}
    #journeyMini .process-step{cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease}
    #journeyMini .process-step:focus-visible{outline:3px solid rgba(200,164,93,.55);outline-offset:3px}
    #journeyMini .process-step.phase-selected{border-color:#17685e;box-shadow:0 0 0 2px rgba(23,104,94,.09);background:#eef4f1}
    #journeyMini .phase-count{margin-left:auto;min-width:28px;text-align:center;background:#efeee8!important;border-color:#d6d5cd!important;color:#526065!important;font-weight:800}
    #view-overview [data-phase-hidden="1"]{display:none!important}
    #view-overview .phase-workspace-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    #view-overview .phase-workspace-note{font-size:12px;color:#657176;margin-top:8px;line-height:1.4}
    @media(max-width:600px){#journeyMini .phase-count{min-width:26px;padding-inline:7px}}
  `;document.head.appendChild(s);
}
function processCard(){return document.querySelector('#journeyMini')?.closest('.compact-process')||null}
function ensureProcess(){
  const host=document.querySelector('#journeyMini'),card=processCard();if(!staff()||!host||!card)return;
  const counts=phaseCounts(),steps=[...host.querySelectorAll('.process-step')].slice(0,4);if(steps.length<4)return;
  let head=card.querySelector('.phase-workspace-head');if(!head){head=document.createElement('div');head.className='phase-workspace-head';head.innerHTML='<small data-phase-label>Generell status · hele løpet</small><button type="button" class="phase-workspace-reset" aria-pressed="true">Generell oversikt</button>';host.insertAdjacentElement('beforebegin',head)}
  const label=head.querySelector('[data-phase-label]'),reset=head.querySelector('.phase-workspace-reset');if(label)label.textContent=selectedPhase==='ALL'?'Generell status · hele løpet':`Viser ${selectedPhase} · arbeidsflate etter rolle og scope`;if(reset)reset.setAttribute('aria-pressed',selectedPhase==='ALL'?'true':'false');
  steps.forEach((step,i)=>{const ph=PHASES[i];step.dataset.phaseWorkspace=ph;step.classList.toggle('phase-selected',selectedPhase===ph);step.setAttribute('role','button');step.tabIndex=0;step.setAttribute('aria-pressed',selectedPhase===ph?'true':'false');step.setAttribute('aria-label',`Vis arbeidsflate for ${ph}`);let count=step.querySelector('.phase-count');if(!count){count=document.createElement('span');count.className='pill phase-count';step.appendChild(count)}const value=String(counts[ph]||0);if(count.textContent!==value)count.textContent=value});
}
function decorateTaskRows(){
  if(!staff())return;const map=new Map(work().map(t=>[String(t.id),t]));
  document.querySelectorAll('#priorityQueue .task-row[data-task-id],#taskList .task-row[data-task-id]').forEach(row=>{const t=map.get(String(row.dataset.taskId||'')),meta=row.querySelector('.task-meta');if(!t||!meta)return;const ph=taskPhase(t);let pill=meta.querySelector('.aidme-context-phase-pill');if(!ph){pill?.remove();return}if(!pill){pill=document.createElement('span');pill.className='pill aidme-context-phase-pill';pill.setAttribute('aria-label','Fase');meta.appendChild(pill)}if(pill.textContent!==ph)pill.textContent=ph});
}
function setMetric(id,value){const e=document.querySelector(id);if(e)e.textContent=String(value)}
function metricLabel(index,label,hint){const c=document.querySelectorAll('#view-overview .metric-grid .metric')[index];if(!c)return;const a=c.querySelector('span'),b=c.querySelector('small');if(a)a.textContent=label;if(b)b.textContent=hint}
function applyMetrics(){
  if(!staff())return;const open=localOpen(),clar=clarificationCount(),mine=open.filter(needsClarification).filter(actionable).length;
  if(selectedPhase==='ALL'){
    setMetric('#metricYellow',clar);metricLabel(2,'Trenger avklaring',demoOrigin()&&continuity?`${clar} beslutnings-/avklaringspunkter i hele demo-løpet`:`${clar} beslutnings-/avklaringspunkter innen synlig arbeidsflate`);return;
  }
  const counts=phaseCounts();setMetric('#metricOpen',open.length);setMetric('#metricRed',open.filter(critical).length);setMetric('#metricYellow',clar);setMetric('#metricParticipants',counts[selectedPhase]||0);
  metricLabel(0,'Åpne oppgaver','tilgjengelig i valgt arbeidsflate');metricLabel(1,'Kritisk / forfalt','krever oppmerksomhet');metricLabel(2,'Trenger avklaring',clar?`${mine} i din rolle · ${Math.max(0,clar-mine)} hos andre roller`:'ingen åpne avklaringspunkter');metricLabel(3,'I fasen',aggregateOnly()?'trygg programstatus uten individinnsyn':`${selectedPhase} · detaljer etter scope`);const mix=document.querySelector('#metricPhaseMix');if(mix)mix.textContent=`${selectedPhase} · ${counts[selectedPhase]||0} forløp`;
}
function applyQueue(){
  document.querySelectorAll('#priorityQueue [data-phase-hidden]').forEach(e=>e.removeAttribute('data-phase-hidden'));document.querySelectorAll('#groupPulse [data-phase-hidden]').forEach(e=>e.removeAttribute('data-phase-hidden'));document.querySelectorAll('[data-phase-empty]').forEach(e=>e.remove());if(selectedPhase==='ALL')return;
  const map=new Map(work().map(t=>[String(t.id),t]));let shown=0;document.querySelectorAll('#priorityQueue .task-row[data-task-id]').forEach(row=>{const t=map.get(String(row.dataset.taskId||'')),ok=!!t&&taskPhase(t)===selectedPhase;row.dataset.phaseHidden=ok?'0':'1';if(ok)shown++});const queue=document.querySelector('#priorityQueue');if(queue&&shown===0){const p=document.createElement('p');p.dataset.phaseEmpty='1';p.textContent='Ingen oppgaver i din rolle i denne fasen.';queue.appendChild(p)}
  if(!aggregateOnly())document.querySelectorAll('#groupPulse .pulse-row').forEach(row=>{const code=row.querySelector('b')?.textContent?.trim(),p=people().find(x=>x.code_name===code),ok=!!p&&participantPhase(p)===selectedPhase;row.dataset.phaseHidden=ok?'0':'1'});
}
const COPY={
  'VÍA':['VÍA · før','Avklaring og neste beslutning','Interesse, VÍA, individuell GO/NO-GO og pilotavklaring samles her. Detaljer følger rollen og scopet ditt.','VÍA – avklaringer og beslutninger'],
  'SER':['SER · under','Operativ status og trygg tilpasning','Rute, sikkerhet, tilpasning og neste operative handling – uten å trekke sensitiv VÍA-informasjon inn i SER.','SER – handling nå'],
  'VIDA':['VIDA · etter','Handling hjemme og oppfølging','Levende VIDA-plan, navngitt eier og 72t/14/30/90-oppfølging innen ditt mandat.','VIDA – oppfølging nå'],
  'ny VÍA':['ny VÍA · neste retning','Neste retning og ny avklaring','Erfaringene tas videre til ny retning. Ny VÍA er et aktivt valg, ikke en automatisk ny runde.','ny VÍA – neste steg']
};
function links(){const r=roles(),out=[],add=(t,h)=>out.push(`<a class="ghost compact" href="${h}">${esc(t)}</a>`);if(selectedPhase==='VÍA'){if(r.has('program_lead')||r.has('via_owner'))add('Mottak / interesse','./intake.html');if(r.has('project_owner')||r.has('program_lead'))add('Pilot / avklaringer','./pilot-ops.html');if(!aggregateOnly())add('Deltakere','./#participants')}if(selectedPhase==='SER'){if(r.has('program_lead')||r.has('ser_lead')||r.has('logistics'))add('Operativ dag','./pilot-ops.html');if(r.has('program_lead')||r.has('ser_lead')||r.has('logistics'))add('Hjelp & SOS','./sos.html');if(!aggregateOnly())add('Deltakere','./#participants')}if(selectedPhase==='VIDA'){if(!aggregateOnly())add('Deltakere','./#participants');if(r.has('program_lead')||r.has('vida_owner')||r.has('via_owner'))add('Ansvar / eiere','./owners.html')}if(selectedPhase==='ny VÍA'&&!aggregateOnly())add('Deltakere','./#participants');return out.join('')}
function applyWorkspaceCopy(){
  document.querySelectorAll('.phase-workspace-links,.phase-workspace-note').forEach(e=>e.remove());if(selectedPhase==='ALL')return;const w=COPY[selectedPhase];if(!w)return;const e=document.querySelector('#homeEyebrow'),h=document.querySelector('#homeHeading'),i=document.querySelector('#homeIntro'),b=document.querySelector('#stageBadge'),c=document.querySelector('#contextMini');if(e)e.textContent=w[0];if(h)h.textContent=w[1];if(i)i.textContent=w[2];if(b)b.textContent=selectedPhase;if(c)c.textContent=`${phaseCounts()[selectedPhase]||0} i fasen · detaljer etter rolle`;const q=document.querySelector('#priorityQueue')?.closest('.panel-card')?.querySelector('h3');if(q)q.textContent=w[3];const hero=document.querySelector('#view-overview .hero-panel>div');if(hero){const l=document.createElement('div');l.className='phase-workspace-links';l.innerHTML=links();hero.appendChild(l);const n=document.createElement('p');n.className='phase-workspace-note';n.textContent='Alle ansatte kan følge fase og fremdrift på oversiktsnivå. Sensitive detaljer krever fortsatt eksplisitt rolle/scope.';hero.appendChild(n)}}
function restoreGeneralCopy(){if(selectedPhase!=='ALL')return;const role=String(document.querySelector('#homeEyebrow')?.textContent||'');if(role.includes('· før')||role.includes('· under')||role.includes('· etter')||role.includes('ny VÍA')){try{originalRenderAll()}catch{}}}
function apply(){
  if(applying||!staff())return;applying=true;try{ensureStyles();loadContinuity();ensureProcess();decorateTaskRows();applyMetrics();applyQueue();applyWorkspaceCopy()}finally{applying=false}}
function choose(ph){selectedPhase=PHASES.includes(ph)?(selectedPhase===ph?'ALL':ph):'ALL';document.querySelectorAll('[data-phase-hidden]').forEach(e=>e.removeAttribute('data-phase-hidden'));document.querySelectorAll('[data-phase-empty],.phase-workspace-links,.phase-workspace-note').forEach(e=>e.remove());if(selectedPhase==='ALL'){try{originalRenderAll()}catch{}}setTimeout(apply,0)}
function openClarificationQueue(){
  taskFilter='OPEN';show('tasks');renderTaskLists();setTimeout(()=>{document.querySelectorAll('#taskList .task-row[data-task-id]').forEach(row=>{const t=work().find(x=>String(x.id)===String(row.dataset.taskId));const ok=!!t&&needsClarification(t)&&(selectedPhase==='ALL'||taskPhase(t)===selectedPhase);row.classList.toggle('ux-filter-hidden',!ok)});const h=document.querySelector('#tasksHeading');if(h)h.textContent=selectedPhase==='ALL'?'Oppgaver som trenger avklaring':`${selectedPhase} · trenger avklaring`},0);
}

const originalRenderAll=renderAll;
renderAll=function(){originalRenderAll();setTimeout(apply,0)};
const originalRenderTaskLists=renderTaskLists;
renderTaskLists=function(){originalRenderTaskLists();setTimeout(apply,0)};

document.addEventListener('click',e=>{const reset=e.target.closest?.('.phase-workspace-reset');if(reset){e.preventDefault();choose('ALL');return}const step=e.target.closest?.('#journeyMini .process-step[data-phase-workspace]');if(step){e.preventDefault();choose(step.dataset.phaseWorkspace);return}const clar=e.target.closest?.('#metricYellow')?.closest?.('.metric');if(clar){e.preventDefault();e.stopImmediatePropagation();openClarificationQueue()}},true);
document.addEventListener('keydown',e=>{const step=e.target.closest?.('#journeyMini .process-step[data-phase-workspace]');if(step&&['Enter',' '].includes(e.key)){e.preventDefault();choose(step.dataset.phaseWorkspace)}} ,true);
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));window.addEventListener('pageshow',()=>setTimeout(apply,30));
[0,120,400,900].forEach(ms=>setTimeout(apply,ms));
})();