(()=>{
'use strict';

const AUTH_RETURN_KEY='aidme:return-intent:v1';
let authContinuityRedirecting=false;

function exactProtectedFormTarget(){
  const query=new URLSearchParams(location.search);
  const specific=location.pathname.endsWith('/form-runner.html')&&(query.has('key')||query.has('participant')||query.has('pilot')||query.has('returnTask'));
  return specific?`${location.pathname}${location.search}${location.hash}`:null;
}
function armExactReturn(){
  const target=exactProtectedFormTarget();
  if(!target)return false;
  try{sessionStorage.setItem(AUTH_RETURN_KEY,JSON.stringify({target,createdAt:Date.now()}));return true}catch{return false}
}
function leaveForAuthentication(){
  if(authContinuityRedirecting)return;authContinuityRedirecting=true;armExactReturn();location.replace('./');
}
async function verifySessionStillPresent(){
  if(authContinuityRedirecting)return;
  try{const {data:{session}}=await client.auth.getSession();if(!session)leaveForAuthentication()}catch{}
}
function polishSecurityChoice(){
  const blocked=document.querySelector('#blocked'),text=document.querySelector('#blockedText'),link=blocked?.querySelector('a.primary');if(!blocked||!text||blocked.classList.contains('hidden'))return;
  if(/Authenticator|tofaktor|AAL2/i.test(text.textContent||''))text.textContent='Dette steget krever ekstra sikkerhetsbekreftelse. Gå til Sikkerhet og bruk metoden som er tilgjengelig for kontoen din.';
  if(link){link.href='./#security';link.textContent='Velg sikker bekreftelse'}
}

client.auth.onAuthStateChange((event,nextSession)=>{if(event==='SIGNED_OUT'||!nextSession)leaveForAuthentication()});
window.addEventListener('focus',()=>setTimeout(verifySessionStillPresent,0));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(verifySessionStillPresent,0)});
window.addEventListener('pageshow',()=>{setTimeout(verifySessionStillPresent,0);setTimeout(polishSecurityChoice,0)});
const blocked=document.querySelector('#blocked');if(blocked)new MutationObserver(()=>setTimeout(polishSecurityChoice,0)).observe(blocked,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
setTimeout(polishSecurityChoice,200);
})();
