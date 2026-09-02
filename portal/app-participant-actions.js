(()=>{
'use strict';

const PARTICIPANT_ACTIONS_VERSION='2026-09-02a';

function stageFormKeys(stage){
  if(stage==='GO'||stage==='GO_WITH_CONDITIONS')return new Set(['participant_agreement']);
  if(stage==='POSTPONED'||stage==='NO_GO')return new Set();
  const phase=stageLabel(stage);
  if(phase==='SER')return new Set();
  if(phase==='VIDA')return new Set(['vida_plan']);
  if(phase==='ny VÍA')return new Set(['via_roadmap']);
  return new Set(['info_before_via','via_roadmap']);
}

function taskCoveredFormKeys(participant){
  const map={participant_via_start:'via_roadmap',participant_agreement_ack:'participant_agreement'};
  return new Set(tasks.filter(t=>t.participant_id===participant?.id&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)).map(t=>map[t.workflow_key]).filter(Boolean));
}

function readyForms(participant){
  if(!participant||assurance?.currentLevel!=='aal2')return[];
  const allowed=stageFormKeys(participant.stage),covered=taskCoveredFormKeys(participant);
  return formDefs.filter(f=>(f.scope==='participant'||f.scope==='participant_staff')&&allowed.has(f.key)&&!covered.has(f.key));
}

function securityAction(){
  if(assurance?.currentLevel==='aal2')return null;
  return {
    kind:'security',
    title:'Bekreft sikker innlogging',
    detail:assurance?.nextLevel==='aal2'?'Bekreft Authenticator før personlige skjema og andre beskyttede steg åpnes.':'Sett opp Authenticator før personlige skjema og andre beskyttede steg åpnes.',
    label:'Nødvendig først'
  };
}

function actionMarkup(action,participant){
  if(action.kind==='security')return `<button class="task-row participant-derived-action" type="button" data-participant-action-view="security"><i class="task-dot YELLOW"></i><div><b>${escapeHtml(action.title)}</b><small>${escapeHtml(action.detail)}</small></div><div class="task-meta"><span class="pill YELLOW">${escapeHtml(action.label)}</span></div></button>`;
  const href=`./form-runner.html?key=${encodeURIComponent(action.key)}&participant=${encodeURIComponent(participant.id)}`;
  return `<a class="task-row participant-derived-action" href="${href}" style="text-decoration:none;color:inherit"><i class="task-dot GREEN"></i><div><b>${escapeHtml(action.title_no)}</b><small>Skjemaet er tilgjengelig i fasen din og kan åpnes direkte herfra.</small></div><div class="task-meta"><span class="pill GREEN">Skjema klart</span></div></a>`;
}

function injectParticipantActions(){
  if(isStaff())return;
  const participant=ownParticipant();if(!participant)return;
  const actions=[];const security=securityAction();if(security)actions.push(security);else actions.push(...readyForms(participant));
  if(!actions.length)return;
  const markup=actions.map(a=>actionMarkup(a,participant)).join('');
  for(const selector of ['#priorityQueue','#taskList']){
    const host=document.querySelector(selector);if(!host)continue;
    host.querySelectorAll('.participant-derived-action').forEach(el=>el.remove());
    const onlyEmpty=host.children.length===1&&host.firstElementChild?.tagName==='P';if(onlyEmpty)host.innerHTML='';
    host.insertAdjacentHTML('afterbegin',markup);
  }
  document.querySelectorAll('[data-participant-action-view="security"]').forEach(btn=>btn.addEventListener('click',()=>show('security')));
  const queueCard=document.querySelector('#priorityQueue')?.closest('.panel-card');
  if(queueCard){const eyebrow=queueCard.querySelector('.eyebrow'),heading=queueCard.querySelector('h3');if(eyebrow)eyebrow.textContent='Neste';if(heading)heading.textContent='Dine neste steg';}
}

const baseRenderTaskLists=renderTaskLists;
renderTaskLists=function(){baseRenderTaskLists();injectParticipantActions()};

function applyHashView(){
  if(!location.hash||isStaff())return;
  const view=location.hash.slice(1);
  if(!['overview','participants','tasks','checkin','forms','security'].includes(view))return;
  const target=document.querySelector(`.nav-item[data-view="${view}"]`);
  if(target&&!target.classList.contains('hidden'))show(view);
  history.replaceState(null,'',location.pathname+location.search);
}

window.setTimeout(()=>{injectParticipantActions();applyHashView()},250);
window.addEventListener('pageshow',()=>window.setTimeout(()=>{injectParticipantActions();applyHashView()},80));
})();
