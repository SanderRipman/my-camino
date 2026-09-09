(()=>{
'use strict';

const UAT_PHASE_CONTEXT_VERSION='2026-09-09a';
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
    return stage==='SER'?'SER':stage==='VIDA'?'VIDA':stage==='NEW_VIA'?'ny VÍA':'VÍA';
  }
}
function taskPhase(row){
  const id=String(row?.dataset?.taskId||'');if(!id)return null;
  const task=allTasks().find(t=>String(t.id)===id);if(!task?.participant_id)return null;
  const participant=allParticipants().find(p=>String(p.id)===String(task.participant_id));
  return phaseOfParticipant(participant);
}
function ensureStyles(){
  if(document.querySelector('#uat-phase-context-style'))return;
  const style=document.createElement('style');style.id='uat-phase-context-style';style.textContent=`
    /* User-tested correction: phase is context, not a large dashboard filter. */
    #overviewPhaseStrip,#taskPhaseFilter,#participantPhaseFilter{display:none!important}
    .participant-card .uat-phase-pill{display:none!important}
    .uat-context-phase-pill{white-space:nowrap;margin-left:2px}
  `;document.head.appendChild(style);
}
function decorateTaskRows(){
  if(!staffPortal())return;
  document.querySelectorAll('#priorityQueue .task-row[data-task-id],#taskList .task-row[data-task-id]').forEach(row=>{
    const meta=row.querySelector('.task-meta');if(!meta)return;
    const phase=taskPhase(row);
    let pill=meta.querySelector('.uat-context-phase-pill');
    if(!phase){pill?.remove();return}
    if(!pill){pill=document.createElement('span');pill.className='pill uat-context-phase-pill';pill.setAttribute('aria-label','Deltakerfase');meta.appendChild(pill)}
    if(pill.textContent!==phase)pill.textContent=phase;
  });
}
function apply(){
  if(applying)return;applying=true;
  try{ensureStyles();decorateTaskRows()}finally{applying=false}
}
const observer=new MutationObserver(()=>{clearTimeout(observer._t);observer._t=setTimeout(apply,25)});
observer.observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));
window.addEventListener('pageshow',()=>setTimeout(apply,30));
[0,120,350,800,1500].forEach(ms=>setTimeout(apply,ms));
})();
