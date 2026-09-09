(()=>{
'use strict';

const UAT_PHASE_CONTEXT_VERSION='2026-09-09b';
let applying=false;

function staffPortal(){
  try{return !!document.querySelector('#mainNav')&&typeof isStaff==='function'&&isStaff()}catch{return false}
}
function allParticipants(){try{return Array.isArray(participants)?participants:[]}catch{return[]}}
function allTasks(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function phaseOfParticipant(p){
  if(!p)return null;
  try{return stageLabel(p.stage||'VIA')}catch{
    const stage=String(p.stage||'VIA').toUpperCase();
    return stage==='SER'?'SER':stage==='VIDA'?'VIDA':stage==='NEW_VIA'?'ny VÍA':stage==='CLOSED'?'CLOSED':'VÍA';
  }
}
function participantForRow(row){
  const id=String(row?.dataset?.taskId||'');
  if(id){const task=allTasks().find(t=>String(t.id)===id);if(task?.participant_id){const p=allParticipants().find(x=>String(x.id)===String(task.participant_id));if(p)return p}}
  const text=String(row?.textContent||'');
  return allParticipants().find(p=>p?.code_name&&text.includes(p.code_name))||null;
}
function ensureStyles(){
  if(document.querySelector('#uat-phase-context-style'))return;
  const style=document.createElement('style');style.id='uat-phase-context-style';style.textContent=`
    /* Phase is compact context. Large dashboard/task strips stay retired; participant filtering remains useful. */
    #overviewPhaseStrip,#taskPhaseFilter{display:none!important}
    .participant-card [data-uat-duplicate-phase="1"]{display:none!important}
    .participant-card .uat-phase-pill{display:inline-flex!important;align-items:center;white-space:nowrap;margin-left:auto;margin-right:4px;background:#efeee8;border-color:#d6d5cd;color:#526065;font-weight:800}
    .uat-context-phase-pill{white-space:nowrap;margin-left:2px;background:#efeee8;border-color:#d6d5cd;color:#526065;font-weight:800}
  `;document.head.appendChild(style);
}
function cleanParticipantPhasePills(){
  if(!staffPortal())return;
  document.querySelectorAll('#participantList .participant-card').forEach(card=>{
    const code=card.querySelector('b')?.textContent?.trim(),participant=allParticipants().find(p=>p.code_name===code);if(!participant)return;
    const phase=phaseOfParticipant(participant);if(!phase)return;
    let preferred=card.querySelector('.uat-phase-pill');
    if(!preferred){preferred=document.createElement('span');preferred.className='pill uat-phase-pill';card.appendChild(preferred)}
    preferred.textContent=phase;preferred.setAttribute('aria-label',`Deltakerfase: ${phase}`);preferred.removeAttribute('data-uat-duplicate-phase');
    [...card.querySelectorAll('span,.pill')].forEach(el=>{
      if(el===preferred)return;
      if((el.textContent||'').trim()===phase)el.dataset.uatDuplicatePhase='1';
      else el.removeAttribute('data-uat-duplicate-phase');
    });
  });
}
function decorateTaskRows(){
  if(!staffPortal())return;
  document.querySelectorAll('#priorityQueue .task-row,#taskList .task-row').forEach(row=>{
    const meta=row.querySelector('.task-meta');if(!meta)return;
    const participant=participantForRow(row),phase=phaseOfParticipant(participant);
    let pill=meta.querySelector('.uat-context-phase-pill');
    if(!phase){pill?.remove();return}
    if(!pill){pill=document.createElement('span');pill.className='pill uat-context-phase-pill';pill.setAttribute('aria-label','Deltakerfase');meta.appendChild(pill)}
    if(pill.textContent!==phase)pill.textContent=phase;
  });
}
function apply(){
  if(applying)return;applying=true;
  try{ensureStyles();cleanParticipantPhasePills();decorateTaskRows()}finally{applying=false}
}
const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(apply,25)});
observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));
window.addEventListener('pageshow',()=>setTimeout(apply,30));
[0,120,350,800,1500].forEach(ms=>setTimeout(apply,ms));
})();
