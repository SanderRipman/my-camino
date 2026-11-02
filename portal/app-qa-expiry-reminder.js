(()=>{
'use strict';
// Display-only reminder: the protected QA Edge Function remains the sole source of expiry.
// No credential, grant, MFA, user or notification-table writes are performed here.
const WARNING_WINDOW_MS=3*24*60*60*1000;
const REFRESH_MS=30*60*1000;
let checkedAt=0,inFlight=false,currentUserId='',expiry=null;

function authorizedAdmin(){
  try{return Boolean(session?.user?.id&&typeof hasRole==='function'&&hasRole('system_admin'))}
  catch{return false}
}
function ensureShortcut(){
  // Also handles a previously cached workday-chrome.js until its CSS/JS cache expires.
  const host=document.querySelector('#profileToolsSummary .profile-tool-links');
  const existing=host?.querySelector('[data-qa-expiry-shortcut="1"]');
  if(!authorizedAdmin()){existing?.remove();return}
  if(!host||host.querySelector('a[href="./qa-role-pack.html"]'))return;
  const a=document.createElement('a');
  a.className='ghost compact';
  a.href='./qa-role-pack.html';
  a.textContent='QA-tilganger';
  a.dataset.qaExpiryShortcut='1';
  host.appendChild(a);
}
function removeNotice(){
  document.querySelector('#qaExpiryProfileNotice')?.remove();
  document.querySelector('#qaExpiryOverviewNotice')?.remove();
}
function addNotice(host,id,heading,message){
  if(!host)return;
  let note=document.getElementById(id);
  if(!note){note=document.createElement('div');note.id=id;note.className='qa-expiry-reminder';note.setAttribute('role','status');note.style.cssText='margin-top:12px;padding:12px 14px;border-left:3px solid #ac7f36;border-radius:8px;background:#faf6ea;color:#193d3a';host.appendChild(note)}
  note.replaceChildren();
  const title=document.createElement('strong');title.textContent=heading;note.appendChild(title);
  const detail=document.createElement('p');detail.style.cssText='margin:6px 0';detail.textContent=message;note.appendChild(detail);
  const link=document.createElement('a');link.href='./qa-role-pack.html';link.textContent='Åpne QA-tilganger';link.className='ghost compact';note.appendChild(link);
}
function render(){
  ensureShortcut();
  if(!authorizedAdmin()||currentUserId!==session?.user?.id||!expiry){removeNotice();return}
  const remaining=expiry.getTime()-Date.now();
  if(!Number.isFinite(remaining)||remaining>WARNING_WINDOW_MS){removeNotice();return}
  const stamp=expiry.toLocaleString('nb-NO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const elapsed=remaining<=0;
  const heading=elapsed?'QA-testrollene har utløpt':'QA-testrollene utløper innen 3 dager';
  const message=elapsed?'Siste registrerte sluttdato var '+stamp+'. Forny via autorisert administratorflyt.':'Tilgangene utløper '+stamp+'. Forny dem før fristen for å unngå avbrudd i testing.';
  addNotice(document.getElementById('profileToolsSummary'),'qaExpiryProfileNotice',heading,message);
  const overview=document.getElementById('view-overview');
  if(overview){
    let host=document.getElementById('qaExpiryOverviewHost');
    if(!host){host=document.createElement('div');host.id='qaExpiryOverviewHost';overview.insertBefore(host,overview.firstChild)}
    addNotice(host,'qaExpiryOverviewNotice',heading,message);
  }
}
async function check(){
  if(!authorizedAdmin()){expiry=null;currentUserId='';checkedAt=0;removeNotice();return}
  const uid=session.user.id;
  if(currentUserId!==uid){currentUserId=uid;checkedAt=0;expiry=null;removeNotice()}
  render();
  if(inFlight||Date.now()-checkedAt<REFRESH_MS)return;
  inFlight=true;
  let verifiedMfa=false;
  try{
    const {data:level,error:levelError}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if(levelError||level?.currentLevel!=='aal2'){expiry=null;return}
    verifiedMfa=true;
    const {data,error}=await client.functions.invoke('qa-renew-role-pack',{body:{action:'preview'}});
    if(error||data?.ok!==true||!data.hasPack||!data.expiresAt){expiry=null;return}
    const value=new Date(data.expiresAt);
    expiry=Number.isFinite(value.getTime())?value:null;
  }catch{expiry=null}
  finally{checkedAt=verifiedMfa?Date.now():0;inFlight=false;render()}
}
document.addEventListener('aidme:portal-rendered',()=>{render();void check()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();void check()}});
window.addEventListener('pageshow',()=>{render();void check()});
[0,160,750,1700].forEach(delay=>window.setTimeout(render,delay));
window.setInterval(()=>{if(!document.hidden){render();void check()}},REFRESH_MS);
})();