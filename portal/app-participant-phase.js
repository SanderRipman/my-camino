(()=>{
'use strict';

const PARTICIPANT_PHASE_UI_VERSION='2026-09-09a';
const PHASES=['VÍA','SER','VIDA','ny VÍA'];
let participantPhaseFilter='ALL';

function staff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function aggregateOnly(){try{return !!window.AidMeRoleLens?.aggregateOnly?.()}catch{return false}}
function people(){try{return Array.isArray(participants)?participants:[]}catch{return[]}}
function phaseOf(p){try{return stageLabel(p?.stage||'VIA')}catch{const s=String(p?.stage||'VIA').toUpperCase();return s==='SER'?'SER':s==='VIDA'?'VIDA':s==='NEW_VIA'?'ny VÍA':'VÍA'}}
function phaseClass(phase){return phase==='SER'?'ser':phase==='VIDA'?'vida':phase==='ny VÍA'?'new-via':'via'}

function ensureStyles(){
 if(document.querySelector('#aidme-participant-phase-style'))return;
 const style=document.createElement('style');style.id='aidme-participant-phase-style';style.textContent=`
  .participant-phase-filter{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
  .participant-phase-filter .chip{min-height:34px}
  .participant-card[data-participant-phase-hidden="1"]{display:none!important}
  .participant-card .aidme-participant-phase-pill{grid-column:3;grid-row:2;justify-self:end;align-self:end;border:1px solid rgba(18,63,61,.18);font-weight:800;background:#efeee8;color:#526065}
  .participant-card .aidme-participant-phase-pill.phase-via{background:#f1e9d6;color:#604b22;border-color:#c8a45d}
  .participant-card .aidme-participant-phase-pill.phase-ser{background:#e3efed;color:#123f3d;border-color:#6e8f88}
  .participant-card .aidme-participant-phase-pill.phase-vida{background:#e6edf4;color:#173852;border-color:#647f9b}
  .participant-card .aidme-participant-phase-pill.phase-new-via{background:#f1edf4;color:#523e55;border-color:#8a708c}
  @media(max-width:700px){.participant-phase-filter{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;scrollbar-width:none}.participant-phase-filter::-webkit-scrollbar{display:none}.participant-phase-filter .chip{white-space:nowrap;flex:0 0 auto}.participant-card .aidme-participant-phase-pill{font-size:10px}}
 `;document.head.appendChild(style)
}
function ensureFilter(){
 if(!staff()||aggregateOnly())return;
 const head=document.querySelector('#view-participants .section-head > div');if(!head)return;
 let host=document.querySelector('#participantPhaseFilter');
 if(!host){host=document.createElement('div');host.id='participantPhaseFilter';host.className='participant-phase-filter';host.setAttribute('aria-label','Filtrer deltakere etter fase');head.appendChild(host)}
 const buttons=[['ALL','Alle'],...PHASES.map(p=>[p,p])];
 host.innerHTML=buttons.map(([value,label])=>`<button class="chip${participantPhaseFilter===value?' active':''}" type="button" data-participant-phase="${value}">${label}</button>`).join('');
 host.querySelectorAll('[data-participant-phase]').forEach(button=>button.addEventListener('click',()=>{
   participantPhaseFilter=button.dataset.participantPhase||'ALL';
   const visible=people().filter(p=>participantPhaseFilter==='ALL'||phaseOf(p)===participantPhaseFilter);
   if(!visible.some(p=>String(p.id)===String(selectedParticipantId||'')))selectedParticipantId=visible[0]?.id||null;
   renderParticipants();
 }));
}
function decorateCards(){
 if(!staff()||aggregateOnly())return;
 ensureFilter();
 for(const card of document.querySelectorAll('#participantList .participant-card')){
   const id=card.dataset.participantId||'';
   const code=card.querySelector('b')?.textContent?.trim();
   const p=people().find(x=>String(x.id)===String(id))||people().find(x=>x.code_name===code);if(!p)continue;
   const phase=phaseOf(p),hidden=participantPhaseFilter!=='ALL'&&phase!==participantPhaseFilter;
   card.dataset.participantPhaseHidden=hidden?'1':'0';
   let pill=card.querySelector('.aidme-participant-phase-pill');if(!pill){pill=document.createElement('span');card.appendChild(pill)}
   pill.className=`pill aidme-participant-phase-pill phase-${phaseClass(phase)}`;pill.textContent=phase;pill.setAttribute('aria-label',`Fase: ${phase}`);
 }
 const intro=document.querySelector('#participantsIntro');
 if(intro&&participantPhaseFilter!=='ALL')intro.textContent=`Viser deltakere i ${participantPhaseFilter}. Status, frister og oppmerksomhet vises separat fra selve fasen.`;
}
function refresh(){ensureStyles();decorateCards()}

if(typeof renderParticipants==='function'){
 const previousRenderParticipants=renderParticipants;
 renderParticipants=function(){const result=previousRenderParticipants();setTimeout(refresh,0);return result};
}
document.addEventListener('aidme:portal-rendered',()=>setTimeout(refresh,0));
setTimeout(refresh,250);
})();
