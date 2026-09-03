const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
let lastAccounts=[];
function activeGrant(g){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function boot(){
 const {data:{session}}=await client.auth.getSession();if(!session){block('Logg inn i portalen først.');return}
 const {data:assurance}=await client.auth.mfa.getAuthenticatorAssuranceLevel();const aal2=assurance?.currentLevel==='aal2';$('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · MFA kreves';$('#securityPill').classList.toggle('secure',aal2);
 if(!aal2){block('Bekreft Authenticator/AAL2 i portalens Sikkerhet før testkontoer kan opprettes.');return}
 const {data:grants,error}=await client.from('role_grants').select('role_code,valid_from,valid_until,revoked_at');if(error){block('Kunne ikke kontrollere rolle.');return}
 if(!(grants||[]).some(g=>activeGrant(g)&&g.role_code==='system_admin')){block('Denne siden krever aktiv systemadministratorrolle.');return}
 $('#workspace').classList.remove('hidden');await refreshPackStatus();
}
function block(text){$('#blockedText').textContent=text;$('#blocked').classList.remove('hidden')}
function renderAccounts(rows){lastAccounts=rows||[];$('#accounts').innerHTML=lastAccounts.map(a=>`<tr><td data-label="Rolle"><strong>${esc(a.label)}</strong></td><td data-label="Scope"><code>${esc(a.scope)}</code></td><td data-label="E-post"><code>${esc(a.email)}</code> <button class="copy-btn" data-copy="${esc(a.email)}">Kopier</button></td><td data-label="Midlertidig passord"><code class="secret">${esc(a.password)}</code> <button class="copy-btn" data-copy="${esc(a.password)}">Kopier</button></td><td data-label="Utløp">${a.expiresAt?new Date(a.expiresAt).toLocaleString('nb-NO'):'Deltaker-demo'}</td></tr>`).join('');
 $('#resultCard').classList.remove('hidden');$('#hideCredentials').classList.remove('hidden');
 document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText(b.dataset.copy||'');const old=b.textContent;b.textContent='Kopiert';setTimeout(()=>b.textContent=old,900)}));
}
async function refreshPackStatus(){
 const host=$('#packStatus'),renew=$('#renewPack');if(!host||!renew)return;
 const {data,error}=await client.functions.invoke('qa-renew-role-pack',{body:{action:'preview'}});
 if(error||data?.error){host.textContent='Kunne ikke lese rollepakke-status akkurat nå.';renew.classList.add('hidden');return}
 if(!data.hasPack){host.textContent='Ingen aktiv syntetisk staff-pakke funnet.';renew.classList.add('hidden');return}
 const when=new Date(data.expiresAt).toLocaleString('nb-NO');const hours=Number(data.remainingHours||0);renew.classList.remove('hidden');
 host.textContent=hours<=48?`Rollepakken utløper ${when}. Forny gjerne for påfølgende uke før fristen.`:`Rollepakken er aktiv til ${when}. Fornyelse endrer ikke passord, MFA eller testdata.`;
}
$('#createPack').addEventListener('click',async()=>{
 const btn=$('#createPack');btn.disabled=true;$('#message').textContent='Oppretter syntetiske testkontoer…';
 const {data,error}=await client.functions.invoke('qa-create-role-pack',{body:{}});
 if(error||data?.error){btn.disabled=false;$('#message').textContent='Kunne ikke opprette rollepakken. Kontroller AAL2 og systemadministratorrollen.';return}
 const {data:weekData}=await client.functions.invoke('qa-renew-role-pack',{body:{action:'ensure_week'}});btn.disabled=false;
 const expiresAt=weekData?.expiresAt||data.expiresAt;const accounts=(data.accounts||[]).map(a=>a.expiresAt?{...a,expiresAt}:a);
 $('#message').textContent=`Rollepakken er klar. Staff-tilgang er sikret til minst ${new Date(expiresAt).toLocaleString('nb-NO')}. Ny opprettelse roterer testpassord, men beholder syntetisk testhistorikk.`;renderAccounts(accounts);await refreshPackStatus();
});
$('#renewPack').addEventListener('click',async()=>{
 if(!confirm('Fornye nåværende staff-tilgang med én uke uten å endre passord, MFA eller testdata?'))return;
 const btn=$('#renewPack');btn.disabled=true;$('#message').textContent='Fornyer QA-tilgang uten å rotere kontoene…';
 const {data,error}=await client.functions.invoke('qa-renew-role-pack',{body:{action:'extend_week'}});btn.disabled=false;
 if(error||data?.error){$('#message').textContent='Kunne ikke fornye rollepakken.';return}
 $('#message').textContent=`Rollepakken er fornyet til ${new Date(data.expiresAt).toLocaleString('nb-NO')}. Passord, MFA og eksisterende testdata er beholdt.`;
 if(lastAccounts.length)renderAccounts(lastAccounts.map(a=>a.expiresAt?{...a,expiresAt:data.expiresAt}:a));await refreshPackStatus();
});
$('#cleanupPack').addEventListener('click',async()=>{if(!confirm('Deaktivere alle syntetiske rolle-QA-kontoer og fjerne demo-deltakerkoblingen?'))return;const btn=$('#cleanupPack');btn.disabled=true;$('#message').textContent='Deaktiverer syntetiske testkontoer…';const {data,error}=await client.functions.invoke('qa-cleanup-role-pack',{body:{}});btn.disabled=false;if(error||data?.error){$('#message').textContent='Kunne ikke rydde testkontoene. Kontroller AAL2 og systemadministratorrollen.';return}lastAccounts=[];$('#accounts').innerHTML='';$('#resultCard').classList.add('hidden');$('#hideCredentials').classList.add('hidden');$('#message').textContent=`Rolle-QA ryddet. ${data.disabledAccounts||0} syntetiske kontoer er deaktivert og tilgangene tilbakekalt.`;await refreshPackStatus()});
$('#hideCredentials').addEventListener('click',()=>{document.querySelectorAll('.secret').forEach(x=>x.textContent='••••••••••••');$('#hideCredentials').classList.add('hidden')});
boot();
