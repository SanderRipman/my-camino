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
  try{
    sessionStorage.setItem(AUTH_RETURN_KEY,JSON.stringify({target,createdAt:Date.now()}));
    return true;
  }catch{return false}
}
function leaveForAuthentication(){
  if(authContinuityRedirecting)return;
  authContinuityRedirecting=true;
  armExactReturn();
  location.replace('./');
}
async function verifySessionStillPresent(){
  if(authContinuityRedirecting)return;
  try{
    const {data:{session}}=await client.auth.getSession();
    if(!session)leaveForAuthentication();
  }catch{}
}

// Logout is shared by Supabase across portal tabs, while this return intent remains
// scoped to the exact tab through sessionStorage. This keeps old portal tabs from
// overwriting the form that the user was actually working in.
client.auth.onAuthStateChange((event,nextSession)=>{
  if(event==='SIGNED_OUT'||!nextSession)leaveForAuthentication();
});

// Mobile browsers can throttle or discard background tabs. Re-check when the user
// comes back so a missed cross-tab auth event still restores the exact form target.
window.addEventListener('focus',()=>setTimeout(verifySessionStillPresent,0));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(verifySessionStillPresent,0)});
window.addEventListener('pageshow',()=>setTimeout(verifySessionStillPresent,0));
})();
