(()=>{
'use strict';
function openStatus(t){return ['OPEN','IN_PROGRESS','WAITING'].includes(String(t?.status||''))}
function visibleTaskRows(){return [...document.querySelectorAll('#taskList .task-row[data-task-id]')].filter(row=>{if(row.classList.contains('hidden')||row.classList.contains('ux-filter-hidden')||row.dataset.aidmeFocusHidden==='1'||row.dataset.phaseHidden==='1')return false;return getComputedStyle(row).display!=='none'&&getComputedStyle(row).visibility!=='hidden'})}
function tone(t){if(!t)return'YELLOW';const overdue=!!t.due_at&&openStatus(t)&&new Date(t.due_at)<new Date();if(overdue||String(severity(t)).toUpperCase()==='RED')return'RED';if(String(severity(t)).toUpperCase()==='YELLOW'||String(t.status).toUpperCase()==='WAITING')return'YELLOW';return'BLUE'}
function apply(){
  if(typeof isStaff!=='function'||!isStaff())return;
  const badge=document.querySelector('#badgeTasks');if(!badge)return;
  const rows=visibleTaskRows(),mapped=rows.map(row=>(tasks||[]).find(t=>String(t.id)===String(row.dataset.taskId))).filter(Boolean).filter(openStatus);
  const counts={RED:0,YELLOW:0,BLUE:0};mapped.forEach(t=>counts[tone(t)]++);
  let html='';
  if(counts.RED)html+=`<span class="nav-count red" aria-label="${counts.RED} synlige kritiske eller forfalte oppgaver">${counts.RED}</span>`;
  if(counts.YELLOW)html+=`<span class="nav-count yellow" aria-label="${counts.YELLOW} synlige oppgaver som trenger avklaring">${counts.YELLOW}</span>`;
  if(counts.BLUE)html+=`<span class="nav-count blue" aria-label="${counts.BLUE} synlige normale oppgaver">${counts.BLUE}</span>`;
  badge.innerHTML=html;badge.title=`Oppgaver i gjeldende visning: ${mapped.length}`;
}
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(apply,0));
document.addEventListener('click',e=>{if(e.target.closest('#view-tasks button,#journeyMini .process-step,[data-aidme-pilot-focus],[data-aidme-archived]'))setTimeout(apply,30)},true);
window.addEventListener('pageshow',()=>setTimeout(apply,80));
setTimeout(apply,220);
})();