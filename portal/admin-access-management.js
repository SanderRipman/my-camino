(()=>{
'use strict';

let showInactiveAccess=false,lastGrantTarget='',editingGrantId='';

function explicitInactive(user){
  if(user?.participant)return user.participant.active===false;
  if(user?.staff)return user.staff.active===false;
  return false;
}
function installAdminHints(){
  const form=document.querySelector('#grantForm');if(!form)return;
  const card=form.closest('.admin-card');
  const intro=card?.querySelector('h2')?.nextElementSibling;
  if(intro)intro.textContent='Én medarbeider kan ha flere eksplisitte roller samtidig. Tildel én rolle av gangen med riktig omfang; samme person kan deretter velges igjen for neste rolle.';
  if(!document.querySelector('#multiRoleHint')){
    const note=document.createElement('p');note.id='multiRoleHint';note.className='privacy-note';note.innerHTML='<strong>Flerrolle:</strong> Rollen legges til – den erstatter ikke andre aktive roller. Ingen rolle gir skjult supertilgang.';
    form.insertAdjacentElement('beforebegin',note);
  }
  if(!document.querySelector('#toggleInactive')){
    const accessCard=document.querySelector('.access-list-card'),head=accessCard?.querySelector('.card-head');
    const refresh=document.querySelector('#refreshAccess');
    if(head&&refresh){
      const actions=document.createElement('div');actions.style.display='flex';actions.style.gap='8px';actions.style.flexWrap='wrap';
      const toggle=document.createElement('button');toggle.id='toggleInactive';toggle.className='ghost';toggle.type='button';toggle.textContent='Vis inaktive';
      refresh.replaceWith(actions);actions.append(toggle,refresh);
      toggle.addEventListener('click',()=>{showInactiveAccess=!showInactiveAccess;toggle.textContent=showInactiveAccess?'Skjul inaktive':'Vis inaktive';enhanceAccessList()});
    }
  }
}
function localInputValue(value){if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return'';const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,16)}
function ensureEditDialog(){
  let dialog=document.querySelector('#editRoleDialog');if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='editRoleDialog';dialog.className='task-dialog';
  dialog.innerHTML='<form id="editRoleForm" class="dialog-shell"><div class="dialog-head"><div><p class="eyebrow">Tilgang</p><h2 id="editRoleTitle">Endre rolle</h2></div><button type="button" class="icon-btn" data-close aria-label="Lukk">×</button></div><p id="editRoleScope" class="privacy-note"></p><label><span>Kun denne deltakeren</span><select id="editParticipant"><option value="">Hele relevant arbeidsflate</option></select></label><label><span>Kun denne piloten/gruppen</span><select id="editPilot"><option value="">Hele relevant arbeidsflate</option></select></label><label><span>Utløper</span><input id="editValidUntil" type="datetime-local"><small>La stå tom for ingen utløpsdato. Midlertidig nødtilgang må ha frist.</small></label><label><span>Begrunnelse for endring</span><input id="editReason" required maxlength="240" placeholder="Kort hvorfor rolle/scope/fristen endres"></label><div class="dialog-actions"><button class="primary" type="submit">Lagre endring</button><button class="ghost" type="button" data-close>Avbryt</button></div><p id="editRoleMessage" class="message"></p></form>';
  document.body.appendChild(dialog);dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
  dialog.querySelector('#editRoleForm').addEventListener('submit',async e=>{e.preventDefault();const reason=document.querySelector('#editReason').value.trim();if(reason.length<3){document.querySelector('#editRoleMessage').textContent='Skriv en kort begrunnelse.';return}const raw=document.querySelector('#editValidUntil').value,body={grantId:editingGrantId,participantId:document.querySelector('#editParticipant').value||null,pilotId:document.querySelector('#editPilot').value||null,validUntil:raw?new Date(raw).toISOString():null,reason};document.querySelector('#editRoleMessage').textContent='Lagrer…';const {data,error}=await client.functions.invoke('admin-update-role',{body});if(error||data?.error){document.querySelector('#editRoleMessage').textContent=`Endringen ble ikke lagret: ${data?.error||error?.message||'ukjent feil'}`;return}dialog.close();await loadAccess()});
  return dialog;
}
function openGrantEditor(user,grant){
  const dialog=ensureEditDialog();editingGrantId=grant.id;
  document.querySelector('#editRoleTitle').textContent=`Endre ${roleLabel(grant.role_code)}`;
  document.querySelector('#editRoleScope').textContent=`${user.staff?.full_name||user.email||'Medarbeider'} · eksisterende rolle beholdes; bare omfang/fristen endres.`;
  document.querySelector('#editParticipant').innerHTML='<option value="">Hele relevant arbeidsflate</option>'+(accessData.participants||[]).map(p=>`<option value="${p.id}">${escapeHtml(p.code_name)} · ${escapeHtml(p.stage)}</option>`).join('');
  document.querySelector('#editPilot').innerHTML='<option value="">Hele relevant arbeidsflate</option>'+(accessData.pilots||[]).map(p=>`<option value="${p.id}">${escapeHtml(p.name)}${p.route_name?` · ${escapeHtml(p.route_name)}`:''}</option>`).join('');
  document.querySelector('#editParticipant').value=grant.participant_id||'';document.querySelector('#editPilot').value=grant.pilot_id||'';document.querySelector('#editValidUntil').value=localInputValue(grant.valid_until);document.querySelector('#editReason').value='';document.querySelector('#editRoleMessage').textContent='';
  const systemAdmin=grant.role_code==='system_admin';document.querySelector('#editParticipant').disabled=systemAdmin;document.querySelector('#editPilot').disabled=systemAdmin;
  dialog.showModal();
}
function enhanceAccessList(){
  installAdminHints();
  const rows=(accessData?.users||[]).filter(u=>u.participant||u.staff||(u.grants||[]).some(activeGrant));
  const sections=[...document.querySelectorAll('#accessList .access-person')];
  sections.forEach((section,index)=>{
    const user=rows[index];if(!user)return;
    section.dataset.userId=user.id;
    const inactive=explicitInactive(user);section.classList.toggle('hidden',inactive&&!showInactiveAccess);
    let status=section.querySelector('.access-user-status');
    if(inactive&&!status){status=document.createElement('span');status.className='pill access-user-status';status.textContent='Inaktiv';section.querySelector('.access-person-head')?.appendChild(status)}
    if(!inactive)status?.remove();
    if(!user.participant&&!section.querySelector('.add-role-access')){
      const button=document.createElement('button');button.className='ghost add-role-access';button.type='button';button.textContent='Legg til rolle';
      button.addEventListener('click',()=>{
        const select=document.querySelector('#targetUserSelect');if(select&&[...select.options].some(o=>o.value===user.id)){select.value=user.id;lastGrantTarget=user.id}
        document.querySelector('#grantForm')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('#roleCode')?.focus({preventScroll:true});
        const message=document.querySelector('#grantMessage');if(message)message.textContent='Velg neste rolle og eventuelt begrenset deltaker-/pilotscope. Eksisterende roller beholdes.';
      });
      section.querySelector('.access-person-head')?.appendChild(button);
    }
    const active=(user.grants||[]).filter(activeGrant),grantRows=[...section.querySelectorAll('.grant-row')];
    grantRows.forEach((row,i)=>{const grant=active[i];if(!grant||row.querySelector('.edit-role-access'))return;const remove=row.querySelector('.revoke-access');const edit=document.createElement('button');edit.type='button';edit.className='ghost edit-role-access';edit.textContent='Endre';edit.addEventListener('click',()=>openGrantEditor(user,grant));if(remove)remove.insertAdjacentElement('beforebegin',edit);else row.appendChild(edit)});
  });
  if(lastGrantTarget){const select=document.querySelector('#targetUserSelect');if(select&&[...select.options].some(o=>o.value===lastGrantTarget))select.value=lastGrantTarget}
  if(location.hash==='#accessList')setTimeout(()=>document.querySelector('#accessList')?.scrollIntoView({block:'start'}),80);
}

if(typeof renderAccessList==='function'){
  const baseRenderAccessList=renderAccessList;
  renderAccessList=function(){const result=baseRenderAccessList();enhanceAccessList();return result};
}
document.querySelector('#grantForm')?.addEventListener('submit',()=>{lastGrantTarget=document.querySelector('#targetUserSelect')?.value||lastGrantTarget},true);
setTimeout(enhanceAccessList,160);
})();
