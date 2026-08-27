(()=>{
'use strict';

const RETURN_KEY='aidme:return-intent:v1';
const path=location.pathname;
const query=new URLSearchParams(location.search);
const isSpecificForm=path.endsWith('/form-runner.html')&&(query.has('key')||query.has('participant')||query.has('pilot')||query.has('returnTask'));
if(!isSpecificForm)return;

const target=`${location.pathname}${location.search}${location.hash}`;
try{
  sessionStorage.setItem(RETURN_KEY,JSON.stringify({target,createdAt:Date.now()}));
}catch{}
})();
