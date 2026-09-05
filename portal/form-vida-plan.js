(()=>{
'use strict';

let vidaOwnerRequestKey='';
let vidaOwnerContext=null;

function vidaFormActive(){return currentDef?.key==='vida_plan'}
function vidaOwnerInput(){return document.querySelector('[name="vida_owner"]')}
function vidaOwnerWrap(){return vidaOwnerInput()?.closest('.field-wrap')||null}
function ensureVidaOwnerNote(){
  const wrap=vidaOwnerWrap();if(!wrap)return null
  let note=wrap.querySelector('.vida-owner-note')
  if(!note){note=document.createElement('small');note.className='vida-owner-note';wrap.querySelector('label')?.appendChild(note)}
  return note
}
async function fetchCanonicalVidaOwner(){
  const participant=selectedParticipant();
  if(!vidaFormActive()||!participant)return null
  const key=participant.id
  if(vidaOwnerRequestKey===key&&vidaOwnerContext)return vidaOwnerContext
  const {data,error}=await client.functions.invoke('case-command',{body:{action:'GET_VIDA_OWNER',participantId:participant.id}})
  if(error||!data?.ok){vidaOwnerRequestKey='';vidaOwnerContext=null;return null}
  vidaOwnerRequestKey=key;vidaOwnerContext=data.owner||null;return vidaOwnerContext
}
async function applyCanonicalVidaOwner(){
  if(!vidaFormActive())return
  const input=vidaOwnerInput();if(!input)return
  const note=ensureVidaOwnerNote();
  input.readOnly=true;input.setAttribute('aria-readonly','true');input.classList.add('canonical-owner')
  const owner=await fetchCanonicalVidaOwner()
  if(owner?.full_name&&owner?.eligible!==false){
    input.value=owner.full_name;input.dataset.ownerUserId=owner.user_id||''
    if(note)note.textContent='Forhåndsdefinert fra Ansvar / eiere. Endres der – ikke i selve VIDA-planen.'
  }else{
    input.value='';delete input.dataset.ownerUserId
    if(note)note.textContent='Mangler aktiv, navngitt VIDA-eier. Avklar ansvar under Ansvar / eiere før planen fullføres.'
  }
}
function resetVidaOwnerContext(){vidaOwnerRequestKey='';vidaOwnerContext=null}

const vidaBaseChooseForm=chooseForm;
chooseForm=async function(){
  resetVidaOwnerContext();
  await vidaBaseChooseForm();
  await applyCanonicalVidaOwner();
};

const vidaBaseRestorePayload=restorePayload;
restorePayload=function(payload={}){
  vidaBaseRestorePayload(payload);
  if(vidaFormActive())setTimeout(()=>applyCanonicalVidaOwner(),0);
};

window.AidMeVidaPlan=Object.freeze({
  applyCanonicalOwner:applyCanonicalVidaOwner,
  resetOwnerContext:resetVidaOwnerContext
});

setTimeout(()=>applyCanonicalVidaOwner(),180);
})();
