(()=>{
'use strict';

function badgeOpenStatus(status){return ['OPEN','IN_PROGRESS','WAITING'].includes(status)}
function badgeOverdue(task){return !!task?.due_at&&badgeOpenStatus(task.status)&&new Date(task.due_at)<new Date()}
function badgeTaskSeverity(task){return badgeOverdue(task)?'RED':severity(task)}
function badgeVisibleTasks(){
  const uid=session?.user?.id,own=ownParticipant(),staff=isStaff();
  return (tasks||[]).filter(t=>staff||t.assignee_user_id===uid||(own&&t.participant_id===own.id));
}
function badgeParticipantSeverity(participant,openTasks){
  const related=openTasks.filter(t=>t.participant_id===participant.id);
  const latest=latestCheckin(participant.id);
  if(related.some(t=>badgeTaskSeverity(t)==='RED')||latest?.rag==='RED')return'RED';
  if(related.some(t=>badgeTaskSeverity(t)==='YELLOW')||latest?.rag==='YELLOW')return'YELLOW';
  return'GREEN';
}
function semanticBadgeMarkup(kind,counts){
  if(kind==='overview'&&isStaff())return counts.total?`<span class="nav-count nav-count-total" aria-label="${counts.total} åpne totalt">${counts.total}</span>`:'';
  let html='';
  if(counts.red)html+=`<span class="nav-count red" aria-label="${counts.red} ${kind==='participants'?'deltakere':'steg'} kritisk / blokkerende / forfalt">${counts.red}</span>`;
  if(counts.yellow)html+=`<span class="nav-count yellow" aria-label="${counts.yellow} ${kind==='participants'?'deltakere':'steg'} trenger avklaring">${counts.yellow}</span>`;
  if(counts.blue)html+=`<span class="nav-count blue" aria-label="${counts.blue} informative eller valgfrie steg">${counts.blue}</span>`;
  return html;
}
function ensureFormsBadge(){
  const nav=document.querySelector('.nav-item[data-view="forms"]');if(!nav)return null;
  let badge=document.querySelector('#badgeForms');if(!badge){badge=document.createElement('i');badge.id='badgeForms';badge.className='nav-badges';nav.appendChild(badge)}
  return badge;
}
function participantItemSummary(item){
  if(!item)return'';
  if(item.kind==='security')return'Krever AAL2 / Authenticator';
  if(item.kind==='task')return `${item.title}${item.due_at?` · frist ${formatDate(item.due_at)}`:''}`;
  return item.title||item.key||'Skjema tilgjengelig';
}
function participantTooltip(label,items){
  if(!items.length)return `${label}: ingen åpne steg`;
  return `${label}: ${items.length} · ${items.slice(0,3).map(participantItemSummary).join(' · ')}`;
}
function polishParticipantAttentionCopy(){
  if(isStaff())return;
  document.querySelectorAll('#view-overview .metric span').forEach(el=>{if(el.textContent.trim()==='Må nå')el.textContent='Kritisk'});
  document.querySelectorAll('[data-participant-attention="RED"] .pill.RED').forEach(el=>{if(el.textContent.trim()==='Må nå')el.textContent='Kritisk'});
}
function renderParticipantNavigationBadges(){
  const snap=typeof window.aidmeParticipantAttentionSnapshot==='function'?window.aidmeParticipantAttentionSnapshot():null;if(!snap)return false;
  const overview=document.querySelector('#badgeOverview'),taskBadge=document.querySelector('#badgeTasks'),participantBadge=document.querySelector('#badgeParticipants'),formsBadge=ensureFormsBadge();
  const counts={red:snap.red.length,yellow:snap.yellow.length,blue:snap.blue.length};
  if(overview){overview.innerHTML=semanticBadgeMarkup('overview',counts);overview.title=`Samlet oversikt: ${snap.total} åpne steg${snap.total?` · ${[...snap.red,...snap.yellow,...snap.blue].slice(0,3).map(participantItemSummary).join(' · ')}`:''}`}
  const taskCounts={red:snap.tasks.filter(x=>x.tone==='RED').length,yellow:snap.tasks.filter(x=>x.tone==='YELLOW').length,blue:snap.tasks.filter(x=>x.tone==='BLUE').length};
  if(taskBadge){taskBadge.innerHTML=semanticBadgeMarkup('tasks',taskCounts);taskBadge.title=participantTooltip('Oppgaver',snap.tasks)}
  if(formsBadge){const formCounts={red:0,yellow:snap.forms.filter(x=>x.tone==='YELLOW').length,blue:snap.forms.filter(x=>x.tone==='BLUE').length};formsBadge.innerHTML=semanticBadgeMarkup('forms',formCounts);formsBadge.title=participantTooltip('Skjema',snap.forms)}
  if(participantBadge){participantBadge.innerHTML='';participantBadge.title='Min reise · fase og neste handling'}
  document.querySelectorAll('[data-participant-attention]').forEach(row=>{const tone=row.dataset.participantAttention;row.title=tone==='RED'?'Kritisk: må håndteres før du kan gå videre':tone==='YELLOW'?'Neste handling i reisen':'Tilgjengelig informasjon / valgfritt steg'});
  polishParticipantAttentionCopy();
  return true;
}
function harmonizeStaffKpis(open,taskCounts){
  const metricOpen=document.querySelector('#metricOpen'),metricRed=document.querySelector('#metricRed'),metricYellow=document.querySelector('#metricYellow');
  if(metricOpen)metricOpen.textContent=String(open.length);
  if(metricRed)metricRed.textContent=String(taskCounts.red);
  if(metricYellow)metricYellow.textContent=String(taskCounts.yellow);
  const redCard=metricRed?.closest('.metric'),yellowCard=metricYellow?.closest('.metric'),openCard=metricOpen?.closest('.metric'),participantCard=document.querySelector('#metricParticipants')?.closest('.metric');
  if(redCard){redCard.classList.add('metric-attention-red');const label=redCard.querySelector('span'),hint=redCard.querySelector('small');if(label)label.textContent='Kritisk / forfalt';if(hint)hint.textContent='krever oppmerksomhet'}
  if(yellowCard){yellowCard.classList.add('metric-attention-yellow');const hint=yellowCard.querySelector('small');if(hint)hint.textContent='trenger avklaring'}
  openCard?.classList.add('metric-attention-open');participantCard?.classList.add('metric-attention-participants');
}
function renderSemanticNavigationBadges(){
  if(!isStaff()&&renderParticipantNavigationBadges())return;
  const visible=badgeVisibleTasks();
  const open=visible.filter(t=>badgeOpenStatus(t.status));
  const taskCounts={red:open.filter(t=>badgeTaskSeverity(t)==='RED').length,yellow:open.filter(t=>badgeTaskSeverity(t)==='YELLOW').length};
  const overview=document.querySelector('#badgeOverview'),taskBadge=document.querySelector('#badgeTasks'),participantBadge=document.querySelector('#badgeParticipants');
  ensureFormsBadge()?.replaceChildren();
  if(overview){overview.innerHTML=semanticBadgeMarkup('overview',{total:open.length});overview.title=`Samlet oversikt: ${open.length} åpne oppgaver`}
  if(taskBadge){taskBadge.innerHTML=semanticBadgeMarkup('tasks',taskCounts);taskBadge.title=`Oppgaver: ${taskCounts.red} kritisk/forfalt · ${taskCounts.yellow} trenger avklaring`}
  if(participantBadge){
    const attention=(participants||[]).map(p=>badgeParticipantSeverity(p,open)).filter(s=>s==='RED'||s==='YELLOW');
    const participantCounts={red:attention.filter(s=>s==='RED').length,yellow:attention.filter(s=>s==='YELLOW').length};
    participantBadge.innerHTML=semanticBadgeMarkup('participants',participantCounts);
    participantBadge.title=`Deltakere: ${participantCounts.red} kritisk · ${participantCounts.yellow} trenger oppmerksomhet`;
  }
  harmonizeStaffKpis(open,taskCounts);
}

if(!document.querySelector('#semantic-nav-badge-style')){
  const style=document.createElement('style');style.id='semantic-nav-badge-style';
  style.textContent=`
    .sidebar .nav-item{grid-template-columns:18px minmax(0,1fr) auto;gap:4px;padding-left:8px;padding-right:8px}
    .sidebar .nav-item b{min-width:0}.sidebar .nav-badges{flex:0 0 auto;flex-wrap:nowrap;justify-self:end}
    .nav-count.red{background:#b4433f;color:#fff}.pill.RED{background:#b4433f;color:#fff}
    .nav-count.nav-count-total{background:#dbe5ec;color:#23435d}.nav-count.blue{background:#dbe5ec;color:#23435d}.nav-badges:empty{display:none}
    .task-dot.BLUE{background:#5f7f9b}.pill.BLUE{background:#dbe5ec;color:#23435d}
    #view-overview .metric.metric-attention-red{border-color:rgba(180,67,63,.28);background:linear-gradient(180deg,rgba(180,67,63,.055),rgba(255,253,248,.92))}
    #view-overview .metric.metric-attention-yellow{border-color:rgba(200,164,93,.36);background:linear-gradient(180deg,rgba(200,164,93,.07),rgba(255,253,248,.92))}
    #view-overview .metric.metric-attention-open{border-color:rgba(95,127,155,.25)}
    #view-overview .metric.metric-attention-participants{border-color:rgba(23,104,94,.24)}
    @media(max-width:780px){
      .sidebar .nav-item{display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;gap:1px!important}
      .sidebar .nav-badges{margin-left:0!important;justify-content:center!important;min-height:18px!important}
    }
  `;document.head.appendChild(style);
}

const priorRenderTaskLists=renderTaskLists;
renderTaskLists=function(){priorRenderTaskLists();renderSemanticNavigationBadges();setTimeout(renderSemanticNavigationBadges,0)};
setTimeout(renderSemanticNavigationBadges,120);
window.addEventListener('pageshow',()=>setTimeout(renderSemanticNavigationBadges,30));

// Post-badge presentation layer: retired menu-level Next cue, consistent active
// participant KPI, and the current physical-QA swipe prototype.
if(!document.querySelector('script[data-aidme-next-nav]')){
  const next=document.createElement('script');next.src='./app-next-nav.js?v=20260906c';next.dataset.aidmeNextNav='1';document.head.appendChild(next);
}
})();
