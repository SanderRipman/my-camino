(()=>{
'use strict';
const SUPABASE_URL='https://ibloovohuhrceivrvhvn.supabase.co';
const SUPABASE_KEY='sb_publishable_JtNmgzTLlepPhKDCVsn6CA_Vk7BCClv';
let opsClient=null,opsBusy=false,lastEnhancedParticipant=null;
function addNavLink(nav,id,num,label,href){if(!nav||document.getElementById(id))return;const a=document.createElement('a');a.id=id;a.className='nav-item';a.href=href;a.innerHTML=`<span class="nav-num">${num}</span><b>${label}</b>`;nav.appendChild(a)}
function addMenuLink(menu,id,label,href,beforeLast=false){if(!menu||document.getElementById(id))return;const a=document.createElement('a');a.id=id;a.href=href;a.textContent=label;a.style.cssText='display:block;padding:10px 11px;border-radius:10px;color:inherit;text-decoration:none';beforeLast?menu.insertBefore(a,menu.lastElementChild):menu.insertBefore(a,menu.firstElementChild)}
async function installOpsUi(){
 try{
  opsClient=opsClient||supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  const nav=document.querySelector('#mainNav');
  addNavLink(nav,'guideNav','00','Slik fungerer det','./guide.html');
  addNavLink(nav,'demoJourneyNav','LAB','Demo-reise','./demo-journey.html');
  addNavLink(nav,'intakeNav','02+','Interesse / VÍA','./intake.html');
  addNavLink(nav,'ownersNav','02A','Ansvar / eiere','./owners.html');
  addNavLink(nav,'pilotOpsNav','SER','Operativ dag','./pilot-ops.html');
  addNavLink(nav,'notificationsNav','N','Varsler','./notifications.html');
  addNavLink(nav,'auditNav','07A','Revisjon','./audit.html');
  addNavLink(nav,'documentsCenterNav','08A','Mine filer','./documents.html');
  addNavLink(nav,'sosNav','10','Hjelp & SOS','./sos.html');
  const menu=document.querySelector('#userMenu');
  addMenuLink(menu,'userGuideLink','Slik fungerer reisen','./guide.html');
  addMenuLink(menu,'userNotificationLink','Varsler','./notifications.html');
  addMenuLink(menu,'userDocumentsLink','Sikkert dokumentarkiv','./documents.html');
  addMenuLink(menu,'userSosLink','Hjelp & SOS','./sos.html',true);
  const admin=document.querySelector('#adminLink');
  const {data:{session}}=await opsClient.auth.getSession();if(!session)return;
  const [{data:grants},{data:own}]=await Promise.all([
   opsClient.from('role_grants').select('role_code,revoked_at,valid_until').eq('user_id',session.user.id),
   opsClient.from('participants').select('id').eq('user_id',session.user.id).eq('active',true).maybeSingle()
  ]);
  const active=(grants||[]).filter(g=>!g.revoked_at&&(!g.valid_until||new Date(g.valid_until)>new Date()));
  const intakeRole=active.some(g=>['via_owner','program_lead'].includes(g.role_code));
  const ownerRole=active.some(g=>['project_owner','via_owner','clinical_professional'].includes(g.role_code));
  const serOpsRole=active.some(g=>['ser_lead','logistics','program_lead'].includes(g.role_code));
  const isAdmin=active.some(g=>g.role_code==='system_admin');
  const canDemo=isAdmin||active.some(g=>g.role_code==='program_lead');
  document.querySelector('#demoJourneyNav')?.classList.toggle('hidden',!canDemo);
  document.querySelector('#intakeNav')?.classList.toggle('hidden',!intakeRole);
  document.querySelector('#ownersNav')?.classList.toggle('hidden',!ownerRole);
  document.querySelector('#pilotOpsNav')?.classList.toggle('hidden',!serOpsRole);
  document.querySelector('#auditNav')?.classList.toggle('hidden',!isAdmin);
  if(admin&&!isAdmin)admin.classList.add('hidden');
  if(own)addMenuLink(menu,'participantProfileLink','Min sikkerhetsprofil','./participant-profile.html');
  const {count:unread}=await opsClient.from('notifications').select('id',{head:true,count:'exact'}).is('read_at',null);
  const notif=document.querySelector('#notificationsNav');if(notif&&(unread||0)>0){const i=document.createElement('i');i.className='nav-badges';i.innerHTML=`<span class="nav-count yellow">${Math.min(unread,99)}</span>`;notif.appendChild(i)}
  const detail=document.querySelector('#participantDetail');if(detail){const observer=new MutationObserver(()=>queueMicrotask(enhanceParticipantDetail));observer.observe(detail,{childList:true,subtree:false});await enhanceParticipantDetail()}
 }catch(e){console.warn('[AidMe VIDA ops UI]',e)}
}
async function enhanceParticipantDetail(){
 if(opsBusy||!opsClient)return;const card=document.querySelector('.participant-card.active'),detail=document.querySelector('#participantDetail');if(!card||!detail)return;const participantId=card.dataset.participantId;if(!participantId||lastEnhancedParticipant===participantId&&detail.querySelector('#workflowGateCard'))return;opsBusy=true;
 try{
  const {data:p,error}=await opsClient.from('participants').select('id,stage').eq('id',participantId).maybeSingle();if(error||!p)return;
  const {data:{session}}=await opsClient.auth.getSession();if(!session)return;
  const {data:grants}=await opsClient.from('role_grants').select('role_code,revoked_at,valid_until').eq('user_id',session.user.id);const staff=(grants||[]).some(g=>!g.revoked_at&&(!g.valid_until||new Date(g.valid_until)>new Date()));if(!staff)return;
  let action='',label='',hint='',formKey='';
  if(p.stage==='VIA'||p.stage==='READY_FOR_GO'){formKey='individual_go_no_go';label='Åpne individuell GO / NO-GO';hint='Formell beslutning tas i det versjonerte VÍA-skjemaet. Beslutningen er en egen gate – ikke en del av veikartet.'}
  else if(p.stage==='POSTPONED'){formKey='individual_go_no_go';label='Ny individuell GO / NO-GO-vurdering';hint='Utsettelse er ikke avslag. Start ny vurdering først når avtalte avklaringer er fulgt opp.'}
  else if(['GO','GO_WITH_CONDITIONS'].includes(p.stage)){action='START_SER';label='Kontroller og start SER';hint='Serveren krever deltakerens egen avtale/bekreftelse, lukket avtale-review, samlet Pilot-GO, navngitt VIDA-eier og eventuelle lukkede GO-vilkår.'}
  else if(p.stage==='SER'){action='START_VIDA';label='Overfør til VIDA';hint='Oppretter 72t/14d/30d/90d oppfølging med navngitt VIDA-eier.'}
  else if(p.stage==='VIDA'){action='START_NEW_VIA';label='Start ny VÍA';hint='Åpner neste veivalg uten å gjøre det automatisk.'}
  else{lastEnhancedParticipant=participantId;return}
  const agreementLink=['GO','GO_WITH_CONDITIONS'].includes(p.stage)?`<a class="ghost" href="./form-runner.html?key=participant_agreement&participant=${encodeURIComponent(participantId)}">Avtale / beredskap</a>`:'';
  detail.querySelector('#workflowGateCard')?.remove();const box=document.createElement('div');box.id='workflowGateCard';box.className='panel-card';box.style.marginTop='14px';box.innerHTML=`<p class="eyebrow">Neste gate</p><h3>${label}</h3><p>${hint}</p><div class="form-actions"><a class="ghost" href="./owners.html?participant=${encodeURIComponent(participantId)}">Ansvar / eiere</a>${agreementLink}${formKey?`<a class="primary" href="./form-runner.html?key=${encodeURIComponent(formKey)}&participant=${encodeURIComponent(participantId)}">${label}</a>`:`<button id="workflowGateButton" class="primary" type="button">${label}</button>`}</div><p id="workflowGateMessage" class="message"></p>`;detail.appendChild(box);lastEnhancedParticipant=participantId;
  const btn=box.querySelector('#workflowGateButton');if(btn)btn.addEventListener('click',async()=>{btn.disabled=true;const msg=box.querySelector('#workflowGateMessage');msg.textContent='Kontrollerer gate…';const {data,error}=await opsClient.functions.invoke('workflow-command',{body:{action,participantId}});if(error||data?.error){const map={PARTICIPANT_AGREEMENT_REQUIRED:'Deltakeravtale, deltakerens egen bekreftelse eller staff-review er ikke ferdig.',PILOT_GO_REQUIRED:'Samlet Pilot-GO mangler eller er ikke GO.',SER_REQUIRES_PILOT:'Deltakeren er ikke knyttet til en aktiv pilot.',NAMED_VIDA_OWNER_REQUIRED:'Navngitt VIDA-eier mangler.',GO_CONDITIONS_OPEN:'GO-vilkår må lukkes først.',SER_REQUIRES_INDIVIDUAL_GO:'Individuell GO mangler.',FORBIDDEN:'Rollen din har ikke myndighet til denne overgangen.'};msg.textContent=map[data?.error]||'Overgangen kunne ikke gjennomføres ennå. Ingen data ble endret.';btn.disabled=false;return}msg.textContent='Overgang registrert.';lastEnhancedParticipant=null;setTimeout(()=>location.reload(),500)})
 }finally{opsBusy=false}
}
setTimeout(installOpsUi,50);
})();
