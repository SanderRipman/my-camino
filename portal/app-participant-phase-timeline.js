(()=>{
'use strict';
// UAT 3M. One participant timeline and one task list. No database writes,
// no inferred GO/NO-GO or fabricated completion dates.
const PHASE_LABELS=['VÍA','SER','VIDA','ny VÍA'];
const PHASE_DESCRIPTIONS=['Før · retning og avklaring','Under · erfaring og trygghet','Etter · handling hjemme','Ved behov · neste veivalg'];
const OPEN_TASK_STATUSES=new Set(['OPEN','IN_PROGRESS','WAITING']);
let selectedParticipantPhase=null;
let returnToParticipantView=null;
let participantTaskAllInitialized=false;

function participantSelf(){
  try{return typeof isStaff==='function'&&!isStaff()&&typeof ownParticipant==='function'?ownParticipant():null}catch{return null}
}
function stageNumber(p){
  const stage=String(p?.stage||'VIA').toUpperCase();
  if(stage==='NEW_VIA')return 3;
  if(stage==='VIDA')return 2;
  if(stage==='SER')return 1;
  return 0; // VÍA includes preparation, formal review, GO_WITH_CONDITIONS and postponement.
}
function phaseNumberForTask(task,person){
  const key=String(task?.workflow_key||'').toLowerCase(),type=String(task?.task_type||'').toUpperCase();
  if(/new_via|next_via/.test(key)||type==='VIA_NEXT')return 3;
  if(/^vida_|participant_vida_/.test(key)||type==='VIDA_FOLLOWUP')return 2;
  if(/^ser_|participant_ser_/.test(key)||['SER_ADAPTATION','INCIDENT_FOLLOWUP'].includes(type))return 1;
  if(/^via_|^participant_via_|^intake_|^interest_|^individual_go|^participant_agreement/.test(key)||['VIA_REVIEW','GO_CONDITION','VIDA_OWNER_GATE'].includes(type))return 0;
  return stageNumber(person);
}
function participantTasks(person){
  const uid=session?.user?.id;
  if(!person||!uid)return[];
  return (tasks||[]).filter(t=>t?.participant_id===person.id&&t.assignee_user_id===uid);
}
function formattedParticipantDate(value){
  return value&&typeof formatDate==='function'?formatDate(value):'';
}
function participantSubmissionComplete(person){
  if(!person||stageNumber(person)!==0)return false;
  try{return window.aidmeParticipantViaAwaitingReview?.(person)===true}catch{return false}
}
function voluntaryInfoAvailable(person){
  return !!person&&stageNumber(person)===0&&(formDefs||[]).some(f=>f.key==='info_before_via'&&(f.scope==='participant'||f.scope==='participant_staff'));
}
function phaseMarkup(index,person){
  const now=stageNumber(person),kind=index<now?'is-past':index===now?'is-current':'is-future';
  const completed=participantTasks(person).filter(t=>phaseNumberForTask(t,person)===index&&t.status==='DONE').length;
  const label=PHASE_LABELS[index],state=index<now?'Gjennomført':index===now?'Du er her':'Ikke åpnet';
  const statusBadge='<span class="participant-phase-badge '+(index<now?'done':index===now?'current':'')+'">'+(index<now?'✓ ':'')+state+'</span>';
  const completedBadge=completed?'<span class="participant-phase-badge done">✓ '+completed+' utført</span>':'';
  return '<button class="process-step participant-phase-step '+kind+'" type="button"'
    +' data-participant-phase="'+index+'"'
    +' aria-label="'+escapeHtml(label+', '+state+(completed?', '+completed+' utført':'')+(index<=now?', vis oppgavehistorikk':', se når steget åpnes'))+'">'
    +'<span class="participant-phase-left"><span class="participant-phase-name">'+escapeHtml(label)+'</span><span class="participant-phase-sub">'+escapeHtml(PHASE_DESCRIPTIONS[index])+'</span></span>'
    +'<span class="participant-phase-meta">'+statusBadge+completedBadge+'</span></button>';
}
const originalParticipantProcessMarkup=processMarkup;
processMarkup=function(index){
  const person=participantSelf();
  if(!person)return originalParticipantProcessMarkup(index);
  return PHASE_LABELS.map((_,i)=>phaseMarkup(i,person)).join('');
};
const originalParticipantTaskRow=taskRow;
taskRow=function(task){
  const person=participantSelf();
  if(!person)return originalParticipantTaskRow(task);
  // Only the participant's assigned tasks get participant-friendly progress labels.
  if(!task||task.participant_id!==person.id||task.assignee_user_id!==session?.user?.id)return '';
  const status=String(task.status||'').toUpperCase(),done=status==='DONE';
  const overdue=!done&&OPEN_TASK_STATUSES.has(status)&&!!task.due_at&&new Date(task.due_at)<new Date();
  const name=done?'✓ Utført':overdue?'Frist passert':status==='WAITING'?'Avventer':status==='IN_PROGRESS'?'Pågår':'Neste steg';
  const style=done?'is-done':overdue?'is-overdue':status==='WAITING'?'is-waiting':status==='IN_PROGRESS'?'is-progress':'is-pending';
  const phase=PHASE_LABELS[phaseNumberForTask(task,person)]||'VÍA';
  const date=done?formattedParticipantDate(task.updated_at):formattedParticipantDate(task.due_at);
  const description=done?'Oppgaven er registrert som utført.':String(task.description||'');
  const datePrefix=done?'Registrert ':overdue?'Frist passert ':'Frist ';
  return '<button class="task-row participant-task-row '+(done?'is-done':'')+'" type="button" data-task-id="'+escapeHtml(task.id)+'" data-participant-task-phase="'+phaseNumberForTask(task,person)+'"'
    +' aria-label="'+escapeHtml(task.title+', '+name+', fase '+phase)+'">'
    +'<span class="participant-task-icon" aria-hidden="true">'+(done?'✓':status==='IN_PROGRESS'?'•':'○')+'</span>'
    +'<span class="participant-task-copy"><b>'+escapeHtml(task.title)+'</b><small>'+escapeHtml(description)+'</small></span>'
    +'<span class="task-meta"><span class="participant-status-pill '+style+'">'+name+'</span>'
    +(date?'<span class="participant-task-date-pill '+(done?'is-completed':overdue?'is-overdue':'')+'" title="'+escapeHtml(datePrefix+date)+'" aria-label="'+escapeHtml(datePrefix+date)+'">'+escapeHtml(date)+'</span>':'')
    +'<span class="participant-phase-pill">'+escapeHtml(phase)+'</span></span></button>';
};
function ensureReturnNavigation(){
  const host=document.querySelector('#view-tasks .panel-card'),list=document.querySelector('#taskList');
  if(!host||!list)return;
  host.querySelector('.participant-task-navigation')?.remove();
  if(selectedParticipantPhase===null||!returnToParticipantView)return;
  const bar=document.createElement('div');bar.className='participant-task-navigation';
  bar.innerHTML='<button class="participant-return" type="button" data-return-to-journey>← Tilbake til '+(returnToParticipantView==='overview'?'Oversikt':'Min reise')+'</button>'
    +'<span class="participant-phase-focus">'+PHASE_LABELS[selectedParticipantPhase]+' · alle oppgaver og utførte steg</span>'
    +'<button class="participant-all-phases" type="button" data-show-all-participant-phases>Vis alle faser</button>';
  const filter=host.querySelector('.task-filter-row');if(filter)filter.insertAdjacentElement('beforebegin',bar);
  else host.insertBefore(bar,list);
}
function optionalResourceCard(){
  const person=participantSelf();
  if(!person||!voluntaryInfoAvailable(person))return;
  if(selectedParticipantPhase!==null&&selectedParticipantPhase!==0)return;
  const list=document.querySelector('#taskList');
  if(!list)return;
  const card=document.createElement('div');card.className='participant-optional-info';
  card.innerHTML='<div><strong>Frivillig informasjon · tilgjengelig</strong><p>«Kort informasjon før VÍA» er valgfritt og teller ikke som en uutført oppgave. Åpning er ikke registrert som «lest».</p></div>'
    +'<button type="button" data-open-optional-forms>Se informasjonen</button>';
  list.appendChild(card);
}
function paintParticipantTaskList(){
  const person=participantSelf();
  if(!person)return;
  const title=document.querySelector('#tasksHeading');
  if(title)title.textContent=selectedParticipantPhase===null?'Mine oppgaver og historikk':'Mine oppgaver · '+PHASE_LABELS[selectedParticipantPhase];
  document.querySelectorAll('[data-task-filter]').forEach(button=>button.classList.toggle('active',button.dataset.taskFilter===taskFilter));
  ensureReturnNavigation();
  let count=0;
  document.querySelectorAll('#taskList .task-row').forEach(row=>{
    const id=row.dataset.taskId,task=id?(tasks||[]).find(t=>t.id===id):null;
    const phase=task?phaseNumberForTask(task,person):(row.dataset.formKey==='vida_plan'?2:row.dataset.formKey==='participant_agreement'?0:0);
    const visible=selectedParticipantPhase===null||selectedParticipantPhase===phase;
    row.classList.toggle('participant-phase-hidden',!visible);
    if(visible)count++;
  });
  const list=document.querySelector('#taskList');if(!list)return;
  list.querySelectorAll('.participant-task-empty,.participant-optional-info').forEach(n=>n.remove());
  if(count===0){
    const placeholder=document.createElement('p');placeholder.className='participant-task-empty';
    placeholder.textContent=selectedParticipantPhase===null?'Ingen oppgaver i dette filteret. Bytt til «Alle» for å se det du har fullført.':'Ingen '+(taskFilter==='OPEN'?'åpne':'registrerte')+' oppgaver i '+PHASE_LABELS[selectedParticipantPhase]+' akkurat nå.';
    list.appendChild(placeholder);
    // Hide the inherited generic empty-state sentence when we show the meaningful one.
    for(const p of [...list.children].filter(e=>e.tagName==='P'&&e!==placeholder))p.hidden=true;
  } else {
    for(const p of [...list.children].filter(e=>e.tagName==='P'))p.hidden=true;
  }
  optionalResourceCard();
}
const originalParticipantRenderTaskLists=renderTaskLists;
renderTaskLists=function(){
  const result=originalParticipantRenderTaskLists();
  paintParticipantTaskList();
  return result;
};
function paintParticipantJourney(){
  const person=participantSelf();
  const view=document.querySelector('#view-participants');
  if(!view)return;
  view.classList.toggle('participant-journey-single',!!person);
  if(!person)return;
  const detail=view.querySelector('#participantDetail');
  if(!detail)return;
  detail.querySelectorAll('.participant-milestone').forEach(e=>e.remove());
  if(!participantSubmissionComplete(person))return;
  const head=detail.querySelector('.card-head');if(!head)return;
  const former=head.nextElementSibling;
  if(former?.tagName==='P'&&!former.classList.contains('eyebrow'))former.remove();
  const heading=[...detail.querySelectorAll('h3')].find(h=>['Hva skjer nå?','Din neste handling'].includes(h.textContent.trim()));
  if(heading){
    const next=heading.nextElementSibling;
    // The completed roadmap does not create an additional action card.
    if(next?.classList.contains('task-list')&&!next.querySelector('.task-row')){next.remove();heading.remove()}
  }
  const section=document.createElement('section');section.className='participant-milestone';section.setAttribute('aria-label','Fullført VÍA-veikart');
  section.innerHTML='<strong>✓ Du har sendt inn VÍA-veikartet!</strong>'
    +'<p>Dette steget er fullført. VÍA-ansvarlig følger opp sammen med deg før en eventuell beslutning om GO/NO-GO.</p>'
    +'<div class="participant-milestone-actions"><a class="link-btn" href="./form-runner.html?latest=1#my-via-roadmap">Se det du har levert</a>'
    +'<span class="participant-milestone-wait">Neste: VÍA-ansvarlig vurderer · du trenger ikke fylle ut på nytt</span></div>';
  head.insertAdjacentElement('afterend',section);
  const eyebrow=detail.querySelector('.card-head .eyebrow');if(eyebrow)eyebrow.textContent='VÍA · til vurdering';
  const pill=detail.querySelector('.card-head .pill');if(pill){pill.textContent='✓ Innsendt';pill.classList.add('participant-completed-pill')}
  const progress=[...detail.querySelectorAll('h3')].find(h=>h.textContent.trim()==='Hvor du er i reisen');
  if(progress)progress.textContent='Din fremdrift – se alle steg';
}
const originalParticipantRenderDetail=renderParticipantDetail;
renderParticipantDetail=function(){
  const result=originalParticipantRenderDetail();
  paintParticipantJourney();
  return result;
};
function syncParticipantOptionalMetric(){
  const person=participantSelf();
  if(!person)return;
  const card=document.querySelector('#metricParticipants')?.closest('.metric');
  if(!card)return;
  const label=card.querySelector('span'),count=card.querySelector('strong'),hint=card.querySelector('small');
  const total=voluntaryInfoAvailable(person)?1:0;
  if(label)label.textContent='Info / valgfritt';
  if(count)count.textContent=String(total);
  if(hint)hint.textContent=total?'tilgjengelig ressurs · ikke «ulest»':'ingen valgfri informasjon nå';
}
const originalParticipantRenderAll=renderAll;
renderAll=function(){
  const person=participantSelf();
  if(person&&!participantTaskAllInitialized){
    taskFilter='ALL';
    participantTaskAllInitialized=true;
  }
  const result=originalParticipantRenderAll();
  paintParticipantJourney();
  paintParticipantTaskList();
  syncParticipantOptionalMetric();
  return result;
};
function showPhaseNotYet(index,origin){
  const host=document.querySelector(origin==='overview'?'#journeyMini':'#view-participants #participantDetail .process-flow');
  if(!host)return;
  const existing=host.nextElementSibling;
  if(existing?.classList.contains('participant-phase-message'))existing.remove();
  const note=document.createElement('p');note.className='participant-phase-message';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  const message=index===3?'Ny VÍA startes bare ved et nytt, avtalt veivalg etter VIDA.':'Dette steget åpnes senere, når de nødvendige avklaringene og beslutningene er gjennomført.';
  note.innerHTML='<strong>Ikke åpnet ennå · '+escapeHtml(PHASE_LABELS[index])+'</strong><span>'+escapeHtml(message)+'</span>';
  host.insertAdjacentElement('afterend',note);
}
function enterPhaseTasks(index,origin){
  selectedParticipantPhase=index;
  returnToParticipantView=origin;
  taskFilter='ALL';
  show('tasks');
  renderTaskLists();
  document.querySelector('#view-tasks .participant-task-navigation')?.scrollIntoView?.({block:'nearest'});
}
function resetPhaseTasks(returnTo=null){
  selectedParticipantPhase=null;
  returnToParticipantView=null;
  taskFilter='ALL';
  if(returnTo)show(returnTo);
  else{show('tasks');renderTaskLists()}
}
document.addEventListener('click',event=>{
  const person=participantSelf();
  if(!person)return;
  const phase=event.target.closest?.('.participant-phase-step[data-participant-phase]');
  if(phase){
    const idx=Number(phase.dataset.participantPhase);
    if(!Number.isInteger(idx)||idx<0||idx>=PHASE_LABELS.length)return;
    event.preventDefault();
    const origin=phase.closest('#view-overview')?'overview':'participants';
    if(idx>stageNumber(person))showPhaseNotYet(idx,origin);
    else enterPhaseTasks(idx,origin);
    return;
  }
  if(event.target.closest?.('[data-return-to-journey]')){event.preventDefault();resetPhaseTasks(returnToParticipantView);return}
  if(event.target.closest?.('[data-show-all-participant-phases]')){event.preventDefault();resetPhaseTasks();return}
  if(event.target.closest?.('[data-open-optional-forms]')){event.preventDefault();show('forms');return}
  if(event.target.closest?.('.nav-item[data-view="tasks"]')){
    selectedParticipantPhase=null;returnToParticipantView=null;taskFilter='ALL';
    renderTaskLists();
  }
});
function installParticipantTimelineCss(){
  if(document.querySelector('link[data-participant-phase-timeline]'))return;
  const link=document.createElement('link');link.rel='stylesheet';
  link.href='./participant-phase-timeline.css?v=20261122b';
  link.dataset.participantPhaseTimeline='1';
  document.head.appendChild(link);
}
installParticipantTimelineCss();
window.AidMeParticipantTimelineUat={phaseNumberForTask,stageNumber,voluntaryInfoAvailable,get selectedPhase(){return selectedParticipantPhase},version:'3M'};
})();