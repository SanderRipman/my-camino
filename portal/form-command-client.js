(()=>{
'use strict';

const FORM_ERROR_TEXT={
  MFA_REQUIRED:'Bekreft Authenticator før skjemaet lagres.',
  FORBIDDEN:'Du har ikke tilgang til å lagre dette skjemaet i valgt kontekst.',
  FORM_VERSION_NOT_ACTIVE:'Denne skjemaversjonen er ikke lenger aktiv. Last siden på nytt.',
  FORM_PAYLOAD_MUST_BE_OBJECT:'Skjemaet inneholder ugyldige data.',
  UNEXPECTED_FORM_FIELD:'Skjemaet inneholder et felt som ikke hører til denne versjonen.',
  REQUIRED_CONFIRMATION_MISSING:'Bekreft alle obligatoriske punkter før du fullfører.',
  REQUIRED_SELECTION_MISSING:'Velg minst ett alternativ i alle obligatoriske felt.',
  REQUIRED_ACTION_MISSING:'Fyll inn den obligatoriske handlingen før du fullfører.',
  REQUIRED_VALUE_MISSING:'Fyll inn alle obligatoriske felt før du fullfører.',
  GO_REQUIRES_ALL_GATES_YES:'GO krever at alle obligatoriske porter er bekreftet.',
  CONDITIONAL_GO_REQUIRES_CORE_FIT_AND_CONDITIONS:'GO med vilkår krever kjerneavklaringer og tydelige vilkår.',
  PILOT_GO_REQUIRES_ALL_GATES_YES:'Samlet Pilot-GO krever at alle obligatoriske porter er bekreftet.',
  PILOT_GO_REQUIRES_ALL_INDIVIDUAL_GATES_CLOSED:'Alle individuelle beslutninger må være lukket før samlet Pilot-GO.',
  PILOT_GO_REQUIRES_NAMED_VIDA_OWNER_FOR_ALL:'Alle deltakere må ha navngitt VIDA-eier før samlet Pilot-GO.',
  NAMED_VIDA_OWNER_REQUIRED:'Navngitt VIDA-eier må være avklart før dette steget kan fullføres.',
  ACTIVE_PARTICIPANT_AGREEMENT_VERSION_REQUIRED:'Aktiv versjon av deltakeravtalen mangler. Kontakt systemansvarlig.',
  CONTEXT_IMMUTABLE:'Utkastet tilhører en annen deltaker-/pilotkontekst. Åpne riktig skjema på nytt.',
  SUBMISSION_IMMUTABLE:'Et fullført skjema kan ikke overskrives. Opprett et nytt steg/ny versjon ved behov.',
  STALE_DRAFT:'Utkastet ble endret et annet sted. Last inn skjemaet på nytt før du fortsetter.'
};
function formError(code){return FORM_ERROR_TEXT[code]||'Skjemaet kunne ikke lagres. Ingen alternativ direkte databasevei ble brukt.'}

const returnQuery=new URLSearchParams(location.search);
const returnTask=returnQuery.get('returnTask');
const returnView=returnQuery.get('returnView')||'tasks';
function returnTaskHref(){
  if(!returnTask)return'./';
  const q=new URLSearchParams({returnTask,returnView});
  return`./?${q.toString()}`;
}
function ensureReturnTaskLink(){
  if(!returnTask)return null;
  let link=document.querySelector('#formReturnTask');
  if(!link){
    link=document.createElement('a');
    link.id='formReturnTask';
    link.className='ghost task-return-link';
    link.href=returnTaskHref();
    link.textContent='Tilbake til oppgaven';
    document.querySelector('.runner-actions')?.prepend(link);
  }
  const portalLink=document.querySelector('.top-actions a.ghost[href="./"]');
  if(portalLink){portalLink.href=returnTaskHref();portalLink.textContent='Tilbake til oppgaven'}
  return link;
}
ensureReturnTaskLink();

save=async function saveThroughCommand(status){
  if(!currentVersion||!contextOk())return;
  const participant=selectedParticipant(),pilot=selectedPilot(),org=orgId();
  if(!org){$('#formMessage').textContent='Mangler organisasjonskontekst.';return}
  if(status==='SUBMITTED'&&!$('#dynamicForm').reportValidity())return;
  const body={
    action:'SAVE',
    submissionId:currentDraft?.id||null,
    organizationId:org,
    participantId:participant?.id||null,
    pilotId:pilot?.id||null,
    formVersionId:currentVersion.id,
    status,
    payload:payloadFromForm()
  };
  $('#formMessage').textContent=status==='SUBMITTED'?'Fullfører sikkert…':'Lagrer utkast sikkert…';
  const {data,error}=await client.functions.invoke('form-command',{body});
  const code=data?.error||(!data?.ok&&error?'FORM_COMMAND_FAILED':null);
  if(error||code){$('#formMessage').textContent=formError(code);return}
  const submission=data.submission;
  $('#formMessage').textContent=status==='SUBMITTED'?'Skjema fullført. Versjon, deltaker og pilotkontekst er bevart.':'Utkast lagret – du kan fortsette senere.';
  if(status==='DRAFT')currentDraft={id:submission.id};else currentDraft=null;
  if(status==='SUBMITTED'){
    const link=ensureReturnTaskLink();
    if(link){link.className='primary task-return-link';link.textContent='Tilbake til oppgaven og se oppdatert status'}
  }
  await loadSubmissions();
};
})();
