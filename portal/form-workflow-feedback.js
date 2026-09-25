(()=>{
'use strict';

const VERIFIED_NEXT={
  interest_referral:{title:'Neste steg er avklaring',text:'Innsendingen registreres i samme sak og sender den videre til VÍA-/programansvarlig for vurdering av riktig neste steg.'},
  via_roadmap:{title:'Veikartet går videre til VÍA-gjennomgang',text:'Det fullførte veikartet oppretter eller gjenbruker neste review-oppgave. Formell GO/NO-GO tas fortsatt i eget beslutningssteg.'},
  participant_agreement:{title:'Avtalen går videre til kontroll',text:'Avtale og beredskap går videre til review før samlet Pilot-GO. Innsendingen starter ikke SER i seg selv.'},
  vida_plan:{title:'Samme VIDA-plan følges videre',text:'Planen beholdes som én levende plan. 72 timer, 14, 30 og 90 dager er oppfølgingspunkter og oppretter ikke parallelle planer ved senere revisjoner.'}
};
function success(){const msg=document.querySelector('#formMessage')?.textContent||'';return /^Skjema fullført/.test(msg)}
function decorate(key){
  if(!success())return;
  const dialog=document.querySelector('#formCompletionBackdrop .form-completion-dialog');if(!dialog)return;
  dialog.querySelector('[data-form-workflow-feedback]')?.remove();
  const info=VERIFIED_NEXT[key]||{title:'Arbeidsflyten er oppdatert',text:'Registreringen er lagret i valgt deltaker-/pilotkontekst. Eventuelle neste steg følger den autoriserte oppgave- og gateflyten.'};
  const box=document.createElement('div');box.dataset.formWorkflowFeedback='1';box.className='preview-strip';box.innerHTML=`<strong>${esc(info.title)}</strong><p>${esc(info.text)}</p>`;
  dialog.querySelector('.form-completion-actions')?.insertAdjacentElement('beforebegin',box);
}

if(typeof save!=='function')return;
const priorSave=save;
save=async function(status){const key=currentDef?.key||'';await priorSave(status);if(status==='SUBMITTED')decorate(key)};
})();