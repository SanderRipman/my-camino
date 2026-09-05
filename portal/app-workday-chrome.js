(()=>{
'use strict';

const WORKDAY_CHROME_VERSION='2026-09-05b';
const MOBILE_BREAKPOINT=780;
const ROLE_LABELS={
  system_admin:'Systemadministrator',project_owner:'Prosjekteier',program_lead:'Programleder',
  via_owner:'VÍA-eier',clinical_professional:'Fagperson',ser_lead:'SER-/turleder',
  logistics:'Logistikk',vida_owner:'VIDA-eier',observer:'Observatør',evaluator:'Evaluator'
};

function mobile(){return window.innerWidth<=MOBILE_BREAKPOINT}
function mainPortal(){return !!document.querySelector('#mainNav')}
function safeActiveRoles(){
  try{
    if(!Array.isArray(accessGrants)||typeof activeGrant!=='function')return[];
    return [...new Set(accessGrants.filter(activeGrant).map(g=>String(g.role_code||'')).filter(Boolean))];
  }catch{return[]}
}
function cleanNonFinalChrome(){
  const auth=document.querySelector('#authView');
  const authEyebrow=auth?.querySelector('.eyebrow');
  if(authEyebrow&&/beta/i.test(authEyebrow.textContent||''))authEyebrow.textContent='Sikker portal';
  auth?.querySelector('.preview-note')?.remove();
  document.querySelectorAll('.demo-note').forEach(el=>el.remove());
  document.querySelectorAll('#appView .preview-strip').forEach(el=>{if(/^Beta:/i.test((el.textContent||'').trim()))el.remove()});
  document.querySelectorAll('.demo-lens-control,.demo-lens-banner').forEach(el=>el.classList.add('workday-dev-ui'));
}
function ensureProfileAccessSummary(){
  if(!mainPortal())return;
  const host=document.querySelector('#view-settings .settings-grid');if(!host)return;
  let card=document.querySelector('#profileAccessSummary');
  if(!card){card=document.createElement('article');card.id='profileAccessSummary';card.className='panel-card';host.appendChild(card)}
  const roles=safeActiveRoles(),sig=roles.slice().sort().join('|');
  if(card.dataset.roleSig===sig)return;card.dataset.roleSig=sig;
  const labels=roles.map(r=>ROLE_LABELS[r]||r);
  card.innerHTML=`<h3>Tilgang og roller</h3><p class="privacy-note">${labels.length?'Aktive roller: '+labels.join(' · '):'Ingen aktiv arbeidsrolle er synlig ennå.'}</p><p class="privacy-note">Tilgang følger rolle, mandat og konkret deltaker-/pilotomfang. Utvidet tilgang skal være begrunnet og godkjent – ikke gitt gjennom en skjult snarvei.</p>`;
}
function promoteProfileNav(){
  if(!mobile())return;
  if(document.documentElement.classList.contains('scope-pending'))return;
  const main=document.querySelector('#mainNav');
  if(main){
    const item=main.querySelector('.nav-item[data-view="settings"]');if(!item)return;
    item.classList.remove('nav-ia-demoted','hidden');
    const num=item.querySelector('.nav-num'),label=item.querySelector('b');if(num)num.textContent='P';if(label)label.textContent='Profil';
    if(main.lastElementChild!==item)main.appendChild(item);
    return;
  }
  const nav=document.querySelector('.app-shell .sidebar nav');if(!nav||nav.querySelector('.mobile-profile-link'))return;
  const a=document.createElement('a');a.className='nav-item mobile-profile-link';a.href='./#settings';
  a.innerHTML='<span class="nav-num">P</span><b>Profil</b>';nav.appendChild(a);
}
function shortHomeReminder(){
  if(!mobile()||!mainPortal())return;
  const intro=document.querySelector('#view-overview #homeIntro');if(!intro)return;
  const roles=safeActiveRoles(),operational=['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].filter(r=>roles.includes(r));
  let text='Prioriter neste konkrete handling.';
  if(operational.length>1)text='Prioriter kritisk/forfalt, deretter neste gate.';
  else if(roles.includes('ser_lead')||roles.includes('logistics'))text='Rute, dagsform og trygg tilpasning først.';
  else if(roles.includes('vida_owner'))text='Neste handling, eier og 72t · 14 · 30 · 90.';
  else if(roles.includes('via_owner')||roles.includes('clinical_professional'))text='Retning, ressurser, trygghet og neste gate.';
  else if(roles.includes('program_lead'))text='Neste gate, ansvar og frist.';
  else if(roles.includes('project_owner')||roles.includes('observer')||roles.includes('evaluator'))text='Status, porter og aggregert læring.';
  if(intro.textContent!==text)intro.textContent=text;
}
function apply(){
  document.documentElement.classList.toggle('workday-mobile',mobile());
  document.documentElement.dataset.workdayChrome=WORKDAY_CHROME_VERSION;
  cleanNonFinalChrome();ensureProfileAccessSummary();promoteProfileNav();shortHomeReminder();
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
[0,180,420,900].forEach(delay=>window.setTimeout(apply,delay));

})();
