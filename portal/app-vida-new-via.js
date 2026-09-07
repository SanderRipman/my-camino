(()=>{
'use strict';

const NEW_VIA_ERRORS={
  MFA_REQUIRED:'Bekreft Authenticator før du starter en ny VÍA.',
  FORBIDDEN:'Din rolle har ikke tilgang til å starte ny VÍA for denne deltakeren.',
  NEW_VIA_REQUIRES_VIDA:'Ny VÍA kan bare startes fra aktiv VIDA-fase.',
  PARTICIPANT_NOT_FOUND:'Deltakeren er ikke tilgjengelig i denne konteksten.',
  STALE_STAGE:'Fasen ble endret et annet sted. Last arbeidsflaten på nytt.',
  WORKFLOW_COMMAND_FAILED:'Ny VÍA-overgangen svarte ikke som forventet. Ingen data ble endret.'
};
function newViaError(code){return NEW_VIA_ERRORS[code]||`Ny VÍA kunne ikke startes (${code||'ukjent årsak'}). Ingen alternativ direkte databasevei ble brukt.`}
async function newViaWorkflowErrorCode(data,error){
  if(data?.error)return String(data.error);
  const response=error?.context;
  if(response){try{const payload=await (typeof response.clone==='function'?response.clone():response).json();if(payload?.error)return String(payload.error)}catch{}}
  return error?'WORKFLOW_COMMAND_FAILED':null;
}
function canStartNewVia(){return hasRole('project_owner')||hasRole('vida_owner')}

function confirmOptionalNewVia(p){
  return new Promise(resolve=>{
    const dialog=document.createElement('dialog');
    dialog.className='task-dialog new-via-confirm-dialog';
    dialog.setAttribute('aria-labelledby','newViaConfirmTitle');
    dialog.innerHTML=`<div class="dialog-shell"><div class="dialog-head"><div><p class="eyebrow">Valgfritt nytt startpunkt</p><h2 id="newViaConfirmTitle">Starte ny VÍA?</h2></div><button class="icon-btn" type="button" data-new-via-cancel aria-label="Lukk">×</button></div><p><strong>${escapeHtml(p.code_name)}</strong> er ferdig med ordinær VIDA-oppfølging. Start bare ny VÍA når deltakeren og ansvarlig faktisk trenger et nytt veivalg.</p><p class="privacy-note">Dette er ikke et obligatorisk fjerde programsteg. Tidligere VIDA-planer og historikk beholdes uendret.</p><div class="dialog-actions"><button class="ghost" type="button" data-new-via-cancel>Avbryt</button><button class="primary" type="button" data-new-via-confirm>Start ny VÍA</button></div></div>`;
    document.body.appendChild(dialog);
    let settled=false;
    const finish=accepted=>{
      if(settled)return;
      settled=true;
      if(dialog.open)dialog.close();
      dialog.remove();
      resolve(accepted);
    };
    dialog.querySelectorAll('[data-new-via-cancel]').forEach(b=>b.addEventListener('click',()=>finish(false)));
    dialog.querySelector('[data-new-via-confirm]')?.addEventListener('click',()=>finish(true));
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false)},{once:true});
    dialog.showModal();
  });
}

async function startOptionalNewVia(p,button,message){
  if(!p||p.stage!=='VIDA'){message.textContent='Deltakeren er ikke lenger i VIDA. Last arbeidsflaten på nytt.';return}
  const accepted=await confirmOptionalNewVia(p);
  if(!accepted)return;
  button.disabled=true;message.textContent='Kontrollerer tilgang og starter ny VÍA…';
  const pilot=participantPilot(p.id);
  const {data,error}=await client.functions.invoke('workflow-command',{body:{action:'START_NEW_VIA',participantId:p.id,pilotId:pilot?.id||null}});
  const code=await newViaWorkflowErrorCode(data,error);
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
  const card=document.querySelector('#participantDetail')||document.querySelector('.ser-vida-today[data-ser-vida-phase="VIDA"]');
  if(!card)return;
  const box=document.createElement('div');box.className='vida-new-via';
  box.innerHTML=`<div class="detail-stat"><span>Ved behov</span><strong>Ny VÍA · nytt startpunkt</strong></div><p class="privacy-note">VIDA er siste steg i den ordinære trestegsreisen. Ny VÍA brukes bare når deltakeren og ansvarlig oppfølging trenger et nytt veivalg. Det skjer aldri automatisk ved 90 dager eller fordi en oppfølgingsoppgave er ferdig.</p><div class="form-actions"><button class="secondary" type="button" data-start-new-via>Start ny VÍA ved behov</button></div><p class="message" data-new-via-message aria-live="polite"></p>`;
  card.appendChild(box);
  const button=box.querySelector('[data-start-new-via]'),message=box.querySelector('[data-new-via-message]');
  button?.addEventListener('click',()=>startOptionalNewVia(p,button,message));
}

const newViaRenderParticipantDetail=renderParticipantDetail;
renderParticipantDetail=function(){newViaRenderParticipantDetail();setTimeout(renderOptionalNewVia,0)};

const newViaRenderAll=renderAll;
renderAll=function(){newViaRenderAll();setTimeout(renderOptionalNewVia,0)};
setTimeout(renderOptionalNewVia,200);

})();