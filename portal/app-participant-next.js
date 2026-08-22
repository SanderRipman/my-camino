(()=>{
'use strict';

function participantNextAction(participant,task){
  if(!participant)return null;
  const stage=participant.stage,phase=stageLabel(stage);
  if(['VIA','READY_FOR_GO','INTEREST','NEW_VIA'].includes(stage))return{
    label:task?.workflow_key==='participant_via_start'?'Start mitt VÍA-veikart':'Åpne mitt VÍA-veikart',
    href:`./form-runner.html?key=via_roadmap&participant=${encodeURIComponent(participant.id)}`,
    hint:'Her avklarer du retning, ressurser og det som må være på plass før neste beslutning. Dette er ikke en GO/NO-GO-beslutning.'
  };
  if(stage==='GO'||stage==='GO_WITH_CONDITIONS')return{
    label:'Bekreft avtale og neste rammer',
    href:`./form-runner.html?key=participant_agreement&participant=${encodeURIComponent(participant.id)}`,
    hint:stage==='GO_WITH_CONDITIONS'?'Din VÍA er avklart med vilkår. Les og bekreft dine rammer; vilkår og samlet SER-gate må fortsatt lukkes før eventuell oppstart.':'Din VÍA er avklart. Les og bekreft avtalen og de praktiske rammene. GO betyr ikke at SER har startet.'
  };
  if(stage==='POSTPONED'||stage==='NO_GO')return null;
  if(phase==='SER')return{
    label:'Åpne dagens SER-steg',
    href:`./form-runner.html?key=ser_daily&participant=${encodeURIComponent(participant.id)}`,
    hint:'Kort innsjekk og det som er relevant for dagen. Pause, tilpasning og transport er legitime tiltak.'
  };
  if(phase==='VIDA')return{
    label:'Åpne min VIDA-plan',
    href:`./form-runner.html?key=vida_plan&participant=${encodeURIComponent(participant.id)}`,
    hint:'Én levende plan med neste konkrete handling og avtalt oppfølging hjemme.'
  };
  return null;
}

const participantJourneyOpenTask=openTask;
openTask=function(id){
  participantJourneyOpenTask(id);
  if(isStaff())return;
  const task=tasks.find(x=>x.id===id),participant=ownParticipant();
  if(!task||!participant||task.participant_id!==participant.id)return;
  const next=participantNextAction(participant,task);if(!next)return;
  const body=document.querySelector('#taskDialogBody');if(!body)return;

  // Internal staff gate hints may already have been rendered by the shared task-dialog layer.
  // They remain useful for staff, but a participant must see their own lawful next action instead.
  body.querySelectorAll('.gate-link,.gate-link-locked,.gate-hint').forEach(el=>el.classList.add('hidden'));
  body.querySelector('[data-participant-next-action]')?.remove();
  const box=document.createElement('div');
  box.dataset.participantNextAction='1';
  box.className='task-crosslinks participant-next-action';
  box.innerHTML=`<p class="eyebrow">Din neste handling</p><p>${escapeHtml(next.hint)}</p><div class="crosslink-grid"><a class="gate-link" href="${next.href}">${escapeHtml(next.label)}</a></div>`;
  body.appendChild(box);
};

})();
