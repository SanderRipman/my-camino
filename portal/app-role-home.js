(()=>{
'use strict';

function scopePendingStyles(){
  if(document.querySelector('#scope-pending-style'))return;
  const style=document.createElement('style');style.id='scope-pending-style';
  style.textContent=`html.scope-pending #mainNav .nav-item:not([data-view="overview"]):not([data-view="tasks"]){display:none!important;pointer-events:none!important}`;
  document.head.appendChild(style);
}
function enterScopePending(){scopePendingStyles();document.documentElement.classList.add('scope-pending')}
function leaveScopePending(){document.documentElement.classList.remove('scope-pending')}
enterScopePending();

function activeRoleCodes(){return new Set((accessGrants||[]).filter(activeGrant).map(g=>g.role_code))}
function roleSetHas(set,codes){return codes.some(code=>set.has(code))}
function roleHomeLens(){
  if(!isStaff())return null;
  const roles=activeRoleCodes();
  const operational=['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].filter(r=>roles.has(r));
  const aggregate=roleSetHas(roles,['project_owner','observer','evaluator']);
  if(!operational.length&&aggregate)return{
    key:'aggregate',eyebrow:'Programnivå',heading:'Status, porter og læring',badge:'PROGRAM',
    intro:'Se samlet status, åpne programoppgaver og læring. Individuelle operative handlinger vises ikke bare fordi du har prosjekt-, observatør- eller evaluatorrolle.',
    context:'Aggregert først · minste nødvendige innsyn',queue:'Programoppgaver og porter'
  };
  if(operational.length>1)return{
    key:'combined',eyebrow:'Samlet arbeidsflate',heading:'Trenger handling nå',badge:'LIVE',
    intro:'Du har flere operative roller. Oversikten samler bare det du allerede har tilgang til; prioriter kritisk/forfalt først, deretter avklaringer og neste lovlige gate.',
    context:`${operational.length} operative roller · ett situasjonsbilde`,queue:'Prioritert arbeidskø'
  };
  if(roles.has('ser_lead')||roles.has('logistics'))return{
    key:'ser',eyebrow:'SER · operativt',heading:'Det viktigste i dag',badge:'SER',
    intro:'Rute, dagsform, ansvar og sikker tilpasning først. Deltakerens egen innsjekk er et signal; teamets operative logg beskriver bare nødvendig handling og oppfølging.',
    context:'Under · erfaring, rytme og trygghet',queue:'SER – handling nå'
  };
  if(roles.has('vida_owner'))return{
    key:'vida',eyebrow:'VIDA · oppfølging',heading:'Neste handling hjemme',badge:'VIDA',
    intro:'Følg samme levende VIDA-plan fra første handling og 72 timer videre til 14, 30 og 90 dager. Bruk nødvendig handoff – ikke rå SER-notater.',
    context:'Etter · handling, eier og frister',queue:'VIDA – oppfølging nå'
  };
  if(roles.has('via_owner')||roles.has('clinical_professional'))return{
    key:'via',eyebrow:'VÍA · avklaring',heading:'Neste avklaring og gate',badge:'VÍA',
    intro:'Avklar retning, ressurser, sikkerhet og det som må være på plass før en formell beslutning. Veikart, vurdering og GO/NO-GO er separate steg.',
    context:'Før · retning, trygghet og beslutning',queue:'VÍA – avklaringer nå'
  };
  if(roles.has('program_lead'))return{
    key:'program',eyebrow:'Programflyt',heading:'Neste gate og ansvar',badge:'VÍA→VIDA',
    intro:'Hold flyten sammenhengende fra interesse til VÍA, SER og VIDA. Se etter manglende eier, frist eller gate – uten å overta faglige eller sensitive detaljer uten eget mandat.',
    context:'Hel reise · riktig eier til riktig tid',queue:'Neste gate og ansvar'
  };
  return{
    key:'staff',eyebrow:'Arbeidsflate',heading:'Trenger handling nå',badge:'VIDA',
    intro:'Visningen følger den tilgangen rollen din allerede har. Start med prioriterte oppgaver og neste lovlige handling.',
    context:'Minste nødvendige innsyn',queue:'Prioritert arbeidskø'
  };
}
function aggregateOnlyLens(){return roleHomeLens()?.key==='aggregate'}
window.AidMeRoleLens=Object.freeze({aggregateOnly:()=>aggregateOnlyLens()});

function roleHomeStyles(){
  if(document.querySelector('#role-home-style'))return;
  const style=document.createElement('style');style.id='role-home-style';
  style.textContent=`
    #view-overview.role-home-aggregate .dashboard-top{grid-template-columns:1fr}
    #view-overview.role-home-aggregate .role-home-hide-aggregate{display:none!important}
    #view-overview.role-home-aggregate .metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    #contextMini{max-width:240px;line-height:1.35}
    #groupPulse .pulse-row[data-vida-participant-link="1"]{cursor:pointer;border-radius:12px;padding:8px;margin:-8px;transition:background .15s ease,box-shadow .15s ease}
    #groupPulse .pulse-row[data-vida-participant-link="1"]:hover{background:rgba(18,63,61,.055)}
    #groupPulse .pulse-row[data-vida-participant-link="1"]:focus-visible{outline:3px solid rgba(200,164,93,.55);outline-offset:3px}
    #groupPulse .vida-open-cue{margin-left:auto;font-weight:700;color:#123f3d;white-space:nowrap}
    .vida-owner-plan-action{border:1px solid rgba(18,63,61,.18);background:rgba(18,63,61,.035)}
    @media(max-width:760px){
      #view-overview .hero-panel.compact-hero{align-items:flex-start;gap:14px}
      #view-overview .hero-badge{min-width:0;max-width:46%;padding-left:12px}
      #view-overview .hero-badge strong{font-size:clamp(20px,6vw,28px)}
      #view-overview #homeIntro{line-height:1.45}
      #view-overview.role-home-aggregate .metric-grid{grid-template-columns:1fr}
    }
  `;document.head.appendChild(style);
}
function setOverviewMetricLabel(index,label,hint){
  const card=document.querySelectorAll('#view-overview .metric-grid .metric')[index];if(!card)return;
  const l=card.querySelector('span'),s=card.querySelector('small');if(l)l.textContent=label;if(s&&hint)s.textContent=hint;
}
function vidaOwnerParticipants(){
  if(roleHomeLens()?.key!=='vida')return[];
  return (participants||[]).filter(p=>stageLabel(p.stage)==='VIDA');
}
function vidaPlanHref(p){return `./form-runner.html?key=vida_plan&participant=${encodeURIComponent(p.id)}`}
function vidaPlanActionMarkup(p){
  return `<a class="task-row vida-owner-plan-action" href="${vidaPlanHref(p)}" style="text-decoration:none;color:inherit"><i class="task-dot YELLOW"></i><div><b>Åpne VIDA-plan · ${escapeHtml(p.code_name)}</b><small>Én levende plan med første handling, 72 timer og videre 14/30/90-oppfølging.</small></div><div class="task-meta"><span class="pill YELLOW">Neste steg</span></div></a>`;
}
function openVidaParticipant(p){
  if(!p)return;selectedParticipantId=p.id;show('participants');renderParticipants();
}
function bindVidaPulseDrilldown(){
  if(roleHomeLens()?.key!=='vida')return;
  const rows=[...document.querySelectorAll('#groupPulse .pulse-row')];
  rows.forEach(row=>{
    if(row.dataset.vidaParticipantLink==='1')return;
    const code=row.querySelector('b')?.textContent?.trim();
    const p=(participants||[]).find(x=>x.code_name===code&&stageLabel(x.stage)==='VIDA');
    if(!p)return;
    row.dataset.vidaParticipantLink='1';row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label',`Åpne ${p.code_name} i VIDA-oppfølging`);
    if(!row.querySelector('.vida-open-cue'))row.insertAdjacentHTML('beforeend','<span class="vida-open-cue">Åpne →</span>');
    const open=()=>openVidaParticipant(p);
    row.addEventListener('click',open);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  });
}
function injectVidaOverviewActions(){
  if(roleHomeLens()?.key!=='vida')return;
  const host=$('#priorityQueue');if(!host)return;
  host.querySelectorAll('.vida-owner-plan-action').forEach(x=>x.remove());
  const scoped=vidaOwnerParticipants();if(!scoped.length)return;
  if(host.children.length===1&&host.firstElementChild?.tagName==='P')host.innerHTML='';
  host.insertAdjacentHTML('afterbegin',scoped.map(vidaPlanActionMarkup).join(''));
}
function adaptVidaParticipantDetail(){
  if(roleHomeLens()?.key!=='vida')return;
  const p=participantById(selectedParticipantId);if(!p||stageLabel(p.stage)!=='VIDA')return;
  const detail=$('#participantDetail');if(!detail)return;
  const heading=[...detail.querySelectorAll('h3')].find(h=>h.textContent.trim()==='Neste handling');
  const list=heading?.nextElementSibling;if(!list)return;
  [...list.querySelectorAll('p')].forEach(x=>{if(x.textContent.trim()==='Ingen åpne oppgaver.')x.remove()});
  if(!list.querySelector('.vida-owner-plan-action'))list.insertAdjacentHTML('afterbegin',vidaPlanActionMarkup(p));
}
function adaptVidaParticipantsView(){
  if(roleHomeLens()?.key!=='vida')return;
  const intro=$('#participantsIntro');if(intro)intro.textContent='Velg en deltaker for VIDA-plan, neste handling og avtalt oppfølging hjemme.';
  document.querySelectorAll('#participantList .participant-card').forEach(card=>{
    const code=card.querySelector('b')?.textContent?.trim();const p=(participants||[]).find(x=>x.code_name===code);
    if(!p||stageLabel(p.stage)!=='VIDA')return;
    const small=card.querySelector('small');if(small)small.textContent='VIDA · levende plan og oppfølging';
  });
  adaptVidaParticipantDetail();
}
function adaptAggregateNavigation(lens){
  const aggregate=lens.key==='aggregate';
  const participantNav=document.querySelector('.nav-item[data-view="participants"]');
  const checkinNav=document.querySelector('.nav-item[data-view="checkin"]');
  const formsNav=document.querySelector('.nav-item[data-view="forms"]');
  if(participantNav)participantNav.classList.toggle('hidden',aggregate);
  if(checkinNav)checkinNav.classList.toggle('hidden',aggregate);
  if(formsNav)formsNav.classList.toggle('hidden',aggregate);
}
function applyRoleAwareHome(){
  if(!isStaff())return;
  const lens=roleHomeLens();if(!lens)return;roleHomeStyles();adaptAggregateNavigation(lens);
  const view=document.querySelector('#view-overview');if(!view)return;
  view.classList.toggle('role-home-aggregate',lens.key==='aggregate');
  const metrics=document.querySelectorAll('#view-overview .metric-grid .metric');
  if(metrics[3])metrics[3].classList.toggle('role-home-hide-aggregate',lens.key==='aggregate');
  const eyebrow=document.querySelector('#homeEyebrow'),heading=document.querySelector('#homeHeading'),intro=document.querySelector('#homeIntro'),badge=document.querySelector('#stageBadge'),context=document.querySelector('#contextMini');
  if(eyebrow)eyebrow.textContent=lens.eyebrow;if(heading)heading.textContent=lens.heading;if(intro)intro.textContent=lens.intro;if(badge)badge.textContent=lens.badge;if(context)context.textContent=lens.context;
  const queue=document.querySelector('#priorityQueue')?.closest('.panel-card');if(queue){const h=queue.querySelector('h3');if(h)h.textContent=lens.queue}
  const pulse=document.querySelector('#groupPulse')?.closest('.panel-card');if(pulse){pulse.classList.toggle('role-home-hide-aggregate',lens.key==='aggregate');const h=pulse.querySelector('h3');const e=pulse.querySelector('.eyebrow');if(lens.key==='ser'){if(e)e.textContent='SER · signaler';if(h)h.textContent='Gruppens puls'}else if(lens.key==='vida'){if(e)e.textContent='VIDA · oppfølging';if(h)h.textContent='Deltakere i oppfølging'}else if(lens.key==='via'){if(e)e.textContent='VÍA · avklaring';if(h)h.textContent='Deltakere som trenger avklaring'}}
  if(lens.key==='aggregate'){
    setOverviewMetricLabel(0,'Åpne programoppgaver','porter, rapportering og oppfølging');
    setOverviewMetricLabel(1,'Kritisk / forfalt','krever programoppmerksomhet');
    setOverviewMetricLabel(2,'Trenger avklaring','åpne programspørsmål');
  }else if(lens.key==='vida'){
    setOverviewMetricLabel(0,'Åpne VIDA-steg','levende plan og neste handling');
    setOverviewMetricLabel(3,'Deltakere i scope','kun ditt eksisterende ansvar');
    const scoped=vidaOwnerParticipants(),ids=new Set(scoped.map(p=>p.id)),openTasks=(tasks||[]).filter(t=>ids.has(t.participant_id)&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)).length;
    const openStrong=metrics[0]?.querySelector('strong');if(openStrong)openStrong.textContent=String(Math.max(openTasks,scoped.length));
  }else if(lens.key==='ser'){
    setOverviewMetricLabel(0,'Åpne SER-oppgaver','rute, sikkerhet og oppfølging');
    setOverviewMetricLabel(3,'Aktive deltakere','innen operativt scope');
  }else if(lens.key==='via'){
    setOverviewMetricLabel(0,'Åpne VÍA-steg','avklaring, ansvar og beslutning');
    setOverviewMetricLabel(3,'Deltakere i VÍA','innen eksisterende scope');
  }
  bindVidaPulseDrilldown();injectVidaOverviewActions();
}

const roleHomeRenderTaskLists=renderTaskLists;
renderTaskLists=function(){
  if(!aggregateOnlyLens())return roleHomeRenderTaskLists();
  const allTasks=tasks;
  tasks=(allTasks||[]).filter(t=>!t.participant_id);
  try{return roleHomeRenderTaskLists()}finally{tasks=allTasks}
};

const roleHomeRenderParticipants=renderParticipants;
renderParticipants=function(){roleHomeRenderParticipants();adaptVidaParticipantsView()};
const roleHomeRenderParticipantDetail=renderParticipantDetail;
renderParticipantDetail=function(){roleHomeRenderParticipantDetail();adaptVidaParticipantDetail()};

const roleHomeRenderAll=renderAll;
renderAll=function(){roleHomeRenderAll();applyRoleAwareHome();leaveScopePending()};
setTimeout(applyRoleAwareHome,180);

if(!document.querySelector('script[data-aggregate-analysis]')){
  const aggregateScript=document.createElement('script');
  aggregateScript.src='./app-aggregate-analysis.js?v=20260903c';
  aggregateScript.defer=true;
  aggregateScript.dataset.aggregateAnalysis='1';
  document.head.appendChild(aggregateScript);
}

})();
