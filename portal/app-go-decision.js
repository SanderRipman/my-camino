(()=>{
'use strict';

function isGoConditionTask(task){return !!task&&(task.workflow_key==='go_conditions'||task.task_type==='GO_CONDITION')}
function isVidaOwnerGateTask(task){return !!task&&task.task_type==='VIDA_OWNER_GATE'}
function refreshTaskContextFromParticipant(task,participant){
  const body=document.querySelector('#taskDialogBody'),grid=body?.querySelector('.task-context-grid');
  if(!grid||!participant)return;
  const pilot=pilotById(task?.pilot_id)||participantPilot(participant.id),route=routeToday(task?.pilot_id||pilot?.id),cells=[...grid.querySelectorAll('.context-cell')];
  const set=(index,value)=>{const target=cells[index]?.querySelector('b');if(target&&value)target.textContent=value};
  set(2,pilot?.name||null);
  set(3,pilot?.route_name||null);
  set(4,route?`Dag ${route.day_number} · ${route.from_place} → ${route.to_place}`:null);
  if(route?.distance_km)set(5,`${route.distance_km} km · ${formatDate(task?.due_at)}`);
}

function staffDecisionTaskGate(task,participant){
  if(!task||!participant)return null;
  const pilot=participantPilot(participant.id);
  if(isVidaOwnerGateTask(task))return{
    label:'Navngi VIDA-eier',
    href:`./owners.html?participant=${encodeURIComponent(participant.id)}`,
    hint:'SER kan ikke startes før en kvalifisert VIDA-eier er navngitt. Lukk dette gjennom Ansvar / eiere – ikke ved å markere oppgaven ferdig manuelt.'
  };
  if(isGoConditionTask(task)&&participant.stage==='GO_WITH_CONDITIONS')return{
    label:'Avklar vilkår i ny GO / NO-GO-vurdering',
    href:`./form-runner.html?key=individual_go_no_go&participant=${encodeURIComponent(participant.id)}${pilot?.id?`&pilot=${encodeURIComponent(pilot.id)}`:''}&returnTask=${encodeURIComponent(task.id)}&returnView=tasks`,
    hint:'GO med vilkår er foreløpig. Oppgaven lukkes først når en ny formell vurdering er sendt; tidligere beslutning beholdes som historikk.'
  };
  if(participant.stage==='POSTPONED')return{
    label:'Åpne ny GO / NO-GO-vurdering',
    href:`./form-runner.html?key=individual_go_no_go&participant=${encodeURIComponent(participant.id)}`,
    hint:'Utsettelse er ikke avslag. Ny vurdering tas først når avtalte avklaringer er fulgt opp.'
  };
  if(!['GO','GO_WITH_CONDITIONS'].includes(participant.stage))return null;
  if(task.workflow_key==='ser_start_ready')return{
    label:'Åpne siste SER-kontroll',
    local:'participant',
    hint:'Samlet Pilot-GO er registrert. Åpne deltakeren og bruk «Kontroller og start SER»; serveren gjør siste gatekontroll.'
  };
  if(task.workflow_key==='via_agreement_review'){
    const canReviewAgreement=canContext('edit_via',participant.id,pilot?.id||null);
    if(!canReviewAgreement)return{
      label:'Åpne ansvar / avklar reviewer',
      href:`./owners.html?participant=${encodeURIComponent(participant.id)}`,
      hint:'Du kan koordinere programramme og neste gate, men detaljert deltakeravtale er rollebegrenset. Tildel eller involver autorisert VÍA-/fagrolle for detaljreview i stedet for å utvide sensitiv tilgang som snarvei.'
    };
    return{
      label:'Se fullført avtale / beredskap',
      href:`./form-runner.html?key=participant_agreement&participant=${encodeURIComponent(participant.id)}&latest=1`,
      hint:'Les deltakerens faktiske avtale, kontakt-/delingsvalg og beredskapsbekreftelser før review lukkes. Deretter er samlet Pilot-GO neste formelle gate; avtalen er ikke i seg selv en SER-godkjenning.'
    };
  }
  return{
    label:'Åpne avtale / beredskap',
    href:`./form-runner.html?key=participant_agreement&participant=${encodeURIComponent(participant.id)}`,
    hint:participant.stage==='GO_WITH_CONDITIONS'?'Individuell GO med vilkår er registrert. Deltakeravtale og vilkår må begge være lukket før samlet Pilot-GO.':'Individuell GO er registrert. Deltakerens egen avtale/bekreftelse kommer før samlet Pilot-GO.'
  };
}

const decisionJourneyOpenTask=openTask;
openTask=function(id){
  decisionJourneyOpenTask(id);
  if(!isStaff())return;
  const task=tasks.find(item=>item.id===id),participant=participantById(task?.participant_id),gate=staffDecisionTaskGate(task,participant),body=document.querySelector('#taskDialogBody');
  refreshTaskContextFromParticipant(task,participant);
  if(isGoConditionTask(task)||isVidaOwnerGateTask(task)){
    const done=document.querySelector('#taskDone');if(done)done.classList.add('hidden');
  }
  if(!gate||!body)return;
  const grid=body.querySelector('.crosslink-grid')||body.querySelector('.task-crosslinks');if(!grid)return;
  let link=body.querySelector('.gate-link');
  if(gate.local==='participant'){
    if(link)link.remove();
    const button=document.createElement('button');button.type='button';button.className='gate-link';button.textContent=gate.label;button.addEventListener('click',()=>{selectedParticipantId=participant.id;document.querySelector('#taskDialog')?.close();show('participants');renderParticipants()});grid.appendChild(button);
  }else if(gate.href){
    if(link&&link.tagName==='A'){link.href=gate.href;link.textContent=gate.label;link.classList.remove('gate-link-locked')}
    else{if(link)link.remove();link=document.createElement('a');link.className='gate-link';link.href=gate.href;link.textContent=gate.label;grid.appendChild(link)}
  }
  const hint=body.querySelector('.gate-hint');if(hint)hint.textContent=gate.hint;else{const p=document.createElement('p');p.className='gate-hint';p.textContent=gate.hint;body.querySelector('.task-crosslinks')?.appendChild(p)}
};

})();
