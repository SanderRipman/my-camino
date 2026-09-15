(()=>{
'use strict';

const PREP_KEY='vida_transition_prep';
if(!ROLE_KEYS.ser_lead.includes(PREP_KEY))ROLE_KEYS.ser_lead.push(PREP_KEY);
if(!ROLE_KEYS.vida_owner.includes(PREP_KEY))ROLE_KEYS.vida_owner.unshift(PREP_KEY);
if(!PARTICIPANT_KEYS.includes(PREP_KEY))PARTICIPANT_KEYS.push(PREP_KEY);
PARTICIPANT_REQUIRED_KEYS.add(PREP_KEY);

const baseParticipantAllowedKeys=participantAllowedKeys;
participantAllowedKeys=function(){
  const stage=String(ownParticipant()?.stage||'').toUpperCase();
  if(stage==='SER')return new Set([PREP_KEY]);
  return baseParticipantAllowedKeys();
};

const baseContextOk=contextOk;
contextOk=function(){
  if(!currentDef)return false;
  const participant=selectedParticipant();
  const stage=String(participant?.stage||'').toUpperCase();
  if(currentDef.key===PREP_KEY&&participant&&stage!=='SER'){
    $('#contextNote').textContent='VIDA-forberedelsen hører til siste del av SER og kan bare lagres mens deltakeren fortsatt er i SER.';
    $('#contextNote').classList.remove('hidden');
    return false;
  }
  if(currentDef.key==='vida_plan'&&participant&&stage!=='VIDA'){
    $('#contextNote').textContent='Den formelle VIDA-planen åpnes etter at SER er avsluttet og VIDA er aktivert. Bruk VIDA-forberedelse mens deltakeren fortsatt er i SER.';
    $('#contextNote').classList.remove('hidden');
    return false;
  }
  return baseContextOk();
};

async function latestSubmittedPrep(participantId){
  const prepDef=definitions.find(d=>d.key===PREP_KEY);if(!prepDef)return null;
  const prepVersion=formVersionFor(prepDef.id);if(!prepVersion)return null;
  const {data,error}=await client.from('form_submissions')
    .select('id,payload,submitted_at,updated_at')
    .eq('participant_id',participantId)
    .eq('form_version_id',prepVersion.id)
    .eq('status','SUBMITTED')
    .order('submitted_at',{ascending:false})
    .limit(1)
    .maybeSingle();
  return error?null:data;
}
async function vidaPlanAlreadyStarted(participantId){
  if(!currentVersion)return false;
  const {count,error}=await client.from('form_submissions')
    .select('id',{count:'exact',head:true})
    .eq('participant_id',participantId)
    .eq('form_version_id',currentVersion.id);
  return !error&&Number(count||0)>0;
}
async function seedVidaPlanFromSerPrep(){
  if(currentDef?.key!=='vida_plan'||currentDraft)return;
  const participant=selectedParticipant();if(!participant||String(participant.stage).toUpperCase()!=='VIDA')return;
  if(await vidaPlanAlreadyStarted(participant.id))return;
  const prep=await latestSubmittedPrep(participant.id);if(!prep?.payload)return;
  const payload={};
  if(prep.payload.take_home)payload.learning=prep.payload.take_home;
  if(prep.payload.first_home_action)payload.action_1=prep.payload.first_home_action;
  if(prep.payload.preferred_first_contact)payload.next_contact=prep.payload.preferred_first_contact;
  if(!Object.keys(payload).length)return;
  restorePayload(payload);
  $('#formMessage').textContent='Første VIDA-steg er forhåndsutfylt fra den kontrollerte SER → VIDA-forberedelsen. Kontroller og juster før du lagrer.';
}

const baseChooseForm=chooseForm;
chooseForm=async function(){
  await baseChooseForm();
  await seedVidaPlanFromSerPrep();
};

// If the non-targeted form library initialized before this additive layer loaded,
// refresh the form choices once without changing any data.
setTimeout(()=>{
  if(!session||TARGETED_CONTEXT)return;
  fillForms();
  if($('#formSelect').value)chooseForm();
},120);
})();
