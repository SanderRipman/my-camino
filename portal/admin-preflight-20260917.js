(()=>{
'use strict';

const PREFLIGHT_ROLE_OPTIONS=[
  ['','Tildel rolle senere'],
  ['project_owner','Prosjekteier'],['program_lead','Programleder'],['via_owner','VÍA-ansvarlig'],['clinical_professional','Relevant fagperson'],['ser_lead','SER-/turleder'],['vida_owner','VIDA-eier'],['logistics','Logistikk / beredskap'],['observer','Observatør'],['evaluator','Evaluator']
];
function ensureInviteRole(){
  const form=document.querySelector('#inviteForm'),participantFields=document.querySelector('#participantInviteFields');if(!form||document.querySelector('#inviteRoleWrap'))return;
  const wrap=document.createElement('label');wrap.id='inviteRoleWrap';wrap.className='hidden';wrap.innerHTML='<span>Arbeidsrolle ved invitasjon (valgfritt)</span><select id="inviteRoleAtCreate"></select><small>Du kan legge til flere roller etterpå. Systemadministrator og nødtilgang tildeles fortsatt separat.</small>';
  wrap.querySelector('select').innerHTML=PREFLIGHT_ROLE_OPTIONS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  participantFields.insertAdjacentElement('afterend',wrap);
  const toggle=()=>wrap.classList.toggle('hidden',document.querySelector('#inviteType')?.value!=='staff');
  document.querySelector('#inviteType')?.addEventListener('change',toggle);toggle();
  const note=document.createElement('p');note.className='privacy-note';note.id='participantRoleBoundary';note.innerHTML='<strong>Deltaker og medarbeider er separate tilganger.</strong> En deltakerkonto vises derfor ikke i listen for arbeidsroller. Skal samme testperson også teste en medarbeiderrolle, bruk en egen medarbeiderkonto.';
  form.insertAdjacentElement('afterend',note);
}
async function detailedInvoke(slug,body){
  const {data,error}=await client.functions.invoke(slug,{body});
  if(!error&&!data?.error)return{ok:true,data};
  let code=data?.error||'';let status=error?.context?.status||0;
  if(!code&&error?.context?.clone){try{const payload=await error.context.clone().json();code=payload?.error||''}catch{}}
  return{ok:false,code:code||error?.message||'REQUEST_FAILED',status,data,error};
}
function inviteFailureText(result){
  const code=String(result?.code||'').toUpperCase();
  if(code==='USER_ALREADY_EXISTS')return'Denne e-postadressen har allerede en konto. Bruk eksisterende konto eller en ny testadresse.';
  if(code.includes('RATE')||result?.status===429)return'E-postgrensen er nådd. Supabase sin innebygde test-utsending har svært lav grense; vent til kvoten fylles opp eller bruk konfigurert SMTP.';
  if(code.includes('NOT_AUTHORIZED'))return'E-postadressen er ikke godkjent for Supabase sin innebygde test-utsending. Bruk godkjent testadresse eller konfigurert SMTP.';
  if(code==='INVITE_FAILED'||code.includes('NON-2XX')||code==='REQUEST_FAILED')return'Invitasjonen ble ikke sendt. Mest sannsynlig er Supabase sin test-e-postbegrensning nådd. Ingen bruker/rolle ble opprettet av dette forsøket.';
  return`Invitasjonen feilet: ${result.code}`;
}
async function submitInvite(event){
  if(event.target?.id!=='inviteForm')return;
  event.preventDefault();event.stopImmediatePropagation();
  const email=clean(document.querySelector('#inviteEmail')?.value).toLowerCase(),type=document.querySelector('#inviteType')?.value,codeName=clean(document.querySelector('#inviteCodeName')?.value),pilotId=document.querySelector('#invitePilot')?.value||null,participantId=document.querySelector('#existingParticipantId')?.value||null,roleCode=document.querySelector('#inviteRoleAtCreate')?.value||'';
  if(type==='participant'&&!participantId&&codeName.length<3){msg('#inviteMessage','Deltaker trenger et kodenavn på minst 3 tegn.');return}
  msg('#inviteMessage','Sender sikker invitasjon…');
  const invite=await detailedInvoke('admin-invite-user',{email});
  if(!invite.ok){msg('#inviteMessage',inviteFailureText(invite));return}
  const userId=invite.data?.userId;if(!userId){msg('#inviteMessage','Invitasjonen ble sendt, men bruker-ID manglet. Ingen videre kobling ble gjort.');return}
  document.querySelector('#targetUserId').value=userId;
  if(type==='participant'){
    msg('#inviteMessage',participantId?'Invitasjon sendt. Kobler kontoen til eksisterende VÍA-reise…':'Invitasjon sendt. Oppretter begrenset deltakerreise…');
    const create=await detailedInvoke('admin-create-participant',{targetUserId:userId,participantId,codeName,pilotId});
    if(!create.ok){msg('#inviteMessage',`Invitasjonen ble sendt, men deltakerkoblingen feilet: ${create.code}`);await loadAccess();return}
    msg('#inviteMessage',participantId?`Invitasjon sendt. Kontoen er koblet til VÍA-reisen ${create.data?.participant?.code_name||codeName}.`:`Deltaker ${codeName} er opprettet med tilgang kun til egen reise.`,true);
  }else if(roleCode){
    msg('#inviteMessage','Invitasjon sendt. Tildeler valgt arbeidsrolle…');
    const grant=await detailedInvoke('admin-grant-role',{targetUserId:userId,roleCode,participantId:null,pilotId:null,reason:'Tildelt ved invitasjon',validUntil:null});
    if(!grant.ok){msg('#inviteMessage',`Invitasjonen er sendt, men rollen ble ikke tildelt: ${grant.code}. Bruk «Arbeidsrolle» nedenfor.`);await loadAccess();return}
    msg('#inviteMessage',`Medarbeider er invitert og rollen «${roleLabel(roleCode)}» er tildelt. Flere roller kan legges til nedenfor.`,true);
  }else msg('#inviteMessage','Medarbeider er invitert. Velg arbeidsrolle nedenfor når det passer.',true);
  document.querySelector('#inviteForm').reset();clearN2Handoff();await loadAccess();if(type==='staff'){document.querySelector('#targetUserSelect').value=userId}
}

ensureInviteRole();
document.addEventListener('submit',submitInvite,true);
})();