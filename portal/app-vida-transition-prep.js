(()=>{
'use strict';

const PREP_KEY='vida_transition_prep';
function vidaPrepHref(p){return `./form-runner.html?key=${PREP_KEY}&participant=${encodeURIComponent(p.id)}`}
function canPrepareVidaAsStaff(){return isStaff()&&(hasRole('ser_lead')||hasRole('vida_owner'))}
function serParticipantsInScope(){return (participants||[]).filter(p=>String(p.stage||'').toUpperCase()==='SER')}

function injectStaffVidaPrep(){
  document.querySelectorAll('[data-vida-prep-action]').forEach(x=>x.remove());
  if(!canPrepareVidaAsStaff())return;
  const p=participantById(selectedParticipantId);if(!p||String(p.stage||'').toUpperCase()!=='SER')return;
  const actions=document.querySelector('.ser-vida-handoff .form-actions');if(!actions)return;
  const link=document.createElement('a');
  link.className='ghost';link.dataset.vidaPrepAction='1';link.href=vidaPrepHref(p);
  link.textContent='Forbered VIDA før hjemkomst';
  link.title='Fang ett første hjemmesteg uten å avslutte SER eller starte den formelle VIDA-planen.';
  actions.prepend(link);
}
function injectVidaOwnerQueue(){
  document.querySelectorAll('[data-vida-prep-queue]').forEach(x=>x.remove());
  if(!isStaff()||!hasRole('vida_owner'))return;
  const host=document.querySelector('#priorityQueue');if(!host)return;
  const scoped=serParticipantsInScope();if(!scoped.length)return;
  const html=scoped.map(p=>`<a class="task-row" data-vida-prep-queue="1" href="${vidaPrepHref(p)}" style="text-decoration:none;color:inherit"><i class="task-dot YELLOW"></i><div><b>VIDA-forberedelse · ${escapeHtml(p.code_name)}</b><small>SER pågår · fang første hjemmesteg og nødvendig handoff uten å starte VIDA tidlig.</small></div><div class="task-meta"><span class="pill YELLOW">SER → VIDA</span></div></a>`).join('');
  host.insertAdjacentHTML('afterbegin',html);
}

const vidaPrepRenderParticipants=renderParticipants;
renderParticipants=function(){const r=vidaPrepRenderParticipants();setTimeout(injectStaffVidaPrep,0);return r};
const vidaPrepRenderAll=renderAll;
renderAll=function(){const r=vidaPrepRenderAll();setTimeout(()=>{injectStaffVidaPrep();injectVidaOwnerQueue()},0);return r};

const vidaPrepOpenTask=openTask;
openTask=function(id){
  vidaPrepOpenTask(id);
  if(isStaff())return;
  const p=ownParticipant();if(!p||String(p.stage||'').toUpperCase()!=='SER')return;
  const body=document.querySelector('#taskDialogBody');if(!body||body.querySelector('[data-participant-vida-prep]'))return;
  const box=document.createElement('div');box.className='task-crosslinks';box.dataset.participantVidaPrep='1';
  box.innerHTML=`<p class="eyebrow">Mot hjemkomsten</p><p>Hvis det kjennes naturlig mot slutten av SER, kan du allerede nå notere ett lite steg du vil prøve hjemme. Dette avslutter ikke SER og starter ikke VIDA.</p><div class="crosslink-grid"><a class="gate-link" href="${vidaPrepHref(p)}">Forbered mitt første VIDA-steg</a></div>`;
  body.appendChild(box);
};

setTimeout(()=>{injectStaffVidaPrep();injectVidaOwnerQueue()},220);
})();
