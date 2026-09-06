(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const reviseLatest=params.get('reviseLatest')==='1';
let prefilledKey='';

function revisionNotice(){
  let note=document.querySelector('#goReassessmentNote');
  if(note)return note;
  note=document.createElement('article');
  note.id='goReassessmentNote';
  note.className='preview-strip';
  note.innerHTML='<strong>Ny formell vurdering.</strong> Forrige GO/NO-GO er hentet inn som utgangspunkt. Endre bare det som faktisk er avklart; tidligere beslutning beholdes skrivebeskyttet i historikken.';
  document.querySelector('#dynamicForm')?.insertAdjacentElement('beforebegin',note);
  return note;
}

function syncConditionalExplanation(){
  if(currentDef?.key!=='individual_go_no_go')return;
  const decision=document.querySelector('[name="decision"]');
  const conditions=document.querySelector('[name="conditions"]');
  if(!decision||!conditions)return;
  const conditional=decision.value==='GO_WITH_CONDITIONS';
  conditions.required=conditional;
  conditions.setAttribute('aria-required',conditional?'true':'false');
  let help=document.querySelector('#conditionalGoHelp');
  if(!help){
    help=document.createElement('small');
    help.id='conditionalGoHelp';
    help.textContent='Ved GO med vilkår må du kort beskrive hva som gjenstår, hvem som følger opp og når det skal være avklart.';
    conditions.insertAdjacentElement('afterend',help);
  }
  help.hidden=!conditional;
}

document.querySelector('#dynamicForm')?.addEventListener('change',event=>{
  if(event.target?.name==='decision')syncConditionalExplanation();
});

const reassessmentLoadSubmissions=loadSubmissions;
loadSubmissions=async function(){
  await reassessmentLoadSubmissions();
  syncConditionalExplanation();
  if(!reviseLatest||currentDef?.key!=='individual_go_no_go'||currentDraft)return;
  const participantId=document.querySelector('#participantSelect')?.value||'';
  if(!participantId||!currentVersion?.id)return;
  const key=`${participantId}:${currentVersion.id}`;
  if(prefilledKey===key)return;
  const {data,error}=await client.from('form_submissions')
    .select('id,payload,submitted_at')
    .eq('participant_id',participantId)
    .eq('form_version_id',currentVersion.id)
    .eq('status','SUBMITTED')
    .order('submitted_at',{ascending:false})
    .limit(1)
    .maybeSingle();
  if(error||!data?.payload||data.payload.decision!=='GO_WITH_CONDITIONS')return;
  prefilledKey=key;
  restorePayload(data.payload);
  syncConditionalExplanation();
  revisionNotice();
};

})();
