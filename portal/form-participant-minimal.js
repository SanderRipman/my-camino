(()=>{
'use strict';

function applyParticipantFormChrome(){
  let staff=false;
  try{staff=isStaff()}catch{return}
  document.body.classList.toggle('participant-form-minimal',!staff);
  if(staff){document.body.classList.remove('participant-single-form');return}
  const select=document.querySelector('#formSelect');
  document.body.classList.toggle('participant-single-form',!!select&&select.options.length<=1);
}

const style=document.createElement('style');
style.id='participant-form-minimal-style';
style.textContent=`
  body.participant-form-minimal .runner-controls>label:nth-of-type(1),
  body.participant-form-minimal .runner-controls>label:nth-of-type(2),
  body.participant-form-minimal .runner-controls>.form-version{display:none}
  body.participant-form-minimal.participant-single-form .runner-controls{display:none}
  body.participant-form-minimal:not(.participant-single-form) .runner-controls{grid-template-columns:minmax(0,1fr)}
  body.participant-form-minimal:not(.participant-single-form) .runner-controls>label:nth-of-type(3){max-width:520px}
`;
document.head.appendChild(style);

setTimeout(applyParticipantFormChrome,120);
setTimeout(applyParticipantFormChrome,320);
document.querySelector('#formSelect')?.addEventListener('change',()=>setTimeout(applyParticipantFormChrome,0));
document.addEventListener('aidme:portal-rendered',applyParticipantFormChrome);
})();
