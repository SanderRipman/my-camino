(()=>{
'use strict';
const VERSION='2026-09-09b';
const PHASES=['VÍA','SER','VIDA','ny VÍA'];
const OPEN=new Set(['OPEN','IN_PROGRESS','WAITING']);
let phase='ALL', continuity=null, loading=false, applying=false;

const roles=()=>{try{return new Set((accessGrants||[]).filter(activeGrant).map(g=>String(g.role_code||'')))}catch{return new Set()}};
const staff=()=>{try{return typeof isStaff==='function'&&isStaff()}catch{return false}};
const aggregate=()=>{try{return !!window.AidMeRoleLens?.aggregateOnly?.()}catch{return false}};
const ps=()=>{try{return Array.isArray(participants)?participants:[]}catch{return[]}};
const ts=()=>{try{return Array.isArray(tasks)?tasks:[]}catch{return[]}};

function pPhase(p){
  try{return stageLabel(p?.stage||'VIA')}
  catch{const s=String(p?.stage||'VIA').toUpperCase();return s==='SER'?'SER':s==='VIDA'?'VIDA':s==='NEW_VIA'?'ny VÍA':'VÍA'}
}
function key(t){return String(t?.workflow_key||'').toLowerCase()}
function type(t){return String(t?.task_type||'').toUpperCase()}
function title(t){return String(t?.title||'').toLowerCase()}
function tPhase(t){
  const k=key(t),ty=type(t),x=title(t);
  if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate'].includes(k)||['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE'].includes(ty)||/interesse|vía|go.no.go|pilot.go|vida.eier/.test(x))return'VÍA';
  if(k.startsWith('ser_')||['SER_ADAPTATION','INCIDENT_FOLLOWUP'].includes(ty)||/etappe|videre vandring|ser /.test(x))return'SER';
  if((k.startsWith('vida_')&&!k.includes('new_via'))||ty==='VIDA_FOLLOWUP'||/72t|72 timer|14 dag|30 dag|90 dag/.test(x))return'VIDA';
  if(['new_via','new_via_review'].includes(k)||ty==='VIA_NEXT'||/ny vía|neste retning/.test(x))return'ny VÍA';
  const p=ps().find(p=>String(p.id)===String(t?.participant_id));
  return p?pPhase(p):null;
}
function clarification(t){
  const k=key(t),ty=type(t),x=title(t);
  if(String(t?.status).toUpperCase()==='WAITING')return true;
  if(k.startsWith('intake_triage:')||['via_first_contact','individual_go','go_conditions','pilot_go','qa_project_program_gate','ser_daily','ser_incident','vida_72h','new_via','new_via_review'].includes(k))return true;
  if(['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE','SER_ADAPTATION','INCIDENT_FOLLOWUP','VIDA_FOLLOWUP','VIA_NEXT'].includes(ty))return true;
  return /avklar|vurder|triage|vilkår|vida.eier|neste retning|handling mangler/.test(x);
}
function actionable(t){
  const r=roles(),k=key(t),ty=type(t),has=(...xs)=>xs.some(x=>r.has(x));
  if(k.startsWith('intake_triage:')||k==='via_first_contact')return has('program_lead','via_owner');
  if(['individual_go','go_conditions'].includes(k)||['VIA_REVIEW','GO_CONDITION'].includes(ty))return has('program_lead','via_owner','clinical_professional');
  if(['pilot_go','qa_project_program_gate'].includes(k)||ty==='VIDA_OWNER_GATE')return has('project_owner','program_lead','via_owner');
  if(k==='ser_incident'||ty==='INCIDENT_FOLLOWUP')return has('program_lead','ser_lead','logistics','clinical_professional');
  if(k==='ser_daily'||ty==='SER_ADAPTATION')return has('program_lead','ser_lead','logistics');
  if(k==='vida_72h'||ty==='VIDA_FOLLOWUP')return has('program_lead','vida_owner');
  if(['new_via','new_via_review'].includes(k)||ty==='VIA_NEXT')return has('program_lead','via_owner');
  return has('program_lead');
}
function phaseCounts(){
  const local={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};
  for(const p of ps()){const x=pPhase(p);if(x in local)local[x]++}
  const remote=continuity?.phase_counts||{};
  return Object.fromEntries(PHASES.map(x=>[x,Number(remote[x]??local[x]??0)]));
}
function localOpen(){return ts().filter(t=>OPEN.has(String(t.status))&&(phase==='ALL'||tPhase(t)===phase))}
function clarCount(open){const v=Number(continuity?.clarifications_by_phase?.[phase]);return Number.isFinite(v)?v:open.filter(clarification).length}
function esc(v=''){try{return escapeHtml(v)}catch{return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}

async function loadContinuity(){
  if(!staff()||loading||continuity||assurance?.currentLevel!=='aal2')return;
  loading=true;
  try{
    const {data,error}=await client.functions.invoke('uat-continuity-command',{body:{action:'SNAPSHOT'}});
    if(!error&&data?.ok&&data?.guardrails?.aggregate_only)continuity=data;
  }catch{}finally{loading=false;setTimeout(apply,0)}
}
function styles(){
  if(document.querySelector('#uat-phase-workspace-v2-style'))return;
  const s=document.createElement('style');s.id='uat-phase-workspace-v2-style';
  s.textContent=`#view-overview [data-uat-phase-workspace-hidden="1"]{display:none!important}#journeyMini .uat-process-count{background:#efeee8!important;border-color:#d6d5cd!important;color:#526065!important}#view-overview .uat-workspace-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#view-overview .uat-workspace-note{font-size:12px;color:#657176;margin-top:8px;line-height:1.4}`;
  document.head.appendChild(s);
}
function selectedFromDom(){const e=document.querySelector('#journeyMini .uat-filter-selected');return PHASES.includes(e?.dataset?.uatOverviewPhase)?e.dataset.uatOverviewPhase:null}
function process(){
  const host=document.querySelector('#journeyMini');if(!host||!staff())return;
  const counts=phaseCounts();
  [...host.querySelectorAll('.process-step')].slice(0,4).forEach((el,i)=>{
    const p=PHASES[i];el.dataset.uatWorkspacePhase=p;
    let n=el.querySelector('.uat-process-count');if(!n){n=document.createElement('span');n.className='pill uat-process-count';el.appendChild(n)}
    n.textContent=String(counts[p]||0);n.setAttribute('aria-label',`${counts[p]||0} forløp i ${p}`);
    if(aggregate()){el.setAttribute('role','button');el.tabIndex=0}
  });
  const label=document.querySelector('[data-uat-overview-filter-label]');
  if(label)label.textContent=phase==='ALL'?'Generell status · hele løpet på trygt oversiktsnivå':`Viser ${phase} · arbeidsflate etter rolle og scope`;
}
function metricLabel(i,label,hint){const c=document.querySelectorAll('#view-overview .metric-grid .metric')[i];if(!c)return;const a=c.querySelector('span'),b=c.querySelector('small');if(a)a.textContent=label;if(b)b.textContent=hint}
function metrics(){
  if(phase==='ALL')return;
  const open=localOpen(),c=clarCount(open),mine=open.filter(clarification).filter(actionable).length,counts=phaseCounts();
  const set=(id,v)=>{const e=document.querySelector(id);if(e)e.textContent=String(v)};
  set('#metricOpen',open.length);
  set('#metricRed',open.filter(t=>{try{return severity(t)==='RED'||(t.due_at&&new Date(t.due_at)<new Date())}catch{return String(t.severity)==='RED'}}).length);
  set('#metricYellow',c);set('#metricParticipants',counts[phase]||0);
  metricLabel(0,'Åpne oppgaver','tilgjengelig i din arbeidsflate');
  metricLabel(1,'Kritisk / forfalt','krever oppmerksomhet');
  metricLabel(2,'Trenger avklaring',c?`${mine} i din rolle · ${Math.max(0,c-mine)} hos andre roller`:'ingen åpne avklaringspunkter');
  metricLabel(3,'I fasen',aggregate()?'trygg programstatus uten individinnsyn':`${phase} · detaljer etter scope`);
  const mix=document.querySelector('#metricPhaseMix');if(mix)mix.textContent=`${phase} · ${counts[phase]||0} forløp`;
}
function queue(){
  if(phase==='ALL')return;
  const map=new Map(ts().map(t=>[String(t.id),t]));let shown=0;
  document.querySelectorAll('#priorityQueue .task-row').forEach(row=>{const t=map.get(String(row.dataset.taskId||'')),ok=!!t&&tPhase(t)===phase;row.dataset.uatPhaseWorkspaceHidden=ok?'0':'1';if(ok)shown++});
  const h=document.querySelector('#priorityQueue');if(!h)return;
  let p=h.querySelector('[data-uat-workspace-empty]');if(!p){p=document.createElement('p');p.dataset.uatWorkspaceEmpty='1';p.textContent='Ingen oppgaver i din rolle i denne fasen.';h.appendChild(p)}p.hidden=shown>0;
}
function pulse(){if(phase==='ALL')return;document.querySelectorAll('#groupPulse .pulse-row').forEach(row=>{const code=row.querySelector('b')?.textContent?.trim(),p=ps().find(x=>x.code_name===code),ok=!!p&&pPhase(p)===phase;row.dataset.uatPhaseWorkspaceHidden=ok?'0':'1'})}
const WORK={
 'VÍA':['VÍA · før','Avklaring og neste gate','Interesse, VÍA, individuell GO/NO-GO og pilotgate samles her. Detaljer følger rollen og scopet ditt.','VÍA – avklaringer og beslutninger'],
 'SER':['SER · under','Operativ status og trygg tilpasning','Rute, sikkerhet, tilpasning og neste operative handling – uten å trekke sensitiv VÍA-informasjon inn i SER.','SER – handling nå'],
 'VIDA':['VIDA · etter','Handling hjemme og oppfølging','Levende VIDA-plan, navngitt eier og 72t/14/30/90-oppfølging innen ditt mandat.','VIDA – oppfølging nå'],
 'ny VÍA':['ny VÍA · neste retning','Neste retning og ny avklaring','Erfaringene tas videre til ny retning. Ny VÍA er et aktivt valg, ikke en automatisk ny runde.','ny VÍA – neste steg']
};
function links(){
  const r=roles(),out=[],add=(t,h)=>out.push(`<a class="ghost compact" href="${h}">${esc(t)}</a>`);
  if(phase==='VÍA'){if(r.has('program_lead')||r.has('via_owner'))add('Mottak / interesse','./intake.html');if(r.has('project_owner')||r.has('program_lead'))add('Pilot / porter','./pilot-ops.html');if(!aggregate())add('Deltakere','./#participants')}
  if(phase==='SER'){if(r.has('program_lead')||r.has('ser_lead')||r.has('logistics'))add('Operativ dag','./pilot-ops.html');if(r.has('program_lead')||r.has('ser_lead')||r.has('logistics'))add('Hjelp & SOS','./sos.html');if(!aggregate())add('Deltakere','./#participants')}
  if(phase==='VIDA'){if(!aggregate())add('Deltakere','./#participants');if(r.has('program_lead')||r.has('vida_owner')||r.has('via_owner'))add('Ansvar / eiere','./owners.html')}
  if(phase==='ny VÍA'&&!aggregate())add('Deltakere','./#participants');
  return out.join('');
}
function workspace(){
  if(phase==='ALL')return;const w=WORK[phase];if(!w)return;
  const e=document.querySelector('#homeEyebrow'),h=document.querySelector('#homeHeading'),i=document.querySelector('#homeIntro'),b=document.querySelector('#stageBadge'),c=document.querySelector('#contextMini');
  if(e)e.textContent=w[0];if(h)h.textContent=w[1];if(i)i.textContent=w[2];if(b)b.textContent=phase;if(c)c.textContent=`${phaseCounts()[phase]||0} i fasen · detaljer etter rolle`;
  const q=document.querySelector('#priorityQueue')?.closest('.panel-card')?.querySelector('h3');if(q)q.textContent=w[3];
  const hero=document.querySelector('#view-overview .hero-panel>div');if(!hero)return;
  let l=hero.querySelector('.uat-workspace-links');if(!l){l=document.createElement('div');l.className='uat-workspace-links';hero.appendChild(l)}l.innerHTML=links();
  let n=hero.querySelector('.uat-workspace-note');if(!n){n=document.createElement('p');n.className='uat-workspace-note';hero.appendChild(n)}n.textContent='Alle ansatte kan følge fase og fremdrift på oversiktsnivå. Sensitive detaljer krever fortsatt eksplisitt rolle/scope.';
}
function clear(){document.querySelectorAll('[data-uat-phase-workspace-hidden]').forEach(e=>e.removeAttribute('data-uat-phase-workspace-hidden'));document.querySelectorAll('[data-uat-workspace-empty],.uat-workspace-links,.uat-workspace-note').forEach(e=>e.remove())}
function apply(){if(applying||!staff())return;applying=true;try{styles();loadContinuity();if(phase!=='ALL'){const dom=selectedFromDom();if(dom)phase=dom}process();if(phase!=='ALL'){metrics();queue();pulse();workspace()}}finally{applying=false}}
function choose(p){phase=PHASES.includes(p)?p:'ALL';clear();if(aggregate()&&phase!=='ALL')document.querySelectorAll('#journeyMini .process-step').forEach(e=>e.classList.toggle('uat-filter-selected',e.dataset.uatWorkspacePhase===phase));setTimeout(apply,0)}

document.addEventListener('click',e=>{const step=e.target.closest?.('#journeyMini .process-step');if(step){const p=step.dataset.uatOverviewPhase||step.dataset.uatWorkspacePhase;if(PHASES.includes(p))choose(p)}if(e.target.closest?.('.uat-overview-filter-reset'))choose('ALL')},true);
document.addEventListener('keydown',e=>{if(!aggregate()||!['Enter',' '].includes(e.key))return;const step=e.target.closest?.('#journeyMini .process-step');if(step){e.preventDefault();choose(step.dataset.uatWorkspacePhase)}},true);
const mo=new MutationObserver(()=>{clearTimeout(mo._t);mo._t=setTimeout(apply,40)});mo.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('aidme:portal-rendered',()=>{continuity=null;phase='ALL';setTimeout(apply,0)});
[0,160,500,1200].forEach(ms=>setTimeout(apply,ms));
})();
