(()=>{
'use strict';

const activeTaskStorageKey='aidme.portal.activeTask';
function storedTaskId(){try{return sessionStorage.getItem(activeTaskStorageKey)||''}catch{return''}}
function rememberTask(id){try{if(id)sessionStorage.setItem(activeTaskStorageKey,id)}catch{}}
function forgetTask(){try{sessionStorage.removeItem(activeTaskStorageKey)}catch{}}

function taskReturnParams(){
  const q=new URLSearchParams(location.search);
  return{taskId:q.get('returnTask')||storedTaskId(),view:q.get('returnView')||'tasks'};
}
function decorateTaskFormLinks(){
  if(!selectedTaskId)return;
  document.querySelectorAll('#taskDialog a[href*="form-runner.html"]').forEach(a=>{
    const u=new URL(a.getAttribute('href'),location.href);
    u.searchParams.set('returnTask',selectedTaskId);
    u.searchParams.set('returnView','tasks');
    a.href=`${u.pathname}${u.search}`;
  });
}

document.addEventListener('click',event=>{
  const a=event.target.closest?.('#taskDialog a[href*="form-runner.html"]');
  if(!a||!selectedTaskId)return;
  const u=new URL(a.getAttribute('href'),location.href);
  u.searchParams.set('returnTask',selectedTaskId);
  u.searchParams.set('returnView','tasks');
  a.href=`${u.pathname}${u.search}`;
},true);

document.querySelector('#taskDialog')?.addEventListener('close',forgetTask);

const returnContextOpenTask=openTask;
openTask=function(id){
  returnContextOpenTask(id);
  if((tasks||[]).some(t=>t.id===id))rememberTask(id);
  decorateTaskFormLinks();
};

let returnContextResumed=false;
function resumeTaskContext(){
  if(returnContextResumed)return;
  const {taskId,view}=taskReturnParams();
  if(!taskId||!(tasks||[]).some(t=>t.id===taskId))return;
  returnContextResumed=true;
  show(view==='tasks'?'tasks':'overview');
  openTask(taskId);
  const clean=new URL(location.href);
  clean.searchParams.delete('returnTask');
  clean.searchParams.delete('returnView');
  history.replaceState({},'',`${clean.pathname}${clean.search}${clean.hash}`);
}

const returnContextRenderAll=renderAll;
renderAll=function(){
  returnContextRenderAll();
  setTimeout(resumeTaskContext,0);
};
setTimeout(resumeTaskContext,220);

})();
