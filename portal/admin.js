const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let accessData={users:[],participants:[],pilots:[]};
let handoffApplied=false;
let pendingViaReviewHandoff=null;
const N2_HANDOFF=(()=>{const p=new URLSearchParams(location.search);if(p.get('from')!=='n2')return null;return{participantId:clean(p.get('participantId'))}})();
const ROLE_INFO={
 project_owner:{title:'Prosjekteier',can:'Konsept, avtaler, økonomi, kvalitetssystem og partner-/forsikringsramme.',limit:'Skal ikke alene gjøre kliniske GO/NO-GO-vurderinger uten riktig kompetanse.'},
 program_lead:{title:'Programleder',can:'Holder sammen VÍA, SER og VIDA, deltakerflyt og kvalitet.',limit:'Skal ikke overstyre faglige sikkerhetsbeslutninger.'},
 via_owner:{title:'VÍA-ansvarlig',can:'Avklaring, forberedelse, dokumenter, veivalg og overgang til SER.',limit:'Skal ikke love deltakelse før GO/NO-GO er avklart.'},
 clinical_professional:{title:'Relevant fagperson',can:'Risiko-/inntaksramme, metodeveiledning, kriseplan, debrief og faglig vurdering innen avtalt mandat.',limit:'Har ikke automatisk behandlingsansvar eller døgnberedskap.'},
 ser_lead:{title:'SER-/turleder',can:'Daglig logistikk, rute, gruppe, sikkerhet, hendelser og enkel metode.',limit:'Skal ikke drive behandling, diagnostikk eller tvungen emosjonell prosess.'},
 vida_owner:{title:'VIDA-eier',can:'Eier aktivering etter hjemkomst: 72 timer og 14/30/90 dager, støtte og neste handling.',limit:'Etteransvar skal ikke bli uavklart eller falle mellom AidMe og partner.'},
 logistics:{title:'Logistikk / beredskap',can:'Reise, overnatting, transport, forsikring og praktiske alternativer.',limit:'Skal ikke fatte deltakerfaglige beslutninger.'},
 observer:{title:'Observatør',can:'Kan få begrenset innsyn for avtalt observasjon/evaluering.',limit:'Teller ikke som sikkerhetsbemanning uten reell operativ rolle og ansvar.'},
 evaluator:{title:'Evaluator',can:'Aggregert evaluering og avtalt måling/læring.',limit:'Skal ikke få mer identifiserbar deltakerinformasjon enn formålet krever.'},
 system_admin:{title:'Systemadministrator',can:'Brukere, roller, konfigurasjon og teknisk administrasjon.',limit:'Gir ikke automatisk faglig eller sensitivt deltakerinnsyn.'},
 break_glass:{title:'Midlertidig nødtilgang',can:'Tidsbegrenset tilgang i en konkret ekstraordinær situasjon.',limit:'Krever begrunnelse og utløp; skal være sjelden, auditert og etterprøvbar.'}
};
function clean(v){return String(v||'').trim()}
function isoOrNull(v){return v?new Date(v).toISOString():null}
function msg(id,text,ok=false){const el=$(id);el.textContent=text;el.dataset.ok=ok?'true':'false'}
function escapeHtml(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function activeGrant(g){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}
function roleLabel(code){return ROLE_INFO[code]?.title||code}
function participantLabel(id){return accessData.participants.find(p=>p.id===id)?.code_name||null}
function pilotLabel(id){return accessData.pilots.find(p=>p.id===id)?.name||null}

async function requireAdmin(){
 const {data:{session}}=await client.auth.getSession();if(!session){location.replace('./');return false}
 const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel(),aal2=aal.data?.currentLevel==='aal2';$('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';$('#securityPill').classList.toggle('secure',aal2);$('#securityPill').classList.toggle('attention',!aal2);
 if(!aal2){$('#blocked').classList.remove('hidden');$('#blockedTitle').textContent='Tofaktor må bekreftes';$('#blockedText').textContent='Gå tilbake til portalen, bekreft Authenticator og åpne administrasjon på nytt.';return false}
 const {data:grants,error}=await client.from('role_grants').select('role_code,revoked_at,valid_from,valid_until').eq('user_id',session.user.id).eq('role_code','system_admin');if(error){$('#blocked').classList.remove('hidden');$('#blockedText').textContent='Kunne ikke kontrollere administratorrollen.';return false}
 if(!(grants||[]).some(activeGrant)){$('#blocked').classList.remove('hidden');$('#blockedText').textContent='Denne kontoen har ikke aktiv systemadministratorrolle.';return false}
 $('#adminWorkspace').classList.remove('hidden');await loadAccess();return true;
}
async function loadAccess(){
 $('#accessList').innerHTML='<p>Laster brukere og tilgang…</p>';const {data,error}=await client.functions.invoke('admin-list-access',{body:{}});if(error||data?.error){$('#accessList').innerHTML='<p>Kunne ikke hente tilgangsoversikten.</p>';return}accessData=data;fillAdminSelects();renderAccessList();applyN2Handoff();
}
function fillAdminSelects(){
 const staffUsers=accessData.users.filter(u=>!u.participant);$('#targetUserSelect').innerHTML='<option value="">Velg medarbeider</option>'+staffUsers.map(u=>`<option value="${u.id}">${escapeHtml(u.staff?.full_name||u.email||u.id)}${u.staff?.job_title?` · ${escapeHtml(u.staff.job_title)}`:''}</option>`).join('');
 const pOpts=accessData.participants.map(p=>`<option value="${p.id}">${escapeHtml(p.code_name)} · ${escapeHtml(p.stage)}</option>`).join('');$('#participantId').innerHTML='<option value="">Hele relevant arbeidsflate</option>'+pOpts;
 const pilotOpts=accessData.pilots.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}${p.route_name?` · ${escapeHtml(p.route_name)}`:''}</option>`).join('');$('#pilotId').innerHTML='<option value="">Hele relevant arbeidsflate</option>'+pilotOpts;$('#invitePilot').innerHTML='<option value="">Ikke tildel ennå</option>'+pilotOpts;
}
function renderAccessList(){
 const rows=accessData.users.filter(u=>u.participant||u.staff||(u.grants||[]).some(activeGrant));$('#accessList').innerHTML=rows.length?rows.map(u=>{const name=u.staff?.full_name||u.participant?.code_name||u.email||u.id,type=u.participant?'Deltaker':'Medarbeider',grants=(u.grants||[]).filter(activeGrant);return `<section class="access-person"><div class="access-person-head"><div><b>${escapeHtml(name)}</b><small>${escapeHtml(type)}${u.email?` · ${escapeHtml(u.email)}`:''}</small></div><span class="pill">${grants.length} rolle${grants.length===1?'':'r'}</span></div>${u.participant?`<div class="access-scope"><span class="pill GREEN">Egen reise · ${escapeHtml(u.participant.code_name)}</span></div>`:''}${grants.length?`<div class="grant-list">${grants.map(g=>`<div class="grant-row"><div><b>${escapeHtml(roleLabel(g.role_code))}</b><small>${escapeHtml([participantLabel(g.participant_id)&&`Deltaker: ${participantLabel(g.participant_id)}`,pilotLabel(g.pilot_id)&&`Pilot: ${pilotLabel(g.pilot_id)}`,g.valid_until&&`Til ${new Intl.DateTimeFormat('nb-NO').format(new Date(g.valid_until))}`].filter(Boolean).join(' · ')||'Generelt omfang')}</small></div><button class="ghost revoke-access" data-grant-id="${g.id}">Fjern</button></div>`).join('')}</div>`:'<p class="privacy-note">Ingen aktiv arbeidsrolle.</p>'}</section>`}).join(''):'<p>Ingen brukere å vise.</p>';
 $$('.revoke-access').forEach(b=>b.addEventListener('click',()=>revokeGrant(b.dataset.grantId)));
}
function maybeDefaultScopedViaFields(){
 const role=$('#roleCode').value,participantId=$('#participantId').value||null;
 if(!participantId||!['via_owner','clinical_professional'].includes(role))return;
 const label=participantLabel(participantId)||'valgt deltaker';
 if(!clean($('#reason').value))$('#reason').value='VÍA-vurdering og tidsavgrenset fagansvar for '+label;
 if(!$('#validUntil').value){
   const when=new Date(Date.now()+7*86400000);
   $('#validUntil').value=new Date(when.getTime()-when.getTimezoneOffset()*60000).toISOString().slice(0,16);
 }
}
function offerViaReviewHandoff(context){
 pendingViaReviewHandoff=context;
 const panel=$('#viaReviewAssignment');
 if(!context){panel.classList.add('hidden');return}
 const staff=accessData.users.find(u=>u.id===context.targetUserId);
 const name=staff?.staff?.full_name||staff?.email||'Valgt medarbeider';
 const participant=participantLabel(context.participantId)||'valgt deltaker';
 $('#viaReviewSummary').textContent=`${participant}: ${name} har fått en tidsavgrenset VÍA-/fagrolle. Du kan nå flytte den åpne vurderingsoppgaven til vedkommende.`;
 $('#assignViaReview').disabled=false;
 msg('#viaReviewMessage','Tilgangen er gitt. Oppgaven er ikke flyttet ennå.');
 panel.classList.remove('hidden');
}
async function assignViaReview(){
 const c=pendingViaReviewHandoff;if(!c)return;
 const button=$('#assignViaReview');button.disabled=true;
 msg('#viaReviewMessage','Kontrollerer rettigheter og overfører eksisterende VÍA-vurdering…');
 try{
   const {data,error}=await client.functions.invoke('task-command',{
     body:{action:'REASSIGN_VIA_REVIEW',participantId:c.participantId,targetUserId:c.targetUserId,reason:c.reason}
   });
   if(error||data?.error){
     msg('#viaReviewMessage','Ingen oppgave ble bekreftet overført: '+(data?.error||error?.message||'Ukjent feil')+'. Kontroller oppgaven før ny handling.');
     button.disabled=false;return;
   }
   msg('#viaReviewMessage',data?.unchanged?'VÍA-vurderingen var allerede tildelt riktig medarbeider.':'VÍA-vurderingen er tildelt medarbeideren. Ingen GO/NO-GO er besluttet.',true);
   await loadAccess();
 }catch{
   msg('#viaReviewMessage','Kunne ikke bekrefte overføring. Kontroller oppgaven før ny handling.');
   button.disabled=false;
 }
}
function renderRoleInfo(){const code=$('#roleCode').value,info=ROLE_INFO[code];if(!info){$('#roleDescription').innerHTML='<strong>Velg en rolle</strong><p>Her vises hva rollen er ment å gjøre – og hva den ikke skal gjøre alene.</p>';return}$('#roleDescription').innerHTML=`<strong>${escapeHtml(info.title)}</strong><p><b>Kan:</b> ${escapeHtml(info.can)}</p><p><b>Grense:</b> ${escapeHtml(info.limit)}</p>`}
function toggleInviteFields(){const participant=$('#inviteType').value==='participant';$('#participantInviteFields').classList.toggle('hidden',!participant);$('#inviteCodeName').required=participant&&!$('#existingParticipantId').value}
function applyN2Handoff(){
 if(!N2_HANDOFF||handoffApplied)return;handoffApplied=true;const participant=accessData.participants.find(p=>p.id===N2_HANDOFF.participantId);
 if(!participant){msg('#inviteMessage','N2-overgangen kunne ikke verifiseres mot en aktiv VÍA-reise. Åpne saken fra Mottak / VÍA på nytt før du inviterer.');history.replaceState(null,'',location.pathname);return}
 if(String(participant.stage).toUpperCase()!=='VIA'){msg('#inviteMessage',`Denne reisen er nå i ${participant.stage}. Konto kan ikke kobles via N2-overgangen uten ny vurdering.`);history.replaceState(null,'',location.pathname);return}
 $('#existingParticipantId').value=participant.id;$('#inviteType').value='participant';$('#inviteType').disabled=true;$('#inviteCodeName').value=participant.code_name;$('#inviteCodeName').readOnly=true;$('#inviteEmail').value='';toggleInviteFields();
 const ctx=$('#inviteJourneyContext');ctx.innerHTML=`<strong>Fortsetter fra N2 · ${escapeHtml(participant.code_name)}</strong><span>VÍA-reisen finnes allerede. Denne invitasjonen kobler sikker konto til samme reise. Av personvernhensyn bæres invitasjonsadressen ikke i N2-lenken; fyll inn bekreftet e-postadresse her. Det opprettes ikke en ny deltaker.</span>`;ctx.classList.remove('hidden');$('#inviteSubmit').textContent='Send invitasjon og koble VÍA';ctx.scrollIntoView({behavior:'smooth',block:'nearest'});$('#inviteEmail').focus({preventScroll:true});
}
function clearN2Handoff(){
 $('#existingParticipantId').value='';$('#inviteJourneyContext').classList.add('hidden');$('#inviteJourneyContext').innerHTML='';$('#inviteType').disabled=false;$('#inviteCodeName').readOnly=false;$('#inviteSubmit').textContent='Send invitasjon';history.replaceState(null,'',location.pathname);toggleInviteFields();
}

$('#inviteForm').addEventListener('submit',async e=>{
 e.preventDefault();const email=clean($('#inviteEmail').value).toLowerCase(),type=$('#inviteType').value,codeName=clean($('#inviteCodeName').value),pilotId=$('#invitePilot').value||null,participantId=$('#existingParticipantId').value||null;if(type==='participant'&&!participantId&&codeName.length<3){msg('#inviteMessage','Deltaker trenger et kodenavn på minst 3 tegn.');return}msg('#inviteMessage',participantId?'Sender sikker invitasjon til eksisterende VÍA-reise…':'Sender sikker invitasjon…');
 const invite=await client.functions.invoke('admin-invite-user',{body:{email}});if(invite.error||invite.data?.error){const code=invite.data?.error||invite.error?.message||'ukjent feil';msg('#inviteMessage',code==='USER_ALREADY_EXISTS'?'Denne e-postadressen har allerede en konto. Ingen deltakerkobling ble endret. Bruk eksisterende konto eller avklar den før ny kobling.':`Invitasjonen feilet: ${code}`);return}const userId=invite.data?.userId;if(!userId){msg('#inviteMessage','Invitasjonen ble sendt, men bruker-ID manglet. Ingen deltakerkobling ble endret.');return}$('#targetUserId').value=userId;
 if(type==='participant'){msg('#inviteMessage',participantId?'Invitasjon sendt. Kobler kontoen til eksisterende VÍA-reise…':'Invitasjon sendt. Oppretter begrenset deltakerreise…');const create=await client.functions.invoke('admin-create-participant',{body:{targetUserId:userId,participantId,codeName,pilotId}});if(create.error||create.data?.error){msg('#inviteMessage',`Invitasjonen ble sendt, men deltakerkoblingen feilet: ${create.data?.error||create.error?.message||'ukjent feil'}`);await loadAccess();return}msg('#inviteMessage',participantId?`Invitasjon sendt. Kontoen er koblet til VÍA-reisen ${create.data?.participant?.code_name||codeName} – ingen ny deltaker ble opprettet.`:`Deltaker ${codeName} er opprettet med tilgang kun til egen reise.`,true)}else{msg('#inviteMessage','Medarbeider er invitert. Velg arbeidsrolle og omfang i neste felt.',true)}
 $('#inviteForm').reset();clearN2Handoff();await loadAccess();if(type==='staff'){$('#targetUserSelect').value=userId;}
});

$('#grantForm').addEventListener('submit',async e=>{
 e.preventDefault();const targetUserId=$('#targetUserSelect').value,roleCode=$('#roleCode').value;if(!targetUserId||!roleCode){msg('#grantMessage','Velg både medarbeider og rolle.');return}const body={targetUserId,roleCode,participantId:$('#participantId').value||null,pilotId:$('#pilotId').value||null,reason:clean($('#reason').value)||null,validUntil:isoOrNull($('#validUntil').value)};
 const scopedVia=!!body.participantId&&['via_owner','clinical_professional'].includes(roleCode);
 if((roleCode==='break_glass'||scopedVia)&&(!body.reason||!body.validUntil)){
   msg('#grantMessage',scopedVia?'Avgrenset VÍA-/fagrolle krever begrunnelse og utløp (maks 30 dager).':'Midlertidig nødtilgang krever begrunnelse og utløpstid.');return;
 }
 if(scopedVia&&Date.parse(body.validUntil)>Date.now()+30*86400000){
   msg('#grantMessage','VÍA-/fagrollen kan maksimalt vare i 30 dager.');return;
 }msg('#grantMessage','Tildeler tilgang…');const {data,error}=await client.functions.invoke('admin-grant-role',{body});if(error||data?.error){msg('#grantMessage',`Tilgangen ble ikke tildelt: ${data?.error||error?.message||'ukjent feil'}`);return}msg('#grantMessage','Arbeidsrollen er tildelt med valgt omfang.',true);
 const handoffContext=scopedVia?{participantId:body.participantId,targetUserId,reason:'Tildeler åpen VÍA-vurdering etter avgrenset rollegrant for '+(participantLabel(body.participantId)||'deltaker')}:null;
 $('#grantForm').reset();renderRoleInfo();await loadAccess();
 offerViaReviewHandoff(handoffContext);
});
async function revokeGrant(grantId){const reason=prompt('Kort begrunnelse for å fjerne tilgangen:');if(!reason)return;const {data,error}=await client.functions.invoke('admin-revoke-role',{body:{grantId,reason:clean(reason)}});if(error||data?.error){alert(`Kunne ikke fjerne tilgang: ${data?.error||error?.message||'ukjent feil'}`);return}await loadAccess()}

$('#roleCode').addEventListener('change',()=>{renderRoleInfo();maybeDefaultScopedViaFields()});
$('#participantId').addEventListener('change',maybeDefaultScopedViaFields);
$('#assignViaReview').addEventListener('click',assignViaReview);$('#inviteType').addEventListener('change',toggleInviteFields);$('#refreshAccess').addEventListener('click',loadAccess);$('#logout').addEventListener('click',async()=>{await client.auth.signOut();location.replace('./')});toggleInviteFields();renderRoleInfo();requireAdmin();