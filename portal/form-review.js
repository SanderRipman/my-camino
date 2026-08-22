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
function ensureReviewPanel(){
  let panel=document.querySelector('#submissionReviewPanel');
  if(panel)return panel;
  panel=document.createElement('article');
  panel.id='submissionReviewPanel';
  panel.className='panel-card hidden';
  document.querySelector('#submissionList')?.closest('.panel-card')?.insertAdjacentElement('afterend',panel);
  return panel;
}
function agreementReviewNext(){
  if(!isStaff()||currentDef?.key!=='participant_agreement')return'';
  const pilot=selectedPilot();
  const href=pilot?.id?`./form-runner.html?key=pilot_go&pilot=${encodeURIComponent(pilot.id)}`:'./#tasks';
  return `<div class="preview-strip pre-ser-review-next"><strong>Neste formelle gate:</strong> Lukk avtale-review og eventuelle individuelle vilkår før samlet Pilot-GO. Deltakeravtalen er dokumentasjon og beredskap – ikke SER-start.<div class="form-actions"><a class="ghost" href="./#tasks">Til oppgaver</a><a class="primary" href="${href}">${pilot?.id?'Åpne samlet Pilot-GO':'Tilbake til oppgaver'}</a></div></div>`;
}
function renderSubmissionReview(row){
  const panel=ensureReviewPanel();if(!panel||!currentVersion)return;
  const sections=currentVersion.schema_json?.sections||[];
  const body=sections.map(sec=>`<section class="form-section review-section"><h3>${esc(sec.title||'Del')}</h3><div class="dynamic-grid">${(sec.fields||[]).map(field=>`<div class="field-wrap${['textarea','action','multi_select'].includes(field.type)?' full':''}"><label><span>${esc(field.label||field.key)}</span><div class="review-value">${esc(reviewValue(row.payload?.[field.key]))}</div></label></div>`).join('')}</div></section>`).join('');
  panel.innerHTML=`<div class="card-head"><div><p class="eyebrow">Fullført · skrivebeskyttet</p><h2>${esc(currentDef?.title_no||'Skjema')}</h2><p>${reviewFormatDate(row.submitted_at||row.updated_at||row.created_at)} · v${currentVersion.version}</p></div><button id="closeSubmissionReview" class="ghost" type="button">Lukk visning</button></div><p class="privacy-note">Dette er den lagrede versjonen. Formell beslutning tas i riktig senere gate; et fullført skjema kan ikke redigeres her.</p>${body}${agreementReviewNext()}`;
  panel.classList.remove('hidden');
  panel.querySelector('#closeSubmissionReview')?.addEventListener('click',()=>{panel.classList.add('hidden');panel.innerHTML='';});
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}
async function fetchReviewRows(){
  if(!currentVersion)return[];
  const participantId=$('#participantSelect').value||null,pilotId=selectedPilot()?.id||null;
  let q=client.from('form_submissions').select('id,participant_id,pilot_id,form_version_id,submitted_by,status,submitted_at,created_at,updated_at,payload').eq('form_version_id',currentVersion.id).order('created_at',{ascending:false}).limit(20);
  q=participantId?q.eq('participant_id',participantId):q.is('participant_id',null);
  q=pilotId?q.eq('pilot_id',pilotId):q.is('pilot_id',null);
  const {data,error}=await q;if(error)return[];return data||[];
}
async function enhanceSubmissionHistory(){
  reviewRows=await fetchReviewRows();
  const list=$('#submissionList');if(!list)return;
  if(!reviewRows.length){list.innerHTML='<p>Ingen registreringer for denne konteksten ennå.</p>';return}
  list.innerHTML=reviewRows.map(row=>`<div class="submission-row"><div><b>${row.status==='SUBMITTED'?'Fullført':'Utkast'}</b><small>${reviewFormatDate(row.submitted_at||row.updated_at||row.created_at)}</small></div><div class="submission-actions"><span class="pill">v${currentVersion.version}</span>${row.status==='SUBMITTED'?`<button type="button" class="ghost compact" data-review-submission="${row.id}">Se fullført</button>`:''}</div></div>`).join('');
  list.querySelectorAll('[data-review-submission]').forEach(button=>button.addEventListener('click',()=>{const row=reviewRows.find(x=>x.id===button.dataset.reviewSubmission);if(row)renderSubmissionReview(row)}));

  const params=new URLSearchParams(location.search),wanted=params.get('submission');
  const autoLatest=params.get('latest')==='1';
  const autoKey=`${currentVersion.id}:${$('#participantSelect').value}:${$('#pilotSelect').value}:${wanted||autoLatest}`;
  if(lastAutoReviewKey===autoKey)return;
  const row=wanted?reviewRows.find(x=>x.id===wanted&&x.status==='SUBMITTED'):autoLatest?reviewRows.find(x=>x.status==='SUBMITTED'):null;
  if(row){lastAutoReviewKey=autoKey;renderSubmissionReview(row)}
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
  if(status!=='SUBMITTED'||!msg.startsWith('Skjema fullført'))return;
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
