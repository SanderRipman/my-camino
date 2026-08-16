const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const stages=['VÍA','SER','VIDA','ny VÍA'];
let session=null, participants=[], tasks=[];

function show(name){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $('#pageTitle').textContent={home:'Hjem',journey:'Min reise',tasks:'Oppgaver',help:'Hjelp & kontakt'}[name]||'AidMe VIDA';
}
function mapStage(stage='INTEREST'){
  if(['SER'].includes(stage))return 1;
  if(['VIDA'].includes(stage))return 2;
  if(['NEW_VIA'].includes(stage))return 3;
  return 0;
}
function journeyMarkup(idx){
  return stages.map((s,i)=>`<div class="journey-step ${i<idx?'done':i===idx?'current':''}"><b>${s}</b><small>${['Før · retning og avklaring','Under · erfaring og trygghet','Etter · handling hjemme','Neste retning'][i]}</small></div>`).join('');
}
function taskMarkup(t){
  const due=t.due_at?new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'short'}).format(new Date(t.due_at)):'Ingen frist';
  return `<div class="list-row"><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.description||'')} · ${due}</small></div><span class="status ${t.status}">${t.status}</span></div>`;
}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

async function loadPortal(){
  $('#loading').classList.remove('hidden'); $('#authView').classList.add('hidden'); $('#appView').classList.add('hidden');
  const {data:{session:s}}=await client.auth.getSession(); session=s;
  if(!session){$('#loading').classList.add('hidden');$('#authView').classList.remove('hidden');return}
  const uid=session.user.id;
  const [pRes,tRes,nRes,profileRes]=await Promise.all([
    client.from('participants').select('id,code_name,stage,user_id,updated_at').order('updated_at',{ascending:false}),
    client.from('tasks').select('id,title,description,status,due_at,priority,task_type,participant_id,assignee_user_id').neq('status','CANCELLED').order('priority',{ascending:true}).order('due_at',{ascending:true,nullsFirst:false}),
    client.from('notifications').select('id,title,safe_preview,read_at,created_at').order('created_at',{ascending:false}).limit(10),
    client.from('profiles').select('display_name,locale').eq('user_id',uid).maybeSingle()
  ]);
  if(pRes.error)console.warn('participants',pRes.error.message);
  if(tRes.error)console.warn('tasks',tRes.error.message);
  participants=pRes.data||[]; tasks=tRes.data||[];
  const own=participants.find(p=>p.user_id===uid);
  const isParticipant=Boolean(own);
  const displayName=profileRes.data?.display_name||session.user.email||'Innlogget';
  $('#userLabel').textContent=displayName;
  $('#homeHeading').textContent=isParticipant?'Din neste handling':'Trenger handling nå';
  $('#homeEyebrow').textContent=isParticipant?'Din portal':'Arbeidsflate';
  $('#homeIntro').textContent=isParticipant?'Her ser du det viktigste for din reise først.':'Her vises tildelte oppgaver og deltakere som krever oppfølging.';
  const current=own||participants[0]; const idx=mapStage(current?.stage);
  $('#stageBadge').textContent=stages[idx]; $('#journeyMini').innerHTML=journeyMarkup(idx); $('#journeyFull').innerHTML=journeyMarkup(idx);
  const myTasks=tasks.filter(t=>t.assignee_user_id===uid || (own&&t.participant_id===own.id));
  const next=myTasks.find(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status));
  if(next){$('#nextActionTitle').textContent=next.title;$('#nextActionText').textContent=next.description||'Åpne oppgaven for neste steg.';}
  $('#taskList').innerHTML=myTasks.length?myTasks.map(taskMarkup).join(''):'<p>Ingen åpne oppgaver akkurat nå.</p>';
  $('#tasksHeading').textContent=isParticipant?'Mine oppgaver':'Tildelte oppgaver';
  $('#participantCards').innerHTML=participants.map(p=>`<article class="card"><p class="eyebrow">${escapeHtml(p.stage)}</p><h3>${escapeHtml(p.code_name)}</h3><p>${p.user_id===uid?'Din deltakerprofil':'Tildelt deltaker'}</p></article>`).join('')||'<article class="card"><h3>Ingen aktiv reise ennå</h3><p>Når en reise blir aktivert, vises den her.</p></article>';
  if(!isParticipant){
    $('#staffQueue').classList.remove('hidden');
    const queue=tasks.filter(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status));
    $('#queueCount').textContent=queue.length;
    $('#queueList').innerHTML=queue.length?queue.slice(0,8).map(taskMarkup).join(''):'<p>Ingen saker krever handling nå.</p>';
  } else $('#staffQueue').classList.add('hidden');
  $('#loading').classList.add('hidden'); $('#appView').classList.remove('hidden');
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=$('#email').value.trim(); $('#authMessage').textContent='Sender…';
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}/portal/`}});
  $('#authMessage').textContent=error?'Kunne ikke sende lenke. Prøv igjen.':'Sjekk e-posten din for sikker innloggingslenke.';
});
$('#logout').addEventListener('click',async()=>{await client.auth.signOut();location.replace('/portal/');});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
client.auth.onAuthStateChange(()=>setTimeout(loadPortal,0));
loadPortal();
