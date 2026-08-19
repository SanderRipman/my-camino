const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
const client=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let session=null,ownerGrant=null,contacts=[],selectedId=null;

const RELATION_LABELS={PARTNER:'Partner',FINANCIER:'Finansiør',PROFESSIONAL:'Fagperson',PUBLIC_SECTOR:'Offentlig / NAV / kommune',NETWORK:'Nettverk',MEDIA:'Media',SUPPLIER:'Leverandør',OTHER:'Annet'};
const STATUS_LABELS={NEW:'Ny',ACTIVE:'Aktiv',WAITING:'Venter',PAUSED:'Pause',CLOSED:'Lukket'};
function escapeHtml(v=''){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function clean(v){const x=String(v??'').trim();return x||null}
function activeGrant(g){const now=new Date();return !g.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now)}
function dateOnly(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)}
function formatDate(v){if(!v)return'Ikke satt';return new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v))}
function asDayStart(v){return v?new Date(`${v}T09:00:00`).toISOString():null}
function setMessage(text,ok=false){$('#crmMessage').textContent=text;$('#crmMessage').dataset.ok=ok?'true':'false'}
function isOpenStatus(c){return !c.archived_at&&!['CLOSED'].includes(c.status)}
function isDue(c){if(!isOpenStatus(c)||!c.next_follow_up_at)return false;const end=new Date();end.setHours(23,59,59,999);return new Date(c.next_follow_up_at)<=end}
function isThisWeek(c){if(!isOpenStatus(c)||!c.next_follow_up_at||isDue(c))return false;const end=new Date();end.setDate(end.getDate()+7);end.setHours(23,59,59,999);return new Date(c.next_follow_up_at)<=end}
function followUpClass(c){return isDue(c)?'crm-overdue':isThisWeek(c)?'crm-this-week':''}

async function requireCrmAccess(){
  const auth=await client.auth.getSession();session=auth.data.session;if(!session){location.replace('./');return false}
  const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();const aal2=aal.data?.currentLevel==='aal2';
  $('#securityPill').textContent=aal2?'AAL2 · bekreftet':'AAL1 · utilstrekkelig';$('#securityPill').classList.toggle('secure',aal2);$('#securityPill').classList.toggle('attention',!aal2);
  if(!aal2){$('#blocked').classList.remove('hidden');$('#blockedTitle').textContent='Tofaktor må bekreftes';$('#blockedText').textContent='CRM inneholder profesjonelle personopplysninger. Bekreft Authenticator under Sikkerhet i portalen og åpne CRM på nytt.';return false}
  const {data:grants,error}=await client.from('role_grants').select('organization_id,role_code,revoked_at,valid_from,valid_until').eq('user_id',session.user.id).eq('role_code','project_owner');
  if(error){$('#blocked').classList.remove('hidden');$('#blockedText').textContent='Kunne ikke kontrollere prosjekteiertilgang.';return false}
  ownerGrant=(grants||[]).find(activeGrant)||null;
  if(!ownerGrant){$('#blocked').classList.remove('hidden');$('#blockedText').textContent='Denne kontoen har ikke aktiv prosjekteierrolle og får derfor ikke åpne Mini CRM.';return false}
  $('#crmWorkspace').classList.remove('hidden');await loadContacts();return true;
}

async function loadContacts(){
  $('#crmList').innerHTML='<p>Laster kontakter…</p>';
  const {data,error}=await client.from('crm_contacts').select('*').eq('owner_user_id',session.user.id).order('priority',{ascending:true}).order('next_follow_up_at',{ascending:true,nullsFirst:false}).order('updated_at',{ascending:false});
  if(error){$('#crmList').innerHTML='<div class="crm-empty">Kunne ikke hente CRM-data med denne tilgangen.</div>';return}
  contacts=data||[];renderAll();
}
function filteredContacts(){
  const q=($('#crmSearch').value||'').trim().toLowerCase(),status=$('#crmStatusFilter').value,showArchived=$('#crmShowArchived').checked;
  return contacts.filter(c=>{
    if(!showArchived&&c.archived_at)return false;if(showArchived===false&&c.archived_at)return false;
    if(status!=='ALL'&&c.status!==status)return false;
    if(!q)return true;return [c.display_name,c.organization_name,c.role_title,c.email,c.phone,RELATION_LABELS[c.relationship_type],c.note].some(v=>String(v||'').toLowerCase().includes(q));
  });
}
function renderMetrics(){
  const active=contacts.filter(c=>!c.archived_at);$('#metricDue').textContent=active.filter(isDue).length;$('#metricWeek').textContent=active.filter(isThisWeek).length;$('#metricWaiting').textContent=active.filter(c=>c.status==='WAITING').length;$('#metricActive').textContent=active.length;
}
function renderList(){
  const rows=filteredContacts();$('#crmCount').textContent=String(rows.length);
  if(!rows.length){$('#crmList').innerHTML='<div class="crm-empty">Ingen kontakter matcher filteret.</div>';if(selectedId&&!contacts.some(c=>c.id===selectedId))selectedId=null;renderDetail();return}
  $('#crmList').innerHTML=rows.map(c=>`<button class="crm-row ${c.id===selectedId?'active':''}" data-crm-id="${c.id}"><div><b>${escapeHtml(c.display_name)}</b><small>${escapeHtml([c.organization_name,c.role_title].filter(Boolean).join(' · ')||RELATION_LABELS[c.relationship_type]||'Kontakt')}</small><small class="${followUpClass(c)}">${c.next_follow_up_at?`Neste: ${escapeHtml(formatDate(c.next_follow_up_at))}`:'Ingen oppfølgingsdato'}</small></div><div class="crm-row-meta"><span class="pill">P${c.priority}</span><span class="pill">${escapeHtml(STATUS_LABELS[c.status]||c.status)}</span>${c.archived_at?'<span class="pill crm-archive-tag">Arkiv</span>':''}</div></button>`).join('');
  $$('.crm-row').forEach(b=>b.addEventListener('click',()=>{selectedId=b.dataset.crmId;renderAll()}));
}
function renderDetail(){
  const c=contacts.find(x=>x.id===selectedId);if(!c){$('#crmDetail').innerHTML='<div class="crm-empty">Velg en kontakt – eller opprett en ny.</div>';return}
  const email=c.email?`<a class="crm-contact-link" href="mailto:${encodeURIComponent(c.email)}">${escapeHtml(c.email)}</a>`:'Ikke satt';const phone=c.phone?`<a class="crm-contact-link" href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a>`:'Ikke satt';
  $('#crmDetail').innerHTML=`<div class="crm-detail-head"><div><p class="eyebrow">${escapeHtml(RELATION_LABELS[c.relationship_type]||'Kontakt')}</p><h2>${escapeHtml(c.display_name)}</h2><p>${escapeHtml([c.organization_name,c.role_title].filter(Boolean).join(' · ')||'')}</p></div><div class="crm-actions"><button id="editCrmContact" class="primary">Rediger</button>${c.archived_at?'<button id="restoreCrmContact" class="ghost">Gjenåpne</button>':'<button id="archiveCrmContact" class="ghost">Arkiver</button>'}</div></div><div class="crm-facts"><div class="crm-fact"><span>Status</span><b>${escapeHtml(STATUS_LABELS[c.status]||c.status)} · P${c.priority}</b></div><div class="crm-fact"><span>Neste oppfølging</span><b class="${followUpClass(c)}">${escapeHtml(formatDate(c.next_follow_up_at))}</b></div><div class="crm-fact"><span>E-post</span><b>${email}</b></div><div class="crm-fact"><span>Telefon</span><b>${phone}</b></div><div class="crm-fact"><span>Sist kontakt</span><b>${escapeHtml(formatDate(c.last_contact_at))}</b></div><div class="crm-fact"><span>Kilde</span><b>${escapeHtml(c.source_type||'MANUAL')}</b></div></div><p class="eyebrow">Arbeidsnotat</p><div class="crm-note">${escapeHtml(c.note||'Ingen notat.')}</div><div class="crm-source"><small class="privacy-note">CRM lagrer bare kort relasjonsminne. Kildepeker: ${escapeHtml(c.source_ref||'ingen')}</small></div>`;
  $('#editCrmContact')?.addEventListener('click',()=>openEditor(c.id));$('#archiveCrmContact')?.addEventListener('click',()=>archiveContact(c.id));$('#restoreCrmContact')?.addEventListener('click',()=>restoreContact(c.id));
}
function renderAll(){renderMetrics();renderList();renderDetail()}

function openEditor(id=null){
  const c=id?contacts.find(x=>x.id===id):null;$('#crmForm').reset();$('#crmId').value=c?.id||'';$('#crmDialogTitle').textContent=c?'Rediger kontakt':'Ny kontakt';$('#crmDialogEyebrow').textContent=c?'Mini CRM · oppdater':'Mini CRM · ny';$('#crmName').value=c?.display_name||'';$('#crmOrganization').value=c?.organization_name||'';$('#crmRole').value=c?.role_title||'';$('#crmRelationship').value=c?.relationship_type||'NETWORK';$('#crmEmail').value=c?.email||'';$('#crmPhone').value=c?.phone||'';$('#crmStatus').value=c?.status||'NEW';$('#crmPriority').value=String(c?.priority||3);$('#crmFollowUp').value=dateOnly(c?.next_follow_up_at);$('#crmLastContact').value=dateOnly(c?.last_contact_at);$('#crmNote').value=c?.note||'';$('#crmArchive').classList.toggle('hidden',!c||!!c.archived_at);$('#crmDuplicateHint').classList.add('hidden');setMessage('');const d=$('#crmDialog');if(!d.open)d.showModal();setTimeout(()=>$('#crmName').focus(),40)
}
function duplicateCheck(){const email=($('#crmEmail').value||'').trim().toLowerCase(),id=$('#crmId').value;if(!email){$('#crmDuplicateHint').classList.add('hidden');return}const hit=contacts.find(c=>c.id!==id&&!c.archived_at&&String(c.email||'').trim().toLowerCase()===email);if(hit){$('#crmDuplicateHint').textContent=`Mulig duplikat: ${hit.display_name}${hit.organization_name?' · '+hit.organization_name:''}. Kontroller før du lagrer.`;$('#crmDuplicateHint').classList.remove('hidden')}else $('#crmDuplicateHint').classList.add('hidden')}

$('#crmForm').addEventListener('submit',async e=>{
  e.preventDefault();const id=$('#crmId').value,name=clean($('#crmName').value);if(!name){setMessage('Kontaktperson må ha et navn.');return}
  const payload={display_name:name,organization_name:clean($('#crmOrganization').value),role_title:clean($('#crmRole').value),email:clean($('#crmEmail').value)?.toLowerCase()||null,phone:clean($('#crmPhone').value),relationship_type:$('#crmRelationship').value,status:$('#crmStatus').value,priority:Number($('#crmPriority').value),next_follow_up_at:asDayStart($('#crmFollowUp').value),last_contact_at:asDayStart($('#crmLastContact').value),note:clean($('#crmNote').value)};
  setMessage('Lagrer…');let result;
  if(id)result=await client.from('crm_contacts').update(payload).eq('id',id).select('*').single();else result=await client.from('crm_contacts').insert({...payload,organization_id:ownerGrant.organization_id,owner_user_id:session.user.id,source_type:'MANUAL'}).select('*').single();
  if(result.error){setMessage('Kunne ikke lagre med gjeldende tilgang. Ingen data ble endret.');return}
  const saved=result.data;const i=contacts.findIndex(c=>c.id===saved.id);if(i>=0)contacts[i]=saved;else contacts.unshift(saved);selectedId=saved.id;setMessage('Lagret.',true);setTimeout(()=>{$('#crmDialog').close();renderAll()},250);
});
async function archiveContact(id){if(!confirm('Arkivere kontakten? Den slettes ikke og kan gjenåpnes.'))return;const {data,error}=await client.from('crm_contacts').update({archived_at:new Date().toISOString()}).eq('id',id).select('*').single();if(error){alert('Kunne ikke arkivere kontakten.');return}contacts[contacts.findIndex(c=>c.id===id)]=data;renderAll()}
async function restoreContact(id){const {data,error}=await client.from('crm_contacts').update({archived_at:null}).eq('id',id).select('*').single();if(error){alert('Kunne ikke gjenåpne kontakten.');return}contacts[contacts.findIndex(c=>c.id===id)]=data;renderAll()}

$('#newCrmContact').addEventListener('click',()=>openEditor());$('#refreshCrm').addEventListener('click',loadContacts);$('#crmSearch').addEventListener('input',renderList);$('#crmStatusFilter').addEventListener('change',renderList);$('#crmShowArchived').addEventListener('change',renderList);$('#crmEmail').addEventListener('blur',duplicateCheck);$('#crmDialogClose').addEventListener('click',()=>$('#crmDialog').close());$('#crmCancel').addEventListener('click',()=>$('#crmDialog').close());$('#crmArchive').addEventListener('click',()=>{const id=$('#crmId').value;if(id){$('#crmDialog').close();archiveContact(id)}});$('#logout').addEventListener('click',async()=>{await client.auth.signOut();location.replace('./')});
requireCrmAccess();