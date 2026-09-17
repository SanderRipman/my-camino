(()=>{
'use strict';

let staffStepTwoOpen=false;
const profileForm=document.querySelector('#profileForm');
const nextCard=document.querySelector('#nextCard');
if(nextCard)nextCard.classList.add('hidden');

function assignedRoleMarkup(data){
  const roles=data?.roles||[];
  if(!roles.length)return '<div class="role-chip"><b>Tilgang venter</b><span>Administrator har ikke tildelt arbeidsrolle ennå.</span></div>';
  return roles.map(r=>`<div class="role-chip"><b>${esc(ROLE_NAMES[r.role_code]||r.role_code)}</b><span>${r.participant_id?'Avgrenset deltaker':r.pilot_id?'Pilot / gruppe':'Relevant arbeidsflate'}</span></div>`).join('');
}
function syncAssignedRoles(data){
  const participant=data?.accountType==='participant';
  let block=document.querySelector('#assignedRolesStepOne');
  if(participant){block?.remove();return}
  const staffFields=document.querySelector('#staffFields');
  if(!staffFields)return;
  if(!block){
    block=document.createElement('section');block.id='assignedRolesStepOne';block.className='assigned-role-block';
    staffFields.prepend(block);
  }
  block.innerHTML=`<span class="field-label">Tildelte arbeidsroller</span><div class="role-list">${assignedRoleMarkup(data)}</div><small>Arbeidsroller og tilgang styres av administrator. Feltet under er bare din eventuelle stillingstittel.</small>`;
  const jobLabel=document.querySelector('#jobTitle')?.closest('label')?.querySelector('span');
  if(jobLabel)jobLabel.textContent='Stillingstittel (valgfritt)';
  const job=document.querySelector('#jobTitle');if(job)job.placeholder='f.eks. rådgiver, turleder eller prosjektleder';
}
function showStaffStepTwo(data){
  staffStepTwoOpen=true;
  syncAssignedRoles(data);
  const roleList=document.querySelector('#roleList');if(roleList)roleList.innerHTML=assignedRoleMarkup(data);
  profileForm?.classList.add('hidden');
  nextCard?.classList.remove('hidden');
  document.querySelector('#nextText').textContent=(data?.roles||[]).length?'Profilen er lagret. Neste steg er å sikre arbeidskontoen før rolleintroduksjonen åpnes.':'Profilen er lagret. Administrator må tildele arbeidsrolle før arbeidsflaten åpnes.';
  refreshMfa();
  setTimeout(()=>nextCard?.scrollIntoView({behavior:'smooth',block:'start'}),20);
}
async function edgeErrorDetails(error,data){
  let status=error?.context?.status||null,code=data?.error||null;
  if(!code&&error?.context?.clone){try{const body=await error.context.clone().json();code=body?.error||null}catch{}}
  return{status,code:code||error?.message||'REQUEST_FAILED'};
}
async function invokeSetup(body,retry=true){
  const {data,error}=await client.functions.invoke('account-setup-command',{body});
  if(!error&&!data?.error)return data;
  const detail=await edgeErrorDetails(error,data);
  if(retry&&(detail.status===401||detail.status===500||detail.code==='ACCOUNT_SETUP_FAILED')){
    if(detail.status===401)await client.auth.refreshSession();
    await new Promise(r=>setTimeout(r,180));
    return invokeSetup(body,false);
  }
  const err=new Error(detail.code);err.status=detail.status;throw err;
}
function friendlySaveError(err){
  const code=String(err?.message||'');
  if(code==='DISPLAY_NAME_REQUIRED')return'Fyll inn navn før du fortsetter.';
  if(code==='INVALID_BIRTH_YEAR')return'Kontroller fødselsår og prøv igjen.';
  if(code==='UNAUTHORIZED'||err?.status===401)return'Innloggingen må fornyes. Åpne invitasjonslenken på nytt og prøv igjen.';
  if(code==='ACCOUNT_SETUP_FAILED'||err?.status===500)return'Profilen kunne ikke lagres akkurat nå. Ingen rolle eller tilgang er endret. Prøv igjen; hvis det skjer på nytt, noter tidspunktet så kan feilen spores presist.';
  return`Kunne ikke lagre (${code||'ukjent feil'}).`;
}

if(typeof fill==='function'){
  const baseFill=fill;
  fill=function(data){
    baseFill(data);
    syncAssignedRoles(data);
    if(data?.accountType==='participant'){
      nextCard?.classList.add('hidden');
    }else if(staffStepTwoOpen){
      profileForm?.classList.add('hidden');nextCard?.classList.remove('hidden');
    }else{
      profileForm?.classList.remove('hidden');nextCard?.classList.add('hidden');
    }
  };
}

profileForm?.addEventListener('submit',async e=>{
  e.preventDefault();e.stopImmediatePropagation();hideMessage();
  const btn=e.submitter||profileForm.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Lagrer…'}
  try{
    const body={action:'UPDATE',display_name:document.querySelector('#displayName').value,phone:document.querySelector('#phone').value,locale:document.querySelector('#locale').value};
    if(state?.accountType==='participant'){
      body.birth_year=document.querySelector('#birthYear').value||null;body.preferred_contact_method=document.querySelector('#preferredContact').value;
    }else body.job_title=document.querySelector('#jobTitle').value;
    const result=await invokeSetup(body);
    document.querySelector('#profileMessage').textContent=state?.accountType==='participant'?'Profilen er lagret. Åpner Min reise…':'Profilen er lagret.';
    if(state?.accountType==='participant'){
      setTimeout(()=>location.replace('./'),220);return;
    }
    const fresh=await invokeSetup({action:'GET'});state=fresh;showStaffStepTwo(fresh);
    if(result.next==='ACCESS_PENDING')show('Profilen er klar','Administrator må tildele arbeidsrolle før arbeidsflaten åpnes.');
  }catch(err){document.querySelector('#profileMessage').textContent=friendlySaveError(err)}finally{
    if(btn){btn.disabled=false;btn.textContent='Lagre og fortsett'}
  }
},{capture:true});
})();
