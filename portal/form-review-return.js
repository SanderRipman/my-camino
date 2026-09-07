(()=>{
'use strict';

function taskReturnHref(){
  const q=new URLSearchParams(location.search),task=q.get('returnTask');
  if(!task)return'';
  const out=new URLSearchParams({returnTask:task,returnView:q.get('returnView')||'tasks'});
  return`./?${out.toString()}`;
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('#closeSubmissionReview');
  if(!button)return;
  const href=taskReturnHref();
  if(!href)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.href=href;
},true);
})();
