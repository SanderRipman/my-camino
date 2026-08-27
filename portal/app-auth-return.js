(()=>{
'use strict';

const AUTH_RETURN_KEY='aidme:return-intent:v1';
const AUTH_RETURN_MAX_AGE_MS=30*60*1000;
let authReturnBusy=false;

function readAuthReturnIntent(){
  try{
    const raw=sessionStorage.getItem(AUTH_RETURN_KEY);if(!raw)return null;
    const value=JSON.parse(raw),target=String(value?.target||''),createdAt=Number(value?.createdAt||0);
    if(!target.startsWith('/portal/')||target.startsWith('//')||!createdAt||Date.now()-createdAt>AUTH_RETURN_MAX_AGE_MS){sessionStorage.removeItem(AUTH_RETURN_KEY);return null}
    return{target,createdAt};
  }catch{try{sessionStorage.removeItem(AUTH_RETURN_KEY)}catch{}return null}
}
function clearAuthReturnIntent(){try{sessionStorage.removeItem(AUTH_RETURN_KEY)}catch{}}
function ensureAuthReturnNotice(){
  const host=document.querySelector('#view-security');if(!host||host.querySelector('#authReturnNotice'))return;
  const box=document.createElement('article');box.id='authReturnNotice';box.className='preview-strip';
  box.innerHTML='<strong>Fortsett der du slapp.</strong> Bekreft Authenticator. Når tofaktor er godkjent, går du tilbake til oppgaven/skjemaet du åpnet.<div class="form-actions"><button id="cancelAuthReturn" class="ghost" type="button">Avbryt og bli her</button></div>';
  host.prepend(box);
  box.querySelector('#cancelAuthReturn')?.addEventListener('click',()=>{clearAuthReturnIntent();box.remove()});
}
async function maybeResumeAuthReturn({routeToSecurity=true}={}){
  if(authReturnBusy)return false;
  const intent=readAuthReturnIntent();if(!intent)return false;
  authReturnBusy=true;
  try{
    const {data:{session:currentSession}}=await client.auth.getSession();if(!currentSession)return false;
    const {data}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if(data?.currentLevel==='aal2'){
      clearAuthReturnIntent();
      location.replace(intent.target);
      return true;
    }
    if(routeToSecurity&&document.querySelector('#appView')&&!document.querySelector('#appView')?.classList.contains('hidden')){
      show('security');
      ensureAuthReturnNotice();
    }
    return false;
  }finally{authReturnBusy=false}
}

const authReturnRenderAll=renderAll;
renderAll=function(){
  authReturnRenderAll();
  setTimeout(()=>maybeResumeAuthReturn(),0);
};

const authReturnVerifyExistingFactor=verifyExistingFactor;
verifyExistingFactor=async function(code){
  await authReturnVerifyExistingFactor(code);
  await maybeResumeAuthReturn({routeToSecurity:false});
};

const authReturnVerifyEnrollment=verifyEnrollment;
verifyEnrollment=async function(code){
  await authReturnVerifyEnrollment(code);
  await maybeResumeAuthReturn({routeToSecurity:false});
};

client.auth.onAuthStateChange(()=>setTimeout(()=>maybeResumeAuthReturn(),80));
setTimeout(()=>maybeResumeAuthReturn(),250);
})();
