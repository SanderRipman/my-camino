(()=>{
'use strict';
// Staff VÍA presentation only. Uses the existing tasks already returned under RLS.
// No grant, sensitive form, go_no_go or intake data is fetched or mutated.
const OPEN=new Set(['OPEN','IN_PROGRESS','WAITING']);
function ownReviewTasks(){
  if(!session?.user?.id||!isStaff()||assurance.currentLevel!=='aal2')return[];
  if(!hasRole('via_owner')&&!hasRole('clinical_professional'))return[];
  return (tasks||[]).filter(t=>t.workflow_key==='via_go_review'&&OPEN.has(t.status)&&t.assignee_user_id===session.user.id)
    .sort((a,b)=>Date.parse(a.due_at||'2999-01-01')-Date.parse(b.due_at||'2999-01-01'));
}
function dueStatus(t){
  if(!t.due_at)return{text:'Ingen frist',tone:'YELLOW'};
  const diff=Date.parse(t.due_at)-Date.now();
  return diff<0?{text:'Forfalt · '+formatDate(t.due_at),tone:'RED'}:
    diff<=86400000?{text:'Frist nærmer seg · '+formatDate(t.due_at),tone:'YELLOW'}:
    {text:'Frist · '+formatDate(t.due_at),tone:'GREEN'};
}
function ownCode(t){
  const participant=(participants||[]).find(p=>p.id===t.participant_id);
  return participant?.code_name||'Deltaker';
}
function assureCard(){
  let card=document.getElementById('viaStaffReviewSummary');
  if(card)return card;
  const queue=document.getElementById('priorityQueue');
  const parent=queue?.closest('article');
  if(!parent)return null;
  card=document.createElement('article');card.id='viaStaffReviewSummary';card.className='panel-card';
  card.innerHTML='<div class="card-head"><div><p class="eyebrow">VÍA · medarbeider</p><h2>Innsendte veikart til gjennomgang</h2></div><span id="viaReviewCount" class="pill GREEN"></span></div><p class="privacy-note">Din arbeidskø viser kun vurderinger tildelt deg. Innsending er ikke GO/NO-GO.</p><div id="viaStaffReviewRows" class="task-list"></div>';
  parent.insertAdjacentElement('beforebegin',card);
  return card;
}
function renderViaReviewSummary(){
  const card=assureCard();
  if(!card)return;
  const reviews=ownReviewTasks();
  card.classList.toggle('hidden',!reviews.length);
  if(!reviews.length)return;
  card.querySelector('#viaReviewCount').textContent=reviews.length+' til oppfølging';
  card.querySelector('#viaStaffReviewRows').innerHTML=reviews.map(t=>{
    const due=dueStatus(t);
    return '<button type="button" class="task-row" data-via-staff-review="'+escapeHtml(t.id)+'">'+
      '<i class="task-dot '+due.tone+'"></i><div><b>'+escapeHtml(ownCode(t))+' · VÍA-veikart mottatt</b>'+
      '<small>Åpne eksisterende oppgave for gjennomgang. Ingen ny innsending.</small></div>'+
      '<div class="task-meta"><span class="pill '+due.tone+'">'+escapeHtml(due.text)+'</span></div></button>';
  }).join('');
  card.querySelectorAll('[data-via-staff-review]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.viaStaffReview;
    if(ownReviewTasks().some(t=>t.id===id))openTask(id);
  }));
}
function decorateReviewTaskRows(){
  const own=ownReviewTasks();
  if(!own.length)return;
  const map=new Map(own.map(t=>[t.id,t]));
  document.querySelectorAll('#taskList .task-row[data-task-id]').forEach(row=>{
    const t=map.get(row.dataset.taskId);if(!t)return;
    const due=dueStatus(t),meta=row.querySelector('.task-meta');
    if(!meta||meta.querySelector('.via-review-tag'))return;
    const label=document.createElement('span');label.className='pill via-review-tag '+due.tone;
    label.textContent='Innsendt VÍA · '+due.text;
    meta.appendChild(label);
  });
}
function decorateParticipantReview(){
  const target=document.getElementById('participantDetail');
  if(!target||!selectedParticipantId)return;
  const review=ownReviewTasks().find(t=>t.participant_id===selectedParticipantId);
  if(!review)return;
  const current=target.querySelector('.via-review-participant-status');if(current)return;
  const status=document.createElement('p');status.className='via-review-participant-status';
  const tone=dueStatus(review);
  status.innerHTML='<span class="pill '+tone.tone+'">VÍA-veikart innsendt · '+escapeHtml(tone.text)+'</span> <small>Venter på din faglige oppfølging. Ikke GO/NO-GO.</small>';
  target.querySelector('.card-head')?.insertAdjacentElement('afterend',status);
}
const baseTaskList=renderTaskLists;
renderTaskLists=function(){const out=baseTaskList();decorateReviewTaskRows();renderViaReviewSummary();return out};
const baseParticipantDetail=renderParticipantDetail;
renderParticipantDetail=function(){const out=baseParticipantDetail();decorateParticipantReview();return out};
})();