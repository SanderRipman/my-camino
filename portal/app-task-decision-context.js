(()=> {
'use strict';

function ensureStyles(){
  if(document.getElementById('aidme-task-decision-context-style'))return;
  const s=document.createElement('style');
  s.id='aidme-task-decision-context-style';
  s.textContent='.task-decision-context{margin:12px 0;padding:14px 16px;border:1px solid #ded8cc;border-radius:14px;background:#fbf8f2}.task-decision-context.is-critical{border-color:#dfb3aa;background:#fff7f4}.task-decision-note{display:block;margin-top:14px}.task-decision-note textarea{width:100%;min-height:88px;resize:vertical}.task-decision-history{margin-top:10px;padding-top:10px;border-top:1px solid #e1ddd4}.task-decision-history-item{margin:7px 0;padding:8px 10px;border-radius:10px;background:#f4f1ea}.task-decision-history-item small{display:block;color:#66737b;margin-bottom:2px}';
  document.head.appendChild(s);
}
function taskFor(id){return (tasks||[]).find(t=>t.id===id)||null}
function staffName(id){return (staffProfiles||[]).find(s=>s.user_id===id)?.full_name||'Medarbeider'}
function dateLabel(v){try{return new Intl.DateTimeFormat('nb-NO',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return''}}

async function loadTaskHistory(task,host){
  const target=host.querySelector('[data-task-decision-history]');
  if(!target)return;
  target.innerHTML='<span class="privacy-note">Laster tidligere beslutningsnotater…</span>';
  const res=await client.functions.invoke('task-command',{body:{action:'CONTEXT',taskId:task.id}});
  const data=res.data,error=res.error;
  if(error||data?.error){target.innerHTML='<span class="privacy-note">Tidligere notater kunne ikke hentes med denne tilgangen.</span>';return}
  const items=(data?.history||[]).filter(e=>String(e?.metadata?.decision_note||'').trim());
  if(!items.length){target.innerHTML='<span class="privacy-note">Ingen tidligere beslutningsnotater på oppgaven.</span>';return}
  target.innerHTML='<p class="eyebrow">Tidligere beslutningsnotat</p>'+items.slice(0,3).map(e=>'<div class="task-decision-history-item"><small>'+escapeHtml(dateLabel(e.occurred_at))+' · '+escapeHtml(staffName(e.actor_user_id))+'</small><div>'+escapeHtml(e.metadata.decision_note)+'</div></div>').join('');
}

function enhanceTaskDecisionContext(id){
  if(!isStaff())return;
  const task=taskFor(id),body=document.querySelector('#taskDialogBody');
  if(!task||!body)return;
  body.querySelectorAll('[data-task-decision-context]').forEach(n=>n.remove());
  const critical=severity(task)==='RED';
  const box=document.createElement('section');
  box.dataset.taskDecisionContext='1';
  box.className='task-decision-context'+(critical?' is-critical':'');
  const description=String(task.description||'').trim();
  box.innerHTML='<p class="eyebrow">Beslutningsgrunnlag</p><p>'+escapeHtml(description||'Ingen konkret arbeidsbeskrivelse er registrert. Avklar grunnlaget før videre beslutning.')+'</p><div class="task-decision-history" data-task-decision-history></div><label class="task-decision-note"><span>Beslutningsnotat '+(critical?'(påkrevd ved Venter/Ferdig)':'(valgfritt)')+'</span><textarea id="taskDecisionNote" maxlength="800" placeholder="Kort relevant arbeidsinformasjon: observasjon, tiltak, hva som er avklart og hva neste ansvarlige trenger å vite. Ikke bruk dette som klinisk journal."></textarea><small>'+(critical?'En kritisk oppgave skal ikke settes på vent eller ferdig uten en kort begrunnelse.':'Notatet følger statusendringen og beholdes i oppgavehistorikken.')+'</small></label>';
  body.insertBefore(box,body.firstChild);
  loadTaskHistory(task,box);
}

const originalOpenTask=openTask;
openTask=function(id){originalOpenTask(id);setTimeout(()=>enhanceTaskDecisionContext(id),0)};

updateTaskStatus=async function(status){
  const task=taskFor(selectedTaskId);if(!task)return;
  const note=(document.querySelector('#taskDecisionNote')?.value||'').trim();
  if(severity(task)==='RED'&&['WAITING','DONE'].includes(status)&&note.length<3){
    document.querySelector('#taskDialogMessage').textContent='Skriv et kort beslutningsnotat før en kritisk oppgave settes på vent eller ferdig.';
    document.querySelector('#taskDecisionNote')?.focus();
    return;
  }
  document.querySelector('#taskDialogMessage').textContent='Lagrer…';
  const res=await client.functions.invoke('task-command',{body:{taskId:task.id,status,note}});
  const data=res.data,error=res.error;
  if(error||data?.error){
    document.querySelector('#taskDialogMessage').textContent=data?.error==='DECISION_NOTE_REQUIRED'?'Et kort beslutningsnotat er påkrevd for denne statusendringen.':'Kunne ikke oppdatere oppgaven med din tilgang.';
    return;
  }
  task.status=data?.task?.status||status;
  document.querySelector('#taskDialog').close();
  renderAll();
};

ensureStyles();
})();
