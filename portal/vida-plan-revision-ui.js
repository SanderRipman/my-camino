(()=>{
'use strict';

let vidaRevisionScheduled=false;

function vidaRevisionRows(){
  return [...document.querySelectorAll('#submissionList .submission-row')]
    .filter(row=>row.querySelector('b')?.textContent?.trim()==='Fullført');
}

function latestVidaRevision(){
  const first=vidaRevisionRows()[0];
  const pill=first?.querySelector('.pill')?.textContent||'';
  const match=pill.match(/Plan\s+v(\d+)/i);
  if(match)return Number(match[1]);
  const count=vidaRevisionRows().length;
  return count||null;
}

function vidaTaskReturnHref(){
  const q=new URLSearchParams(location.search);
  const returnTask=q.get('returnTask');
  if(!returnTask)return null;
  const out=new URLSearchParams({returnTask,returnView:q.get('returnView')||'tasks'});
  return`./?${out.toString()}`;
}

function bindVidaReviewReturn(){
  if(document.documentElement.dataset.vidaReviewReturnBound==='1')return;
  document.documentElement.dataset.vidaReviewReturnBound='1';
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#closeSubmissionReview');
    if(!button||typeof currentDef==='undefined'||currentDef?.key!=='vida_plan')return;
    const href=vidaTaskReturnHref();
    if(!href)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(href);
  },true);
}

function resetVidaRevisionLabel(){
  const versionBox=document.querySelector('.form-version');
  const label=versionBox?.querySelector('span');
  const value=document.querySelector('#versionLabel');
  if(label?.textContent==='Planversjon')label.textContent='Versjon';
  if(value?.title?.startsWith('Skjemamal v'))value.removeAttribute('title');
}

function applyVidaRevisionUi(){
  if(typeof currentDef==='undefined'||currentDef?.key!=='vida_plan'){
    resetVidaRevisionLabel();
    return;
  }
  const revision=latestVidaRevision();
  if(!revision)return;

  const versionBox=document.querySelector('.form-version');
  const label=versionBox?.querySelector('span');
  const value=document.querySelector('#versionLabel');
  if(label&&label.textContent!=='Planversjon')label.textContent='Planversjon';
  if(value){
    const next=`v${revision}`;
    if(value.textContent!==next)value.textContent=next;
    if(typeof currentVersion!=='undefined'&&currentVersion?.version)value.title=`Skjemamal v${currentVersion.version}`;
  }

  const history=document.querySelector('#submissionList')?.closest('.panel-card');
  const eyebrow=history?.querySelector('.eyebrow');
  if(eyebrow&&eyebrow.textContent!=='Planversjoner')eyebrow.textContent='Planversjoner';

  const rows=vidaRevisionRows();
  rows.forEach((row,index)=>{
    const pill=row.querySelector('.pill');
    if(!pill)return;
    const match=pill.textContent.match(/Plan\s+v(\d+)/i);
    const n=match?match[1]:String(rows.length-index);
    const text=index===0?`Gjeldende · Plan v${n}`:`Plan v${n}`;
    if(pill.textContent!==text)pill.textContent=text;
  });
}

function scheduleVidaRevisionUi(){
  if(vidaRevisionScheduled)return;
  vidaRevisionScheduled=true;
  requestAnimationFrame(()=>{
    vidaRevisionScheduled=false;
    applyVidaRevisionUi();
  });
}

function installVidaRevisionUi(){
  bindVidaReviewReturn();

  const vidaRevisionBaseLoadSubmissions=loadSubmissions;
  loadSubmissions=async function(...args){
    const result=await vidaRevisionBaseLoadSubmissions.apply(this,args);
    scheduleVidaRevisionUi();
    return result;
  };

  const vidaRevisionBaseChooseForm=chooseForm;
  chooseForm=async function(...args){
    const result=await vidaRevisionBaseChooseForm.apply(this,args);
    scheduleVidaRevisionUi();
    return result;
  };

  window.addEventListener('pageshow',scheduleVidaRevisionUi);
  document.addEventListener('aidme:portal-rendered',scheduleVidaRevisionUi);
  setTimeout(scheduleVidaRevisionUi,0);
  setTimeout(scheduleVidaRevisionUi,240);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installVidaRevisionUi,{once:true});
else installVidaRevisionUi();
})();
