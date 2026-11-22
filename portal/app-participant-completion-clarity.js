(()=>{
'use strict';
// Participant-only presentation. All status and authorization remain server-owned.
function ownCompletedTask(task){
  const self=typeof ownParticipant==='function'?ownParticipant():null;
  return !isStaff()&&!!self&&!!task&&task.status==='DONE'
    &&task.participant_id===self.id
    &&task.assignee_user_id===session?.user?.id
    &&(task.audience==='PARTICIPANT'||task.audience==='BOTH');
}
function submittedViaForParticipant(person){
  return !isStaff()&&!!person&&typeof window.aidmeParticipantViaAwaitingReview==='function'
    &&window.aidmeParticipantViaAwaitingReview(person)===true;
}
function completedViaTask(task){
  return ownCompletedTask(task)&&task.workflow_key==='participant_via_start';
}
const priorCompletionTaskRow=taskRow;
taskRow=function(task){
  if(!ownCompletedTask(task))return priorCompletionTaskRow(task);
  const when=task.updated_at?formatDate(task.updated_at):'';
  return '<button class="task-row participant-completed-task" type="button" data-task-id="'+escapeHtml(task.id)+'" data-task-status="DONE" aria-label="Utført: '+escapeHtml(task.title)+'">'
    +'<span class="participant-completed-check" aria-hidden="true">✓</span>'
    +'<span><b>'+escapeHtml(task.title)+'</b><small>'+escapeHtml(when?'Fullført '+when:'Tidligere fullført oppgave')+'</small></span>'
    +'<span class="task-meta"><span class="pill participant-completed-pill">✓ Utført</span></span></button>';
};
const priorCompletionOpenTask=openTask;
openTask=function(id){
  priorCompletionOpenTask(id);
  const task=(tasks||[]).find(item=>item.id===id);
  if(!completedViaTask(task))return;
  const dialog=document.querySelector('#taskDialog'),body=document.querySelector('#taskDialogBody');
  if(!dialog||!body||!dialog.open)return;
  const time=task.updated_at?formatDate(task.updated_at):null;
  const title=dialog.querySelector('#taskDialogTitle'),eyebrow=dialog.querySelector('#taskDialogEyebrow');
  if(title)title.textContent='Min VÍA – start her';
  if(eyebrow)eyebrow.textContent='✓ Fullført';
  body.innerHTML='<div class="participant-completed-message"><strong>✓ Oppgaven er utført</strong>'
    +'<p>VÍA-veikartet er sendt inn. VÍA-ansvarlig følger opp før en eventuell beslutning om GO/NO-GO.</p></div>'
    +(time?'<p class="privacy-note">Registrert som fullført '+escapeHtml(time)+'.</p>':'')
    +'<a class="ghost link-btn" href="./form-runner.html?latest=1#my-via-roadmap">Se innsendt VÍA-veikart</a>';
  dialog.querySelector('#taskStart')?.classList.add('hidden');
  dialog.querySelector('#taskDone')?.classList.add('hidden');
  dialog.querySelector('#taskDialogMessage').textContent='';
};
function removeRedundantParticipantWorkflow(detail){
  // A duplicate legacy flow card competes with the true phase and task state.
  const headings=[...detail.querySelectorAll('h2,h3')];
  const heading=headings.find(h=>(h.textContent||'').trim()==='Skjema og neste handling');
  if(!heading)return;
  let parent=heading.parentElement;
  while(parent&&parent!==detail){
    if((parent.tagName==='ARTICLE'||parent.tagName==='SECTION'||parent.classList.contains('panel-card'))){
      parent.remove();return;
    }
    parent=parent.parentElement;
  }
  if(heading.parentElement&&heading.parentElement!==detail)heading.parentElement.remove();
}
function clarifyParticipantJourney(){
  if(isStaff())return;
  const detail=document.querySelector('#participantDetail'),person=ownParticipant();
  if(!detail||!person)return;
  removeRedundantParticipantWorkflow(detail);
  if(!submittedViaForParticipant(person))return;
  const header=detail.querySelector('.card-head');
  const eyebrow=header?.querySelector('.eyebrow'),pill=header?.querySelector('.pill');
  if(eyebrow)eyebrow.textContent='VÍA · avventer vurdering';
  if(pill){pill.textContent='✓ Veikart innsendt';pill.classList.add('participant-completed-pill')}
  const heading=[...detail.querySelectorAll('h3')].find(x=>(x.textContent||'').trim()==='Din neste handling');
  if(heading){
    heading.textContent='Hva skjer nå?';
    const list=heading.nextElementSibling;
    if(list?.classList.contains('task-list')&&!list.querySelector('.task-row')){
      list.innerHTML='<p>Ingen flere oppgaver nå. VÍA-ansvarlig følger opp.</p>'
        +'<a class="ghost link-btn participant-submission-link" href="./form-runner.html?latest=1#my-via-roadmap">Se innsendt veikart</a>';
    }
  }
  const card=document.querySelector('#participantList .participant-card.active');
  const cardSub=card?.querySelector('small');if(cardSub)cardSub.textContent='VÍA · veikart innsendt';
}
const priorCompletionDetail=renderParticipantDetail;
renderParticipantDetail=function(){
  const result=priorCompletionDetail();
  clarifyParticipantJourney();
  return result;
};
const priorCompletionAll=renderAll;
renderAll=function(){
  const result=priorCompletionAll();
  clarifyParticipantJourney();
  return result;
};
if(!document.querySelector('#participant-completion-clarity-style')){
  const style=document.createElement('style');
  style.id='participant-completion-clarity-style';
  style.textContent='.participant-completed-check{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#dcebe3;color:#256344;font-weight:800;margin-top:-1px}'
    +'.participant-completed-task{grid-template-columns:20px minmax(0,1fr) auto}'
    +'.participant-completed-pill{background:#dcebe3!important;color:#23573d!important;border:1px solid #a5cbb1}'
    +'.participant-completed-message{border-left:3px solid #367e5b;background:#f0f7f2;padding:12px 14px;border-radius:10px}'
    +'.participant-completed-message strong{color:#20573d}.participant-completed-message p{margin:.45rem 0 0}'
    +'.participant-submission-link{display:inline-flex;margin-top:5px}';
  document.head.appendChild(style);
}
})();