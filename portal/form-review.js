(()=>{
'use strict';

let reviewRows=[];
let lastAutoReviewKey='';

function reviewFormatDate(value){
  if(!value)return'–';
  return new Intl.DateTimeFormat('nb-NO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
}
function reviewValue(value){
  if(value==null||value==='')return'Ikke oppgitt';
  if(Array.isArray(value))return value.length?value.map(v=>String(v).replaceAll('_',' ')).join(', '):'Ikke oppgitt';
  if(typeof value==='boolean')return value?'Ja':'Nei';
  if(typeof value==='object'){
    const parts=[];
    if(value.action)parts.push(`Handling: ${value.action}`);
    if(value.support)parts.push(`Støtte/eier: ${value.support}`);
    if(value.deadline)parts.push(`Frist: ${value.deadline}`);
    return parts.length?parts.join(' · '):'Ikke oppgitt';
  }
  return String(value).replaceAll('_',' ');
}
function historyCard(){return document.querySelector('#submissionList')?.closest('.panel-card')||null}
function runnerCard(){return document.querySelector('#dynamicForm')?.closest('.runner-card')||null}
function setFocusedReview(active){
  const runner=document.querySelector('#runner');if(!runner)return
  runner.classList.toggle('submission-review-focused',!!active)
}
function ensureReviewPanel(){
  let panel=document.querySelector('#submissionReviewPanel');
  if(panel)return panel;
  panel=document.createElement('article');
  panel.id='submissionReviewPanel';
  panel.className='panel-card hidden';
  const history=historyCard();
  if(history)history.insertAdjacentElement('beforebegin',panel);
  else document.querySelector('#runner')?.appendChild(panel);
  return panel;
}
function agreementReviewNext(){
  if(!isStaff()||currentDef?.key!=='participant_agreement')return'';
  const pilot=selectedPilot();
  const href=pilot?.id?`./form-runner.html?key=pilot_go&pilot=${encodeURIComponent(pilot.id)}`:'./#tasks';
  return `<div class="preview-strip pre-ser-review-next"><strong>Neste formelle beslutningspunkt:</strong> Lukk avtale-review og eventuelle individuelle vilkår før samlet Pilot-GO. Deltakeravtalen er dokumentasjon og beredskap – ikke SER-start.<div class="form-actions"><a class="ghost" href="./#tasks">Til oppgaver</a><a class="primary" href="${href}">${pilot?.id?'Åpne samlet Pilot-GO':'Tilbake til oppgaver'}</a></div></div>`;
}
function vidaLivingPlanNext(){
  if(currentDef?.key!=='vida_plan')return'';
  return `<div class="preview-strip vida-plan-review-next"><strong>Én levende plan.</strong> Denne registreringen beholdes skrivebeskyttet som historikk. Når planen må justeres ved 72 timer, 14, 30 eller 90 dager, oppdateres samme plan som en ny revisjon – ikke som fire separate planer.<div class="form-actions"><button id="reviseVidaPlan" class="primary" type="button">Oppdater levende plan</button><a class="ghost" href="./">Til Oversikt</a></div></div>`;
}
function restoreVidaRevision(payload){
  setFocusedReview(false);
  const panel=document.querySelector('#submissionReviewPanel');if(panel){panel.classList.add('hidden');panel.innerHTML=''}
  currentDraft=null;
  restorePayload(payload||{});
  window.AidMeVidaPlan?.applyCanonicalOwner?.();
  const submit=document.querySelector('#dynamicForm button[type="submit"]');if(submit)submit.textContent='Lagre oppdatert plan';
  const msg=document.querySelector('#formMessage');if(msg)msg.textContent='Du oppdaterer den samme levende VIDA-planen. Forrige fullførte versjon beholdes i historikken.';
  runnerCard()?.scrollIntoView({behavior:'smooth',block:'start'});
}
async function renderSubmissionReview(row,{focused=false}={}){
  const panel=ensureReviewPanel();if(!panel||!currentVersion)return;
  panel.classList.remove('hidden');
  panel.innerHTML='<p>Åpner valgt registrering…</p>';
  const {data,error}=await client.from('form_submissions').select('id,payload').eq('id',row.id).single();
  if(error||!data){
    setFocusedReview(focused);
    panel.innerHTML='<div class="card-head"><div><p class="eyebrow">Tilgang</p><h2>Kunne ikke åpne registreringen</h2></div><button id="closeSubmissionReview" class="ghost" type="button">Lukk</button></div><p>Registreringen er ikke tilgjengelig med din nåværende tilgang. Gå tilbake til oppgaven eller kontakt riktig eier dersom den må vurderes.</p>';
    panel.querySelector('#closeSubmissionReview')?.addEventListener('click',()=>{setFocusedReview(false);panel.classList.add('hidden');panel.innerHTML='';});
    return;
  }
  const payload=data.payload||{};
  const sections=currentVersion.schema_json?.sections||[];
  const body=sections.map(sec=>`<section class="form-section review-section"><h3>${esc(sec.title||'Del')}</h3><div class="dynamic-grid">${(sec.fields||[]).map(field=>`<div class="field-wrap${['textarea','action','multi_select'].includes(field.type)?' full':''}"><label><span>${esc(field.label||field.key)}</span><div class="review-value">${esc(reviewValue(payload?.[field.key]))}</div></label></div>`).join('')}</div></section>`).join('');
  const privacy=currentDef?.key==='vida_plan'
    ?'Dette er den lagrede planversjonen. Den kan ikke overskrives; senere justeringer blir en ny revisjon av den samme levende planen.'
    :'Dette er den lagrede versjonen. Formell beslutning tas i riktig senere beslutningspunkt; et fullført skjema kan ikke redigeres her.';
  panel.innerHTML=`<div class="card-head"><div><p class="eyebrow">Fullført · skrivebeskyttet</p><h2>${esc(currentDef?.title_no||'Skjema')}</h2><p>${reviewFormatDate(row.submitted_at||row.updated_at||row.created_at)} · mal v${currentVersion.version}</p></div><button id="closeSubmissionReview" class="ghost" type="button">Lukk visning</button></div><p class="privacy-note">${esc(privacy)}</p>${body}${agreementReviewNext()}${vidaLivingPlanNext()}`;
  setFocusedReview(focused);
  panel.querySelector('#closeSubmissionReview')?.addEventListener('click',()=>{setFocusedReview(false);panel.classList.add('hidden');panel.innerHTML='';});
  panel.querySelector('#reviseVidaPlan')?.addEventListener('click',()=>restoreVidaRevision(payload));
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}
async function fetchReviewRows(){
  if(!currentVersion)return[];
  const participantId=$('#participantSelect').value||null,pilotId=selectedPilot()?.id||null;
  let q=client.from('form_submissions').select('id,participant_id,pilot_id,form_version_id,submitted_by,status,submitted_at,created_at,updated_at').eq('form_version_id',currentVersion.id).order('created_at',{ascending:false}).limit(20);
  q=participantId?q.eq('participant_id',participantId):q.is('participant_id',null);
  q=pilotId?q.eq('pilot_id',pilotId):q.is('pilot_id',null);
  const {data,error}=await q;if(error)return[];return data||[];
}
async function enhanceSubmissionHistory(){
  reviewRows=await fetchReviewRows();
  const list=$('#submissionList');if(!list)return;
  const history=historyCard();
  const historyTitle=history?.querySelector('h3');
  const historyEyebrow=history?.querySelector('.eyebrow');
  if(currentDef?.key==='vida_plan'){
    if(historyTitle)historyTitle.textContent='Planens historikk';
    if(historyEyebrow)historyEyebrow.textContent='Tidligere planversjoner';
  }else{
    if(historyTitle)historyTitle.textContent='Versjonshistorikk';
    if(historyEyebrow)historyEyebrow.textContent='Tidligere registreringer';
  }
  if(!reviewRows.length){list.innerHTML='<p>Ingen registreringer for denne konteksten ennå.</p>';setFocusedReview(false);return}
  const submittedRows=reviewRows.filter(r=>r.status==='SUBMITTED');
  list.innerHTML=reviewRows.map((row,index)=>{
    const submittedIndex=submittedRows.findIndex(r=>r.id===row.id);
    const revision=currentDef?.key==='vida_plan'&&row.status==='SUBMITTED'?`Plan v${submittedRows.length-submittedIndex}`:`v${currentVersion.version}`;
    return `<div class="submission-row"><div><b>${row.status==='SUBMITTED'?'Fullført':'Utkast'}</b><small>${reviewFormatDate(row.submitted_at||row.updated_at||row.created_at)}</small></div><div class="submission-actions"><span class="pill">${revision}</span>${row.status==='SUBMITTED'?`<button type="button" class="ghost compact" data-review-submission="${row.id}">Se fullført</button>`:''}</div></div>`;
  }).join('');
  list.querySelectorAll('[data-review-submission]').forEach(button=>button.addEventListener('click',async()=>{const row=reviewRows.find(x=>x.id===button.dataset.reviewSubmission);if(row)await renderSubmissionReview(row,{focused:true})}));

  const params=new URLSearchParams(location.search),wanted=params.get('submission');
  const autoLatest=params.get('latest')==='1';
  const vidaLatest=currentDef?.key==='vida_plan'&&!currentDraft&&!wanted&&!autoLatest;
  const autoKey=`${currentVersion.id}:${$('#participantSelect').value}:${$('#pilotSelect').value}:${wanted||autoLatest||vidaLatest}`;
  if(lastAutoReviewKey===autoKey)return;
  const row=wanted?reviewRows.find(x=>x.id===wanted&&x.status==='SUBMITTED'):autoLatest?reviewRows.find(x=>x.status==='SUBMITTED'):vidaLatest?reviewRows.find(x=>x.status==='SUBMITTED'):null;
  if(row){lastAutoReviewKey=autoKey;await renderSubmissionReview(row,{focused:true})}
  else setFocusedReview(false);
}

const baseLoadSubmissions=loadSubmissions;
loadSubmissions=async function(){
  await baseLoadSubmissions();
  await enhanceSubmissionHistory();
};

const baseJourneySave=save;
save=async function(status){
  const key=currentDef?.key,own=ownParticipant(),participant=selectedParticipant();
  await baseJourneySave(status);
  const msg=$('#formMessage')?.textContent||'';
  if(status!=='SUBMITTED'||!(msg.startsWith('Skjema fullført')||msg.startsWith('Skjema fullført og skrivebeskyttet')))return;
  if(!isStaff()&&own&&participant?.id===own.id&&key==='via_roadmap'){
    let box=document.querySelector('#participantFormHandoff');
    if(!box){box=document.createElement('div');box.id='participantFormHandoff';box.className='preview-strip';$('#dynamicForm')?.insertAdjacentElement('afterend',box)}
    box.innerHTML='<strong>Veikartet er sendt videre.</strong> VÍA-ansvarlig går nå gjennom retning, ressurser, beredskap og VIDA-broen sammen med deg før en eventuell formell GO/NO-GO. Du trenger ikke «godkjenne deg selv». <a href="./">Tilbake til min reise</a>';
  }
  if(!isStaff()&&own&&participant?.id===own.id&&key==='participant_agreement'){
    let box=document.querySelector('#participantFormHandoff');
    if(!box){box=document.createElement('div');box.id='participantFormHandoff';box.className='preview-strip';$('#dynamicForm')?.insertAdjacentElement('afterend',box)}
    box.innerHTML='<strong>Avtalen og kontaktvalgene dine er bekreftet.</strong> Programansvarlig kontrollerer nå avtale, beredskap og eventuelle vilkår før samlet Pilot-GO. Du trenger ikke gjøre noe mer her nå, og dette betyr ikke at SER har startet. <a href="./">Tilbake til min reise</a>';
  }
};

})();
