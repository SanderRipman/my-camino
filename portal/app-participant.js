(()=>{
'use strict';

function participantStageCopy(stage){
  const s=stageLabel(stage);
  if(s==='SER')return'Under · erfaring, rytme og trygg tilpasning';
  if(s==='VIDA')return'Etter · erfaring omsettes til handling hjemme';
  if(s==='ny VÍA')return'Neste retning · ny avklaring når du er klar';
  return'Før · retning, avklaring og forberedelse';
}
function participantOpenTasks(p){return tasks.filter(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status))}
function participantTaskTone(t){const s=severity(t);return s==='RED'?'Viktig':s==='YELLOW'?'Avklares':'Neste steg'}
function participantFormKeys(stage){
  const s=stageLabel(stage);
  if(s==='SER')return new Set(['ser_daily','participant_agreement']);
  if(s==='VIDA')return new Set(['vida_plan']);
  if(s==='ny VÍA')return new Set(['via_roadmap']);
  return new Set(['info_before_via','via_roadmap','participant_agreement']);
}

const staffTaskRow=taskRow;
taskRow=function(t){
  if(isStaff())return staffTaskRow(t);
  const p=participantById(t.participant_id),pilot=pilotById(t.pilot_id),r=routeToday(t.pilot_id),sev=severity(t),overdue=!!t.due_at&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&new Date(t.due_at)<new Date();
  const context=[r?`Dag ${r.day_number}: ${r.from_place} → ${r.to_place}${r.distance_km?` · ${r.distance_km} km`:''}`:null,t.description||null].filter(Boolean).join(' · ');
  const due=overdue?`<span class="pill RED">Frist passert · ${formatDate(t.due_at)}</span>`:`<span class="pill">${formatDate(t.due_at)}</span>`;
  return `<button class="task-row" data-task-id="${t.id}"><i class="task-dot ${sev}"></i><div><b>${escapeHtml(t.title)}</b><small>${escapeHtml(context)}</small></div><div class="task-meta"><span class="pill ${sev}">${participantTaskTone(t)}</span>${due}</div></button>`;
};

const staffRenderPulse=renderPulse;
renderPulse=function(){
  if(isStaff())return staffRenderPulse();
  const p=ownParticipant();if(!p){$('#groupPulse').innerHTML='<p>Reisen din er ikke aktivert ennå.</p>';return}
  const l=latestCheckin(p.id),open=participantOpenTasks(p),phase=stageLabel(p.stage);
  $('#groupPulse').innerHTML=`<div class="pulse-row"><i class="dot ${phase==='SER'?'ser':phase==='VIDA'?'vida':'via'}"></i><div><b>${escapeHtml(phase)} · din reise</b><small>${l?.checkin_date?`Sist innsjekk ${escapeHtml(l.checkin_date)}`:'Ingen innsjekk ennå'}</small></div><small>${open.length} åpne steg</small></div>`;
};

const staffRenderParticipants=renderParticipants;
renderParticipants=function(){
  if(isStaff())return staffRenderParticipants();
  const p=ownParticipant();$('#participantsNavLabel').textContent='Min reise';$('#participantsHeading').textContent='Min reise';$('#participantsIntro').textContent='Fase, neste handling og det som er relevant for deg – uten interne arbeidsmarkører.';
  selectedParticipantId=p?.id||null;
  if(!p){$('#participantList').innerHTML='<p>Ingen aktiv reise ennå.</p>';$('#participantDetail').innerHTML='<h3>Reisen din er ikke aktivert ennå</h3><p>Kontakt AidMe-kontakten din dersom du forventet tilgang.</p>';fillParticipantSelect();return}
  const phase=stageLabel(p.stage),open=participantOpenTasks(p);
  $('#participantList').innerHTML=`<button class="participant-card active" data-participant-id="${p.id}"><i class="dot ${phase==='SER'?'ser':phase==='VIDA'?'vida':'via'}"></i><div><b>${escapeHtml(p.code_name)}</b><small>${escapeHtml(phase)} · ${open.length} åpne steg</small></div><span class="pill">${escapeHtml(phase)}</span></button>`;
  renderParticipantDetail();fillParticipantSelect();
};

const staffRenderParticipantDetail=renderParticipantDetail;
renderParticipantDetail=function(){
  if(isStaff())return staffRenderParticipantDetail();
  const p=ownParticipant();if(!p){$('#participantDetail').innerHTML='<h3>Ingen aktiv reise ennå</h3>';return}
  const phase=stageLabel(p.stage),pilot=participantPilot(p.id),r=routeToday(pilot?.id),open=participantOpenTasks(p),ordered=[...open].sort((a,b)=>new Date(a.due_at||'2999')-new Date(b.due_at||'2999')),next=ordered[0],idx=stageIndex(p.stage);
  $('#participantDetail').innerHTML=`<div class="card-head"><div><p class="eyebrow">${escapeHtml(phase)} · din reise</p><h2>${escapeHtml(p.code_name)}</h2></div><span class="pill">${escapeHtml(phase)}</span></div><p>${escapeHtml(participantStageCopy(p.stage))}</p><div class="detail-grid"><div class="detail-stat"><span>Fase</span><strong>${escapeHtml(phase)}</strong></div><div class="detail-stat"><span>Neste frist</span><strong>${escapeHtml(next?formatDate(next.due_at):'Ingen frist')}</strong></div><div class="detail-stat"><span>Åpne steg</span><strong>${open.length}</strong></div><div class="detail-stat"><span>${phase==='SER'?'Dagens etappe':'Gruppe / rute'}</span><strong>${escapeHtml(phase==='SER'&&r?`${r.from_place} → ${r.to_place}`:(pilot?.route_name||'Avklares senere'))}</strong></div></div><h3>Din neste handling</h3><div class="task-list">${ordered.length?ordered.slice(0,4).map(taskRow).join(''):'<p>Du har ingen åpne steg akkurat nå.</p>'}</div><h3>Hvor du er i reisen</h3><div class="process-flow">${processMarkup(idx)}</div>`;
  $$('#participantDetail .task-row').forEach(b=>b.addEventListener('click',()=>openTask(b.dataset.taskId)));
};

const staffRenderForms=renderForms;
renderForms=function(){
  if(isStaff())return staffRenderForms();
  const p=ownParticipant(),keys=participantFormKeys(p?.stage),participant=p?.id||'';
  const defs=formDefs.filter(f=>(f.scope==='participant'||f.scope==='participant_staff')&&keys.has(f.key));
  $('#formLibrary').innerHTML=defs.length?defs.map((f,i)=>`<a class="form-module" style="text-decoration:none;color:inherit" href="./form-runner.html?key=${encodeURIComponent(f.key)}${participant?'&participant='+encodeURIComponent(participant):''}"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(f.title_no)}</h3><p>${escapeHtml(f.key==='info_before_via'?'Kort informasjon før du går videre.':f.key==='via_roadmap'?'Ditt veikart og neste avklaringer i VÍA.':f.key==='participant_agreement'?'Avtaler og kontaktvalg som gjelder reisen din.':f.key==='ser_daily'?'Din korte daglige SER-oppfølging.':'Din levende VIDA-plan og neste handling hjemme.')}</p><div class="meta"><span>${escapeHtml(stageLabel(p?.stage||'VIA'))}</span><span>Åpne →</span></div></a>`).join(''):'<p>Ingen skjemaer krever noe fra deg i denne fasen.</p>';
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
  const p=ownParticipant(),open=participantOpenTasks(p),overdue=t=>!!t.due_at&&new Date(t.due_at)<new Date(),important=open.filter(t=>severity(t)==='RED'||overdue(t)).length,clarify=open.filter(t=>severity(t)==='YELLOW'&&!overdue(t)).length,phase=stageLabel(p?.stage||'VIA');
  const cards=$$('#view-overview .metric-grid .metric');
  const setCard=(i,label,value,hint)=>{const c=cards[i];if(!c)return;c.querySelector('span').textContent=label;c.querySelector('strong').textContent=value;c.querySelector('small').textContent=hint};
  setCard(0,'Mine åpne steg',open.length,'det du kan gjøre nå');setCard(1,'Viktig nå',important,'prioritert for deg');setCard(2,'Trenger avklaring',clarify,'kan vente på svar');setCard(3,'Min fase',phase,participantStageCopy(p?.stage));
  const pulse=$('#groupPulse')?.closest('.panel-card');if(pulse){pulse.querySelector('.eyebrow').textContent='Din rytme';pulse.querySelector('h3').textContent='Siste status'}
  const chart=$('#overviewChart')?.closest('.panel-card');if(chart){chart.querySelector('.eyebrow').textContent='Din utvikling';chart.querySelector('h3').textContent='Siste 30 dager';const b=chart.querySelector('[data-go="analysis"]');if(b)b.textContent='Se min utvikling'}
  const analysis=$('#view-analysis .section-head');if(analysis){analysis.querySelector('.eyebrow').textContent='Dine målinger';analysis.querySelector('h2').textContent='Din utvikling over tid';analysis.querySelector('p').textContent='Se dine egne målinger som støtte for refleksjon og samtale. En skår er ikke en diagnose eller en automatisk beslutning.'}
  $('#analysisParticipants')?.classList.add('hidden');$('#showAverage')?.closest('label')?.classList.add('hidden');
  const formsHead=$('#view-forms .section-head');if(formsHead){formsHead.querySelector('.eyebrow').textContent='Din reise';formsHead.querySelector('h2').textContent='Dine steg og skjemaer';formsHead.querySelector('p').textContent='Bare det som er relevant i fasen din vises her.'}
  $('#view-forms .reference-card')?.classList.add('hidden');
  const checkStatus=$('#dayStatus')?.closest('label');checkStatus?.classList.add('hidden');
  const documentsHead=$('#view-documents .section-head');if(documentsHead){documentsHead.querySelector('p').textContent='Dokumenter som gjelder reisen din samles her når de er klare.';documentsHead.querySelector('button')?.classList.add('hidden')}
  const docNote=$('#view-documents .privacy-note');if(docNote)docNote.textContent='Du ser bare dokumenter kontoen din har tilgang til.';
  const red=$('#mobileAttentionBar [data-attention="RED"]'),yellow=$('#mobileAttentionBar [data-attention="YELLOW"]');if(red)red.innerHTML=`<b>${important}</b> viktig/forfalt`;if(yellow)yellow.innerHTML=`<b>${clarify}</b> avklaringer`;
}

const participantOpenTask=openTask;
openTask=function(id){
  participantOpenTask(id);if(isStaff())return;const t=tasks.find(x=>x.id===id);if(!t)return;$('#taskDialogEyebrow').textContent=`${participantTaskTone(t)} · ${statusText(t.status)}`;
};

const participantRenderAll=renderAll;
renderAll=function(){participantRenderAll();if(!isStaff())adaptParticipantChrome()};

})();
