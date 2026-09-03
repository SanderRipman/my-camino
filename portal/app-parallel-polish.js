(()=>{
'use strict';

// Presentation-only layer for the isolated parallel polish branch.
// It consumes the final rendered task dialog and never changes role, scope, workflow, RLS or backend state.

function attentionLabel(task){
  const sev=severity(task);
  return sev==='RED'?'Kritisk':sev==='YELLOW'?'Avklar':'Normal';
}

function makeStatic(cell){
  const label=cell.querySelector('span')?.textContent||'Detalj';
  const value=cell.querySelector('b')?.textContent||'Ikke angitt';
  const clone=cell.cloneNode(true);
  clone.classList.remove('context-cell-action');
  clone.classList.add('context-cell-static');
  clone.removeAttribute('role');
  clone.removeAttribute('tabindex');
  delete clone.dataset.contextState;
  clone.setAttribute('aria-label',`${label}: ${value}. Ingen handling tilgjengelig.`);
  cell.replaceWith(clone);
  return clone;
}

function polishTaskDialog(taskId){
  const task=(tasks||[]).find(item=>item.id===taskId);
  const body=document.querySelector('#taskDialogBody');
  if(!task||!body)return;

  const eyebrow=document.querySelector('#taskDialogEyebrow');
  if(eyebrow)eyebrow.textContent=`Arbeidsstatus: ${statusText(task.status)} · Oppmerksomhet: ${attentionLabel(task)}`;

  const cells=[...body.querySelectorAll('.task-context-grid .context-cell')];
  const participant=participantById(task.participant_id);
  const route=routeToday(task.pilot_id);

  const deadline=cells.find(cell=>cell.dataset.contextKind==='deadline')||cells[5];
  if(deadline&&!route){
    const label=deadline.querySelector('span');
    if(label)label.textContent='Frist';
    deadline.dataset.parallelDeadlineLabel='Frist';
  }

  for(const cell of cells){
    const kind=cell.dataset.contextKind;
    const state=cell.dataset.contextState;
    const value=cell.querySelector('b')?.textContent?.trim();
    const noParticipant=kind==='participant'&&value==='Ikke knyttet';
    const noRouteAction=(kind==='route'||kind==='stage')&&value==='Ikke angitt'&&state==='info';
    if(noParticipant||noRouteAction)makeStatic(cell);
  }

  // Pilot "Ikke knyttet" is intentionally left alone: an own-participant view may still expose Help/contact.
  void participant;
}

const parallelPolishOpenTask=openTask;
openTask=function(id){
  parallelPolishOpenTask(id);
  polishTaskDialog(id);
};

function normalizeDeadlineContextTitle(event){
  const cell=event.target.closest?.('.context-cell[data-parallel-deadline-label="Frist"]');
  if(!cell)return;
  const title=document.querySelector('#contextActionTitle');
  if(title)title.textContent='Frist';
}
document.addEventListener('click',normalizeDeadlineContextTitle);
document.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' ')normalizeDeadlineContextTitle(event);
});

})();
