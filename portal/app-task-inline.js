(()=>{
'use strict';

const TASK_INLINE_VERSION='2026-09-13a';
let expandedTaskId=null;

function staff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function esc(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}
function work(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function task(id){return work().find(t=>String(t.id)===String(id))||null}
function participant(t){try{return participantById(t?.participant_id)||null}catch{return null}}
function pilot(t){try{return pilotById(t?.pilot_id)||null}catch{return null}}
function route(t){try{return routeToday(t?.pilot_id)||null}catch{return null}}
function phase(t){try{return window.AidMeAttentionSemantics?.taskPhase?.(t)||stageLabel(participant(t)?.stage||'VIA')}catch{return null}}
function status(t){try{return statusText(t?.status||'')||t?.status||'–'}catch{return t?.status||'–'}}
function due(t){try{return formatDate(t?.due_at)}catch{return t?.due_at?String(t.due_at):'Ingen frist'}}
function owner(t){try{const p=(staffProfiles||[]).find(x=>x.user_id===t?.assignee_user_id);if(p?.full_name)return p.full_name;if(t?.assignee_user_id===session?.user?.id)return document.querySelector('#userLabel')?.textContent?.trim()||'Deg';return'Ikke navngitt'}catch{return'Ikke navngitt'}}

function ensureStyles(){if(document.querySelector('#aidme-task-inline-style'))return;const style=document.createElement('style');style.id='aidme-task-inline-style';style.textContent=`
 #taskList .task-row{position:relative}
 #taskList .task-row .aidme-task-expand-hint{background:#efeee8;color:#526065;border-color:#d6d5cd;white-space:nowrap}
 #taskList .task-row[aria-expanded="true"]{border-bottom-left-radius:0;border-bottom-right-radius:0;border-bottom-color:transparent;box-shadow:none}
 .aidme-task-inline{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .28s cubic-bezier(.16,1,.3,1),opacity .2s ease;margin:-1px 0 10px;border:1px solid var(--line);border-top:0;border-radius:0 0 14px 14px;background:rgba(255,253,248,.94);overflow:hidden}
 .aidme-task-inline.open{grid-template-rows:1fr;opacity:1}
 .aidme-task-inline-inner{min-height:0;overflow:hidden;padding:0 14px}
 .aidme-task-inline.open .aidme-task-inline-inner{padding:10px 14px 14px}
 .aidme-task-inline-copy{margin:0 0 10px;color:var(--muted);line-height:1.45}
 .aidme-task-inline-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 11px}
 .aidme-task-inline-stat{min-width:0;padding:8px 9px;border-radius:10px;background:rgba(18,63,61,.045)}
 .aidme-task-inline-stat span{display:block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
 .aidme-task-inline-stat b{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
 .aidme-task-inline-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
 @media(max-width:780px){
  .aidme-task-inline-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .aidme-task-inline-actions{justify-content:stretch}.aidme-task-inline-actions>*{flex:1 1 130px;max-width:100%}
  #taskList .task-row{transition:border-color .18s ease,background .18s ease}
 }
 @media(max-width:430px){.aidme-task-inline-grid{grid-template-columns:minmax(0,1fr)}}
 @media(prefers-reduced-motion:reduce){.aidme-task-inline{transition:none!important}}
`;document.head.appendChild(style)}

function clearHints(){document.querySelectorAll('#taskList .aidme-task-expand-hint').forEach(el=>el.remove())}
function decorate(){if(!staff())return;ensureStyles();for(const row of document.querySelectorAll('#taskList .task-row[data-task-id]')){const id=String(row.dataset.taskId||'');if(!id||!task(id))continue;row.setAttribute('aria-expanded',expandedTaskId===id?'true':'false');row.setAttribute('aria-controls',`aidme-task-inline-${id}`);let hint=row.querySelector('.aidme-task-expand-hint');const meta=row.querySelector('.task-meta');if(!hint&&meta){hint=document.createElement('span');hint.className='pill aidme-task-expand-hint';meta.appendChild(hint)}if(hint)hint.textContent=expandedTaskId===id?'Minimer ↑':'Mer ↓'}}
function removeDetails(){document.querySelectorAll('#taskList .aidme-task-inline').forEach(el=>el.remove());for(const row of document.querySelectorAll('#taskList .task-row[aria-expanded="true"]'))row.setAttribute('aria-expanded','false')}
function close({keepId=false}={}){removeDetails();if(!keepId)expandedTaskId=null;decorate()}
function detailMarkup(t){const p=participant(t),pi=pilot(t),r=route(t),ph=phase(t);const description=String(t.description||'').trim();const routeText=r?`Dag ${r.day_number}: ${r.from_place} → ${r.to_place}${r.distance_km?` · ${r.distance_km} km`:''}`:(pi?.route_name||'Ikke angitt');return `<div class="aidme-task-inline-inner"><p class="aidme-task-inline-copy">${esc(description||'Åpne handlingen for videre detaljer og autoriserte valg.')}</p><div class="aidme-task-inline-grid"><div class="aidme-task-inline-stat"><span>Fase</span><b>${esc(ph||'–')}</b></div><div class="aidme-task-inline-stat"><span>Status</span><b>${esc(status(t))}</b></div><div class="aidme-task-inline-stat"><span>Deltaker</span><b>${esc(p?.code_name||'Ikke knyttet')}</b></div><div class="aidme-task-inline-stat"><span>Ansvarlig</span><b>${esc(owner(t))}</b></div><div class="aidme-task-inline-stat"><span>Gruppe / rute</span><b>${esc(routeText)}</b></div><div class="aidme-task-inline-stat"><span>Frist</span><b>${esc(due(t))}</b></div></div><div class="aidme-task-inline-actions"><button type="button" class="ghost compact" data-task-inline-close>Minimer</button><button type="button" class="primary compact" data-task-inline-open>Åpne handling</button></div></div>`}
function expand(row,t){close({keepId:true});expandedTaskId=String(t.id);row.setAttribute('aria-expanded','true');const detail=document.createElement('div');detail.id=`aidme-task-inline-${t.id}`;detail.className='aidme-task-inline';detail.dataset.taskInlineId=String(t.id);detail.setAttribute('role','region');detail.setAttribute('aria-label',`Oppgave: ${t.title||''}`);detail.innerHTML=detailMarkup(t);row.insertAdjacentElement('afterend',detail);requestAnimationFrame(()=>detail.classList.add('open'));detail.querySelector('[data-task-inline-close]')?.addEventListener('click',()=>close());detail.querySelector('[data-task-inline-open]')?.addEventListener('click',()=>{const id=String(t.id);close();try{openTask(id)}catch{}});decorate()}
function toggle(row){const id=String(row.dataset.taskId||''),t=task(id);if(!t)return;if(expandedTaskId===id){close();return}expand(row,t)}
function bind(){const list=document.querySelector('#taskList');if(!list||list.dataset.aidmeTaskInline==='1')return;list.dataset.aidmeTaskInline='1';list.addEventListener('click',event=>{const row=event.target.closest?.('.task-row[data-task-id]');if(!row||!list.contains(row))return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toggle(row)},true);list.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;const row=event.target.closest?.('.task-row[data-task-id]');if(!row)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toggle(row)},true)}
function refresh(){if(!staff()){close();return}bind();if(expandedTaskId&&!document.querySelector(`#taskList .task-row[data-task-id="${CSS.escape(expandedTaskId)}"]`))expandedTaskId=null;removeDetails();decorate()}

ensureStyles();bind();decorate();
document.addEventListener('aidme:portal-rendered',()=>{expandedTaskId=null;setTimeout(refresh,0)});
document.addEventListener('aidme:phase-workspace-changed',()=>{expandedTaskId=null;setTimeout(refresh,0)});
window.addEventListener('pageshow',()=>setTimeout(refresh,40));
})();
