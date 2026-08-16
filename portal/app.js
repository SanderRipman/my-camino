const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const stages=['VÍA','SER','VIDA','ny VÍA'];
let session=null, participants=[], tasks=[], accessGrants=[], assurance={currentLevel:'aal1',nextLevel:'aal1'};
let pendingEnrollmentFactorId=null;

function show(name){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
  $$('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $('#pageTitle').textContent={home:'Hjem',journey:'Min reise',tasks:'Oppgaver',security:'Sikkerhet',help:'Hjelp & kontakt'}[name]||'AidMe VIDA';
  window.scrollTo({top:0,behavior:'smooth'});
}
function mapStage(stage='INTEREST'){
  if(stage==='SER')return 1;
  if(stage==='VIDA')return 2;
  if(stage==='NEW_VIA')return 3;
  return 0;
}
function journeyMarkup(idx){
  return stages.map((s,i)=>`<div class="journey-step ${i<idx?'done':i===idx?'current':''}"><b>${s}</b><small>${['Før · retning og avklaring','Under · erfaring og trygghet','Etter · handling hjemme','Neste retning'][i]}</small></div>`).join('');
}
function taskMarkup(t){
  const due=t.due_at?new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'short'}).format(new Date(t.due_at)):'Ingen frist';
  return `<div class="list-row"><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.description||'')} · ${due}</small></div><span class="status ${t.status}">${escapeHtml(t.status)}</span></div>`;
}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function activeGrant(g){
  if(g.revoked_at)return false;
  if(g.valid_from&&new Date(g.valid_from)>new Date())return false;
  if(g.valid_until&&new Date(g.valid_until)<=new Date())return false;
  return true;
}
function isStaff(){return accessGrants.some(activeGrant)}
function hasRole(code){return accessGrants.some(g=>activeGrant(g)&&g.role_code===code)}
function roleLabel(code){return ({system_admin:'Systemadministrator',project_owner:'Prosjekteier',program_lead:'Programleder',via_owner:'VÍA-ansvarlig',clinical_professional:'Relevant fagperson',ser_lead:'SER-/turleder',vida_owner:'VIDA-eier',logistics:'Logistikk / beredskap',observer:'Observatør',evaluator:'Evaluator',break_glass:'Break-glass'})[code]||code}
function roleSummary(){return accessGrants.filter(activeGrant).map(g=>roleLabel(g.role_code)).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')}

async function getAssurance(){
  const {data,error}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if(error){console.warn('aal',error.message);return {currentLevel:'aal1',nextLevel:'aal1'}}
  return data||{currentLevel:'aal1',nextLevel:'aal1'};
}
async function getTotpFactors(){
  const {data,error}=await client.auth.mfa.listFactors();
  if(error){console.warn('mfa factors',error.message);return []}
  return data?.totp||[];
}
async function renderSecurity(){
  assurance=await getAssurance();
  const factors=await getTotpFactors();
  const verified=factors.filter(f=>f.status==='verified');
  const atAal2=assurance.currentLevel==='aal2';
  const canStepUp=assurance.nextLevel==='aal2'&&!atAal2;
  $('#securityPill').textContent=atAal2?'AAL2 · bekreftet':'AAL1 · grunnnivå';
  $('#securityPill').classList.toggle('secure',atAal2);
  $('#securityPill').classList.toggle('attention',!atAal2);
  $('#startMfa').classList.toggle('hidden',verified.length>0);
  $('#startChallenge').classList.toggle('hidden',!canStepUp);
  if(atAal2)$('#mfaStatus').textContent='Denne innloggingen er bekreftet med tofaktor. Sensitive moduler kan åpnes etter rollen din.';
  else if(verified.length)$('#mfaStatus').textContent='Tofaktor er satt opp, men denne innloggingen må bekreftes før sensitive eller rollebaserte arbeidsflater åpnes.';
  else $('#mfaStatus').textContent='Tofaktor er ikke satt opp ennå. Arbeidsroller og sensitive moduler krever Authenticator.';
  return {factors,verified,atAal2,canStepUp};
}

async function startMfaEnrollment(){
  $('#mfaEnrollMessage').textContent='Oppretter sikker faktor…';
  const {data,error}=await client.auth.mfa.enroll({factorType:'totp'});
  if(error){$('#mfaEnrollMessage').textContent='Kunne ikke starte oppsettet. Prøv igjen.';return}
  pendingEnrollmentFactorId=data.id;
  $('#mfaQr').src=data.totp.qr_code;
  $('#mfaSecret').value=data.totp.secret||'';
  $('#mfaEnrollPanel').classList.remove('hidden');
  $('#mfaEnrollMessage').textContent='Skann koden og bekreft med seks sifre.';
  $('#mfaEnrollCode').focus();
}
async function verifyEnrollment(code){
  if(!pendingEnrollmentFactorId)return;
  $('#mfaEnrollMessage').textContent='Bekrefter…';
  const challenge=await client.auth.mfa.challenge({factorId:pendingEnrollmentFactorId});
  if(challenge.error){$('#mfaEnrollMessage').textContent='Kunne ikke opprette sikkerhetskontrollen.';return}
  const verify=await client.auth.mfa.verify({factorId:pendingEnrollmentFactorId,challengeId:challenge.data.id,code});
  if(verify.error){$('#mfaEnrollMessage').textContent='Koden ble ikke godkjent. Prøv med en ny kode fra Authenticator.';return}
  pendingEnrollmentFactorId=null;
  $('#mfaEnrollPanel').classList.add('hidden');
  $('#mfaEnrollForm').reset();
  await loadPortal();
}
async function verifyExistingFactor(code){
  $('#mfaChallengeMessage').textContent='Bekrefter…';
  const factors=await getTotpFactors();
  const factor=factors.find(f=>f.status==='verified')||factors[0];
  if(!factor){$('#mfaChallengeMessage').textContent='Ingen aktiv Authenticator-faktor ble funnet.';return}
  const challenge=await client.auth.mfa.challenge({factorId:factor.id});
  if(challenge.error){$('#mfaChallengeMessage').textContent='Kunne ikke opprette sikkerhetskontrollen.';return}
  const verify=await client.auth.mfa.verify({factorId:factor.id,challengeId:challenge.data.id,code});
  if(verify.error){$('#mfaChallengeMessage').textContent='Koden ble ikke godkjent. Prøv igjen med en ny kode.';return}
  $('#mfaChallengePanel').classList.add('hidden');
  $('#mfaChallengeForm').reset();
  await loadPortal();
}

function renderEmptyShell(displayName){
  $('#userLabel').textContent=displayName;
  $('#homeHeading').textContent='Kontoen er klar';
  $('#homeEyebrow').textContent='Tilgang avventer';
  $('#homeIntro').textContent='Ingen deltakerreise eller arbeidsrolle er knyttet til kontoen ennå.';
  $('#accessPending').classList.remove('hidden');
  $('#stageBadge').textContent='VÍA';
  $('#journeyMini').innerHTML=journeyMarkup(0);
  $('#journeyFull').innerHTML=journeyMarkup(0);
  $('#taskList').innerHTML='<p>Ingen oppgaver er tildelt.</p>';
  $('#participantCards').innerHTML='<article class="card"><h3>Ingen aktiv reise ennå</h3><p>Når en reise blir aktivert, vises den her.</p></article>';
  $('#staffQueue').classList.add('hidden');
  $('#ownerText').textContent='Tildeles når reisen er aktivert.';
}

async function loadPortal(){
  $('#loading').classList.remove('hidden');
  $('#authView').classList.add('hidden');
  $('#appView').classList.add('hidden');
  $('#accessPending').classList.add('hidden');
  $('#adminLink').classList.add('hidden');
  const {data:{session:s}}=await client.auth.getSession();
  session=s;
  if(!session){$('#loading').classList.add('hidden');$('#authView').classList.remove('hidden');return}

  const uid=session.user.id;
  const [ownPRes,grantRes,profileRes]=await Promise.all([
    client.from('participants').select('id,code_name,stage,user_id,updated_at').eq('user_id',uid),
    client.from('role_grants').select('id,role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',uid),
    client.from('profiles').select('display_name,locale').eq('user_id',uid).maybeSingle()
  ]);
  if(ownPRes.error)console.warn('own participant',ownPRes.error.message);
  if(grantRes.error)console.warn('access grants',grantRes.error.message);
  accessGrants=grantRes.data||[];
  const own=(ownPRes.data||[])[0]||null;
  const displayName=profileRes.data?.display_name||session.user.email||'Innlogget';
  $('#userLabel').textContent=displayName;
  $('#adminLink').classList.toggle('hidden',!hasRole('system_admin'));

  const security=await renderSecurity();
  const staff=isStaff();
  if(staff&&!security.atAal2){
    renderEmptyShell(displayName);
    $('#adminLink').classList.toggle('hidden',!hasRole('system_admin'));
    $('#homeHeading').textContent='Bekreft tofaktor';
    $('#homeEyebrow').textContent='Arbeidsflate låst';
    $('#homeIntro').textContent='Arbeidsroller åpnes først etter at denne innloggingen er bekreftet med Authenticator.';
    $('#ownerText').textContent=roleSummary()||'Arbeidsrolle registrert';
    $('#loading').classList.add('hidden');
    $('#appView').classList.remove('hidden');
    show('security');
    if(security.canStepUp){
      $('#mfaChallengePanel').classList.remove('hidden');
      $('#mfaChallengeCode').focus();
    }
    return;
  }

  const [pRes,tRes,nRes]=await Promise.all([
    client.from('participants').select('id,code_name,stage,user_id,updated_at').order('updated_at',{ascending:false}),
    client.from('tasks').select('id,title,description,status,due_at,priority,task_type,participant_id,assignee_user_id').neq('status','CANCELLED').order('priority',{ascending:true}).order('due_at',{ascending:true,nullsFirst:false}),
    client.from('notifications').select('id,title,safe_preview,read_at,created_at').order('created_at',{ascending:false}).limit(10)
  ]);
  if(pRes.error)console.warn('participants',pRes.error.message);
  if(tRes.error)console.warn('tasks',tRes.error.message);
  if(nRes.error)console.warn('notifications',nRes.error.message);
  participants=pRes.data||[];
  tasks=tRes.data||[];

  const isParticipant=Boolean(own);
  if(!isParticipant&&!staff){
    renderEmptyShell(displayName);
    $('#loading').classList.add('hidden');
    $('#appView').classList.remove('hidden');
    return;
  }

  $('#homeHeading').textContent=isParticipant?'Din neste handling':'Trenger handling nå';
  $('#homeEyebrow').textContent=isParticipant?'Din portal':'Arbeidsflate';
  $('#homeIntro').textContent=isParticipant?'Her ser du det viktigste for din reise først.':'Her vises tildelte oppgaver og deltakere som krever oppfølging.';
  $('#ownerText').textContent=isParticipant?'Navngitt eier vises her når reisen er aktivert.':(roleSummary()||'Arbeidsrolle registrert');
  const current=own||participants[0];
  const idx=mapStage(current?.stage);
  $('#stageBadge').textContent=stages[idx];
  $('#journeyMini').innerHTML=journeyMarkup(idx);
  $('#journeyFull').innerHTML=journeyMarkup(idx);

  const myTasks=tasks.filter(t=>t.assignee_user_id===uid||(own&&t.participant_id===own.id));
  const next=myTasks.find(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status));
  $('#nextActionTitle').textContent=next?.title||'Ingen åpen oppgave';
  $('#nextActionText').textContent=next?.description||'Når noe krever handling, vises det her med eier og frist.';
  $('#taskList').innerHTML=myTasks.length?myTasks.map(taskMarkup).join(''):'<p>Ingen åpne oppgaver akkurat nå.</p>';
  $('#tasksHeading').textContent=isParticipant?'Mine oppgaver':'Tildelte oppgaver';
  $('#participantCards').innerHTML=participants.map(p=>`<article class="card"><p class="eyebrow">${escapeHtml(p.stage)}</p><h3>${escapeHtml(p.code_name)}</h3><p>${p.user_id===uid?'Din deltakerprofil':'Tildelt deltaker'}</p></article>`).join('')||'<article class="card"><h3>Ingen aktiv reise ennå</h3><p>Når en reise blir aktivert, vises den her.</p></article>';

  if(staff){
    $('#staffQueue').classList.remove('hidden');
    const queue=tasks.filter(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status));
    $('#queueCount').textContent=queue.length;
    $('#queueList').innerHTML=queue.length?queue.slice(0,8).map(taskMarkup).join(''):'<p>Ingen saker krever handling nå.</p>';
  } else $('#staffQueue').classList.add('hidden');

  $('#loading').classList.add('hidden');
  $('#appView').classList.remove('hidden');
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=$('#email').value.trim().toLowerCase();
  const password=$('#password').value;
  if(!password){$('#authMessage').textContent='Skriv inn testpassordet, eller bruk sikker innloggingslenke.';return}
  $('#authMessage').textContent='Logger inn…';
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error){$('#authMessage').textContent='Innloggingen ble ikke godkjent. Kontroller e-post og passord.';return}
  $('#authMessage').textContent='Innlogget. Kontrollerer tilgang…';
  await loadPortal();
});
$('#magicLinkButton').addEventListener('click',async()=>{
  const email=$('#email').value.trim().toLowerCase();
  if(!email){$('#authMessage').textContent='Skriv inn e-postadressen først.';return}
  $('#authMessage').textContent='Sender sikker innloggingslenke…';
  const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:`${location.origin}/portal/`}});
  $('#authMessage').textContent=error?'Kunne ikke sende lenken i dette miljøet. Bruk testpassordet inntil e-postflyten er ferdig konfigurert.':'Sjekk e-posten din for sikker innloggingslenke.';
});
$('#changePasswordForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const value=$('#newPassword').value;
  const current=await getAssurance();
  if(current.currentLevel!=='aal2'){$('#passwordMessage').textContent='Bekreft Authenticator først. Passordbytte for arbeidskonto krever AAL2.';show('security');return}
  if(value.length<12){$('#passwordMessage').textContent='Bruk minst 12 tegn.';return}
  $('#passwordMessage').textContent='Bytter passord…';
  const {error}=await client.auth.updateUser({password:value});
  if(error){$('#passwordMessage').textContent='Passordet kunne ikke endres. Prøv igjen.';return}
  $('#changePasswordForm').reset();
  $('#passwordMessage').textContent='Passordet er endret. Det midlertidige testpassordet er nå ugyldig.';
});
$('#logout').addEventListener('click',async()=>{await client.auth.signOut();location.replace('/portal/');});
$('#startMfa').addEventListener('click',startMfaEnrollment);
$('#startChallenge').addEventListener('click',()=>{$('#mfaChallengePanel').classList.remove('hidden');$('#mfaChallengeCode').focus();});
$('#mfaEnrollForm').addEventListener('submit',async e=>{e.preventDefault();await verifyEnrollment($('#mfaEnrollCode').value.trim());});
$('#mfaChallengeForm').addEventListener('submit',async e=>{e.preventDefault();await verifyExistingFactor($('#mfaChallengeCode').value.trim());});
$$('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
client.auth.onAuthStateChange(()=>setTimeout(loadPortal,0));
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
loadPortal();
