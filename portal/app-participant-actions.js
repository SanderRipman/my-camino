(()=>{
'use strict';

const PARTICIPANT_ACTIONS_VERSION='2026-09-09a';

function staff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function aggregateOnly(){try{return !!window.AidMeRoleLens?.aggregateOnly?.()}catch{return false}}
function participant(){try{return participants.find(p=>String(p.id)===String(selectedParticipantId||''))||null}catch{return null}}
function pilotIdFor(p){try{return pilotParticipants.find(x=>String(x.participant_id)===String(p?.id))?.pilot_id||null}catch{return null}}
function applicableRoles(p){
  if(!p)return new Set();const pilotId=pilotIdFor(p);
  try{return new Set((accessGrants||[]).filter(g=>activeGrant(g)&&(!g.participant_id||String(g.participant_id)===String(p.id))&&(!g.pilot_id||String(g.pilot_id)===String(pilotId))).map(g=>String(g.role_code||'')))}catch{return new Set()}
}
function canOwners(p){const r=applicableRoles(p);return ['system_admin','project_owner','program_lead','via_owner','clinical_professional','vida_owner'].some(x=>r.has(x))}
function canManualTask(p){const r=applicableRoles(p),phase=String(p?.stage||'VIA').toUpperCase();return phase==='SER'?(r.has('program_lead')||r.has('ser_lead')):r.has('program_lead')}
function esc(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}

function ensureStyles(){
 if(document.querySelector('#aidme-participant-actions-style'))return;
 const style=document.createElement('style');style.id='aidme-participant-actions-style';style.textContent=`
  .participant-more-row{display:flex;justify-content:flex-end;margin-top:12px}
  .participant-more-menu{display:grid;gap:8px;margin-top:8px;padding-top:10px;border-top:1px solid rgba(18,63,61,.12)}
  .participant-more-menu.hidden{display:none!important}
  .participant-more-menu .ghost,.participant-more-menu a{width:100%;text-decoration:none;text-align:center;justify-content:center}
  .participant-actions-note{font-size:11px;color:#66737b;line-height:1.4;margin:4px 0 0}
 `;document.head.appendChild(style)
}
function ensureDialog(){
 let dialog=document.querySelector('#manualTaskDialog');if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.id='manualTaskDialog';dialog.className='task-dialog';
 dialog.innerHTML='<form id="manualTaskForm" class="dialog-shell"><div class="dialog-head"><div><p class="eyebrow">Oppfølging</p><h2>Opprett manuell oppgave</h2></div><button type="button" class="icon-btn" data-close aria-label="Lukk">×</button></div><p id="manualTaskContext" class="privacy-note"></p><label><span>Tittel</span><input id="manualTaskTitle" maxlength="120" required placeholder="Kort og konkret"></label><label><span>Notat (valgfritt)</span><textarea id="manualTaskNote" rows="3" maxlength="800" placeholder="Kun nødvendig arbeidsinformasjon"></textarea></label><label><span>Frist (valgfritt)</span><input id="manualTaskDue" type="datetime-local"></label><div class="dialog-actions"><button class="primary" type="submit">Opprett oppgave</button><button class="ghost" type="button" data-close>Avbryt</button></div><p id="manualTaskMessage" class="message"></p></form>';
 document.body.appendChild(dialog);dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.querySelector('#manualTaskForm').addEventListener('submit',async e=>{
   e.preventDefault();const p=participant();if(!p)return;const title=document.querySelector('#manualTaskTitle').value.trim(),note=document.querySelector('#manualTaskNote').value.trim(),raw=document.querySelector('#manualTaskDue').value,msg=document.querySelector('#manualTaskMessage');
   if(title.length<3){msg.textContent='Skriv en kort tittel.';return}if(assurance?.currentLevel!=='aal2'){msg.textContent='Bekreft Authenticator (AAL2) før du oppretter oppgaven.';return}
   msg.textContent='Oppretter…';const dueAt=raw?new Date(raw).toISOString():null;const {data,error}=await client.functions.invoke('manual-task-command',{body:{participantId:p.id,title,note:note||null,dueAt}});
   if(error||data?.error){msg.textContent='Oppgaven kunne ikke opprettes med rollen og omfanget ditt.';return}
   dialog.close();try{await loadPortal()}catch{try{renderAll()}catch{}}
 });
 return dialog;
}
function openManualTask(p){const d=ensureDialog();d.querySelector('#manualTaskForm').reset();d.querySelector('#manualTaskMessage').textContent='';d.querySelector('#manualTaskContext').textContent=`${p.code_name} · oppgaven tildeles deg og følger eksisterende rolle/scope.`;d.showModal()}
function decorate(){
 if(!staff()||aggregateOnly())return;ensureStyles();const detail=document.querySelector('#participantDetail'),p=participant();if(!detail||!p)return;
 detail.querySelectorAll('.participant-more-row,.participant-more-menu,.participant-actions-note').forEach(e=>e.remove());
 const owner=canOwners(p),manual=canManualTask(p);if(!owner&&!manual)return;
 const row=document.createElement('div');row.className='participant-more-row';row.innerHTML='<button type="button" class="ghost compact">Mer</button>';detail.appendChild(row);
 const menu=document.createElement('div');menu.className='participant-more-menu hidden';const items=[];
 if(owner)items.push(`<a class="ghost" href="./owners.html?participant=${encodeURIComponent(p.id)}">Ansvar / eiere</a>`);
 if(manual)items.push('<button type="button" class="ghost" data-manual-task>Opprett manuell oppgave</button>');
 menu.innerHTML=items.join('');detail.appendChild(menu);
 const note=document.createElement('p');note.className='participant-actions-note';note.textContent='Handlingene følger eksisterende rolle og deltaker-/pilotscope. «Mer» gir ingen ny tilgang.';detail.appendChild(note);
 row.querySelector('button').addEventListener('click',()=>menu.classList.toggle('hidden'));menu.querySelector('[data-manual-task]')?.addEventListener('click',()=>openManualTask(p));
}

if(typeof renderParticipantDetail==='function'){
 const previous=renderParticipantDetail;renderParticipantDetail=function(){const result=previous();setTimeout(decorate,0);return result};
}
document.addEventListener('aidme:portal-rendered',()=>setTimeout(decorate,0));
setTimeout(decorate,300);
})();
