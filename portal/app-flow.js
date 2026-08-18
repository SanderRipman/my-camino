(()=>{
'use strict';

const FLOW_UX_VERSION='2026-08-18a';

function addFlowStyles(){
  if(document.querySelector('link[data-aidme-flow]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=`./flow.css?v=${FLOW_UX_VERSION}`;
  link.dataset.aidmeFlow='1';
  document.head.appendChild(link);
}

function flowLevel(t){
  if(!t)return'GREEN';
  if(typeof taskAttention==='function')return taskAttention(t);
  const open=['OPEN','IN_PROGRESS','WAITING'].includes(t.status);
  const overdue=open&&t.due_at&&new Date(t.due_at)<new Date();
  return overdue||severity(t)==='RED'?'RED':severity(t)==='YELLOW'?'YELLOW':'GREEN';
}

function visibleOpenTasks(){
  const open=(tasks||[]).filter(t=>['OPEN','IN_PROGRESS','WAITING'].includes(t.status));
  if(isStaff())return open;
  const own=ownParticipant();
  return open.filter(t=>t.assignee_user_id===session?.user?.id||(own&&t.participant_id===own.id));
}

function bestVisibleTask(){
  const rank={RED:0,YELLOW:1,GREEN:2};
  return [...visibleOpenTasks()].sort((a,b)=>
    (rank[flowLevel(a)]-rank[flowLevel(b)])||
    (new Date(a.due_at||'2999-12-31')-new Date(b.due_at||'2999-12-31'))
  )[0]||null;
}

function phaseActionForParticipant(p){
  if(!p)return null;
  const phase=stageLabel(p.stage);
  if(isStaff()&&typeof logicalGateFor==='function'){
    const gate=logicalGateFor(p);
    if(gate)return{level:'GREEN',kicker:`Neste handling · ${phase}`,title:gate.label,body:gate.hint,href:gate.href,meta:[p.code_name,phase]};
  }
  if(phase==='SER')return{level:'GREEN',kicker:'Neste handling · SER',title:'Se dagens oppgaver og innsjekk',body:'Fortsett med det som gjelder i dag. Pause, tilpasning og avklaring er legitime deler av løpet.',view:'checkin',meta:[p.code_name,'SER · Under']};
  if(phase==='VIDA')return{level:'GREEN',kicker:'Neste handling · VIDA',title:'Fortsett broen hjem',body:'Se neste konkrete handling og oppfølging i den levende VIDA-planen.',view:'forms',meta:[p.code_name,'VIDA · Etter']};
  return{level:'GREEN',kicker:'Neste handling · VÍA',title:'Fortsett avklaringen',body:'Se neste avtalte steg, oppgave eller skjema før eventuell overgang til SER.',view:'forms',meta:[p.code_name,'VÍA · Før']};
}

function nextActionModel(){
  const t=bestVisibleTask();
  if(t){
    const p=participantById(t.participant_id),pilot=pilotById(t.pilot_id),level=flowLevel(t);
    const context=[p?.code_name,pilot?.name,t.due_at?formatDate(t.due_at):null].filter(Boolean);
    return{
      level,
      kicker:level==='RED'?'Neste handling · Kritisk/forfalt':level==='YELLOW'?'Neste handling · Trenger avklaring':'Neste handling · Oppgave',
      title:t.title,
      body:t.description||'Åpne oppgaven for ansvar, kontekst og riktig neste steg.',
      taskId:t.id,
      meta:context
    };
  }

  const p=participantById(selectedParticipantId)||ownParticipant()||(participants||[])[0]||null;
  const phase=phaseActionForParticipant(p);
  if(phase)return phase;

  return{
    level:'GREEN',
    kicker:'Neste handling',
    title:'Ingen saker krever handling nå',
    body:'Arbeidskøen er ryddig. Du kan gå til deltakere eller oppgaver for å kontrollere status.',
    view:isStaff()?'participants':'tasks',
    meta:isStaff()&&typeof roleSummary==='function'&&roleSummary()?[roleSummary()]:[]
  };
}

function renderNextAction(){
  const overview=document.querySelector('#view-overview');
  const hero=overview?.querySelector('.hero-panel');
  if(!overview||!hero)return;
  let card=overview.querySelector('#nextActionCard');
  if(!card){
    card=document.createElement('article');
    card.id='nextActionCard';
    card.className='next-action-card';
    hero.insertAdjacentElement('afterend',card);
  }
  const m=nextActionModel();
  card.dataset.level=m.level||'GREEN';
  card.innerHTML=`<div class="next-action-copy"><p class="next-action-kicker">${escapeHtml(m.kicker||'Neste handling')}</p><h3>${escapeHtml(m.title||'Neste steg')}</h3><p>${escapeHtml(m.body||'')}</p>${m.meta?.length?`<div class="next-action-meta">${m.meta.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`:''}</div><div class="next-action-actions"></div>`;
  const actions=card.querySelector('.next-action-actions');
  if(m.taskId){
    const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='Åpne oppgaven';b.addEventListener('click',()=>openTask(m.taskId));actions.appendChild(b);
  }else if(m.href){
    const a=document.createElement('a');a.className='primary link-btn';a.href=m.href;a.textContent='Gå til riktig steg';actions.appendChild(a);
  }else if(m.view){
    const b=document.createElement('button');b.type='button';b.className='primary';b.textContent=m.view==='participants'?'Åpne deltakere':m.view==='checkin'?'Åpne innsjekk':m.view==='forms'?'Åpne skjema & rutiner':'Åpne oppgaver';b.addEventListener('click',()=>show(m.view));actions.appendChild(b);
  }
}

function ensureReturnRow(name){
  document.querySelectorAll('.view-return-row').forEach(el=>el.remove());
  if(name==='overview')return;
  const view=document.querySelector(`#view-${name}`);if(!view)return;
  const head=view.querySelector('.section-head')||view.firstElementChild;if(!head)return;
  const row=document.createElement('div');row.className='view-return-row';
  row.innerHTML=`<button type="button">← Oversikt</button><span>${escapeHtml(document.querySelector('#contextLabel')?.textContent||'AidMe VIDA')}</span>`;
  row.querySelector('button').addEventListener('click',()=>show('overview'));
  head.insertAdjacentElement('beforebegin',row);
}

function installFlowHooks(){
  const baseRender=renderAll;
  renderAll=function(){baseRender();renderNextAction()};
  const baseShow=show;
  show=function(name){baseShow(name);ensureReturnRow(name);if(name==='overview')renderNextAction()};
  setTimeout(()=>{renderNextAction();const active=document.querySelector('.view.active')?.id?.replace('view-','')||'overview';ensureReturnRow(active)},120);
}

addFlowStyles();
installFlowHooks();
})();
