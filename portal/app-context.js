(()=>{
'use strict';

const CONTEXT_VERSION='2026-08-21a';
const ROLE_CAPABILITIES={
  system_admin:['manage_config','manage_roles','manage_users','view_audit'],
  project_owner:['manage_program','view_case_status','view_reports'],
  program_lead:['manage_intakes','manage_tasks','respond_sos','view_case_status','view_go','view_participant_core','view_ser','view_vida'],
  via_owner:['decide_go','edit_via','manage_intakes','view_go','view_identity','view_operational_min','view_participant_core','view_sensitive_via'],
  clinical_professional:['decide_go','edit_via','view_go','view_identity','view_incidents','view_sensitive_via'],
  ser_lead:['edit_incidents','edit_ser','manage_ser_tasks','respond_sos','view_incidents','view_operational_min','view_participant_core','view_ser'],
  vida_owner:['edit_vida','view_participant_core','view_vida'],
  logistics:['edit_logistics','respond_sos','view_operational_min','view_participant_core'],
  observer:['view_aggregated'],
  evaluator:['view_aggregated'],
  break_glass:['view_identity','view_incidents','view_operational_min','view_sensitive_via']
};

function installContextStyles(){
  if(document.querySelector('link[data-aidme-context]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=`./context-drilldown.css?v=${CONTEXT_VERSION}`;link.dataset.aidmeContext='1';
  document.head.appendChild(link);
}

function contextGrantCovers(grant,participantId,pilotId){
  if(!activeGrant(grant))return false;
  if(grant.participant_id&&participantId&&grant.participant_id!==participantId)return false;
  if(grant.pilot_id&&pilotId&&grant.pilot_id!==pilotId)return false;
  return true;
}
function canContext(capability,participantId=null,pilotId=null){
  return accessGrants.some(grant=>contextGrantCovers(grant,participantId,pilotId)&&(ROLE_CAPABILITIES[grant.role_code]||[]).includes(capability));
}
function ownsContextParticipant(participant){return !!participant&&participant.user_id===session?.user?.id}
function contextOwnerHref(participant){return participant?`./owners.html?participant=${encodeURIComponent(participant.id)}`:null}
function contextPilotHref(pilot,extra=''){return pilot?`./pilot-ops.html?pilot=${encodeURIComponent(pilot.id)}${extra}`:null}

function ensureContextDialog(){
  let dialog=document.querySelector('#contextActionDialog');if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='contextActionDialog';dialog.className='context-action-dialog';
  dialog.innerHTML=`<form method="dialog" class="context-action-shell"><div class="context-action-head"><div><p class="eyebrow" id="contextActionEyebrow">Kontekst</p><h2 id="contextActionTitle">Detalj</h2></div><button class="icon-btn" value="cancel" aria-label="Lukk">×</button></div><p id="contextActionValue" class="context-action-value"></p><p id="contextActionHint" class="context-action-hint"></p><div id="contextActionMeta" class="context-action-meta"></div><div class="dialog-actions"><button id="contextActionPrimary" type="button" class="primary hidden"></button><button id="contextActionSecondary" type="button" class="ghost hidden"></button><button value="cancel" class="ghost">Lukk</button></div></form>`;
  document.body.appendChild(dialog);return dialog;
}

function openLocalParticipant(participant){
  if(!participant)return;selectedParticipantId=participant.id;document.querySelector('#taskDialog')?.close();show('participants');renderParticipants();
}
function openHelp(){document.querySelector('#taskDialog')?.close();show('help')}

function resolveContextAction(kind,{task,participant,pilot,route,assignee}){
  const own=ownsContextParticipant(participant),pid=participant?.id||null,pilotId=pilot?.id||task?.pilot_id||null;
  const ownerHref=contextOwnerHref(participant),pilotHref=contextPilotHref(pilot);
  const common={kind,state:'info',primary:null,secondary:null};
  if(kind==='participant'){
    if(!participant)return{...common,title:'Deltaker',hint:'Oppgaven er ikke knyttet til en deltaker ennå.',state:canContext('manage_tasks',pid,pilotId)?'open':'info'};
    if(own||canContext('view_participant_core',pid,pilotId))return{...common,title:'Deltaker',hint:own?'Åpner din egen reiseflate.':'Åpner deltakerens operative kjerneinformasjon innenfor din rolle.',state:'open',primary:{label:own?'Åpne min reise':'Åpne deltaker',local:'participant'}};
    return lockedContext('Deltaker','Du har ikke deltakerinnsyn for denne saken.',participant,pilotId);
  }
  if(kind==='assignee'){
    if(own)return{...common,title:'Ansvarlig',hint:'Dette er personen eller rollen som følger opp oppgaven. Endring av ansvar skjer i arbeidsflyten, ikke i dette feltet.',state:'info',primary:{label:'Hjelp og kontakt',local:'help'}};
    if(participant&&(canContext('view_case_status',pid,pilotId)||canContext('view_participant_core',pid,pilotId)))return{...common,title:'Ansvarlig',hint:assignee?'Se ansvar, eiere og videre oppfølging for saken.':'Ingen ansvarlig er navngitt. Gå til ansvar/eier for å lukke dette hullet.',state:'open',primary:{label:'Åpne ansvar / eiere',href:ownerHref}};
    return lockedContext('Ansvarlig','Ansvarsdetaljer følger rolle og saksomfang.',participant,pilotId);
  }
  if(kind==='pilot'){
    if(!pilot){
      if(canContext('manage_program',pid,pilotId)||canContext('manage_tasks',pid,pilotId))return{...common,title:'Gruppe / pilot',hint:'Deltakeren er ikke knyttet til gruppe/pilot. Dette bør avklares før SER-logistikk låses.',state:'open',primary:ownerHref?{label:'Åpne ansvar / eiere',href:ownerHref}:null};
      return{...common,title:'Gruppe / pilot',hint:own?'Du er ikke knyttet til en SER-gruppe ennå. Ansvarlig følger opp dette når reisen er klar for neste steg.':'Ingen gruppe/pilot er knyttet til oppgaven.',state:'info',primary:own?{label:'Hjelp og kontakt',local:'help'}:null};
    }
    if(canContext('view_ser',pid,pilot.id)||canContext('view_operational_min',pid,pilot.id)||canContext('manage_program',pid,pilot.id))return{...common,title:'Gruppe / pilot',hint:'Åpner riktig operative arbeidsflate for gruppe, rute og gjennomføring.',state:'open',primary:{label:'Åpne gruppe / pilot',href:pilotHref}};
    if(own)return{...common,title:'Gruppe / pilot',hint:'Dette er gruppen reisen din er knyttet til. Operative endringer håndteres av ansvarlig team.',state:'info',primary:{label:'Hjelp og kontakt',local:'help'}};
    return lockedContext('Gruppe / pilot','Du har ikke operativ SER-tilgang for denne gruppen.',participant,pilot.id);
  }
  if(kind==='route'){
    if(!pilot?.route_name){
      if(canContext('manage_program',pid,pilotId)||canContext('edit_logistics',pid,pilotId)||canContext('view_ser',pid,pilotId))return{...common,title:'Rute',hint:'Rute er ikke angitt. Åpne den operative arbeidsflaten og avklar rute før etapper brukes.',state:'open',primary:pilotHref?{label:'Åpne rute / pilot',href:pilotHref}:ownerHref?{label:'Åpne ansvar / eiere',href:ownerHref}:null};
      return{...common,title:'Rute',hint:own?'Ruten er ikke publisert for reisen din ennå.':'Rute er ikke angitt.',state:'info'};
    }
    if(canContext('view_ser',pid,pilot.id)||canContext('view_operational_min',pid,pilot.id)||canContext('edit_logistics',pid,pilot.id))return{...common,title:'Rute',hint:'Se rute, etapper og operative detaljer i SER-arbeidsflaten.',state:'open',primary:{label:'Åpne rute',href:contextPilotHref(pilot,'&focus=route')}};
    if(own)return{...common,title:'Rute',hint:'Dette er ruten som gjelder for reisen din. Endringer og operative detaljer publiseres av teamet.',state:'info'};
    return lockedContext('Rute','Rutedetaljer krever operativt innsyn for denne gruppen.',participant,pilot.id);
  }
  if(kind==='stage'){
    if(!route){
      if(pilotHref&&(canContext('view_ser',pid,pilotId)||canContext('view_operational_min',pid,pilotId)))return{...common,title:'Dagens etappe',hint:'Ingen etappe er angitt for i dag. Åpne SER-arbeidsflaten for rute-/dagsstatus.',state:'open',primary:{label:'Åpne dagens rute',href:contextPilotHref(pilot,'&focus=today')}};
      return{...common,title:'Dagens etappe',hint:own?'Dagens etappe er ikke publisert ennå.':'Ingen etappe er angitt.',state:'info'};
    }
    if(canContext('view_ser',pid,pilotId)||canContext('view_operational_min',pid,pilotId))return{...common,title:'Dagens etappe',hint:`Dag ${route.day_number}: ${route.from_place} → ${route.to_place}${route.distance_km?` · ${route.distance_km} km`:''}. Åpne for operativ status og tilpasninger.`,state:'open',primary:{label:'Åpne etappen',href:contextPilotHref(pilot,'&focus=today')}};
    if(own)return{...common,title:'Dagens etappe',hint:`Dag ${route.day_number}: ${route.from_place} → ${route.to_place}${route.distance_km?` · ${route.distance_km} km`:''}. Tilpasning, pause eller transport er legitime tiltak når det trengs.`,state:'info',primary:{label:'Hjelp og kontakt',local:'help'}};
    return lockedContext('Dagens etappe','Etappedetaljer krever relevant operativ tilgang.',participant,pilotId);
  }
  if(kind==='deadline'){
    const canManage=canContext('manage_tasks',pid,pilotId)||canContext('manage_ser_tasks',pid,pilotId);
    return{...common,title:'Distanse / frist',hint:canManage?'Fristen hører til oppgaven. Endring skal skje gjennom den autoriserte arbeidsflyten, ikke ved direkte feltredigering.':own?'Dette er gjeldende distanse og/eller frist for oppgaven. Trenger du avklaring, kontakt ansvarlig.':'Dette feltet er informativt med din nåværende tilgang.',state:canManage?'open':'info',primary:canManage&&ownerHref?{label:'Se ansvar / eiere',href:ownerHref}:own?{label:'Hjelp og kontakt',local:'help'}:null};
  }
  return common;
}

function lockedContext(title,hint,participant,pilotId){
  const pid=participant?.id||null;
  const canSeeOwner=!!participant&&(canContext('view_case_status',pid,pilotId)||canContext('view_participant_core',pid,pilotId));
  return{kind:'locked',title,hint,state:'locked',primary:canSeeOwner?{label:'Se ansvar / eiere',href:contextOwnerHref(participant)}:ownsContextParticipant(participant)?{label:'Hjelp og kontakt',local:'help'}:null,secondary:null};
}

function runContextAction(action,participant,dialog){
  if(!action)return;
  if(action.href){location.href=action.href;return}
  dialog?.close();
  if(action.local==='participant')openLocalParticipant(participant);
  if(action.local==='help')openHelp();
}
function presentContextAction(cell,descriptor,participant){
  const dialog=ensureContextDialog();
  dialog.querySelector('#contextActionEyebrow').textContent=descriptor.state==='locked'?'Tilgang og neste steg':descriptor.state==='open'?'Detalj og neste handling':'Detalj';
  dialog.querySelector('#contextActionTitle').textContent=descriptor.title||cell.querySelector('span')?.textContent||'Detalj';
  dialog.querySelector('#contextActionValue').textContent=cell.querySelector('b')?.textContent||'Ikke angitt';
  dialog.querySelector('#contextActionHint').textContent=descriptor.hint||'';
  dialog.querySelector('#contextActionMeta').textContent=descriptor.state==='locked'?'Portalen viser ikke mer informasjon enn rollen din tillater.':'Trykk videre bare når det er relevant; formelle beslutninger går via riktig skjema/gate.';
  const primary=dialog.querySelector('#contextActionPrimary'),secondary=dialog.querySelector('#contextActionSecondary');
  [primary,secondary].forEach(button=>{button.classList.add('hidden');button.onclick=null});
  if(descriptor.primary){primary.textContent=descriptor.primary.label;primary.classList.remove('hidden');primary.onclick=()=>runContextAction(descriptor.primary,participant,dialog)}
  if(descriptor.secondary){secondary.textContent=descriptor.secondary.label;secondary.classList.remove('hidden');secondary.onclick=()=>runContextAction(descriptor.secondary,participant,dialog)}
  if(!dialog.open)dialog.showModal();
}

function makeContextCellInteractive(cell,kind,ctx){
  if(!cell)return;const descriptor=resolveContextAction(kind,ctx);
  cell.classList.add('context-cell-action');cell.dataset.contextKind=kind;cell.dataset.contextState=descriptor.state||'info';cell.tabIndex=0;cell.setAttribute('role','button');
  const label=cell.querySelector('span')?.textContent||descriptor.title||'Detalj',value=cell.querySelector('b')?.textContent||'Ikke angitt';
  cell.setAttribute('aria-label',`${label}: ${value}. Åpne detaljer og neste handling.`);
  const open=()=>presentContextAction(cell,descriptor,ctx.participant);cell.addEventListener('click',open);cell.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}});
}

function hardenGateLink(ctx){
  const link=document.querySelector('#taskDialogBody .gate-link');if(!link||!ctx.participant)return;
  const p=ctx.participant,pid=p.id,pilotId=ctx.pilot?.id||ctx.task?.pilot_id||null,stage=p.stage;
  let allowed=true,message='';
  if(['VIA','READY_FOR_GO','INTEREST'].includes(stage)){allowed=canContext('decide_go',pid,pilotId);message='Individuell GO / NO-GO krever navngitt VÍA-/fagmandat.'}
  else if(['GO','GO_WITH_CONDITIONS'].includes(stage)){allowed=canContext('manage_program',pid,pilotId)||hasRole('program_lead');message='Pilot-GO håndteres av navngitt program-/prosjektansvar.'}
  else if(stage==='SER'){allowed=canContext('view_ser',pid,pilotId);message='SER-arbeidsflaten krever operativ SER-tilgang.'}
  else if(stage==='VIDA'){allowed=ownsContextParticipant(p)||canContext('view_vida',pid,pilotId);message='VIDA-planen følger deltakerens eget innsyn eller navngitt VIDA-mandat.'}
  if(allowed)return;
  const note=document.createElement('span');note.className='gate-link gate-link-locked';note.textContent='Neste gate · tilgang styres av rolle';note.title=message;link.replaceWith(note);
  const hint=document.querySelector('#taskDialogBody .gate-hint');if(hint)hint.textContent=message;
}

function enhanceContextCells(taskId){
  const body=document.querySelector('#taskDialogBody'),grid=body?.querySelector('.task-context-grid');if(!grid)return;
  const task=tasks.find(item=>item.id===taskId);if(!task)return;
  const participant=participantById(task.participant_id),pilot=pilotById(task.pilot_id)||participantPilot?.(participant?.id),route=routeToday(task.pilot_id||pilot?.id),assignee=staffProfiles.find(item=>item.user_id===task.assignee_user_id);
  const ctx={task,participant,pilot,route,assignee};
  const kinds=['participant','assignee','pilot','route','stage','deadline'];
  [...grid.querySelectorAll('.context-cell')].forEach((cell,index)=>makeContextCellInteractive(cell,kinds[index]||'info',ctx));
  hardenGateLink(ctx);
  body.querySelector('.task-crosslinks')?.classList.add('context-crosslinks-secondary');
}

function installContextResolver(){
  const original=openTask;openTask=function(id){original(id);enhanceContextCells(id)};
}

installContextStyles();ensureContextDialog();installContextResolver();
})();
