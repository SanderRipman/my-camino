const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
const QA_MODE=new URLSearchParams(location.search).get('n2qa')==='1';
let session=null,rows=[],selectedId=null,qaRows=[];

function esc(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function statusLabel(status){return({NEW:'Ny',TRIAGE:'Trenger avklaring',REFERRED:'Anbefalt annen vei',CLOSED:'Avsluttet',CONVERTED:'VÍA opprettet'})[status]||status||'Ukjent'}
function sourceLabel(source){return({PUBLIC_WEB:'aidme.no',WEB:'aidme.no',PARTNER:'Partner',NAV:'NAV / offentlig partner',SELF:'Egen interesse',STAFF:'Registrert av medarbeider'})[String(source||'').toUpperCase()]||source||'Ikke angitt'}
function statusTone(status){return status==='NEW'?'YELLOW':status==='TRIAGE'?'GREEN':'neutral'}
function receivedLabel(value){try{return new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}catch{return'–'}}
function receivedDate(value){try{return new Intl.DateTimeFormat('nb-NO',{dateStyle:'medium'}).format(new Date(value))}catch{return'–'}}
function qaFixtures(){const now=Date.now();return[
  {id:'qa-n2-001',status:'NEW',source:'PUBLIC_WEB',contact_name:'Mina Test',contact_email:'mina.test@example.invalid',contact_phone:'',received_at:new Date(now-22*60*1000).toISOString(),interest_text:null,triage_summary:null},
  {id:'qa-n2-002',status:'TRIAGE',source:'PARTNER',contact_name:'Jon Test',contact_email:'jon.test@example.invalid',contact_phone:'+47 400 00 002',received_at:new Date(now-4*60*60*1000).toISOString(),interest_text:'Ønsker å vite mer om før–under–etter-løpet og om VÍA kan passe.',triage_summary:'Avklar forventninger og om personen ønsker egen dialog eller partnerdialog.'},
  {id:'qa-n2-003',status:'NEW',source:'NAV',contact_name:'Siri Test',contact_email:'siri.test@example.invalid',contact_phone:'+47 400 00 003',received_at:new Date(now-26*60*60*1000).toISOString(),interest_text:null,triage_summary:null}
]}
async function cmd(action,body={}){return client.functions.invoke('intake-command',{body:{action,...body}})}

function setWorkspaceMessage(text,type='info'){
  const el=$('#workspaceMessage');if(!el)return;el.textContent=text||'';el.className=`message ${type==='success'?'auth-success':type==='error'?'auth-error':'auth-info'}`;
}
function updateSummary(){
  const open=rows.filter(r=>['NEW','TRIAGE'].includes(r.status));
  $('#countNew').textContent=open.filter(r=>r.status==='NEW').length;
  $('#countTriage').textContent=open.filter(r=>r.status==='TRIAGE').length;
  $('#countOpen').textContent=open.length;
}
function initializeQa(){qaRows=qaFixtures();rows=qaRows.map(x=>({...x}));selectedId=rows[0]?.id||null}

async function init(){
  const {data:{session:s}}=await client.auth.getSession();session=s;if(!session){location.replace('./');return}
  const a=await client.auth.mfa.getAuthenticatorAssuranceLevel(),aal2=a.data?.currentLevel==='aal2';
  $('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';$('#securityPill').classList.toggle('secure',aal2);
  if(!aal2){$('#blocked').classList.remove('hidden');return}
  if(QA_MODE){$('#qaBanner').classList.remove('hidden');$('#workspace').classList.remove('hidden');initializeQa();renderAll();return}
  const {data,error}=await cmd('LIST',{limit:1});
  if(error||data?.error){$('#blocked').classList.remove('hidden');$('#blocked').innerHTML='<h2>Mottak er ikke tilgjengelig</h2><p>Tilgangen er bekreftet, men den autoriserte intake-tjenesten svarte ikke. Ingen direkte databasevei brukes som reserve.</p><a class="ghost link-btn" href="./">Tilbake til portalen</a>';return}
  $('#workspace').classList.remove('hidden');await refresh()
}
async function refresh(){
  if(QA_MODE){rows=qaRows.filter(r=>['NEW','TRIAGE'].includes(r.status));if(selectedId&&!rows.some(x=>x.id===selectedId))selectedId=rows[0]?.id||null;renderAll();return}
  const {data,error}=await cmd('LIST',{statuses:['NEW','TRIAGE'],limit:50});
  if(error||data?.error){$('#intakeList').innerHTML='<div class="n2-empty"><b>Kunne ikke hente innkomne interesser.</b><p>Prøv Oppdater. Portalen faller ikke tilbake til direkte tabelltilgang.</p></div>';return}
  rows=data.intakes||[];if(selectedId&&!rows.some(x=>x.id===selectedId))selectedId=null;if(!selectedId&&rows.length)selectedId=rows[0].id;renderAll()
}
function renderAll(){updateSummary();renderList();renderDetail()}
function renderList(){
  $('#intakeList').innerHTML=rows.length?rows.map(r=>`<button class="participant-card ${r.id===selectedId?'active':''}" data-id="${esc(r.id)}"><i class="status-dot ${statusTone(r.status)}"></i><div><b>${esc(r.contact_name||'Ny interessent')}</b><small>${esc(sourceLabel(r.source))} · ${esc(receivedLabel(r.received_at))}</small></div><span class="pill ${statusTone(r.status)} n2-status">${esc(statusLabel(r.status))}</span></button>`).join(''):'<div class="n2-empty"><b>Ingen interesser venter på beslutning.</b><p>Det betyr at køen er tom – ikke at noen automatisk er godkjent.</p></div>';
  document.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{selectedId=b.dataset.id;renderList();renderDetail()}))
}
function renderDetail(){
  const r=rows.find(x=>x.id===selectedId);
  if(!r){$('#detail').innerHTML='<h3>Velg en interesse</h3><p>Kontaktopplysninger vises bare i denne autoriserte triageflaten.</p>';return}
  const interest=r.interest_text?esc(r.interest_text):'Ingen fritekst mottatt. Det er normalt når første kontakt er bevisst dataminimal.';
  $('#detail').innerHTML=`<div class="card-head"><div><p class="eyebrow">${esc(statusLabel(r.status))} · ${esc(sourceLabel(r.source))}</p><h2>${esc(r.contact_name||'Interessent')}</h2></div><span class="pill YELLOW">VÍA-triage</span></div><div class="n2-flow-note"><strong>Interesse mottatt – ikke godkjenning.</strong> Neste steg velges av ansvarlig medarbeider. SER-plass eller effekt loves ikke her.</div><section class="n2-section"><h3>Hva vet vi?</h3><div class="n2-known-grid"><div class="n2-known"><span>E-post</span><strong>${esc(r.contact_email||'Ikke oppgitt')}</strong></div><div class="n2-known"><span>Telefon</span><strong>${esc(r.contact_phone||'Ikke oppgitt')}</strong></div><div class="n2-known"><span>Kilde</span><strong>${esc(sourceLabel(r.source))}</strong></div><div class="n2-known"><span>Mottatt</span><strong>${esc(receivedDate(r.received_at))}</strong></div></div><p>${interest}</p></section><section class="n2-section"><h3>Hva mangler før neste steg?</h3><p class="n2-next-copy">Noter bare det som er nødvendig for å avgjøre neste kontakt eller om VÍA er aktuelt. Sensitiv kartlegging hører hjemme senere i riktig VÍA-flyt.</p><label><span>Kort avklaring / triageoppsummering</span><textarea id="triageSummary" rows="4" placeholder="Eksempel: Avklar forventninger, ønsket kontaktform eller om personen skal inviteres til VÍA.">${esc(r.triage_summary||'')}</textarea></label></section><section class="n2-section"><h3>Velg ett neste utfall</h3><div class="n2-outcomes"><button class="ghost" data-triage="TRIAGE">Trenger avklaring</button><button class="ghost n2-terminal" data-triage="REFERRED">Anbefal annen vei</button><button class="ghost n2-terminal" data-triage="CLOSED">Avslutt</button><button class="primary" id="toVia">Gå videre til VÍA</button></div><p class="n2-next-copy">«Gå videre til VÍA» oppretter VÍA-reisen. Konto og sikker invitasjon er neste separate steg.</p></section><p id="detailMessage" class="message" aria-live="polite"></p>`;
  document.querySelectorAll('[data-triage]').forEach(b=>b.addEventListener('click',()=>requestTriage(b.dataset.triage)));
  $('#toVia').addEventListener('click',()=>{$('#codeName').value='';$('#convertMessage').textContent='';$('#convertDialog').showModal()})
}
function requestTriage(status){
  if(['REFERRED','CLOSED'].includes(status)){
    const text=status==='REFERRED'?'Bekreft at denne interessen skal tas ut av VÍA-køen og følges opp i et annet spor.':'Bekreft at saken skal avsluttes og tas ut av aktiv triage.';
    if(!window.confirm(text))return
  }
  triage(status)
}
async function triage(status){
  const summary=$('#triageSummary')?.value.trim()||null;
  if(QA_MODE){const row=qaRows.find(x=>x.id===selectedId);if(!row)return;row.status=status;row.triage_summary=summary;setWorkspaceMessage(status==='TRIAGE'?'Syretest: markert «Trenger avklaring». Ingen data ble lagret.':`Syretest: ${statusLabel(status)}. Ingen data ble lagret.`,'success');await refresh();return}
  $('#detailMessage').textContent='Lagrer…';const {data,error}=await cmd('TRIAGE',{intakeId:selectedId,status,summary});
  if(error||data?.error){$('#detailMessage').textContent='Kunne ikke lagre triage. Ingen alternativ direkte databasevei er brukt.';return}
  setWorkspaceMessage(status==='TRIAGE'?'Saken er markert «Trenger avklaring».':`${statusLabel(status)}. Saken er tatt ut av aktiv triage.`,'success');await refresh()
}
$('#convertForm').addEventListener('submit',async e=>{
  e.preventDefault();const codeName=$('#codeName').value.trim();if(!codeName)return;
  if(QA_MODE){const row=qaRows.find(x=>x.id===selectedId);if(row)row.status='CONVERTED';$('#convertDialog').close();setWorkspaceMessage(`Syretest: VÍA-reise «${codeName}» opprettet lokalt. Ingen konto eller data ble opprettet. Neste logiske steg er sikker VÍA-invitasjon.`,'success');await refresh();return}
  $('#convertMessage').textContent='Oppretter VÍA…';const {data,error}=await cmd('CONVERT_TO_VIA',{intakeId:selectedId,codeName});
  if(error||data?.error){$('#convertMessage').textContent=`Kunne ikke opprette VÍA (${data?.error||'ukjent feil'}).`;return}
  $('#convertDialog').close();selectedId=null;setWorkspaceMessage(`VÍA-reise «${codeName}» er opprettet. Neste steg er sikker invitasjon når VÍA skal starte; personen er ikke godkjent for SER.`,'success');await refresh()
});
$('#refresh').addEventListener('click',refresh);
$('#resetQa')?.addEventListener('click',()=>{initializeQa();setWorkspaceMessage('Syretesten er nullstilt. Ingen data ble lagret.','success');renderAll()});
client.auth.onAuthStateChange(()=>setTimeout(init,0));
init();