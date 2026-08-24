(()=>{
'use strict';

function taskReturnParams(){
  const q=new URLSearchParams(location.search);
  return{taskId:q.get('returnTask'),view:q.get('returnView')||'tasks'};
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

const returnContextOpenTask=openTask;
openTask=function(id){
  returnContextOpenTask(id);
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
