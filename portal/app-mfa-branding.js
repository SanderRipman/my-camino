(()=>{
'use strict';

const MFA_TOTP_ISSUER='AidMe';
const MFA_TOTP_FRIENDLY_NAME='AidMe VIDA';
const AUTHENTICATOR_HELP_URL='https://support.microsoft.com/nb-no/authenticator/download-microsoft-authenticator';
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

function installAuthenticatorHelp(){
  const security=document.querySelector('#view-security');
  if(!security||security.querySelector('#authenticatorHelp'))return;
  const primary=security.querySelector('#startMfa')?.closest('.panel-card');
  if(!primary)return;
  const help=document.createElement('details');
  help.id='authenticatorHelp';
  help.className='auth-inline-help';
  help.innerHTML=`<summary><strong>Trenger du en Authenticator-app?</strong></summary><p>AidMe bruker standard TOTP. Du kan bruke Microsoft Authenticator, Google Authenticator, 1Password, Authy eller en annen kompatibel autentiseringsapp.</p><p><strong>iPhone / Android:</strong> Installer appen på telefonen. Microsoft har en samlet, offisiell nedlastingsside for begge plattformer.</p><p><strong>PC / Mac:</strong> Microsoft Authenticator finnes ikke som PC- eller Mac-app. For arbeidsroller og sensitive moduler anbefaler vi telefon som separat enhet.</p><p>Hvis du åpner AidMe på samme telefon som autentiseringsappen, kan du bruke den manuelle nøkkelen i stedet for å skanne QR-koden.</p><p><a href="${AUTHENTICATOR_HELP_URL}" target="_blank" rel="noopener noreferrer">Last ned / se veiledning for Microsoft Authenticator →</a></p>`;
  primary.appendChild(help);
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
  $('#mfaEnrollMessage').textContent=`AidMe · ${mfaEnrollmentIdentity()}. Skann QR-koden eller bruk manuell nøkkel, og bekreft med seks sifre.`;
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
installAuthenticatorHelp();

})();
