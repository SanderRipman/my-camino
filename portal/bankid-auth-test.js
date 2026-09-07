const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const BANKID_PROVIDER='custom:bankid-preprod';
const PREVIEW_HOST=/^deploy-preview-\d+--mycamino\.netlify\.app$/;
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
let session=null,grants=[],assurance={currentLevel:'aal1',nextLevel:'aal1'},identities=[],attestation=null;
let loadFlight=null,loadQueued=false,loadEpoch=0;
const RELOAD_AUTH_EVENTS=new Set(['SIGNED_IN','SIGNED_OUT','USER_UPDATED','MFA_CHALLENGE_VERIFIED']);

function isPreview(){return location.protocol==='https:'&&PREVIEW_HOST.test(location.hostname)}
function returnUrl(flow){const url=new URL('/portal/bankid-auth-test.html',location.origin);if(flow)url.searchParams.set('flow',flow);return url.toString()}
function activeGrant(g){const now=Date.now();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from).getTime()<=now)&&(!g.valid_until||new Date(g.valid_until).getTime()>now)}
function activeGrants(){return grants.filter(activeGrant)}
function hasRole(code){return activeGrants().some(g=>g.role_code===code)}
function isStaff(){return activeGrants().length>0}
function setMessage(selector,text,kind=''){const el=$(selector);el.textContent=text||'';el.className=`message ${kind}`.trim()}
function showGlobal(text){$('#globalMessage').textContent=text;$('#globalMessage').classList.remove('hidden')}
function stale(epoch){return epoch!==loadEpoch}

function failClosedEnvironment(){
  if(isPreview())return true;
  $('#environmentGate').textContent='Denne testflaten er deaktivert utenfor en Netlify Deploy Preview.';
  $('#environmentGate').classList.remove('hidden');
  $('#testGrid').classList.add('hidden');
  return false;
}

async function fetchAttestation(){
  const {data,error}=await client.functions.invoke('bankid-auth-attestation',{body:{previewTest:true}});
  if(error||data?.error)return{available:false,error:data?.error||error?.message||'ATTESTATION_UNAVAILABLE'};
  return{available:true,...data};
}

async function loadState(epoch){
  if(!failClosedEnvironment())return;
  $('#hostState').textContent=`Preview host · ${location.hostname}`;
  $('#redirectState').textContent=`Auth-retur · ${returnUrl('signin')}`;

  const result=await client.auth.getSession();
  if(stale(epoch))return;
  const nextSession=result.data.session||null;
  let nextGrants=[];
  let nextIdentities=[];
  let nextAssurance={currentLevel:'aal1',nextLevel:'aal1'};
  let nextAttestation=null;

  if(nextSession){
    const [grantRes,assuranceRes,identityRes]=await Promise.all([
      client.from('role_grants').select('id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',nextSession.user.id),
      client.auth.mfa.getAuthenticatorAssuranceLevel(),
      client.auth.getUserIdentities(),
    ]);
    if(stale(epoch))return;
    nextGrants=grantRes.data||[];
    nextAssurance=assuranceRes.data||nextAssurance;
    nextIdentities=identityRes.data?.identities||[];
    nextAttestation=await fetchAttestation();
    if(stale(epoch))return;
  }

  session=nextSession;
  grants=nextGrants;
  assurance=nextAssurance;
  identities=nextIdentities;
  attestation=nextAttestation;
  render();
}

function requestLoad(reason='manual'){
  loadEpoch+=1;
  loadQueued=true;
  if(loadFlight)return loadFlight;
  loadFlight=(async()=>{
    try{
      while(loadQueued){
        loadQueued=false;
        const epoch=loadEpoch;
        await loadState(epoch);
      }
    }finally{
      loadFlight=null;
    }
  })();
  return loadFlight;
}
function safeRequestLoad(reason){
  requestLoad(reason).catch(err=>showGlobal(`Testflaten kunne ikke initialiseres: ${err.message}`));
}

function render(){
  const bankidLinked=identities.some(i=>i.provider===BANKID_PROVIDER);
  const active=activeGrants();
  const roleText=active.length?[...new Set(active.map(g=>g.role_code))].join(' · '):'deltaker / ingen arbeidsrolle';
  $('#sessionState').innerHTML=session
    ?`<span>Innlogget</span><span>${assurance.currentLevel||'aal1'}</span><span>${roleText}</span>`
    :'<span>Ikke innlogget</span><span>AidMe-konto kreves for sikker kobling</span>';
  $('#identityState').innerHTML=bankidLinked?'<span>BankID test koblet</span>':'<span>BankID test ikke koblet</span>';
  $('#assuranceState').innerHTML=`<span>Supabase ${assurance.currentLevel||'aal1'}</span><span>${isStaff()?'Arbeidsrolle · TOTP-step-up beholdes':'Deltaker/ingen arbeidsrolle'}</span>`;
  if(session){
    if(!attestation?.available)$('#assuranceState').innerHTML+='<span>BankID-attestasjon: ikke tilgjengelig ennå</span>';
    else{
      const label=attestation.linked?`${attestation.assurance}${attestation.acrVerified?' · verifisert claim':' · claim ikke verifisert'}`:'BankID ikke koblet';
      $('#assuranceState').innerHTML+=`<span>${label}</span><span>Autorisasjon: uendret</span>`;
    }
  }

  $('#bankidSignIn').disabled=!!session;
  $('#bankidSignIn').textContent=session?'AidMe-konto allerede innlogget':'Logg inn med BankID test';
  const canLink=!!session&&!bankidLinked&&(!isStaff()||assurance.currentLevel==='aal2');
  $('#linkBankid').disabled=!canLink;
  if(session&&!bankidLinked&&isStaff()&&assurance.currentLevel!=='aal2')setMessage('#linkMessage','Arbeidsrollen må bekrefte Authenticator/AAL2 før BankID-identitet kan kobles.');
  else if(bankidLinked)setMessage('#linkMessage','BankID test-identitet er allerede koblet. Ingen rolle eller scope er endret.');
  else setMessage('#linkMessage','');

  const canInvite=!!session&&assurance.currentLevel==='aal2'&&hasRole('system_admin');
  $('#inviteButton').disabled=!canInvite;
  if(!canInvite)setMessage('#inviteMessage','Preview-invitasjon krever AAL2 og aktiv systemadministrator.');
  else setMessage('#inviteMessage','Klar for syntetisk preview-invitasjon.');
}

async function signInBankid(){
  if(!isPreview())return;
  if(session){setMessage('#signinMessage','Logg ut først hvis du vil teste BankID som primær innlogging. Bruk koblingsknappen for eksisterende konto.');return}
  setMessage('#signinMessage','Starter BankID preprod…');
  const {error}=await client.auth.signInWithOAuth({
    provider:BANKID_PROVIDER,
    options:{redirectTo:returnUrl('signin')},
  });
  if(error)setMessage('#signinMessage',`BankID preprod er ikke klar: ${error.message}`);
}

async function linkBankid(){
  if(!isPreview()||!session)return;
  if(isStaff()&&assurance.currentLevel!=='aal2'){setMessage('#linkMessage','AAL2 kreves før arbeidskonto kan koble BankID.');return}
  setMessage('#linkMessage','Starter sikker BankID-kobling…');
  const {error}=await client.auth.linkIdentity({
    provider:BANKID_PROVIDER,
    options:{redirectTo:returnUrl('link')},
  });
  if(error)setMessage('#linkMessage',`Kobling kunne ikke startes: ${error.message}`);
}

async function sendInvite(event){
  event.preventDefault();
  if(!isPreview())return;
  const email=$('#inviteEmail').value.trim().toLowerCase();
  if(!$('#testOnly').checked){setMessage('#inviteMessage','Bekreft syntetisk test før utsending.');return}
  if(!session||assurance.currentLevel!=='aal2'||!hasRole('system_admin')){setMessage('#inviteMessage','AAL2 + systemadministrator kreves.');return}
  $('#inviteButton').disabled=true;setMessage('#inviteMessage','Sender preview-invitasjon…');
  const {data,error}=await client.functions.invoke('admin-invite-user-preview',{body:{email,testOnly:true}});
  if(error||data?.error){
    const detail=data?.error||error?.message||'INVITE_FAILED';
    const suffix=data?.inviteCreated?' Invitasjonen ble opprettet, men audit feilet; ikke send ny invitasjon før audit er avklart.':'';
    setMessage('#inviteMessage',`Invitasjon ikke fullført: ${detail}.${suffix}`);
  }else{
    setMessage('#inviteMessage',`Invitasjon sendt og auditert. Forventet retur: ${data.redirectTo}`);
    $('#redirectState').textContent=`Invitasjonsretur · ${data.redirectTo}`;
  }
  $('#inviteButton').disabled=false;
}

$('#bankidSignIn').addEventListener('click',signInBankid);
$('#linkBankid').addEventListener('click',linkBankid);
$('#inviteForm').addEventListener('submit',sendInvite);
client.auth.onAuthStateChange((event)=>{
  if(!RELOAD_AUTH_EVENTS.has(event))return;
  setTimeout(()=>safeRequestLoad(`auth:${event}`),0);
});
safeRequestLoad('boot');
