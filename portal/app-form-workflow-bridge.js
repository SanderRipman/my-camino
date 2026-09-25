(()=>{
'use strict';

const VERSION='2026-09-25a';
const DECISION_TASKS=new Set(['via_go_review','via_roadmap_review','go_conditions','go_postponed_review','no_go_followup']);
const VIDA_TASKS=new Set(['vida_72h','vida_14d','vida_30d','vida_90d','participant_vida_72h']);

function esc(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}
function currentTasks(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function taskById(id){return currentTasks().find(t=>String(t.id)===String(id))||null}
function participantFor(t){try{return participantById(t?.participant_id)||null}catch{return null}}
function pilotFor(p,t){try{return pilotById(t?.pilot_id)||participantPilot(p?.id)||null}catch{return null}}
function own(p){try{return !!p&&ownParticipant()?.id===p.id}catch{return false}}
function role(name){try{return hasRole(name)}catch{return false}}
function returnFormHref(key,p,t,{latest=false}={}){
  const q=new URLSearchParams({key});
  if(p?.id)q.set('participant',p.id);
  const pilot=pilotFor(p,t);if(pilot?.id)q.set('pilot',pilot.id);
  if(latest)q.set('latest','1');
  if(t?.id){q.set('returnTask',t.id);q.set('returnView','tasks')}
  return`./form-runner.html?${q.toString()}`;
}
function actionForTask(t,p){
  const k=String(t?.workflow_key||'');
  if(k==='participant_via_start')return{key:'via_roadmap',label:'Åpne VÍA-veikart',hint:'Oppgaven og skjemaet bruker samme deltakerkontekst. Når veikartet fullføres, sendes saken videre til VÍA-gjennomgang.'};
  if(k==='via_interest_review')return{key:'interest_referral',label:'Åpne interesse / første avklaring',hint:'Bruk samme sak til å avklare neste steg; interesse er ikke godkjenning.'};
  if(k==='via_go_review'||k==='via_roadmap_review')return{key:'via_roadmap',label:'Se fullført VÍA-veikart',latest:true,hint:'Les veikartet i samme kontekst før den separate GO/NO-GO-gaten.'};
  if(['go_conditions','go_postponed_review','no_go_followup'].includes(k))return{key:'individual_go_no_go',label:'Åpne ny GO / NO-GO-vurdering',hint:'Ny vurdering skjer som eget formelt steg; tidligere beslutning beholdes i historikken.'};
  if(k==='via_agreement_review')return{key:'participant_agreement',label:'Se avtale og beredskap',latest:true,hint:'Avtalen kontrolleres før samlet Pilot-GO og starter ikke SER i seg selv.'};
  if(k==='new_via_review')return{key:'via_roadmap',label:'Åpne nytt VÍA-veikart',hint:'Ny VÍA er et nytt startpunkt etter VIDA, ikke et automatisk fjerde steg.'};
  if(VIDA_TASKS.has(k))return{key:'vida_plan',label:'Åpne levende VIDA-plan',hint:'72 timer, 14, 30 og 90 dager følger den samme levende planen; de er ikke separate planer.'};
  return null;
}
function addTaskBridge(id){
  const t=taskById(id),p=participantFor(t),body=document.querySelector('#taskDialogBody');if(!t||!p||!body)return;
  const action=actionForTask(t,p);if(!action)return;
  if(body.querySelector(`a[href*="form-runner.html?key=${CSS.escape(action.key)}"]`))return;
  body.querySelector('[data-form-workflow-bridge]')?.remove();
  const box=document.createElement('div');box.dataset.formWorkflowBridge='1';box.className='task-crosslinks';
  box.innerHTML=`<p class="eyebrow">Skjema i arbeidsflyten</p><h3>${esc(action.label)}</h3><p>${esc(action.hint)}</p><div class="crosslink-grid"><a class="primary" href="${returnFormHref(action.key,p,t,{latest:!!action.latest})}">${esc(action.label)}</a></div>`;
  body.appendChild(box);
}

function decisionTaskOpen(p){return currentTasks().some(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&DECISION_TASKS.has(String(t.workflow_key||'')))}
function participantActions(p){
  if(!p)return[];const stage=String(p.stage||'').toUpperCase(),viaStaff=role('via_owner')||role('clinical_professional'),out=[];
  if(stage==='INTEREST'&&(role('program_lead')||viaStaff))out.push({key:'interest_referral',label:'Interesse / første avklaring',hint:'Avklar riktig neste steg i samme sak.'});
  if(['INTEREST','VIA','READY_FOR_GO','NEW_VIA'].includes(stage)&&(own(p)||viaStaff))out.push({key:'via_roadmap',label:stage==='NEW_VIA'?'Nytt VÍA-veikart':'VÍA-veikart',hint:'Retning, ressurser og det som må være på plass.'});
  if(viaStaff&&decisionTaskOpen(p))out.push({key:'individual_go_no_go',label:'Individuell GO / NO-GO',hint:'Formell beslutningsgate når avklaringen er klar.'});
  if(['GO','GO_WITH_CONDITIONS'].includes(stage)&&(own(p)||viaStaff))out.push({key:'participant_agreement',label:'Avtale og beredskap',hint:'Kontaktvalg og praktiske rammer før samlet Pilot-GO.'});
  if(stage==='SER'&&role('ser_lead'))out.push({key:'ser_daily',label:'Daglig SER-operativlogg',hint:'Teamets operative normaldagslogg; deltakerens Innsjekk er separat.'});
  if(stage==='VIDA'&&(own(p)||role('vida_owner')))out.push({key:'vida_plan',label:'Levende VIDA-plan',hint:'Neste konkrete handling og 72t/14/30/90 i samme plan.'});
  return out;
}
function renderParticipantBridge(){
  document.querySelectorAll('[data-participant-form-bridge]').forEach(el=>el.remove());
  let p=null;try{p=isStaff()?participantById(selectedParticipantId):ownParticipant()}catch{}if(!p)return;
  const host=document.querySelector('#participantDetail');if(!host)return;const actions=participantActions(p);if(!actions.length)return;
  const box=document.createElement('section');box.dataset.participantFormBridge='1';box.className='panel-card';box.innerHTML=`<div class="card-head"><div><p class="eyebrow">Arbeidsflyt</p><h3>Skjema og neste handling</h3></div></div><p class="privacy-note">Åpne skjema herfra eller fra en oppgave. Da følger deltakerkonteksten med, og etter fullføring går du tilbake til riktig arbeidssteg.</p><div class="form-actions">${actions.map(a=>`<a class="ghost" href="${returnFormHref(a.key,p,null)}" title="${esc(a.hint)}">${esc(a.label)}</a>`).join('')}</div>`;host.appendChild(box);
}
function polishFormLibrary(){
  const view=document.querySelector('#view-forms'),head=view?.querySelector('.section-head');if(!view||!head||view.querySelector('[data-form-workflow-note]'))return;
  const note=document.createElement('article');note.dataset.formWorkflowNote='1';note.className='preview-strip';note.innerHTML='<strong>Arbeidsflyt først.</strong> Skjemaene er arbeidssteg i samme deltakerreise – ikke et separat dokumentbibliotek. Start helst fra <b>Deltakere</b> eller <b>Oppgaver</b>; da følger deltaker, fase og returpunkt automatisk med.';head.insertAdjacentElement('afterend',note);
}
function install(){
  try{polishFormLibrary();renderParticipantBridge()}catch{}
  if(typeof openTask==='function'&&!openTask.__aidmeFormWorkflowBridge){const prior=openTask;const wrapped=function(id){const out=prior(id);setTimeout(()=>addTaskBridge(id),0);return out};wrapped.__aidmeFormWorkflowBridge=true;openTask=wrapped}
  if(typeof renderParticipants==='function'&&!renderParticipants.__aidmeFormWorkflowBridge){const prior=renderParticipants;const wrapped=function(){const out=prior();setTimeout(renderParticipantBridge,0);return out};wrapped.__aidmeFormWorkflowBridge=true;renderParticipants=wrapped}
}

window.AidMeFormWorkflowBridge={version:VERSION,refresh:install};
document.addEventListener('aidme:portal-rendered',()=>setTimeout(install,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(install,0));
window.addEventListener('pageshow',()=>setTimeout(install,30));
setTimeout(install,0);setTimeout(install,600);
})();