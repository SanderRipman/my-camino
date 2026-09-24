(()=>{
'use strict';

function intakeTask(t){return !!t&&(String(t.source_type||'').toLowerCase()==='intake'||String(t.workflow_key||'').toLowerCase().startsWith('intake_triage:'))}
function intakeId(t){const explicit=String(t?.source_id||'').trim();if(explicit)return explicit;const k=String(t?.workflow_key||'');return k.startsWith('intake_triage:')?k.slice('intake_triage:'.length):''}
function href(t){const id=intakeId(t);return id?`./intake.html?intake=${encodeURIComponent(id)}`:'./intake.html'}
function enhanceRows(){
  for(const row of document.querySelectorAll('#taskList .task-row[data-task-id],#priorityQueue .task-row[data-task-id]')){
    const t=(tasks||[]).find(x=>String(x.id)===String(row.dataset.taskId||''));if(!intakeTask(t))continue;
    const small=row.querySelector('small');if(small&&!small.textContent.trim())small.textContent='Interesse · kontakt og første avklaring i autorisert mottaksflate';
    row.dataset.intakeTask='1';
  }
  for(const detail of document.querySelectorAll('#taskList .aidme-task-inline[data-task-inline-id]')){
    if(detail.querySelector('[data-intake-open]'))continue;const t=(tasks||[]).find(x=>String(x.id)===String(detail.dataset.taskInlineId||''));if(!intakeTask(t))continue;
    const stats=[...detail.querySelectorAll('.aidme-task-inline-stat')];const participant=stats.find(x=>x.querySelector('span')?.textContent?.trim()==='Deltaker');if(participant){participant.querySelector('span').textContent='Kontekst';const b=participant.querySelector('b');if(b)b.textContent='Ny interesse'}
    const actions=detail.querySelector('.aidme-task-inline-actions');if(actions){const a=document.createElement('a');a.className='primary compact';a.dataset.intakeOpen='1';a.href=href(t);a.textContent='Åpne interesse / kontakt';actions.appendChild(a)}
  }
}
const baseOpenTask=openTask;
openTask=function(id){const out=baseOpenTask(id),t=(tasks||[]).find(x=>String(x.id)===String(id));if(intakeTask(t)){const body=document.querySelector('#taskDialogBody');if(body&&!body.querySelector('[data-intake-open]')){const box=document.createElement('div');box.className='task-crosslinks';box.dataset.intakeOpen='1';box.innerHTML=`<p class="eyebrow">Interesse / første avklaring</p><p>Navn, valgt kontaktkanal og nødvendig kontaktinformasjon vises i den autoriserte mottaksflaten – ikke i den generelle oppgavelisten.</p><div class="crosslink-grid"><a class="primary" href="${href(t)}">Åpne interesse / kontakt</a></div>`;body.appendChild(box)}}return out};
const observer=new MutationObserver(()=>enhanceRows());const host=document.querySelector('#taskList')?.parentElement||document.body;observer.observe(host,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',()=>setTimeout(enhanceRows,0));
document.addEventListener('aidme:phase-workspace-changed',()=>setTimeout(enhanceRows,0));
setTimeout(enhanceRows,180);
})();
