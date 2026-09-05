(()=>{
'use strict';

const WORKDAY_CHROME_VERSION='2026-09-05g';
const MOBILE_BREAKPOINT=780;
const ROLE_LABELS={
  system_admin:'Systemadministrator',project_owner:'Prosjekteier',program_lead:'Programleder',
  via_owner:'VÍA-eier',clinical_professional:'Fagperson',ser_lead:'SER-/turleder',
  logistics:'Logistikk',vida_owner:'VIDA-eier',observer:'Observatør',evaluator:'Evaluator'
};
const MOBILE_SECONDARY_LABELS=new Set([
  'Analyse','Dokumenter','Mine filer','Mine dokumenter','Skjema & rutiner','Varsler','Revisjon',
  'Rolleintro','Rolleintroduksjon','Demo-reise','Demo-reise (LAB)','Administrasjon','Mini CRM'
]);

function mobile(){return window.innerWidth<=MOBILE_BREAKPOINT}
function mainPortal(){return !!document.querySelector('#mainNav')}
function safeActiveRoles(){
  try{
    if(!Array.isArray(accessGrants)||typeof activeGrant!=='function')return[];
    return [...new Set(accessGrants.filter(activeGrant).map(g=>String(g.role_code||'')).filter(Boolean))];
  }catch{return[]}
}
function ensureMobileAttention(){
  if(!mobile()||!mainPortal())return;
  const workspace=document.querySelector('#appView .workspace');if(!workspace)return;
  let bar=document.querySelector('#mobileAttentionBar');
  if(!bar){bar=document.createElement('div');bar.id='mobileAttentionBar';bar.className='mobile-attention-bar';const firstView=workspace.querySelector('.view');if(firstView)workspace.insertBefore(bar,firstView);else workspace.appendChild(bar)}
  else{const firstView=workspace.querySelector('.view');if(firstView&&bar.parentElement===workspace&&bar.nextElementSibling!==firstView)workspace.insertBefore(bar,firstView)}
  try{if(typeof updateMobileAttention==='function')updateMobileAttention()}catch{}
}
function cleanNonFinalChrome(){
  const auth=document.querySelector('#authView');const authEyebrow=auth?.querySelector('.eyebrow');
  if(authEyebrow&&/beta/i.test(authEyebrow.textContent||''))authEyebrow.textContent='Sikker portal';
  auth?.querySelector('.preview-note')?.remove();
  document.querySelectorAll('.demo-note').forEach(el=>el.remove());
  document.querySelectorAll('#appView .preview-strip').forEach(el=>{if(/^Beta:/i.test((el.textContent||'').trim()))el.remove()});
  document.querySelectorAll('.demo-lens-control,.demo-lens-banner').forEach(el=>el.classList.add('workday-dev-ui'));
}
function addToolLink(items,seen,label,href,show=true){
  if(!show||seen.has(label))return;seen.add(label);items.push(`<a class="ghost compact" href="${href}">${label}</a>`)
}
function secondaryToolLinks(roles){
  const items=[],seen=new Set();
  if(roles.length)addToolLink(items,seen,'Analyse','./#analysis');
  addToolLink(items,seen,'Skjema & rutiner','./#forms');
  addToolLink(items,seen,'Mine dokumenter','./documents.html');
  addToolLink(items,seen,'Varsler','./notifications.html');
  addToolLink(items,seen,'Slik fungerer det','./guide.html');
  addToolLink(items,seen,'Rolleintroduksjon','./onboarding.html');
  const demo=document.querySelector('#demoJourneyNav');addToolLink(items,seen,'Demo-reise (LAB)','./demo-journey.html',!!demo&&!demo.classList.contains('hidden'));
  const audit=document.querySelector('#auditNav');addToolLink(items,seen,'Revisjon','./audit.html',!!audit&&!audit.classList.contains('hidden'));
  const admin=document.querySelector('#adminLink');addToolLink(items,seen,'Administrasjon','./admin.html',roles.includes('system_admin')||!!admin&&!admin.classList.contains('hidden'));
  const crm=document.querySelector('#crmNav');addToolLink(items,seen,'Mini CRM','./crm.html',!!crm&&!crm.classList.contains('hidden'));
  return items.join('');
}
function ensureProfileCards(){
  if(!mainPortal())return;
  const view=document.querySelector('#view-settings'),host=view?.querySelector('.settings-grid');if(!view||!host)return;
  const roles=safeActiveRoles(),sig=roles.slice().sort().join('|');
  let access=document.querySelector('#profileAccessSummary');if(!access){access=document.createElement('article');access.id='profileAccessSummary';access.className='panel-card profile-access-card';host.appendChild(access)}
  let tools=document.querySelector('#profileToolsSummary');if(!tools){tools=document.createElement('article');tools.id='profileToolsSummary';tools.className='panel-card profile-tools-card';host.appendChild(tools)}
  const labels=roles.map(r=>ROLE_LABELS[r]||r);
  if(access.dataset.roleSig!==sig){access.dataset.roleSig=sig;access.innerHTML=`<p class="eyebrow">Tilgang</p><h3>Tilgang og roller</h3><p class="privacy-note">${labels.length?'Aktive roller: '+labels.join(' · '):'Ingen aktiv arbeidsrolle er synlig ennå.'}</p><p class="privacy-note">Tilgang følger rolle, mandat og konkret deltaker-/pilotomfang. Forespørsel om utvidet tilgang skal være begrunnet, godkjent og loggført.</p>`}
  const toolHtml=secondaryToolLinks(roles);if(tools.dataset.toolSig!==toolHtml){tools.dataset.toolSig=toolHtml;tools.innerHTML=`<p class="eyebrow">Snarveier</p><h3>Verktøy og snarveier</h3><div class="profile-tool-links" aria-label="Verktøy og snarveier">${toolHtml}</div>`}
  let logout=document.querySelector('#profileLogoutSummary');if(!logout){logout=document.createElement('article');logout.id='profileLogoutSummary';logout.className='panel-card profile-logout-card';logout.innerHTML='<p class="eyebrow">Konto</p><h3>Avslutt økten</h3><button type="button" class="profile-logout-button">Logg ut</button>';view.appendChild(logout);logout.querySelector('button')?.addEventListener('click',()=>document.querySelector('#logout')?.click())}
}
function existingProfileItem(nav){
  return [...(nav?.querySelectorAll?.('.nav-item')||[])].find(item=>{
    const label=item.querySelector('b')?.textContent?.trim();const href=item.getAttribute('href')||'';
    return label==='Profil'||item.dataset?.view==='settings'||href.includes('#settings');
  })||null;
}
function promoteProfileNav(){
  if(!mobile())return;if(document.documentElement.classList.contains('scope-pending'))return;
  const main=document.querySelector('#mainNav');
  if(main){
    const item=main.querySelector('.nav-item[data-view="settings"]');if(!item)return;
    item.classList.remove('nav-ia-demoted','nav-mobile-secondary','hidden');
    const label=item.querySelector('b');if(label)label.textContent='Profil';
    if(main.lastElementChild!==item)main.appendChild(item);
    [...main.querySelectorAll('.nav-item')].filter(x=>x!==item&&x.querySelector('b')?.textContent?.trim()==='Profil').forEach(x=>x.remove());
    return;
  }
  const nav=document.querySelector('.app-shell .sidebar nav,.sidebar nav');if(!nav||existingProfileItem(nav))return;
  const a=document.createElement('a');a.className='nav-item mobile-profile-link';a.href='./#settings';a.innerHTML='<span class="nav-num">P</span><b>Profil</b>';nav.appendChild(a);
}
function enforceStableMobilePrimaryNav(){
  if(!mobile()||!mainPortal())return;
  const nav=document.querySelector('#mainNav');if(!nav)return;
  const profile=nav.querySelector('.nav-item[data-view="settings"]');
  for(const item of nav.querySelectorAll('.nav-item')){
    if(item===profile)continue;
    const label=item.querySelector('b')?.textContent?.trim()||'';
    if(MOBILE_SECONDARY_LABELS.has(label))item.classList.add('nav-mobile-secondary');
  }
  const profiles=[...nav.querySelectorAll('.nav-item')].filter(item=>item.querySelector('b')?.textContent?.trim()==='Profil');profiles.slice(1).forEach(item=>item.remove());
}
function overviewHasRecentData(){
  try{if(!Array.isArray(checkins)||!checkins.length)return false;const cutoff=Date.now()-30*86400000;return checkins.some(row=>{const t=new Date(row.checkin_date||row.created_at||0).getTime();return Number.isFinite(t)&&t>=cutoff})}catch{return false}
}
function ensureOverviewDataState(){
  if(!mainPortal())return;const canvas=document.querySelector('#overviewChart'),legend=document.querySelector('#overviewLegend'),card=canvas?.closest('.panel-card');if(!canvas||!card)return;
  let state=document.querySelector('#overviewDataState');if(!state){state=document.createElement('div');state.id='overviewDataState';state.className='overview-data-state hidden';state.setAttribute('role','status');canvas.insertAdjacentElement('beforebegin',state)}
  const hasData=overviewHasRecentData();card.classList.toggle('overview-no-data',!hasData);state.classList.toggle('hidden',hasData);canvas.classList.toggle('hidden',!hasData);legend?.classList.toggle('hidden',!hasData);
  if(!hasData)state.innerHTML='<strong>Mangler data</strong><span>Det er ingen registrerte målinger de siste 30 dagene ennå.</span>';
}
function polishNorwegianUiTerms(){
  const root=document.querySelector('#appView')||document.body;if(!root)return;
  const replacements=[
    [/\bNeste gate\b/g,'Neste avklaring'],[/\bneste gate\b/g,'neste avklaring'],
    [/\bgatekontroll\b/gi,'sluttkontroll'],[/\bbeslutningsgaten\b/gi,'beslutningspunktet'],[/\bbeslutningsgate\b/gi,'beslutningspunkt'],
    [/\bPilot-GO-gaten\b/g,'Pilot-GO-beslutningen'],[/\bservergaten\b/gi,'serverkontrollen'],
    [/\bgaten\b/gi,'beslutningspunktet'],[/\bgate\b/gi,'beslutningspunkt']
  ];
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;if(!p||['SCRIPT','STYLE','CODE','PRE'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return /gate/i.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){let text=node.nodeValue||'';for(const [re,to] of replacements)text=text.replace(re,to);if(text!==node.nodeValue)node.nodeValue=text}
}
function shortHomeReminder(){
  if(!mobile()||!mainPortal())return;
  const intro=document.querySelector('#view-overview #homeIntro');if(!intro)return;
  const roles=safeActiveRoles(),operational=['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].filter(r=>roles.includes(r));
  let text='Prioriter neste konkrete handling.';
  if(operational.length>1)text='Prioriter kritisk/forfalt, deretter avklaringer og neste beslutningspunkt.';
  else if(roles.includes('ser_lead')||roles.includes('logistics'))text='Rute, dagsform og trygg tilpasning først.';
  else if(roles.includes('vida_owner'))text='Neste handling, eier og 72t · 14 · 30 · 90.';
  else if(roles.includes('via_owner')||roles.includes('clinical_professional'))text='Retning, ressurser, trygghet og neste beslutningspunkt.';
  else if(roles.includes('program_lead'))text='Neste beslutningspunkt, ansvar og frist.';
  else if(roles.includes('project_owner')||roles.includes('observer')||roles.includes('evaluator'))text='Status, beslutningspunkter og aggregert læring.';
  if(intro.textContent!==text)intro.textContent=text;
}
function apply(){
  document.documentElement.classList.toggle('workday-mobile',mobile());document.documentElement.dataset.workdayChrome=WORKDAY_CHROME_VERSION;
  ensureMobileAttention();cleanNonFinalChrome();ensureProfileCards();promoteProfileNav();enforceStableMobilePrimaryNav();ensureOverviewDataState();polishNorwegianUiTerms();shortHomeReminder();
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule,{passive:true});window.addEventListener('pageshow',schedule);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});document.addEventListener('aidme:portal-rendered',schedule);document.addEventListener('aidme:navigation-normalized',schedule);
[0,180,420,900,1500].forEach(delay=>window.setTimeout(apply,delay));
})();
