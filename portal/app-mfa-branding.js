(()=>{
'use strict';

const MFA_TOTP_ISSUER='AidMe';
const MFA_TOTP_FRIENDLY_NAME='AidMe VIDA';
const QA_ROLE_LABELS={
  via_owner:'VÍA-ansvarlig',
  clinical_professional:'Relevant fagperson',
  ser_lead:'SER-/turleder',
  vida_owner:'VIDA-eier',
  logistics:'Logistikk / beredskap',
  program_lead:'Programleder',
  project_owner:'Prosjekteier',
  observer:'Observatør',
  evaluator:'Evaluator',
  participant:'Deltaker'
};

function mfaEnrollmentIdentity(){
  const email=session?.user?.email||'konto';
  const qaKey=session?.user?.user_metadata?.qa_key;
  const role=qaKey?QA_ROLE_LABELS[qaKey]:null;
  return role?`${role} · ${email}`:email;
}

const brandedStartMfaEnrollment=async function(){
  $('#mfaEnrollMessage').textContent='Oppretter sikker AidMe-faktor…';
  const {data,error}=await client.auth.mfa.enroll({
    factorType:'totp',
    friendlyName:MFA_TOTP_FRIENDLY_NAME,
    issuer:MFA_TOTP_ISSUER
  });
  if(error){
    $('#mfaEnrollMessage').textContent='Kunne ikke starte Authenticator-oppsettet.';
    return;
  }
  pendingEnrollmentFactorId=data.id;
  $('#mfaQr').src=data.totp.qr_code;
  $('#mfaSecret').value=data.totp.secret||'';
  $('#mfaEnrollPanel').classList.remove('hidden');
  $('#mfaEnrollMessage').textContent=`AidMe · ${mfaEnrollmentIdentity()}. Skann QR-koden og bekreft med seks sifre.`;
};

// Core binds the original enrollment function before this late branding layer loads.
// Replace that one button once so future enrollments use the branded handler instead
// of leaving the already-bound unbranded callback in place.
startMfaEnrollment=brandedStartMfaEnrollment;
function bindBrandedMfaStart(){
  const current=document.querySelector('#startMfa');
  if(!current||current.dataset.aidmeMfaBound==='1')return;
  const replacement=current.cloneNode(true);
  replacement.dataset.aidmeMfaBound='1';
  current.replaceWith(replacement);
  replacement.addEventListener('click',brandedStartMfaEnrollment);
}
bindBrandedMfaStart();

})();
