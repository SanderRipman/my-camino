(()=>{
'use strict';

let earlyUatPhaseFilter='ALL';
const FILTERS=[['ALL','Alle'],['VÍA','VÍA'],['SER','SER'],['VIDA','VIDA'],['ny VÍA','ny VÍA']];

function earlyUatStaff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function earlyUatPhase(p){try{return stageLabel(p?.stage||'VIA')}catch{return'VÍA'}}
function earlyUatPhaseClass(phase){return phase==='SER'?'ser':phase==='VIDA'?'vida':phase==='ny VÍA'?'new-via':'via'}
function earlyUatStyles(){
  if(document.querySelector('#early-uat-polish-style'))return;
  const style=document.createElement('style');style.id='early-uat-polish-style';style.textContent=`
    .participant-phase-filter{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
    .participant-phase-filter .chip{min-height:34px}
    .participant-card .phase-pill{margin-left:auto;margin-right:4px;border-width:1px;border-style:solid;font-weight:800}
    .phase-pill.phase-via{background:#f1e9d6;border-color:#c8a45d;color:#604b22}
    .phase-pill.phase-ser{background:#e3efed;border-color:#6e8f88;color:#123f3d}
    .phase-pill.phase-vida{background:#e6edf4;border-color:#647f9b;color:#173852}
    .phase-pill.phase-new-via{background:#f1edf4;border-color:#8a708c;color:#523e55}
    .participant-card[data-phase-hidden="1"]{display:none!important}
    @media(max-width:700px){.participant-phase-filter{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.participant-phase-filter .chip{white-space:nowrap}.participant-card .phase-pill{font-size:10px}}
  `;document.head.appendChild(style);
}
function ensurePhaseFilter(){
  if(!earlyUatStaff())return;
  const view=document.querySelector('#view-participants'),head=view?.querySelector('.section-head');if(!head)return;
  let host=document.querySelector('#participantPhaseFilter');
  if(!host){host=document.createElement('div');host.id='participantPhaseFilter';host.className='participant-phase-filter';host.setAttribute('aria-label','Filtrer deltakere etter fase');head.querySelector('div')?.appendChild(host)}
  host.innerHTML=FILTERS.map(([value,label])=>`<button class="chip${earlyUatPhaseFilter===value?' active':''}" type="button" data-participant-phase="${value}">${label}</button>`).join('');
  host.querySelectorAll('[data-participant-phase]').forEach(button=>button.addEventListener('click',()=>{
    earlyUatPhaseFilter=button.dataset.participantPhase||'ALL';
    const visible=(participants||[]).filter(p=>earlyUatPhaseFilter==='ALL'||earlyUatPhase(p)===earlyUatPhaseFilter);
    if(!visible.some(p=>p.id===selectedParticipantId))selectedParticipantId=visible[0]?.id||null;
    renderParticipants();
  }));
}
function decorateParticipantCards(){
  if(!earlyUatStaff())return;
  const cards=[...document.querySelectorAll('#participantList .participant-card')];
  for(const card of cards){
    const code=card.querySelector('b')?.textContent?.trim();const p=(participants||[]).find(x=>x.code_name===code);if(!p)continue;
    const phase=earlyUatPhase(p),hidden=earlyUatPhaseFilter!=='ALL'&&phase!==earlyUatPhaseFilter;
    card.dataset.phaseHidden=hidden?'1':'0';
    let pill=card.querySelector('.phase-pill');if(!pill){pill=document.createElement('span');card.appendChild(pill)}
    pill.className=`pill phase-pill phase-${earlyUatPhaseClass(phase)}`;pill.textContent=phase;
  }
  const intro=document.querySelector('#participantsIntro');
  if(intro&&earlyUatPhaseFilter!=='ALL')intro.textContent=`Viser aktive deltakere i ${earlyUatPhaseFilter}. Status og frister vises separat fra selve fasen.`;
}
function refresh(){earlyUatStyles();ensurePhaseFilter();decorateParticipantCards()}

if(typeof renderParticipants==='function'){
  const baseRenderParticipants=renderParticipants;
  renderParticipants=function(){const result=baseRenderParticipants();setTimeout(refresh,0);return result};
}
setTimeout(refresh,260);
document.addEventListener('aidme:portal-rendered',()=>setTimeout(refresh,0));
})();
