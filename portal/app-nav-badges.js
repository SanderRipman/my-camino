(()=>{
'use strict';

function badgeOpenStatus(status){return ['OPEN','IN_PROGRESS','WAITING'].includes(status)}
function badgeOverdue(task){return !!task?.due_at&&badgeOpenStatus(task.status)&&new Date(task.due_at)<new Date()}
function badgeTaskSeverity(task){return badgeOverdue(task)?'RED':severity(task)}
function badgeVisibleTasks(){
  const uid=session?.user?.id,own=ownParticipant(),staff=isStaff();
  return (tasks||[]).filter(t=>staff||t.assignee_user_id===uid||(own&&t.participant_id===own.id));
}
function badgeParticipantSeverity(participant,openTasks){
  const related=openTasks.filter(t=>t.participant_id===participant.id);
  const latest=latestCheckin(participant.id);
  if(related.some(t=>badgeTaskSeverity(t)==='RED')||latest?.rag==='RED')return'RED';
  if(related.some(t=>badgeTaskSeverity(t)==='YELLOW')||latest?.rag==='YELLOW')return'YELLOW';
  return'GREEN';
}
function semanticBadgeMarkup(kind,counts){
  if(kind==='overview')return counts.total?`<span class="nav-count nav-count-total" aria-label="${counts.total} åpne totalt">${counts.total}</span>`:'';
  let html='';
  if(counts.red)html+=`<span class="nav-count red" aria-label="${counts.red} ${kind==='participants'?'deltakere':'oppgaver'} kritisk">${counts.red}</span>`;
  if(counts.yellow)html+=`<span class="nav-count yellow" aria-label="${counts.yellow} ${kind==='participants'?'deltakere':'oppgaver'} trenger avklaring">${counts.yellow}</span>`;
  return html;
}
function renderSemanticNavigationBadges(){
  const visible=badgeVisibleTasks();
  const open=visible.filter(t=>badgeOpenStatus(t.status));
  const taskCounts={
    red:open.filter(t=>badgeTaskSeverity(t)==='RED').length,
    yellow:open.filter(t=>badgeTaskSeverity(t)==='YELLOW').length
  };
  const overview=document.querySelector('#badgeOverview');
  const taskBadge=document.querySelector('#badgeTasks');
  const participantBadge=document.querySelector('#badgeParticipants');
  if(overview){
    overview.innerHTML=semanticBadgeMarkup('overview',{total:open.length});
    overview.title=`Samlet oversikt: ${open.length} åpne oppgaver`;
  }
  if(taskBadge){
    taskBadge.innerHTML=semanticBadgeMarkup('tasks',taskCounts);
    taskBadge.title=`Oppgaver: ${taskCounts.red} kritisk/forfalt · ${taskCounts.yellow} trenger avklaring`;
  }
  if(participantBadge){
    if(!isStaff()){
      participantBadge.innerHTML='';
      participantBadge.title='Min reise';
    }else{
      const attention=(participants||[]).map(p=>badgeParticipantSeverity(p,open)).filter(s=>s==='RED'||s==='YELLOW');
      const participantCounts={red:attention.filter(s=>s==='RED').length,yellow:attention.filter(s=>s==='YELLOW').length};
      participantBadge.innerHTML=semanticBadgeMarkup('participants',participantCounts);
      participantBadge.title=`Deltakere: ${participantCounts.red} kritisk · ${participantCounts.yellow} trenger oppmerksomhet`;
    }
  }
}

if(!document.querySelector('#semantic-nav-badge-style')){
  const style=document.createElement('style');
  style.id='semantic-nav-badge-style';
  style.textContent='.nav-count.nav-count-total{background:#dbe5ec;color:#23435d}.nav-badges:empty{display:none}';
  document.head.appendChild(style);
}

const priorRenderTaskLists=renderTaskLists;
renderTaskLists=function(){
  priorRenderTaskLists();
  renderSemanticNavigationBadges();
};
setTimeout(renderSemanticNavigationBadges,120);

})();
