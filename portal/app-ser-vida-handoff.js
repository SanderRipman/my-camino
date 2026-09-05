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
let participantInlineCollapsed=true;
function serVidaHandoffError(code){return SER_VIDA_HANDOFF_ERRORS[code]||'VIDA kunne ikke startes. Ingen alternativ direkte databasevei ble brukt.'}
function canStartVida(){return hasRole('program_lead')||hasRole('ser_lead')}
function serVidaHandoffParticipant(){return canStartVida()?participantById(selectedParticipantId):null}
function serVidaHandoffOpenSerTasks(p){return (tasks||[]).filter(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&String(t.workflow_key||'').startsWith('ser_'))}
function participantRagText(value){return({GREEN:'Grønn',YELLOW:'Gul',RED:'Rød'})[String(value||'GREEN').toUpperCase()]||String(value||'Grønn')}

async function startVidaHandoff(p,button,message){
  if(!p||p.stage!=='SER'){message.textContent='Deltakeren er ikke lenger i SER. Last arbeidsflaten på nytt.';return}
  const open=serVidaHandoffOpenSerTasks(p),pilot=participantPilot(p.id);
  const detail=open.length?` Det finnes ${open.length} åpne SER-oppgave${open.length===1?'':'r'}; de blir ikke automatisk markert ferdige.`:'';
  const accepted=window.confirm(`Fullfør SER og aktiver VIDA for ${p.code_name}? Bruk dette ved den faktiske overgangen når SER avsluttes. 72-timersbroen og videre VIDA-oppfølging starter fra dette tidspunktet.${detail}`);
  if(!accepted)return;
  button.disabled=true;message.textContent='Kontrollerer tilgang og aktiverer VIDA sikkert…';
  const {data,error}=await client.functions.invoke('workflow-command',{body:{action:'START_VIDA',participantId:p.id,pilotId:pilot?.id||null}});
  const code=data?.error||(!data?.ok&&error?'WORKFLOW_COMMAND_FAILED':null);
  if(error||code){message.textContent=serVidaHandoffError(code);button.disabled=false;return}
  message.textContent='VIDA er aktivert. Oppdaterer deltaker, oppgaver og levende plan…';
  await loadData();
  participantInlineCollapsed=false;
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
  box.innerHTML=`<div class="detail-stat"><span>Neste handling</span><strong>SER → VIDA</strong><small>VIDA forberedes i siste del av SER. Fullfør faseovergangen først ved den faktiske avslutningen av SER; da starter 72-timersbroen og videre oppfølging hjemme.</small></div>${open.length?`<p class="gate-hint">${open.length} åpne SER-oppgave${open.length===1?'':'r'} blir liggende synlig som kontekst og lukkes ikke automatisk.</p>`:''}<div class="form-actions"><button class="primary" type="button" data-start-vida>Fullfør SER og aktiver VIDA</button></div><p class="message" data-ser-vida-handoff-message aria-live="polite"></p>`;
  if(placement.heading)placement.heading.insertAdjacentElement('afterend',box);else placement.detail.prepend(box);
  const empty=[...placement.detail.querySelectorAll('p')].find(el=>(el.textContent||'').trim()==='Ingen åpne oppgaver.');
  if(empty&&!open.length)empty.textContent='Ingen andre åpne SER-oppgaver.';
  const button=box.querySelector('[data-start-vida]'),message=box.querySelector('[data-ser-vida-handoff-message]');
  button?.addEventListener('click',()=>startVidaHandoff(p,button,message));
}

function installParticipantInlineStyles(){
  if(document.querySelector('#participant-inline-detail-style'))return;
  const style=document.createElement('style');style.id='participant-inline-detail-style';style.textContent=`
    @media(max-width:780px){
      #view-participants{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding-bottom:max(36px,env(safe-area-inset-bottom,0px))!important}
      #view-participants .participant-layout{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
      #participantList{display:grid!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;align-content:start!important}
      #participantList>#participantDetail.participant-detail-inline{display:block;width:100%;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;margin:0 0 12px;padding-bottom:14px;box-sizing:border-box;scroll-margin-top:84px}
      #participantList>.participant-card.active{margin-bottom:0;border-bottom-left-radius:8px;border-bottom-right-radius:8px}
      #participantList>.participant-card.active+#participantDetail.participant-detail-inline{margin-top:6px}
      #participantList>#participantDetail.participant-detail-inline.participant-inline-collapsed{display:none!important}
    }
  `;document.head.appendChild(style);
}
function restoreParticipantDetailHost(){
  const detail=document.querySelector('#participantDetail'),layout=document.querySelector('#view-participants .participant-layout');
  if(detail&&layout&&detail.parentElement!==layout)layout.appendChild(detail);
  detail?.classList.remove('participant-detail-inline','participant-inline-collapsed');
}
function placeParticipantDetailInline(){
  installParticipantInlineStyles();
  const detail=document.querySelector('#participantDetail');
  if(!detail)return;
  if(window.innerWidth>780||!isStaff()){restoreParticipantDetailHost();return}
  const list=document.querySelector('#participantList'),active=list?.querySelector('.participant-card.active');
  if(!list||!active)return;
  active.insertAdjacentElement('afterend',detail);
  detail.classList.add('participant-detail-inline');
  detail.classList.toggle('participant-inline-collapsed',participantInlineCollapsed);
}
function bindParticipantInlineToggle(){
  const list=document.querySelector('#participantList');if(!list||list.dataset.inlineToggleBound==='1')return;
  list.dataset.inlineToggleBound='1';
  list.addEventListener('click',event=>{
    if(window.innerWidth>780||!isStaff())return;
    const card=event.target.closest('.participant-card');if(!card)return;
    const same=card.classList.contains('active')&&card.dataset.participantId===selectedParticipantId;
    if(!same){participantInlineCollapsed=false;return}
    const detail=document.querySelector('#participantDetail');
    if(!detail?.classList.contains('participant-detail-inline'))return;
    participantInlineCollapsed=!participantInlineCollapsed;
    detail.classList.toggle('participant-inline-collapsed',participantInlineCollapsed);
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  },true);
}
function localizeParticipantDetailRag(){
  const p=participantById(selectedParticipantId),detail=document.querySelector('#participantDetail');if(!p||!detail)return;
  const raw=latestCheckin(p.id)?.rag||'GREEN',text=participantRagText(raw),head=detail.querySelector('.card-head');if(!head)return;
  const eyebrow=head.querySelector('.eyebrow'),pill=head.querySelector('.pill');
  if(eyebrow)eyebrow.textContent=`${stageLabel(p.stage)} · ${text.toUpperCase()}`;
  if(pill)pill.textContent=text;
}
function refreshSelectedParticipantAugmentations(){
  try{if(typeof renderSerVidaToday==='function')renderSerVidaToday()}catch{}
  renderSerVidaHandoff();
  localizeParticipantDetailRag();
  placeParticipantDetailInline();
  bindParticipantInlineToggle();
}

const serVidaHandoffRenderParticipants=renderParticipants;
renderParticipants=function(){
  restoreParticipantDetailHost();
  const result=serVidaHandoffRenderParticipants();
  setTimeout(refreshSelectedParticipantAugmentations,0);
  return result;
};
const serVidaHandoffRenderAll=renderAll;
renderAll=function(){
  restoreParticipantDetailHost();
  const result=serVidaHandoffRenderAll();
  setTimeout(refreshSelectedParticipantAugmentations,0);
  return result;
};
window.addEventListener('resize',()=>setTimeout(placeParticipantDetailInline,80),{passive:true});
setTimeout(refreshSelectedParticipantAugmentations,180);

})();
