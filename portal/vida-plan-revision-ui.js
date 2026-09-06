(()=>{
'use strict';

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

function applyVidaRevisionUi(){
  if(typeof currentDef==='undefined'||currentDef?.key!=='vida_plan')return;
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

function observeVidaRevisionUi(){
  const target=document.querySelector('#runner')||document.body;
  const observer=new MutationObserver(()=>queueMicrotask(applyVidaRevisionUi));
  observer.observe(target,{subtree:true,childList:true,characterData:true});
  applyVidaRevisionUi();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeVidaRevisionUi,{once:true});
else observeVidaRevisionUi();
})();
