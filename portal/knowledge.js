/* Read-only, AAL2-gated, same-tab form guidance and admin field preview.
 * NAV_RETURN contains only current-tab navigation, never auth/grant/participant data.
 * No save, direct form submission, GO decision, token export or SQL mutation.
 */
(()=>{
'use strict';
const K=window.AIDME_KNOWLEDGE,$=s=>document.querySelector(s),q=new URLSearchParams(location.search);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const PREVIEW_OPTION_NB=Object.freeze({GO:'GO',GO_WITH_CONDITIONS:'GO med vilkår',POSTPONE:'Utsett',NO_GO_NOW:'NO-GO nå',YES:'Ja',NO:'Nei',UNKNOWN:'Ikke avklart',CONTINUE:'Fortsett',ADJUST:'Juster',PAUSE:'Pause',STOP:'Stopp'});
const previewOptionNb=v=>PREVIEW_OPTION_NB[String(v)]||String(v||'Velg');
const key=K?.getForm(q.get('form'))?q.get('form'):null;
const topic=K?.getTopic(q.get('topic'))?q.get('topic'):null;
const NAV_RETURN='aidme:knowledge:return:v1';
const client=supabase.createClient('https://ibloovohuhrceivrvhvn.supabase.co','sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv');
function backTarget(){
 try{
  const x=JSON.parse(sessionStorage.getItem(NAV_RETURN)||'null');
  if(!x||Date.now()-x.at>30*60*1000)return './';
  const u=new URL(x.path,location.origin);
  if(u.origin!==location.origin||!['/portal/','/portal/index.html','/portal/form-runner.html','/portal/onboarding-read.html','/portal/onboarding.html'].includes(u.pathname))return './';
  return u.pathname+u.search+u.hash;
 }catch{return './'}
}
function error(title,message){
 $('#knowledgeError').innerHTML='<h2>'+esc(title)+'</h2><p>'+esc(message)+'</p>';
 $('#knowledgeError').classList.remove('hidden');$('#knowledgeCard').classList.add('hidden');
}
function appendList(host,lines){host.innerHTML='';for(const s of lines){const li=document.createElement('li');li.textContent=s;host.appendChild(li)}}
function renderItem(){
 const f=key?K.getForm(key):null,t=topic?K.getTopic(topic):null;
 if(!f&&!t){error('Fant ikke veiledningen','Åpne veiledningen fra riktig skjema eller rolleintroduksjon. Ingen data er endret.');return}
 $('#knowledgeCard').classList.remove('hidden');
 $('#knowledgeTitle').textContent=f?.title||t?.title;
 $('#knowledgePhase').textContent=f?.phase||'Faglig veiledning';
 $('#knowledgeLead').textContent=f?.why||t?.why;
 $('#knowledgeWhy').textContent=f?'Når og hvorfor?':'Hva handler dette om?';
 $('#knowledgeWhen').textContent=f?'Når: '+f.when:'Formål: '+t.why;
 $('#knowledgeWho').textContent=f?'Ansvar: '+f.who:'Denne veiledningen gir ingen nye rettigheter.';
 $('#knowledgeRepeat').textContent=f?'Bruksfrekvens: '+f.repeat:'';
 appendList($('#knowledgePoints'),f?.points||t.points);
 $('#knowledgeNext').textContent=f?f.next:'Bruk informasjonen innenfor det mandatet du faktisk har.';
 const related=f?K.topicForForm(key):null;
 if(related){$('#relatedKnowledge').classList.remove('hidden');$('#relatedKnowledgeLead').textContent=related.title+' · '+related.why;appendList($('#relatedKnowledgePoints'),related.points)}
 $('#knowledgeBack').href=backTarget();
 if($('#knowledgeBack').getAttribute('href')==='./')$('#knowledgeBack').textContent='← Tilbake til portalen';
 if(f){
  const a=document.createElement('button');a.type='button';a.className='ghost';a.textContent='Forhåndsvis feltene med fiktive data';a.id='openFieldPreview';
  a.hidden=true;$('#knowledgeActions').appendChild(a);
 }
}
function visiblePreview(btn,visible){btn.hidden=!visible}
function editableField(field){
 const wrap=document.createElement('div');wrap.className='knowledge-preview-field';
 const label=document.createElement('label');label.textContent=(field.label||field.key||'Felt')+(field.required?' *':'');wrap.appendChild(label);
 let el;
 if(field.type==='textarea'||field.type==='action'){el=document.createElement('textarea');el.rows=2;}
 else if(field.type==='select'||field.type==='tri_state'||field.type==='yes_no'||field.type==='multi_select'){
  el=document.createElement('select');let values=field.type==='tri_state'?['','YES','NO','UNKNOWN']:field.type==='yes_no'?['','YES','NO']:field.options||[];
  if(!values.length)values=['','Eksempel'];for(const v of values){const opt=document.createElement('option');opt.value=String(v);opt.textContent=previewOptionNb(v);el.appendChild(opt)}
 }else{el=document.createElement('input');el.type=field.type==='date'?'date':field.type==='datetime'?'datetime-local':'text'}
 el.setAttribute('aria-label',label.textContent);el.dataset.previewField='1';el.autocomplete='off';wrap.appendChild(el);
 const help=field.help;if(typeof help==='string'&&help){const small=document.createElement('small');small.textContent=help;wrap.appendChild(small)}
 return wrap;
}
async function preview(userId){
 const btn=$('#openFieldPreview');if(!btn)return;
 const {data:roleRows,error:e}=await client.from('role_grants').select('role_code,participant_id,pilot_id,valid_from,valid_until,revoked_at').eq('user_id',userId).is('revoked_at',null);
 if(e)return;
 const now=Date.now();
 const allowed=(roleRows||[]).some(x=>['system_admin','project_owner'].includes(x.role_code)&&!x.participant_id&&!x.pilot_id&&(!x.valid_from||new Date(x.valid_from).getTime()<=now)&&(!x.valid_until||new Date(x.valid_until).getTime()>now));
 if(!allowed)return;
 btn.hidden=false;
 btn.addEventListener('click',async ()=>{
  btn.disabled=true;$('#previewCard').classList.remove('hidden');$('#previewStatus').textContent='Henter publisert skjemastruktur uten deltakerdata …';
  try{
   const d=await client.from('form_definitions').select('id,key,title_no').eq('key',key).maybeSingle();
   if(d.error||!d.data){$('#previewStatus').textContent='Fant ingen tilgjengelig skjemadefinisjon.';return}
   const v=await client.from('form_versions').select('version,schema_json,published_at,retired_at').eq('form_definition_id',d.data.id).not('published_at','is',null).is('retired_at',null).order('version',{ascending:false}).limit(1).maybeSingle();
   if(v.error||!v.data){$('#previewStatus').textContent='Aktiv skjemaversjon er ikke tilgjengelig.';return}
   const sections=v.data.schema_json?.sections||[];
   $('#previewSections').replaceChildren();let count=0;
   for(const s of sections){const article=document.createElement('section');article.className='knowledge-preview-section';const title=document.createElement('h3');title.textContent=s.title||'Skjemadel';article.appendChild(title);
    for(const field of s.fields||[]){article.appendChild(editableField(field));count++}$('#previewSections').appendChild(article)}
   $('#previewStatus').textContent='Publisert v'+v.data.version+' · '+count+' felt · kun lokal eksempelutfylling. Ingen felt er koblet til lagring eller innsendelse.';
   btn.hidden=true;
  }catch{$('#previewStatus').textContent='Kunne ikke hente skjemastruktur. Ingen deltakerdata er berørt.'}
  finally{btn.disabled=false}
 });
 $('#previewDemo').addEventListener('click',()=>{for(const el of document.querySelectorAll('[data-preview-field]')){if(el.tagName==='SELECT'){if(el.options.length>1)el.selectedIndex=1}else if(el.type==='date'){el.value='2026-11-23'}else if(el.type==='datetime-local'){el.value='2026-11-23T10:00'}else el.value='Fiktivt testeksempel – ingen personopplysninger'}});
 $('#previewClear').addEventListener('click',()=>{for(const el of document.querySelectorAll('[data-preview-field]')){if(el.tagName==='SELECT')el.selectedIndex=0;else el.value=''}});
}
async function init(){
 $('#knowledgeBack').href=backTarget();
 if(!key&&!topic){error('Ukjent innhold','Velg et kjent skjema eller fagtema fra portalen.');return}
 const {data:{session}}=await client.auth.getSession();
 if(!session){error('Innlogging kreves','Logg inn i AidMe VIDA før du åpner veiledningen.');return}
 const {data:aal,error:e}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
 if(e||aal?.currentLevel!=='aal2'){ $('#knowledgeAal').textContent='AAL2 kreves';error('Bekreft tofaktor','Bekreft Authenticator i portalen før du leser den interne veiledningen.');return}
 $('#knowledgeAal').textContent='AAL2 · bekreftet';$('#knowledgeAal').classList.add('secure');
 renderItem();if(key)await preview(session.user.id);
}
init();
})();
