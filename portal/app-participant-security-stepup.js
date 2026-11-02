(()=>{
'use strict';
const RETURN_KEY='aidme:participant-protected-target:v1';
let applying=false,scheduled=false;
function participant(){try{return typeof isStaff==='function'&&!isStaff()&&typeof ownParticipant==='function'&&!!ownParticipant()}catch{return false}}
function aal2(){try{return assurance?.currentLevel==='aal2'}catch{return false}}
function rememberTarget(href){try{sessionStorage.setItem(RETURN_KEY,href)}catch{}}
function takeTarget(){try{const href=sessionStorage.getItem(RETURN_KEY);if(href)sessionStorage.removeItem(RETURN_KEY);return href||''}catch{return''}}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;apply()},0)}
function securityCard(){
  const view=document.querySelector('#view-security'),grid=view?.querySelector('.settings-grid');if(!view||!grid||!participant())return;
  let card=document.querySelector('#participantSecurityChoice');
  if(!card){card=document.createElement('article');card.id='participantSecurityChoice';card.className='panel-card participant-security-choice';grid.insertBefore(card,grid.firstChild)}
  const sig=aal2()?'aal2':'aal1';if(card.dataset.sig===sig)return;card.dataset.sig=sig;
  if(aal2()){
    card.innerHTML='<p class="eyebrow">Sikker bekreftelse</p><h3>Identiteten din er bekreftet</h3><p>Du kan fortsette til beskyttede personlige steg i denne økten.</p>';
    return;
  }
  card.innerHTML=`<p class="eyebrow">Sikker bekreftelse</p><h3>Bekreft identiteten din når det trengs</h3><p>Dette skjemaet krever ekstra identitetsbekreftelse. <strong>Authenticator fungerer nå.</strong> BankID er planlagt som et valgfritt alternativ, men leverandørkoblingen er ennå ikke aktiv og kan ikke brukes til innlogging.</p><div class="participant-security-actions"><button class="primary" type="button" data-aidme-authenticator-choice>Fortsett med Authenticator</button><a class="ghost link-btn" href="./bankid-auth-test.html?source=participant-security">BankID · se status</a></div><p class="privacy-note">Bekreftelse gir aldri nye roller eller bredere personinnsyn. Etter vellykket tofaktor fortsetter du til skjemaet du forsøkte å åpne.</p>`;
  card.querySelector('[data-aidme-authenticator-choice]')?.addEventListener('click',()=>{
    const verified=document.querySelector('#startChallenge'),enroll=document.querySelector('#startMfa');
    const target=!verified?.classList.contains('hidden')?verified:enroll;target?.scrollIntoView({block:'center',behavior:'smooth'});target?.focus();
  });
}
function removePrematureSecurityTask(){
  if(!participant()||aal2())return;
  document.querySelectorAll('[data-participant-action-view="security"]').forEach(el=>el.remove());
  try{
    const snap=window.aidmeParticipantAttentionSnapshot?.();if(!snap?.security)return;
    const cards=[...document.querySelectorAll('#view-overview .metric-grid .metric')];
    const set=(i,v)=>{const strong=cards[i]?.querySelector('strong'),next=String(v);if(strong&&strong.textContent!==next)strong.textContent=next};
    set(0,Math.max(0,Number(snap.total||0)-1));
    set(1,(snap.red||[]).filter(x=>x.kind!=='security').length);
  }catch{}
}
function resumeProtectedTarget(){
  if(!participant()||!aal2())return;const href=takeTarget();if(!href)return;
  try{const u=new URL(href,location.href);if(u.origin===location.origin&&u.pathname.endsWith('/portal/form-runner.html'))location.assign(u.href)}catch{}
}
function apply(){
  if(applying)return;applying=true;
  try{
    if(!participant()){const card=document.querySelector('#participantSecurityChoice');if(card)card.remove();return}
    securityCard();removePrematureSecurityTask();resumeProtectedTarget();
  }finally{applying=false}
}

document.addEventListener('click',event=>{
  if(!participant()||aal2())return;const link=event.target.closest?.('a[href*="form-runner.html"]');if(!link)return;
  let u;try{u=new URL(link.href,location.href)}catch{return}if(u.origin!==location.origin)return;
  event.preventDefault();event.stopPropagation();rememberTarget(u.href);document.querySelector('#taskDialog')?.close();if(typeof show==='function')show('security');schedule();
},{capture:true});

const host=document.querySelector('#appView');if(host)new MutationObserver(schedule).observe(host,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',schedule);document.addEventListener('aidme:navigation-normalized',schedule);
window.addEventListener('pageshow',()=>setTimeout(schedule,50));setTimeout(schedule,300);
})();
