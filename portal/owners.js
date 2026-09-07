const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);
let session=null,participants=[],context=null,initPromise=null,contextSeq=0;

function esc(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt',"'":'&#39;','"':'&quot;'}[c]))}
async function cmd(action,body={}){return client.functions.invoke('case-command',{body:{action,...body}})}
function loading(message='Laster ansvar…',visible=true){const el=$('#ownerLoading');if(!el)return;el.textContent=message;el.classList.toggle('hidden',!visible)}
function blocked(message){const text=$('#blockedText');if(text)text.textContent=message;$('#blocked')?.classList.remove('hidden');$('#work')?.classList.add('hidden');loading('',false)}
async function withTimeout(promise,ms=10000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('OWNER_CONTEXT_TIMEOUT')),ms)})])}finally{clearTimeout(timer)}}
function requestedParticipantId(){return new URLSearchParams(location.search).get('participant')||''}

async function initCore(){
  loading('Kontrollerer tilgang…',true);$('#blocked')?.classList.add('hidden');$('#work')?.classList.add('hidden');
  const sessionRes=await withTimeout(client.auth.getSession(),8000);const s=sessionRes?.data?.session;session=s;
  if(!session){location.replace('./');return}
  const aal=await withTimeout(client.auth.mfa.getAuthenticatorAssuranceLevel(),8000),ok=aal.data?.currentLevel==='aal2';
  $('#securityPill').textContent=ok?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';
  $('#securityPill').classList.toggle('secure',ok);
  if(!ok){blocked('Bekreft Authenticator og bruk en rolle med mandat til å forvalte VÍA/ansvar.');return}

  const select=$('#participantSelect'),requested=requestedParticipantId();
  if(requested){
    loading('Laster valgt deltaker…',true);
    participants=[{id:requested,code_name:'Valgt deltaker',stage:''}];
    select.innerHTML=`<option value="${esc(requested)}">Laster valgt deltaker…</option>`;
    select.value=requested;
    const probe=await loadContext();
    if(!probe){blocked('Valgt deltaker eller ansvarskontekst kunne ikke lastes. Ingen data er endret. Trykk «Prøv igjen» eller gå tilbake til portalen.');return}
    const p=context?.participant||{};
    participants=[{id:requested,code_name:p.code_name||'Valgt deltaker',stage:p.stage||''}];
    select.innerHTML=`<option value="${esc(requested)}">${esc(p.code_name||'Valgt deltaker')} · ${esc(p.stage||'')}</option>`;
    select.value=requested;
    $('#blocked').classList.add('hidden');$('#work').classList.remove('hidden');loading('',false);return;
  }

  loading('Laster deltakere…',true);
  let participantRes;
  try{participantRes=await withTimeout(client.from('participants').select('id,code_name,stage,updated_at').eq('active',true).order('updated_at',{ascending:false}),10000)}catch{blocked('Deltakerlisten svarte ikke innen fristen. Ingen data er endret. Trykk «Prøv igjen» eller åpne verktøyet fra en konkret deltakeroppgave.');return}
  const {data,error}=participantRes||{};participants=data||[];
  if(error||!participants.length){blocked('Deltakerlisten kunne ikke lastes med denne tilgangen. Gå tilbake til portalen og prøv igjen.');return}
  const previous=select.value;
  select.innerHTML=participants.map(p=>`<option value="${p.id}">${esc(p.code_name)} · ${esc(p.stage)}</option>`).join('');
  if(previous&&participants.some(p=>p.id===previous))select.value=previous;
  const probe=await loadContext();
  if(!probe){blocked('Ansvar og eierkontekst kunne ikke lastes. Ingen data er endret. Trykk «Prøv igjen» eller gå tilbake til portalen.');return}
  $('#blocked').classList.add('hidden');$('#work').classList.remove('hidden');loading('',false);
}
function init(){
  if(initPromise)return initPromise;
  initPromise=initCore().catch(()=>blocked('Ansvar kunne ikke lastes. Ingen data er endret. Trykk «Prøv igjen» eller gå tilbake til portalen.')).finally(()=>{initPromise=null});
  return initPromise;
}

function peopleOptions(rows,current){return '<option value="">Velg ansvarlig</option>'+rows.map(p=>`<option value="${p.user_id}" ${p.user_id===current?'selected':''}>${esc(p.full_name)}${p.job_title?` · ${esc(p.job_title)}`:''}</option>`).join('')}

async function loadContext(){
  const participantId=$('#participantSelect').value;if(!participantId)return false;
  const seq=++contextSeq;loading('Laster ansvar og eiere…',true);
  let response;
  try{response=await withTimeout(cmd('LIST_CONTEXT',{participantId}),10000)}catch{return false}
  if(seq!==contextSeq)return true;
  const {data,error}=response||{};
  if(error||data?.error)return false;
  context=data;
  $('#stage').textContent=data.participant?.stage||'–';
  $('#pilot').textContent=data.pilot?.name||'Ikke tildelt';
  $('#viaOwner').innerHTML=peopleOptions(data.eligible?.via||[],data.assessment?.owner_user_id);
  $('#vidaOwner').innerHTML=peopleOptions(data.eligible?.vida||[],data.assessment?.vida_owner_user_id);
  $('#viaMessage').textContent=data.assessment?.owner_user_id?'VÍA-eier er navngitt.':'VÍA-eier er ikke navngitt ennå.';
  $('#vidaMessage').textContent=data.assessment?.vida_owner_user_id?'VIDA-eier er navngitt.':'VIDA-eier mangler – SER kan ikke startes.';
  loading('',false);return true;
}

async function save(action,selectId,messageId){
  const participantId=$('#participantSelect').value,targetUserId=$(selectId).value;
  if(!targetUserId){$(messageId).textContent='Velg en ansvarlig først.';return}
  $(messageId).textContent='Lagrer…';
  let response;
  try{response=await withTimeout(cmd(action,{participantId,targetUserId}),10000)}catch{$(messageId).textContent='Lagringen svarte ikke innen fristen. Ingen bekreftet endring er registrert i visningen; prøv igjen.';return}
  const {data,error}=response||{};
  if(error||data?.error){$(messageId).textContent='Eierskapet kunne ikke lagres med valgt rolle/scope.';return}
  $(messageId).textContent='Ansvar lagret og revisjonsført.';await loadContext();
}

$('#participantSelect').addEventListener('change',async()=>{const ok=await loadContext();if(!ok)blocked('Ansvar og eierkontekst kunne ikke lastes. Ingen data er endret. Trykk «Prøv igjen».')});
$('#saveVia').addEventListener('click',()=>save('SET_VIA_OWNER','#viaOwner','#viaMessage'));
$('#saveVida').addEventListener('click',()=>save('SET_VIDA_OWNER','#vidaOwner','#vidaMessage'));
$('#retryOwner')?.addEventListener('click',()=>init());
client.auth.onAuthStateChange(event=>{
  if(event==='SIGNED_OUT'){location.replace('./');return}
  if(['SIGNED_IN','MFA_CHALLENGE_VERIFIED'].includes(event))setTimeout(init,0);
});
init();
