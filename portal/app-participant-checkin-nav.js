(()=>{
'use strict';
let applying=false;
function participant(){try{return typeof isStaff==='function'&&!isStaff()&&typeof ownParticipant==='function'&&!!ownParticipant()}catch{return false}}
function phase(){try{return stageLabel(ownParticipant()?.stage||'VIA')}catch{return'VÍA'}}
function ensureNote(form,ser){
  let note=document.querySelector('#participantCheckinPhaseNote');
  if(ser){note?.remove();return}
  if(!note){note=document.createElement('article');note.id='participantCheckinPhaseNote';note.className='preview-strip participant-checkin-phase-note';form?.insertAdjacentElement('beforebegin',note)}
  const ph=phase();
  note.innerHTML=`<strong>Innsjekk åpnes under SER.</strong> Denne siden er synlig allerede nå for at reisen og toppmenyen skal være stabil. ${ph==='VIDA'?'I VIDA følger du i stedet neste handling i Min reise.':'Du trenger ikke registrere noe her før SER starter.'}`;
}
function setFormAvailability(form,ser){
  if(!form)return;
  for(const el of form.querySelectorAll('input,select,textarea,button')){
    if(ser&&el.dataset.aidmePhaseDisabled==='1'){el.disabled=false;delete el.dataset.aidmePhaseDisabled}
    else if(!ser&&!el.disabled){el.disabled=true;el.dataset.aidmePhaseDisabled='1'}
  }
  form.classList.toggle('participant-checkin-locked',!ser);
}
function apply(){
  if(applying)return;applying=true;
  try{
    if(!participant())return;
    const item=document.querySelector('.nav-item[data-view="checkin"]');
    if(item)item.classList.remove('hidden','nav-mobile-secondary','nav-ia-demoted');
    const ser=phase()==='SER',form=document.querySelector('#checkinForm');ensureNote(form,ser);setFormAvailability(form,ser);
  }finally{applying=false}
}
const app=document.querySelector('#appView');if(app)new MutationObserver(()=>setTimeout(apply,0)).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(apply,0));
window.addEventListener('pageshow',()=>setTimeout(apply,50));
setTimeout(apply,320);
})();
