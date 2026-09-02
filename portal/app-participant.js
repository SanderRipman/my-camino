(()=>{
'use strict';

function participantPhaseLabel(stage){
  if(stage==='GO')return'VÍA · avklart';
  if(stage==='GO_WITH_CONDITIONS')return'VÍA · vilkår';
  if(stage==='POSTPONED')return'VÍA · utsatt';
  if(stage==='NO_GO')return'VÍA · annen vei nå';
  return stageLabel(stage);
}
function participantStageCopy(stage){
  if(stage==='GO')return'VÍA er avklart. Neste steg er deltakeravtale, beredskap og samlet SER-gate. GO er ikke det samme som oppstart.';
  if(stage==='GO_WITH_CONDITIONS')return'VÍA er avklart med vilkår. Vilkårene og neste rammer må lukkes før en eventuell SER-start.';
  if(stage==='POSTPONED')return'VÍA er utsatt. Det er ikke et avslag; ansvarlig følger opp hva som må avklares og når en ny vurdering er riktig.';
  if(stage==='NO_GO')return'SER er ikke riktig neste steg nå. Du skal få en tydelig og trygg viderevei; dette er ikke en permanent dom over hva som kan være mulig senere.';
  const s=stageLabel(stage);
  if(s==='SER')return'Under · erfaring, rytme og trygg tilpasning';
  if(s==='VIDA')return'Etter · erfaring omsettes til handling hjemme';
  if(s==='ny VÍA')return'Neste retning · ny avklaring når du er klar';
  return'Før · retning, avklaring og forberedelse';
}
function participantOpenTasks(p){return tasks.filter(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status))}
function participantTaskAttention(t){
  const overdue=!!t?.due_at&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&new Date(t.due_at)<new Date();
  if(overdue||severity(t)==='RED')return'RED';
  if(t.status==='WAITING')return'BLUE';
  return'YELLOW';
}
function participantAttentionLabel(tone){return tone==='RED'?'Må nå':tone==='YELLOW'?'Neste steg':'Info / valgfritt'}
function participantTaskTone(t){return participantAttentionLabel(participantTaskAttention(t))}
function participantFormKeys(stage){
  if(stage==='GO'||stage==='GO_WITH_CONDITIONS')return new Set(['participant_agreement']);
  if(stage==='POSTPONED'||stage==='NO_GO')return new Set();
  const s=stageLabel(stage);
  if(s==='SER')return new Set();
  if(s==='VIDA')return new Set(['vida_plan']);
  if(s==='ny VÍA')return new Set(['via_roadmap']);
  return new Set(['info_before_via','via_roadmap']);
}
function participantTaskCoveredForms(p){
  const map={participant_via_start:'via_roadmap',participant_agreement_ack:'participant_agreement'};
  return new Set(participantOpenTasks(p).map(t=>map[t.workflow_key]).filter(Boolean));
}
function participantReadyForms(p){
  if(!p||assurance?.currentLevel!=='aal2')return[];
  const allowed=participantFormKeys(p.stage),covered=participantTaskCoveredForms(p);
  return formDefs.filter(f=>(f.scope==='participant'||f.scope==='participant_staff')&&allowed.has(f.key)&&!covered.has(f.key));
}
function participantSecurityAction(){
  if(assurance?.currentLevel==='aal2')return null;
  return {kind:'security',tone:'RED',title:'Bekreft sikker innlogging',detail:assurance?.nextLevel==='aal2'?'Bekreft Authenticator før personlige skjema og andre beskyttede steg åpnes.':'Sett opp Authenticator før personlige skjema og andre beskyttede steg åpnes.',label:'Må gjøres først'};
}
function participantFormTone(f){return f?.key==='info_before_via'?'BLUE':'YELLOW'}
function participantDerivedActions(p){const security=participantSecurityAction();return security?[security]:participantReadyForms(p).map(f=>({kind:'form',tone:participantFormTone(f),...f}))}
function participantDerivedActionMarkup(a,p){
  const tone=a.tone||'YELLOW';
  if(a.kind==='security')return `<button class="task-row participant-derived-action" type="button" data-participant-action-view="security" data-participant-attention="${tone}"><i class="task-dot ${tone}"></i><div><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.detail)}</small></div><div class="task-meta"><span class="pill ${tone}">${escapeHtml(a.label)}</span></div></button>`;
  const href=`./form-runner.html?key=${encodeURIComponent(a.key)}&participant=${encodeURIComponent(p.id)}`;
  const detail=tone==='BLUE'?'Tilgjengelig som støtte i VÍA. Ikke nødvendig for å åpne neste obligatoriske steg.':'Skjemaet er klart i fasen din og kan åpnes direkte herfra.';
  return `<a class="task-row participant-derived-action" href="${href}" style="text-decoration:none;color:inherit" data-participant-attention="${tone}" data-form-key="${escapeHtml(a.key)}"><i class="task-dot ${tone}"></i><div><b>${escapeHtml(a.title_no)}</b><small>${escapeHtml(detail)}</small></div><div class="task-meta"><span class="pill ${tone}">${participantAttentionLabel(tone)}</span></div></a>`;
}
function bindParticipantDerivedActions(root=document){root.querySelectorAll('[data-participant-action-view="security"]').forEach(b=>b.addEventListener('click',()=>show('security')))}
function injectParticipantDerivedActions(){
  if(isStaff())return;
  const p=ownParticipant();if(!p)return;
  const actions=participantDerivedActions(p);if(!actions.length)return;
  const markup=actions.map(a=>participantDerivedActionMarkup(a,p)).join('');
  for(const selector of ['#priorityQueue','#taskList']){
    const host=document.querySelector(selector);if(!host)continue;
    const onlyEmpty=host.children.length===1&&host.firstElementChild?.tagName==='P';if(onlyEmpty)host.innerHTML='';
    host.insertAdjacentHTML('afterbegin',markup);
  }
  bindParticipantDerivedActions();
  const queueCard=$('#priorityQueue')?.closest('.panel-card');if(queueCard){queueCard.querySelector('.eyebrow').textContent='Neste';queueCard.querySelector('h3').textContent='Dine neste steg'}
}
function participantAttentionSnapshot(){
  if(isStaff())return null;
  const p=ownParticipant();if(!p)return{red:[],yellow:[],blue:[],tasks:[],forms:[],security:null,total:0};
  const security=participantSecurityAction();
  const open=participantOpenTasks(p).map(t=>({kind:'task',tone:participantTaskAttention(t),title:t.title,due_at:t.due_at,status:t.status,id:t.id,workflow_key:t.workflow_key||null}));
  const forms=security?[]:participantReadyForms(p).map(f=>({kind:'form',tone:participantFormTone(f),title:f.title_no,key:f.key}));
  const items=[...(security?[security]:[]),...open,...forms];
  const red=items.filter(x=>x.tone==='RED'),yellow=items.filter(x=>x.tone==='YELLOW'),blue=items.filter(x=>x.tone==='BLUE');
  return{red,yellow,blue,tasks:open,forms,security,total:items.length};
}
window.aidmeParticipantAttentionSnapshot=participantAttentionSnapshot;

const staffRenderTaskLists=renderTaskLists;
renderTaskLists=function(){staffRenderTaskLists();if(!isStaff())injectParticipantDerivedActions()};

const staffTaskRow=taskRow;
taskRow=function(t){
  if(isStaff())return staffTaskRow(t);
  const p=participantById(t.participant_id),pilot=pilotById(t.pilot_id),r=routeToday(t.pilot_id),tone=participantTaskAttention(t),overdue=!!t.due_at&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&new Date(t.due_at)<new Date();
  const context=[r?`Dag ${r.day_number}: ${r.from_place} → ${r.to_place}${r.distance_km?` · ${r.distance_km} km`:''}`:null,t.description||null].filter(Boolean).join(' · ');
  const due=overdue?`<span class="pill RED">Frist passert · ${formatDate(t.due_at)}</span>`:`<span class="pill">${formatDate(t.due_at)}</span>`;
  return `<button class="task-row" data-task-id="${t.id}" data-participant-attention="${tone}"><i class="task-dot ${tone}"></i><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(context)}</small></div><div class="task-meta"><span class="pill ${tone}">${participantTaskTone(t)}</span>${due}</div></button>`;
};

const staffRenderPulse=renderPulse;
renderPulse=function(){
  if(isStaff())return staffRenderPulse();
  const p=ownParticipant();if(!p){$('#groupPulse').innerHTML='<p>Reisen din er ikke aktivert ennå.</p>';return}
  const l=latestCheckin(p.id),open=participantOpenTasks(p),base=stageLabel(p.stage),phase=participantPhaseLabel(p.stage),extra=participantDerivedActions(p).length;
  $('#groupPulse').innerHTML=`<div class="pulse-row"><i class="dot ${base==='SER'?'ser':base==='VIDA'?'vida':'via'}"></i><div><b>${escapeHtml(phase)} · din reise</b><small>${l?.checkin_date?`Sist innsjekk ${escapeHtml(l.checkin_date)}`:'Ingen innsjekk ennå'}</small></div><small>${open.length+extra} åpne steg</small></div>`;
};

const staffRenderParticipants=renderParticipants;
renderParticipants=function(){
  if(isStaff())return staffRenderParticipants();
  const p=ownParticipant();$('#participantsNavLabel').textContent='Min reise';$('#participantsHeading').textContent='Min reise';$('#participantsIntro').textContent='Fase, neste handling og det som er relevant for deg – uten interne arbeidsmarkører.';
  selectedParticipantId=p?.id||null;
  if(!p){$('#participantList').innerHTML='<p>Ingen aktiv reise ennå.</p>';$('#participantDetail').innerHTML='<h3>Reisen din er ikke aktivert ennå</h3><p>Kontakt AidMe-kontakten din dersom du forventet tilgang.</p>';fillParticipantSelect();return}
  const base=stageLabel(p.stage),phase=participantPhaseLabel(p.stage),snap=participantAttentionSnapshot();
  $('#participantList').innerHTML=`<button class="participant-card active" data-participant-id="${p.id}"><i class="dot ${base==='SER'?'ser':base==='VIDA'?'vida':'via'}"></i><div><b>${escapeHtml(p.code_name)}</b><small>${escapeHtml(phase)} · ${snap.total} åpne steg</small></div><span class="pill">${escapeHtml(phase)}</span></button>`;
  renderParticipantDetail();fillParticipantSelect();
};

const staffRenderParticipantDetail=renderParticipantDetail;
renderParticipantDetail=function(){
  if(isStaff())return staffRenderParticipantDetail();
  const p=ownParticipant();if(!p){$('#participantDetail').innerHTML='<h3>Ingen aktiv reise ennå</h3>';return}
  const base=stageLabel(p.stage),phase=participantPhaseLabel(p.stage),pilot=participantPilot(p.id),r=routeToday(pilot?.id),open=participantOpenTasks(p),actions=participantDerivedActions(p),ordered=[...open].sort((a,b)=>new Date(a.due_at||'2999')-new Date(b.due_at||'2999')),next=ordered[0],idx=stageIndex(p.stage),actionMarkup=actions.map(a=>participantDerivedActionMarkup(a,p)).join('');
  $('#participantDetail').innerHTML=`<div class="card-head"><div><p class="eyebrow">${escapeHtml(phase)} · din reise</p><h2>${escapeHtml(p.code_name)}</h2></div><span class="pill">${escapeHtml(phase)}</span></div><p>${escapeHtml(participantStageCopy(p.stage))}</p><div class="detail-grid"><div class="detail-stat"><span>Fase</span><strong>${escapeHtml(phase)}</strong></div><div class="detail-stat"><span>Neste frist</span><strong>${escapeHtml(next?formatDate(next.due_at):'Ingen frist')}</strong></div><div class="detail-stat"><span>Åpne steg</span><strong>${open.length+actions.length}</strong></div><div class="detail-stat"><span>${base==='SER'?'Dagens etappe':'Gruppe / rute'}</span><strong>${escapeHtml(base==='SER'&&r?`${r.from_place} → ${r.to_place}`:(pilot?.route_name||'Avklares senere'))}</strong></div></div><h3>Din neste handling</h3><div class="task-list">${actionMarkup}${ordered.length?ordered.slice(0,4).map(taskRow).join(''):actions.length?'':'<p>Du har ingen åpne steg akkurat nå.</p>'}</div><h3>Hvor du er i reisen</h3><div class="process-flow">${processMarkup(idx)}</div>`;
  $$('#participantDetail .task-row[data-task-id]').forEach(b=>b.addEventListener('click',()=>openTask(b.dataset.taskId)));bindParticipantDerivedActions($('#participantDetail'));
};

const staffRenderForms=renderForms;
renderForms=function(){
  if(isStaff())return staffRenderForms();
  const p=ownParticipant(),keys=participantFormKeys(p?.stage),participant=p?.id||'';
  const defs=formDefs.filter(f=>(f.scope==='participant'||f.scope==='participant_staff')&&keys.has(f.key));
  $('#formLibrary').innerHTML=defs.length?defs.map((f,i)=>`<a class="form-module" style="text-decoration:none;color:inherit" href="./form-runner.html?key=${encodeURIComponent(f.key)}${participant?'&participant='+encodeURIComponent(participant):''}"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(f.title_no)}</h3><p>${escapeHtml(f.key==='info_before_via'?'Kort informasjon før du går videre.':f.key==='via_roadmap'?'Ditt veikart og neste avklaringer i VÍA.':f.key==='participant_agreement'?'Din egen bekreftelse av avtale, kontaktvalg og praktiske rammer før neste gate.':'Din levende VIDA-plan og neste handling hjemme.')}</p><div class="meta"><span>${escapeHtml(participantPhaseLabel(p?.stage||'VIA'))}</span><span>Åpne →</span></div></a>`).join(''):'<p>Ingen versjonerte skjemaer krever noe fra deg i denne fasen.</p>';
};

const staffRenderAnalysis=renderAnalysis;
renderAnalysis=function(){
  if(isStaff())return staffRenderAnalysis();
  const avg=$('#showAverage');if(avg)avg.checked=false;
  staffRenderAnalysis();
  $('#analysisParticipants')?.classList.add('hidden');avg?.closest('label')?.classList.add('hidden');
};

function adaptParticipantChrome(){
  if(isStaff())return;
  const p=ownParticipant(),snap=participantAttentionSnapshot(),phase=participantPhaseLabel(p?.stage||'VIA'),base=stageLabel(p?.stage||'VIA');
  const cards=$$('#view-overview .metric-grid .metric');
  const setCard=(i,label,value,hint)=>{const c=cards[i];if(!c)return;c.querySelector('span').textContent=label;c.querySelector('strong').textContent=value;c.querySelector('small').textContent=hint};
  setCard(0,'Mine åpne steg',snap.total,'det du kan gjøre eller må avklare');setCard(1,'Må nå',snap.red.length,'blokkerer / forfalt');setCard(2,'Neste steg',snap.yellow.length,'krever handling');setCard(3,'Info / valgfritt',snap.blue.length,'nyttig, men ikke fremdriftskrav');
  const pulse=$('#groupPulse')?.closest('.panel-card');if(pulse){pulse.querySelector('.eyebrow').textContent='Din rytme';pulse.querySelector('h3').textContent='Siste status'}
  const chart=$('#overviewChart')?.closest('.panel-card');if(chart){chart.querySelector('.eyebrow').textContent='Din utvikling';chart.querySelector('h3').textContent='Siste 30 dager';const b=chart.querySelector('[data-go="analysis"]');if(b)b.textContent='Se min utvikling'}
  const analysis=$('#view-analysis .section-head');if(analysis){analysis.querySelector('.eyebrow').textContent='Dine målinger';analysis.querySelector('h2').textContent='Din utvikling over tid';analysis.querySelector('p').textContent='Se dine egne målinger som støtte for refleksjon og samtale. En skår er ikke en diagnose eller en automatisk beslutning.'}
  $('#analysisParticipants')?.classList.add('hidden');$('#showAverage')?.closest('label')?.classList.add('hidden');
  const formsHead=$('#view-forms .section-head');if(formsHead){formsHead.querySelector('.eyebrow').textContent='Din reise';formsHead.querySelector('h2').textContent='Dine steg og skjemaer';formsHead.querySelector('p').textContent=base==='SER'?'Under SER bruker du den korte Innsjekk-flaten. Den daglige operative SER-loggen tilhører teamet.':'Bare det som er relevant i fasen din vises her.'}
  $('#view-forms .reference-card')?.classList.add('hidden');
  const checkNav=$('.nav-item[data-view="checkin"]');if(checkNav)checkNav.classList.toggle('hidden',base!=='SER');
  const checkStatus=$('#dayStatus')?.closest('label');checkStatus?.classList.add('hidden');
  const checkHead=$('#view-checkin .section-head');if(checkHead){checkHead.querySelector('.eyebrow').textContent='SER · din korte innsjekk';checkHead.querySelector('h2').textContent='Hvordan er dagen din?';checkHead.querySelector('p').textContent='Kort egen innsjekk for støtte og tilpasning. Dette er ikke teamets operative SER-logg, og ingen enkelt skår avgjør sikkerhet eller videre deltakelse.'}
  const documentsHead=$('#view-documents .section-head');if(documentsHead){documentsHead.querySelector('p').textContent='Dokumenter som gjelder reisen din samles her når de er klare.';documentsHead.querySelector('button')?.classList.add('hidden')}
  const docNote=$('#view-documents .privacy-note');if(docNote)docNote.textContent='Du ser bare dokumenter kontoen din har tilgang til.';
  const red=$('#mobileAttentionBar [data-attention="RED"]'),yellow=$('#mobileAttentionBar [data-attention="YELLOW"]'),neutral=$('#mobileAttentionBar [data-attention="ALL"]');if(red)red.innerHTML=`<b>${snap.red.length}</b> må nå`;if(yellow)yellow.innerHTML=`<b>${snap.yellow.length}</b> neste steg`;if(neutral)neutral.innerHTML=`<b>${snap.blue.length}</b> info / valgfritt`;
}

const participantOpenTask=openTask;
openTask=function(id){
  participantOpenTask(id);if(isStaff())return;const t=tasks.find(x=>x.id===id);if(!t)return;$('#taskDialogEyebrow').textContent=`${participantTaskTone(t)} · ${statusText(t.status)}`;
};

const participantRenderAll=renderAll;
renderAll=function(){participantRenderAll();if(!isStaff())adaptParticipantChrome()};

})();
