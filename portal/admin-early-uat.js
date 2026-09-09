(()=>{
'use strict';

let showInactiveAccess=false,lastGrantTarget='';

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
function enhanceAccessList(){
  installAdminHints();
  const rows=(accessData?.users||[]).filter(u=>u.participant||u.staff||(u.grants||[]).some(activeGrant));
  const sections=[...document.querySelectorAll('#accessList .access-person')];
  sections.forEach((section,index)=>{
    const user=rows[index];if(!user)return;
    section.dataset.userId=user.id;
    const inactive=explicitInactive(user);section.classList.toggle('hidden',inactive&&!showInactiveAccess);
    let status=section.querySelector('.early-uat-user-status');
    if(inactive&&!status){status=document.createElement('span');status.className='pill early-uat-user-status';status.textContent='Inaktiv';section.querySelector('.access-person-head')?.appendChild(status)}
    if(!inactive)status?.remove();
    if(!user.participant&&!section.querySelector('.add-role-access')){
      const button=document.createElement('button');button.className='ghost add-role-access';button.type='button';button.textContent='Legg til rolle';
      button.addEventListener('click',()=>{
        const select=document.querySelector('#targetUserSelect');if(select&&[...select.options].some(o=>o.value===user.id)){select.value=user.id;lastGrantTarget=user.id}
        document.querySelector('#grantForm')?.scrollIntoView({behavior:'smooth',block:'start'});
        document.querySelector('#roleCode')?.focus({preventScroll:true});
        const message=document.querySelector('#grantMessage');if(message)message.textContent='Velg neste rolle og eventuelt begrenset deltaker-/pilotscope. Eksisterende roller beholdes.';
      });
      section.querySelector('.access-person-head')?.appendChild(button);
    }
  });
  if(lastGrantTarget){const select=document.querySelector('#targetUserSelect');if(select&&[...select.options].some(o=>o.value===lastGrantTarget))select.value=lastGrantTarget}
}

if(typeof renderAccessList==='function'){
  const baseRenderAccessList=renderAccessList;
  renderAccessList=function(){const result=baseRenderAccessList();enhanceAccessList();return result};
}
document.querySelector('#grantForm')?.addEventListener('submit',()=>{lastGrantTarget=document.querySelector('#targetUserSelect')?.value||lastGrantTarget},true);
setTimeout(enhanceAccessList,160);
})();
