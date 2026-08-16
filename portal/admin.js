const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);

function msg(id,text,ok=false){const el=$(id);el.textContent=text;el.dataset.ok=ok?'true':'false';}
function clean(v){return String(v||'').trim();}
function isoOrNull(v){return v?new Date(v).toISOString():null;}

async function requireAdmin(){
  const {data:{session}}=await client.auth.getSession();
  if(!session){location.replace('./');return false;}
  const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();
  const atAal2=aal.data?.currentLevel==='aal2';
  $('#securityPill').textContent=atAal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';
  $('#securityPill').classList.toggle('secure',atAal2);
  $('#securityPill').classList.toggle('attention',!atAal2);
  if(!atAal2){
    $('#blocked').classList.remove('hidden');
    $('#blockedTitle').textContent='Tofaktor må bekreftes';
    $('#blockedText').textContent='Gå tilbake til portalen, bekreft Authenticator og åpne administrasjon på nytt.';
    return false;
  }
  const {data:grants,error}=await client.from('role_grants').select('role_code,revoked_at,valid_from,valid_until').eq('user_id',session.user.id).eq('role_code','system_admin');
  if(error){
    $('#blocked').classList.remove('hidden');
    $('#blockedText').textContent='Kunne ikke kontrollere administratorrollen.';
    return false;
  }
  const now=new Date();
  const active=(grants||[]).some(g=>!g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now));
  if(!active){
    $('#blocked').classList.remove('hidden');
    $('#blockedText').textContent='Denne kontoen har ikke aktiv systemadministratorrolle.';
    return false;
  }
  $('#adminWorkspace').classList.remove('hidden');
  return true;
}

$('#inviteForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=clean($('#inviteEmail').value).toLowerCase();
  msg('#inviteMessage','Sender sikker invitasjon…');
  const {data,error}=await client.functions.invoke('admin-invite-user',{body:{email}});
  if(error||data?.error){msg('#inviteMessage',`Invitasjonen feilet: ${data?.error||error?.message||'ukjent feil'}`);return;}
  if(data?.userId)$('#targetUserId').value=data.userId;
  msg('#inviteMessage','Invitasjonen er sendt. Tildel bare rollen personen faktisk trenger.',true);
});

$('#grantForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const targetUserId=clean($('#targetUserId').value);
  const roleCode=clean($('#roleCode').value);
  if(!targetUserId||!roleCode){msg('#grantMessage','Bruker-ID og rolle er påkrevd.');return;}
  const body={
    targetUserId,
    roleCode,
    participantId:clean($('#participantId').value)||null,
    pilotId:clean($('#pilotId').value)||null,
    reason:clean($('#reason').value)||null,
    validUntil:isoOrNull($('#validUntil').value)
  };
  if(roleCode==='break_glass'&&(!body.reason||!body.validUntil)){
    msg('#grantMessage','Break-glass krever både begrunnelse og utløpstid.');return;
  }
  msg('#grantMessage','Tildeler rolle…');
  const {data,error}=await client.functions.invoke('admin-grant-role',{body});
  if(error||data?.error){msg('#grantMessage',`Rollen ble ikke tildelt: ${data?.error||error?.message||'ukjent feil'}`);return;}
  msg('#grantMessage',`Rolle tildelt. Grant-ID: ${data.grant?.id||'opprettet'}`,true);
  if(data.grant?.id)$('#grantId').value=data.grant.id;
});

$('#revokeForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const grantId=clean($('#grantId').value), reason=clean($('#revokeReason').value);
  if(!grantId||!reason){msg('#revokeMessage','Grant-ID og begrunnelse er påkrevd.');return;}
  msg('#revokeMessage','Tilbakekaller tilgang…');
  const {data,error}=await client.functions.invoke('admin-revoke-role',{body:{grantId,reason}});
  if(error||data?.error){msg('#revokeMessage',`Tilgangen ble ikke tilbakekalt: ${data?.error||error?.message||'ukjent feil'}`);return;}
  msg('#revokeMessage',data.alreadyRevoked?'Tilgangen var allerede tilbakekalt.':'Tilgangen er tilbakekalt og revisjonshistorikken er beholdt.',true);
});

$('#logout').addEventListener('click',async()=>{await client.auth.signOut();location.replace('./');});
requireAdmin();
