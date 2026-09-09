(()=>{
'use strict';

const UAT_FOLLOWUP_VERSION='2026-09-09a';
const MOBILE_BREAKPOINT=780;
let phaseFilter='ALL',taskPhaseFilter='ALL',sosChecked=false;
const PHASES=[['ALL','Alle'],['VÍA','VÍA'],['SER','SER'],['VIDA','VIDA'],['ny VÍA','ny VÍA']];

function mainPortal(){return !!document.querySelector('#mainNav')}
function mobile(){return window.innerWidth<=MOBILE_BREAKPOINT}
function staff(){try{return typeof isStaff==='function'&&isStaff()}catch{return false}}
function roles(){try{return [...new Set((accessGrants||[]).filter(activeGrant).map(g=>String(g.role_code||'')))]}catch{return[]}}
function phaseOf(p){try{return stageLabel(p?.stage||'VIA')}catch{const s=String(p?.stage||'VIA').toUpperCase();return s==='NEW_VIA'?'ny VÍA':s==='SER'?'SER':s==='VIDA'?'VIDA':'VÍA'}}
function phaseClass(p){return p==='SER'?'ser':p==='VIDA'?'vida':p==='ny VÍA'?'new-via':'via'}
function visibleParticipants(){try{return Array.isArray(participants)?participants:[]}catch{return[]}}
function visibleTasks(){try{return Array.isArray(tasks)?tasks:[]}catch{return[]}}
function byLabel(label){return [...document.querySelectorAll('.sidebar .nav-item')].filter(item=>(item.querySelector('b')?.textContent||'').trim()===label)}
function escapeSafe(v=''){try{return escapeHtml(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}

function addStyles(){
 if(document.querySelector('#uat-followup-style'))return;
 const style=document.createElement('style');style.id='uat-followup-style';style.textContent=`
  .uat-primary-hidden{display:none!important}
  .uat-phase-strip{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:12px 0}
  .uat-phase-bubble{appearance:none;border:1px solid rgba(18,63,61,.16);background:#fffdf8;border-radius:999px;padding:7px 10px;min-height:34px;display:inline-flex;align-items:center;gap:7px;font:inherit;font-weight:750;color:#193c3a;cursor:pointer}
  .uat-phase-bubble strong{min-width:22px;height:22px;border-radius:999px;display:inline-grid;place-items:center;background:#e7ece9;font-size:12px}
  .uat-phase-bubble.active{border-color:#17685e;box-shadow:0 0 0 2px rgba(23,104,94,.08)}
  .uat-phase-bubble.phase-via strong{background:#f1e9d6;color:#604b22}.uat-phase-bubble.phase-ser strong{background:#e3efed;color:#123f3d}.uat-phase-bubble.phase-vida strong{background:#e6edf4;color:#173852}.uat-phase-bubble.phase-new-via strong{background:#f1edf4;color:#523e55}
  .participant-card .uat-phase-pill{margin-left:auto;margin-right:4px;border:1px solid rgba(18,63,61,.18);font-weight:800}
  .participant-card[data-uat-phase-hidden="1"],.task-row[data-uat-phase-hidden="1"]{display:none!important}
  .uat-more-row{display:flex;justify-content:flex-end;margin-top:10px}.uat-more-button{min-width:0!important;padding:8px 14px!important}
  .uat-more-menu{margin-top:10px;border-top:1px solid rgba(18,63,61,.12);padding-top:10px;display:grid;gap:8px}
  .uat-more-menu.hidden{display:none!important}.uat-more-menu .ghost,.uat-more-menu a{width:100%;justify-content:center;text-align:center;text-decoration:none}
  #profileAccessSummary.uat-access-action{position:relative}.uat-access-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .uat-sos-badge{background:#b4433f!important;color:#fff!important}
  @media(max-width:780px){
    .sidebar .nav-item.uat-mobile-secondary:not(.uat-sos-primary){display:none!important}
    .sidebar nav{scroll-padding-inline:0!important}
    .uat-phase-strip{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;scrollbar-width:none}.uat-phase-strip::-webkit-scrollbar{display:none}.uat-phase-bubble{white-space:nowrap;flex:0 0 auto}
  }
 `;document.head.appendChild(style);
}

function normalizePrimaryNav(){
 byLabel('Interesse / VÍA').forEach(item=>item.classList.add('uat-primary-hidden'));
 const mobileSecondary=new Set(['Slik fungerer det','Hjelp & SOS','Analyse','Skjema & rutiner','Administrasjon','Varsler','Revisjon','Rolleintroduksjon','Rolleintro','Demo-reise (LAB)','Mini CRM','Mine dokumenter','Dokumenter','Ansvar / eiere','Operativ dag','Operativ i dag']);
 for(const item of document.querySelectorAll('.sidebar .nav-item')){
   const label=(item.querySelector('b')?.textContent||'').trim();
   item.classList.toggle('uat-mobile-secondary',mobileSecondary.has(label)&&!item.classList.contains('uat-sos-primary'));
 }
}

function ensureProfileTools(){
 if(!mainPortal())return;
 const tools=document.querySelector('#profileToolsSummary .profile-tool-links');
 if(tools){
   const seen=[...tools.querySelectorAll('a')].map(a=>(a.textContent||'').trim());
   if(!seen.includes('Hjelp & SOS'))tools.insertAdjacentHTML('beforeend','<a class="ghost compact" href="./sos.html">Hjelp & SOS</a>');
   const r=roles();if(r.some(x=>['system_admin','program_lead','via_owner','clinical_professional'].includes(x))&&!seen.includes('Mottak / interesse'))tools.insertAdjacentHTML('beforeend','<a class="ghost compact" href="./intake.html">Mottak / interesse</a>');
 }
 const access=document.querySelector('#profileAccessSummary');if(!access)return;
 access.classList.add('uat-access-action');
 let links=access.querySelector('.uat-access-links');if(!links){links=document.createElement('div');links.className='uat-access-links';access.appendChild(links)}
 const isAdmin=roles().includes('system_admin');
 const linkHtml=isAdmin?'<a class="ghost compact" href="./admin.html#accessList">Administrer roller →</a>':'<a class="ghost compact" href="./onboarding.html">Se rollebeskrivelser →</a>';if(links.dataset.sig!==linkHtml){links.dataset.sig=linkHtml;links.innerHTML=linkHtml}
}

function phaseCounts(){
 const counts={'VÍA':0,'SER':0,'VIDA':0,'ny VÍA':0};
 for(const p of visibleParticipants()){const ph=phaseOf(p);if(ph in counts)counts[ph]++}
 return counts;
}
function phaseButtons(active='ALL',context='participants'){
 const counts=phaseCounts();
 return PHASES.map(([value,label])=>{
   const count=value==='ALL'?visibleParticipants().length:(counts[value]||0);
   const cls=value==='ALL'?'':` phase-${phaseClass(value)}`;
   return `<button type="button" class="uat-phase-bubble${cls}${active===value?' active':''}" data-uat-phase="${escapeSafe(value)}" data-uat-context="${context}"><span>${escapeSafe(label)}</span><strong>${count}</strong></button>`;
 }).join('');
}
function bindPhaseButtons(host){
 host?.querySelectorAll('[data-uat-phase]').forEach(button=>button.addEventListener('click',()=>{
   const value=button.dataset.uatPhase||'ALL',context=button.dataset.uatContext||'participants';
   if(context==='tasks'){taskPhaseFilter=value;decorateTasks();return}
   phaseFilter=value;
   if(context==='overview'&&typeof show==='function')show('participants');
   decorateParticipants();
 }));
}
function ensureOverviewPhases(){
 if(!mainPortal()||!staff())return;
 const hero=document.querySelector('#view-overview .hero-panel');if(!hero)return;
 let host=document.querySelector('#overviewPhaseStrip');if(!host){host=document.createElement('div');host.id='overviewPhaseStrip';host.className='uat-phase-strip';hero.insertAdjacentElement('afterend',host)}
 const html=phaseButtons(phaseFilter,'overview');if(host.dataset.sig!==html){host.dataset.sig=html;host.innerHTML=html;bindPhaseButtons(host)}
}
function ensureParticipantPhases(){
 if(!mainPortal()||!staff())return;
 const head=document.querySelector('#view-participants .section-head > div');if(!head)return;
 let host=document.querySelector('#participantPhaseFilter');if(!host){host=document.createElement('div');host.id='participantPhaseFilter';host.className='uat-phase-strip';host.setAttribute('aria-label','Filtrer deltakere etter fase');head.appendChild(host)}
 const html=phaseButtons(phaseFilter,'participants');if(host.dataset.sig!==html){host.dataset.sig=html;host.innerHTML=html;bindPhaseButtons(host)}
}
function ensureTaskPhases(){
 if(!mainPortal()||!staff())return;
 const row=document.querySelector('#view-tasks .task-filter-row');if(!row)return;
 let host=document.querySelector('#taskPhaseFilter');if(!host){host=document.createElement('div');host.id='taskPhaseFilter';host.className='uat-phase-strip';row.insertAdjacentElement('afterend',host)}
 const html=phaseButtons(taskPhaseFilter,'tasks');if(host.dataset.sig!==html){host.dataset.sig=html;host.innerHTML=html;bindPhaseButtons(host)}
}
function decorateParticipants(){
 if(!mainPortal()||!staff())return;ensureParticipantPhases();ensureOverviewPhases();
 for(const card of document.querySelectorAll('#participantList .participant-card')){
   const code=card.querySelector('b')?.textContent?.trim(),p=visibleParticipants().find(x=>x.code_name===code);if(!p)continue;
   const ph=phaseOf(p);card.dataset.uatPhaseHidden=phaseFilter!=='ALL'&&ph!==phaseFilter?'1':'0';
   let pill=card.querySelector('.uat-phase-pill');if(!pill){pill=document.createElement('span');pill.className='pill uat-phase-pill';card.appendChild(pill)}pill.textContent=ph;
 }
 const filtered=visibleParticipants().filter(p=>phaseFilter==='ALL'||phaseOf(p)===phaseFilter);
 if(phaseFilter!=='ALL'&&!filtered.some(p=>p.id===selectedParticipantId))selectedParticipantId=filtered[0]?.id||null;
 addParticipantMore();
}
function decorateTasks(){
 if(!mainPortal()||!staff())return;ensureTaskPhases();
 const taskById=new Map(visibleTasks().map(t=>[String(t.id),t]));
 for(const row of document.querySelectorAll('#taskList .task-row')){
   const task=taskById.get(String(row.dataset.taskId||'')),p=task?visibleParticipants().find(x=>x.id===task.participant_id):null,ph=p?phaseOf(p):null;
   row.dataset.uatPhaseHidden=taskPhaseFilter!=='ALL'&&ph!==taskPhaseFilter?'1':'0';
 }
}

function canManualTask(){return roles().some(r=>['system_admin','program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].includes(r))}
function canOwners(){return roles().some(r=>['system_admin','project_owner','program_lead','via_owner','clinical_professional','vida_owner'].includes(r))}
function ensureManualDialog(){
 let dialog=document.querySelector('#uatManualTaskDialog');if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.id='uatManualTaskDialog';dialog.className='task-dialog';
 dialog.innerHTML='<form class="dialog-shell" id="uatManualTaskForm"><div class="dialog-head"><div><p class="eyebrow">Manuell oppgave</p><h2>Opprett enkelt oppfølgingspunkt</h2></div><button class="icon-btn" type="button" data-close aria-label="Lukk">×</button></div><label><span>Tittel</span><input id="uatManualTitle" maxlength="120" required placeholder="Kort og konkret"></label><label><span>Notat (valgfritt)</span><textarea id="uatManualNote" rows="3" maxlength="800" placeholder="Kun nødvendig arbeidsinformasjon"></textarea></label><label><span>Frist (valgfritt)</span><input id="uatManualDue" type="datetime-local"></label><div class="dialog-actions"><button class="primary" type="submit">Opprett</button><button class="ghost" type="button" data-close>Avbryt</button></div><p id="uatManualMessage" class="message"></p></form>';
 document.body.appendChild(dialog);dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.querySelector('#uatManualTaskForm').addEventListener('submit',async e=>{e.preventDefault();const pid=dialog.dataset.participantId,title=dialog.querySelector('#uatManualTitle').value.trim(),note=dialog.querySelector('#uatManualNote').value.trim(),raw=dialog.querySelector('#uatManualDue').value;const msg=dialog.querySelector('#uatManualMessage');if(!pid||title.length<3){msg.textContent='Skriv en kort tittel.';return}msg.textContent='Oppretter…';const dueAt=raw?new Date(raw).toISOString():null;const {data,error}=await client.functions.invoke('manual-task-command',{body:{participantId:pid,title,note:note||null,dueAt}});if(error||data?.error){msg.textContent='Oppgaven kunne ikke opprettes med din tilgang.';return}msg.textContent='Oppgave opprettet.';dialog.close();try{await loadPortal()}catch{} });
 return dialog;
}
function openManualTask(pid){const d=ensureManualDialog();d.dataset.participantId=pid;d.querySelector('#uatManualTaskForm').reset();d.querySelector('#uatManualMessage').textContent='';d.showModal()}
function addParticipantMore(){
 if(!mainPortal()||!staff())return;const detail=document.querySelector('#participantDetail'),pid=String(selectedParticipantId||'');if(!detail||!pid||!visibleParticipants().some(p=>String(p.id)===pid))return;
 let row=detail.querySelector('.uat-more-row');if(!row){row=document.createElement('div');row.className='uat-more-row';row.innerHTML='<button type="button" class="ghost compact uat-more-button">Mer</button>';detail.appendChild(row)}
 let menu=detail.querySelector('.uat-more-menu');if(!menu){menu=document.createElement('div');menu.className='uat-more-menu hidden';detail.appendChild(menu)}
 const items=[];if(canOwners())items.push(`<a class="ghost" href="./owners.html?participant=${encodeURIComponent(pid)}">Ansvar / eiere</a>`);if(canManualTask())items.push('<button type="button" class="ghost" data-manual-task>Opprett manuell oppgave</button>');
 if(!items.length){row.remove();menu.remove();return}const html=items.join('');if(menu.dataset.sig!==html){menu.dataset.sig=html;menu.innerHTML=html;menu.querySelector('[data-manual-task]')?.addEventListener('click',()=>openManualTask(pid))}row.querySelector('button').onclick=()=>menu.classList.toggle('hidden');
}

function naturalAdminOwnerLink(){
 if(!/\/admin\.html$/.test(location.pathname))return;
 const link=[...document.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')==='./owners.html'||a.dataset.uatOwnerShortcut==='1');if(!link)return;
 link.dataset.uatOwnerShortcut='1';if(link.getAttribute('href')!=='./#participants')link.href='./#participants';if(link.textContent!=='Velg deltaker')link.textContent='Velg deltaker';
 const card=link.closest('.panel-card');const p=card?.querySelector('h2')?.nextElementSibling;const copy='Velg først deltakeren i portalen. Åpne deretter «Mer» → «Ansvar / eiere» for akkurat den deltakeren.';if(p&&p.textContent!==copy)p.textContent=copy;
}

async function refreshSosNav(){
 if(!mainPortal()||sosChecked)return;sosChecked=true;
 const sos=byLabel('Hjelp & SOS')[0];if(!sos)return;
 const own=typeof ownParticipant==='function'?ownParticipant():null;
 if(!staff()){
   const showPrimary=own&&phaseOf(own)==='SER';sos.classList.toggle('uat-mobile-secondary',!showPrimary);sos.classList.toggle('uat-sos-primary',!!showPrimary);return;
 }
 const r=roles();if(!r.some(x=>['ser_lead','logistics','program_lead'].includes(x))){sos.classList.add('uat-mobile-secondary');return}
 try{
   const {data,error}=await client.functions.invoke('sos-command',{body:{action:'LIST_ACTIVE'}});if(error||data?.error)throw error||new Error(data?.error);
   const count=(data?.events||[]).length;if(count>0){sos.classList.remove('uat-mobile-secondary','nav-mobile-secondary','nav-ia-demoted','hidden');sos.classList.add('uat-sos-primary');let badges=sos.querySelector('.nav-badges');if(!badges){badges=document.createElement('i');badges.className='nav-badges';sos.appendChild(badges)}badges.innerHTML=`<span class="nav-count uat-sos-badge" aria-label="${count} aktive SOS-hendelser">${count}</span>`}else{sos.classList.remove('uat-sos-primary');sos.classList.add('uat-mobile-secondary')}
 }catch{sos.classList.remove('uat-sos-primary');sos.classList.add('uat-mobile-secondary')}
}

function apply(){addStyles();normalizePrimaryNav();naturalAdminOwnerLink();if(mainPortal()){ensureProfileTools();ensureOverviewPhases();ensureParticipantPhases();ensureTaskPhases();decorateParticipants();decorateTasks();addParticipantMore();refreshSosNav()}}

if(mainPortal()){
 if(typeof renderParticipants==='function'){const base=renderParticipants;renderParticipants=function(){const out=base();setTimeout(()=>{decorateParticipants();addParticipantMore()},0);return out}}
 if(typeof renderParticipantDetail==='function'){const base=renderParticipantDetail;renderParticipantDetail=function(){const out=base();setTimeout(addParticipantMore,0);return out}}
 if(typeof renderTaskLists==='function'){const base=renderTaskLists;renderTaskLists=function(){const out=base();setTimeout(decorateTasks,0);return out}}
}
const observer=new MutationObserver(()=>{window.clearTimeout(observer._t);observer._t=window.setTimeout(apply,20)});observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('resize',apply,{passive:true});window.addEventListener('pageshow',()=>setTimeout(apply,30));document.addEventListener('aidme:portal-rendered',()=>setTimeout(()=>{sosChecked=false;apply()},0));document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));
[0,120,350,800,1500].forEach(ms=>setTimeout(apply,ms));
})();
