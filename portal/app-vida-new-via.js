(()=>{
'use strict';

const NEW_VIA_ERRORS={
  MFA_REQUIRED:'Bekreft Authenticator før du starter en ny VÍA.',
  FORBIDDEN:'Din rolle har ikke tilgang til å starte ny VÍA for denne deltakeren.',
  NEW_VIA_REQUIRES_VIDA:'Ny VÍA kan bare startes fra aktiv VIDA-fase.',
  PARTICIPANT_NOT_FOUND:'Deltakeren er ikke tilgjengelig i denne konteksten.',
  STALE_STAGE:'Fasen ble endret et annet sted. Last arbeidsflaten på nytt.'
};
function newViaError(code){return NEW_VIA_ERRORS[code]||'Ny VÍA kunne ikke startes. Ingen alternativ direkte databasevei ble brukt.'}
function canStartNewVia(){return hasRole('project_owner')||hasRole('vida_owner')}

async function startOptionalNewVia(p,button,message){
  if(!p||p.stage!=='VIDA'){message.textContent='Deltakeren er ikke lenger i VIDA. Last arbeidsflaten på nytt.';return}
  const accepted=window.confirm(`Starte ny VÍA for ${p.code_name}? Dette er et valgfritt nytt startpunkt når retningen må justeres – ikke et obligatorisk fjerde programsteg.`);
  if(!accepted)return;
  button.disabled=true;message.textContent='Kontrollerer tilgang og starter ny VÍA…';
  const pilot=participantPilot(p.id);
  const {data,error}=await client.functions.invoke('workflow-command',{body:{action:'START_NEW_VIA',participantId:p.id,pilotId:pilot?.id||null}});
  const code=data?.error||(!data?.ok&&error?'WORKFLOW_COMMAND_FAILED':null);
  if(error||code){message.textContent=newViaError(code);button.disabled=false;return}
  message.textContent='Ny VÍA er startet som nytt veivalg. Oppdaterer arbeidsflaten…';
  await loadData();
  renderAll();
}

function renderOptionalNewVia(){
  document.querySelectorAll('.vida-new-via').forEach(el=>el.remove());
  if(!canStartNewVia())return;
  const p=participantById(selectedParticipantId);
  if(!p||p.stage!=='VIDA')return;
  const card=document.querySelector('.ser-vida-today[data-ser-vida-phase="VIDA"]');
  if(!card)return;
  const box=document.createElement('div');box.className='vida-new-via';
  box.innerHTML=`<div class="detail-stat"><span>Ved behov</span><strong>Ny VÍA · nytt startpunkt</strong></div><p class="privacy-note">VIDA er siste steg i den ordinære trestegsreisen. Ny VÍA brukes bare når deltakeren og ansvarlig oppfølging trenger et nytt veivalg. Det skjer aldri automatisk ved 90 dager eller fordi en oppfølgingsoppgave er ferdig.</p><div class="form-actions"><button class="secondary" type="button" data-start-new-via>Start ny VÍA ved behov</button></div><p class="message" data-new-via-message aria-live="polite"></p>`;
  card.appendChild(box);
  const button=box.querySelector('[data-start-new-via]'),message=box.querySelector('[data-new-via-message]');
  button?.addEventListener('click',()=>startOptionalNewVia(p,button,message));
}

const newViaRenderAll=renderAll;
renderAll=function(){newViaRenderAll();setTimeout(renderOptionalNewVia,0)};
setTimeout(renderOptionalNewVia,200);

})();
