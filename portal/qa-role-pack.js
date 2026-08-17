const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s);
function activeGrant(g){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function boot(){
 const {data:{session}}=await client.auth.getSession();if(!session){block('Logg inn i portalen først.');return}
 const {data:assurance}=await client.auth.mfa.getAuthenticatorAssuranceLevel();const aal2=assurance?.currentLevel==='aal2';$('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · MFA kreves';$('#securityPill').classList.toggle('secure',aal2);
 if(!aal2){block('Bekreft Authenticator/AAL2 i portalens Sikkerhet før testkontoer kan opprettes.');return}
 const {data:grants,error}=await client.from('role_grants').select('role_code,valid_from,valid_until,revoked_at');if(error){block('Kunne ikke kontrollere rolle.');return}
 if(!(grants||[]).some(g=>activeGrant(g)&&g.role_code==='system_admin')){block('Denne siden krever aktiv systemadministratorrolle.');return}
 $('#workspace').classList.remove('hidden');
}
function block(text){$('#blockedText').textContent=text;$('#blocked').classList.remove('hidden')}
function renderAccounts(rows){$('#accounts').innerHTML=(rows||[]).map(a=>`<tr><td data-label="Rolle"><strong>${esc(a.label)}</strong></td><td data-label="Scope"><code>${esc(a.scope)}</code></td><td data-label="E-post"><code>${esc(a.email)}</code> <button class="copy-btn" data-copy="${esc(a.email)}">Kopier</button></td><td data-label="Midlertidig passord"><code class="secret">${esc(a.password)}</code> <button class="copy-btn" data-copy="${esc(a.password)}">Kopier</button></td><td data-label="Utløp">${a.expiresAt?new Date(a.expiresAt).toLocaleString('nb-NO'):'Deltaker-demo'}</td></tr>`).join('');
 $('#resultCard').classList.remove('hidden');$('#hideCredentials').classList.remove('hidden');
 document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText(b.dataset.copy||'');const old=b.textContent;b.textContent='Kopiert';setTimeout(()=>b.textContent=old,900)}));
}
$('#createPack').addEventListener('click',async()=>{const btn=$('#createPack');btn.disabled=true;$('#message').textContent='Oppretter syntetiske testkontoer…';const {data,error}=await client.functions.invoke('qa-create-role-pack',{body:{}});btn.disabled=false;if(error||data?.error){$('#message').textContent='Kunne ikke opprette rollepakken. Kontroller AAL2 og systemadministratorrollen.';return}$('#message').textContent=`Rollepakken er klar. Staff-tilgang utløper ${new Date(data.expiresAt).toLocaleString('nb-NO')}.`;renderAccounts(data.accounts)});
$('#hideCredentials').addEventListener('click',()=>{document.querySelectorAll('.secret').forEach(x=>x.textContent='••••••••••••');$('#hideCredentials').classList.add('hidden')});
boot();
