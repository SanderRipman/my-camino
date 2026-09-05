(()=>{
'use strict';

const SER_VIDA_HANDOFF_ERRORS={
  MFA_REQUIRED:'Bekreft Authenticator før du starter VIDA.',
  FORBIDDEN:'Din rolle har ikke tilgang til å starte VIDA for denne deltakeren.',
  VIDA_REQUIRES_SER:'Deltakeren er ikke lenger i SER. Last arbeidsflaten på nytt.',
  NAMED_VIDA_OWNER_REQUIRED:'Navngitt VIDA-eier mangler. Avklar ansvar før VIDA starter.',
  PARTICIPANT_NOT_FOUND:'Deltakeren er ikke tilgjengelig i denne konteksten.',
  STALE_STAGE:'Fasen ble endret et annet sted. Last arbeidsflaten på nytt.'
};
function serVidaHandoffError(code){return SER_VIDA_HANDOFF_ERRORS[code]||'VIDA kunne ikke startes. Ingen alternativ direkte databasevei ble brukt.'}
function canStartVida(){return hasRole('program_lead')||hasRole('ser_lead')}
function serVidaHandoffParticipant(){return canStartVida()?participantById(selectedParticipantId):null}
function serVidaHandoffOpenSerTasks(p){return (tasks||[]).filter(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&String(t.workflow_key||'').startsWith('ser_'))}

async function startVidaHandoff(p,button,message){
  if(!p||p.stage!=='SER'){message.textContent='Deltakeren er ikke lenger i SER. Last arbeidsflaten på nytt.';return}
  const open=serVidaHandoffOpenSerTasks(p),pilot=participantPilot(p.id);
  const detail=open.length?` Det finnes ${open.length} åpne SER-oppgave${open.length===1?'':'r'}; de blir ikke automatisk markert ferdige.`:'';
  const accepted=window.confirm(`Start VIDA for ${p.code_name}? Dette er en eksplisitt faseovergang fra SER til VIDA.${detail}`);
  if(!accepted)return;
  button.disabled=true;message.textContent='Kontrollerer tilgang og starter VIDA sikkert…';
  const {data,error}=await client.functions.invoke('workflow-command',{body:{action:'START_VIDA',participantId:p.id,pilotId:pilot?.id||null}});
  const code=data?.error||(!data?.ok&&error?'WORKFLOW_COMMAND_FAILED':null);
  if(error||code){message.textContent=serVidaHandoffError(code);button.disabled=false;return}
  message.textContent='VIDA er startet. Oppdaterer deltaker, oppgaver og levende plan…';
  await loadData();
  renderAll();
}

function serVidaHandoffPlacement(){
  const detail=document.querySelector('#participantDetail');
  if(!detail)return null;
  const heading=[...detail.querySelectorAll('h3')].find(h=>/^(Neste handling|Din neste handling|Neste steg)$/i.test((h.textContent||'').trim()));
  return{detail,heading};
}
function renderSerVidaHandoff(){
  document.querySelectorAll('.ser-vida-handoff').forEach(el=>el.remove());
  if(!canStartVida())return;
  const p=serVidaHandoffParticipant();
  if(!p||p.stage!=='SER')return;
  const placement=serVidaHandoffPlacement();
  if(!placement)return;
  const open=serVidaHandoffOpenSerTasks(p);
  const box=document.createElement('div');box.className='ser-vida-handoff';
  box.innerHTML=`<div class="detail-stat"><span>Neste handling</span><strong>SER → VIDA</strong><small>Avslutt SER og start oppfølging hjemme. Overgangen skjer ikke automatisk; serveren kontrollerer rolle, sikker innlogging og navngitt VIDA-eier.</small></div>${open.length?`<p class="gate-hint">${open.length} åpne SER-oppgave${open.length===1?'':'r'} blir liggende synlig som kontekst og lukkes ikke automatisk.</p>`:''}<div class="form-actions"><button class="primary" type="button" data-start-vida>Avslutt SER og start VIDA</button></div><p class="message" data-ser-vida-handoff-message aria-live="polite"></p>`;
  if(placement.heading)placement.heading.insertAdjacentElement('afterend',box);else placement.detail.prepend(box);
  const empty=[...placement.detail.querySelectorAll('p')].find(el=>(el.textContent||'').trim()==='Ingen åpne oppgaver.');
  if(empty&&!open.length)empty.textContent='Ingen andre åpne SER-oppgaver.';
  const button=box.querySelector('[data-start-vida]'),message=box.querySelector('[data-ser-vida-handoff-message]');
  button?.addEventListener('click',()=>startVidaHandoff(p,button,message));
}

const serVidaHandoffRenderAll=renderAll;
renderAll=function(){serVidaHandoffRenderAll();setTimeout(renderSerVidaHandoff,0)};
setTimeout(renderSerVidaHandoff,180);

})();
