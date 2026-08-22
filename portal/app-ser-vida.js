(()=>{
'use strict';

const VIDA_MILESTONE_LABELS={vida_72h:'72 timer',participant_vida_72h:'72 timer',vida_14d:'14 dager',vida_30d:'30 dager',vida_90d:'90 dager'};
function serVidaParticipant(){
  return isStaff()?participantById(selectedParticipantId):ownParticipant();
}
function serVidaPhase(p){return p?stageLabel(p.stage):null}
function serVidaOpenTasks(p){return (tasks||[]).filter(t=>t.participant_id===p?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status))}
function serVidaMilestones(p){
  const rows=(tasks||[]).filter(t=>t.participant_id===p?.id&&VIDA_MILESTONE_LABELS[t.workflow_key]);
  const byKey=new Map();
  rows.sort((a,b)=>new Date(a.due_at||'2999')-new Date(b.due_at||'2999')).forEach(t=>{if(!byKey.has(t.workflow_key))byKey.set(t.workflow_key,t)});
  return [...byKey.values()];
}
function serVidaTodayModel(p){
  if(!p)return null;
  const phase=serVidaPhase(p),pilot=participantPilot(p.id),route=pilot?routeToday(pilot.id):null,checkin=latestCheckin(p.id),open=serVidaOpenTasks(p);
  if(phase==='SER'){
    const dayZero=!checkin;
    return{
      phase,
      kicker:dayZero?'SER · første dag':'SER · i dag',
      title:dayZero?'Start rolig – få rammene på plass':'Dagens rytme',
      body:dayZero
        ?'Første SER-dag handler om orientering, kontaktvei og en gjennomførbar start. Pause, kortere etappe, transport eller annen tilpasning er legitime valg.'
        :'Bruk den korte innsjekken til å fange det som faktisk betyr noe i dag. En gul eller rød status er et signal om støtte og tilpasning – ikke prestasjon.',
      route,
      checkin,
      open,
      milestones:[],
      primary:`./form-runner.html?key=ser_daily&participant=${encodeURIComponent(p.id)}`,
      primaryLabel:dayZero?'Gjør første SER-innsjekk':'Åpne dagens innsjekk'
    };
  }
  if(phase==='VIDA')return{
    phase,
    kicker:'VIDA · hjemme',
    title:'Én levende plan – neste konkrete handling',
    body:'VIDA-planen skal være stedet du og avtalt oppfølgingskontakt holder neste handling, ansvar og oppfølging levende. 72 timer, 14, 30 og 90 dager er oppfølgingstidspunkter for den samme planen – ikke fire nye planer.',
    route:null,checkin,open,milestones:serVidaMilestones(p),
    primary:`./form-runner.html?key=vida_plan&participant=${encodeURIComponent(p.id)}`,
    primaryLabel:'Åpne min levende VIDA-plan'
  };
  return null;
}
function serVidaMilestoneHtml(m){
  if(m.phase!=='VIDA'||!m.milestones?.length)return'';
  const rows=m.milestones.map(t=>`<div class="detail-stat"><span>${escapeHtml(VIDA_MILESTONE_LABELS[t.workflow_key]||'Oppfølging')}</span><strong>${escapeHtml(statusText(t.status))} · ${escapeHtml(formatDate(t.due_at))}</strong></div>`).join('');
  return `<div class="detail-grid vida-followup-rhythm">${rows}</div><p class="privacy-note">Milepælene er påminnelser om å se på samme levende VIDA-plan igjen. Neste handling kan endres uten å opprette parallelle planer.</p>`;
}
function serVidaCardHtml(m){
  const route=m.route?`<div class="detail-stat"><span>Dagens etappe</span><strong>${escapeHtml(`${m.route.from_place} → ${m.route.to_place}${m.route.distance_km?` · ${m.route.distance_km} km`:''}`)}</strong></div>`:'';
  const last=m.checkin?.checkin_date?escapeHtml(m.checkin.checkin_date):'Ingen ennå';
  return `<section class="panel-card ser-vida-today" data-ser-vida-phase="${m.phase}"><div class="card-head"><div><p class="eyebrow">${escapeHtml(m.kicker)}</p><h3>${escapeHtml(m.title)}</h3></div><span class="pill">${escapeHtml(m.phase)}</span></div><p>${escapeHtml(m.body)}</p><div class="detail-grid">${route}<div class="detail-stat"><span>Siste innsjekk</span><strong>${last}</strong></div><div class="detail-stat"><span>Åpne steg</span><strong>${m.open.length}</strong></div></div>${serVidaMilestoneHtml(m)}<div class="form-actions"><a class="primary" href="${m.primary}">${escapeHtml(m.primaryLabel)}</a></div></section>`;
}
function renderSerVidaToday(){
  const p=serVidaParticipant(),m=serVidaTodayModel(p);
  document.querySelectorAll('.ser-vida-today').forEach(el=>el.remove());
  if(!m)return;
  const target=document.querySelector('#participantDetail');
  if(!target)return;
  target.insertAdjacentHTML('beforeend',serVidaCardHtml(m));
}

const serVidaParticipantNext=typeof participantNextAction==='function'?participantNextAction:null;
if(serVidaParticipantNext){
  participantNextAction=function(participant,task){
    const base=serVidaParticipantNext(participant,task);if(!participant)return base;
    const phase=serVidaPhase(participant);
    if(phase==='SER')return{
      label:'Åpne dagens SER-steg',
      href:`./form-runner.html?key=ser_daily&participant=${encodeURIComponent(participant.id)}`,
      hint:latestCheckin(participant.id)?'Kort innsjekk for dagens rytme, støtte og tilpasning.':'Første SER-dag: orienter deg, bekreft kontaktveien og gjør en kort innsjekk. Du kan be om pause, kortere etappe, transport eller annen tilpasning.'
    };
    if(phase==='VIDA')return{
      label:'Åpne min levende VIDA-plan',
      href:`./form-runner.html?key=vida_plan&participant=${encodeURIComponent(participant.id)}`,
      hint:'Hold én plan levende. 72 timer, 14, 30 og 90 dager er oppfølging av samme neste handling, ansvar og avtalt kontakt – ikke nye parallelle planer.'
    };
    return base;
  };
}

const serVidaRenderAll=renderAll;
renderAll=function(){serVidaRenderAll();renderSerVidaToday()};
setTimeout(renderSerVidaToday,140);

})();
