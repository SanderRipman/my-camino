(()=>{
'use strict';
// UAT-only, administrator-driven transfer of the same existing VÍA task.
// No write on page load. All writes go through already deployed AAL2,
 // organization-scoped, auditable Edge commands. No direct table UPDATE.
const EXPECTED_PARTICIPANT='Mina-UAT-01';
const EXPECTED_TASK='e29136cd-b4f7-4984-bd20-cd54c72e4a35';
const active=x=>!x.revoked_at&&(!x.valid_from||new Date(x.valid_from)<=new Date())&&(!x.valid_until||new Date(x.valid_until)>new Date());
const targetUser=u=>!!u.staff&&u.staff.active!==false&&/^[^@\s]+\+via@gmail\.com$/i.test(String(u.email||''));
let running=false;

function card(){
 let root=document.querySelector('#viaGmailHandoffUat');if(root)return root;
 const access=document.querySelector('.access-list-card');if(!access)return null;
 root=document.createElement('article');root.id='viaGmailHandoffUat';root.className='panel-card access-list-card';
 root.innerHTML='<p class="eyebrow">UAT · sikker medarbeiderovergang</p><h2>Gmail-VÍA: begrens rollen og flytt eksisterende vurdering</h2><p>Testkontoen har allerede innlogging. Denne handlingen snevrer inn dens eksisterende VÍA-rolle til bare Mina i sju dager, og flytter <strong>samme åpne vurderingsoppgave</strong>. Ingen ny invitasjon, skjema eller GO-beslutning.</p><label><span>Testmedarbeider</span><select id="viaGmailHandoffUser"></select></label><p class="privacy-note" id="viaGmailHandoffContext"></p><button class="primary" type="button" id="viaGmailHandoffStart" disabled>Begrens rolle og overfør Minas åpne vurdering</button><p class="message" id="viaGmailHandoffMessage" aria-live="polite"></p><small>Kun systemadministrator med AAL2. Den tidligere QA-rollens Mina-tilgang beholdes til overføringen er verifisert og kan deretter fjernes separat.</small>';
 access.insertAdjacentElement('beforebegin',root);
 root.querySelector('#viaGmailHandoffStart').addEventListener('click',start);
 return root;
}
function eligibility(data){
 const p=(data?.participants||[]).find(p=>p.code_name===EXPECTED_PARTICIPANT);
 const users=(data?.users||[]).filter(targetUser).map(u=>{
   const grants=(u.grants||[]).filter(g=>active(g)&&g.role_code==='via_owner');
   const unscoped=grants.filter(g=>!g.participant_id&&!g.pilot_id);
   return{user:u,grant:unscoped.length===1&&grants.length===1?unscoped[0]:null};
 });
 return{p,users};
}
function render(){
 const root=card();if(!root||running)return;
 const {p,users}=eligibility(accessData);
 const list=users.filter(x=>!!x.grant);
 const select=root.querySelector('#viaGmailHandoffUser');
 const old=select.value;
 select.replaceChildren(new Option('Velg Gmail-rolle',''),...list.map(x=>new Option(x.user.email,x.user.id)));
 if(list.length===1)select.value=list[0].user.id;
 else if(list.some(x=>x.user.id===old))select.value=old;
 const available=!!p&&list.length>0;
 root.querySelector('#viaGmailHandoffStart').disabled=!available;
 root.querySelector('#viaGmailHandoffContext').textContent=available?
   'Mål: '+p.code_name+' · kun 7 dagers rolle · eksisterende OPEN-oppgave · ingen ny vurdering.':
   'Ingen bred Gmail-VÍA-testrolle som kan begrenses her. Er rollen allerede avgrenset, skal handlingen IKKE gjentas.';
}
function setState(message,ok=false){
 const el=document.querySelector('#viaGmailHandoffMessage');if(!el)return;
 el.textContent=message;el.dataset.ok=ok?'true':'false';
}
async function start(){
 if(running)return;
 const id=document.querySelector('#viaGmailHandoffUser')?.value;
 if(!id){setState('Velg riktig Gmail-alias.');return}
 running=true;
 const button=document.querySelector('#viaGmailHandoffStart');button.disabled=true;
 try{
   setState('Kontrollerer eksisterende Gmail-rolle og deltakeromfang…');
   // Re-read admin inventory immediately before changing anything.
   const pre=await client.functions.invoke('admin-list-access',{body:{}});
   if(pre.error||pre.data?.error||!pre.data?.users)throw new Error('ADMIN_PREFLIGHT_FAILED');
   const {p,users}=eligibility(pre.data),candidate=users.find(x=>x.user.id===id);
   if(!p||!candidate?.grant)throw new Error('ROLE_SCOPE_CHANGED_STOP');
   const now=Date.now(),expires=new Date(now+7*86400000).toISOString();
   const reason='Syntetisk UAT: avgrens Gmail-VÍA til Mina før auditerbar oppgaveoverføring';
   const current=candidate.grant;
   // Do NOT create a second grant or change a participant. Tighten the existing one.
   const scoped=await client.functions.invoke('admin-update-role',{
     body:{grantId:current.id,participantId:p.id,pilotId:null,validUntil:expires,reason}
   });
   if(scoped.error||scoped.data?.error)throw new Error('SCOPE_UPDATE_FAILED: '+(scoped.data?.error||scoped.error?.message||'ukjent'));
   if(scoped.data?.auditLogged!==true)throw new Error('SCOPE_NARROWED_BUT_AUDIT_NOT_CONFIRMED_STOP');
   // Read back the scoped role from the authorized admin inventory before task write.
   const second=await client.functions.invoke('admin-list-access',{body:{}});
   if(second.error||second.data?.error||!second.data?.users)throw new Error('SCOPE_READBACK_FAILED_STOP');
   const actual=second.data.users.find(u=>u.id===id);
   const role=(actual?.grants||[]).find(g=>g.id===current.id);
   if(!role||role.role_code!=='via_owner'||role.participant_id!==p.id||role.pilot_id||
       !role.valid_until||Date.parse(role.valid_until)>now+8*86400000||!active(role))
      throw new Error('SCOPED_ROLE_READBACK_MISMATCH_STOP');
   if((actual.grants||[]).some(g=>active(g)&&g.role_code==='via_owner'&&!g.participant_id&&!g.pilot_id))
      throw new Error('GLOBAL_VIA_ROLE_STILL_ACTIVE_STOP');
   setState('Rolle begrenset og loggført. Flytter nå nøyaktig én eksisterende OPEN-vurdering…');
   const move=await client.functions.invoke('task-command',{body:{
     action:'REASSIGN_VIA_REVIEW',participantId:p.id,targetUserId:id,
     reason:'Overfør eksisterende Mina VÍA-review til Gmail VÍA-ansvarlig etter begrenset rolletildeling'
   }});
   if(move.error||move.data?.error)throw new Error('TASK_TRANSFER_UNCONFIRMED_STOP: '+(move.data?.error||move.error?.message||'ukjent'));
   if(!move.data?.ok||move.data?.task?.id!==EXPECTED_TASK||move.data?.task?.status!=='OPEN'||move.data?.task?.assignee_user_id!==id)
     throw new Error('TASK_ID_OR_OWNER_READBACK_MISMATCH_STOP');
   setState('Overføring bekreftet: samme OPEN-oppgave, Gmail-VÍA som eier, avgrenset rolle og loggført handling. Gammel QA-tilgang er foreløpig bevart for kontroll.',true);
   await loadAccess();
 }catch(error){
   setState('Stoppet uten nytt skjema/ny oppgave: '+String(error?.message||error)+'. Ikke klikk igjen før DB-/audit-readback.');
 }finally{running=false;render()}
}
const base=renderAccessList;
renderAccessList=function(){const result=base();render();return result};
setTimeout(render,150);
})();