(()=>{
'use strict';

const VERSION='2026-09-25b';
const ALIASES=Object.freeze({
  'DEMO-VIA-01':'Ingrid Demo','DEMO-SER-02':'Martin Demo','DEMO-VIDA-03':'Eva Demo','QA-ROLE-VIA-01':'Daniel Demo',
  'DEMO-STRESS-SER':'Sofia Demo','DEMO-STRESS-GO':'Henrik Demo','DEMO-STRESS-VIDA':'Aisha Demo','DEMO-SHOW-KARI':'Kari Demo','DEMO-STRESS-NYVIA':'Thomas Demo'
});
const INTERESTS=Object.freeze([
  {id:'demo-nora',name:'Nora Demo',channel:'E-post',state:'Ny interesse',text:'Ønsker retning tilbake mot arbeid etter en periode med lav motivasjon. Trives med praktiske oppgaver, tydelige mål og fellesskap.',next:'Foreslå en kort VÍA-samtale og avklar motivasjon, praktiske rammer og realistisk neste steg.'},
  {id:'demo-amalie',name:'Amalie Demo',channel:'E-post',state:'Trenger avklaring',text:'Har mistet tydelig arbeidsretning etter flere skifter og ønsker et strukturert før–under–etter-løp.',next:'Avklar hva hun ønsker å endre hjemme, og om VÍA bør starte med arbeid, aktivitet eller hverdagsstruktur.'},
  {id:'demo-markus',name:'Markus Demo',channel:'Telefon',state:'Praktisk avklaring',text:'Ønsker tydeligere rytme og arbeidsretning, men trenger fleksibilitet dersom en etappe blir for krevende.',next:'Avklar trygg tilpasning, transportalternativ og forventning om at pause/tilpasning er legitimt.'},
  {id:'demo-elias',name:'Elias Demo',channel:'E-post',state:'Ny interesse',text:'Har god arbeidskapasitet, men lite erfaring med lengre vandringer.',next:'Avklar realistisk fysisk forberedelse, bagasje og hva som må være på plass før individuell GO/NO-GO.'},
  {id:'demo-jonas',name:'Jonas Demo',channel:'Telefon',state:'Trenger avklaring',text:'Er motivert for endring, men har flere praktiske forhold hjemme som må avklares før en lengre reise.',next:'Kartlegg praktiske bindinger og vurder om tidspunktet er riktig eller om neste steg bør utsettes.'},
  {id:'demo-selma',name:'Selma Demo',channel:'E-post',state:'Orientering',text:'Ønsker å utforske programmet, men er usikker på om tidspunktet passer.',next:'Gi kort informasjon og avklar om hun ønsker VÍA-samtale nå, senere eller avslutning uten videre oppfølging.'}
]);
let installed=false,snapCache=null,snapPromise=null,taskFocus='ALL',lastTaskPaint=0,lastAnalysisKick=0,lastOverviewKick=0,analysisStableHits=0,lastView='';

function demoOrigin(){const h=location.hostname;return h==='demo.aidme.no'||h==='mycamino-demo.netlify.app'||h.endsWith('--mycamino-demo.netlify.app')}
function eligible(){try{return demoOrigin()&&typeof hasRole==='function'&&hasRole('system_admin')}catch{return false}}
function esc(v=''){try{return typeof escapeHtml==='function'?escapeHtml(v):String(v??'')}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}
function alias(code){return ALIASES[String(code||'').trim()]||String(code||'Demo-deltaker')}
function stage(v){const s=String(v||'VIA').toUpperCase();return s==='SER'?'SER':s==='VIDA'?'VIDA':s==='NEW_VIA'?'NEW_VIA':'VIA'}
function stageLabel(v){return v==='VIA'?'VÍA':v==='NEW_VIA'?'ny VÍA':v}
function owner(v){return v==='SER'?'SER-/turleder':v==='VIDA'?'VIDA-eier':v==='NEW_VIA'?'VÍA-ansvarlig / programleder':'VÍA-ansvarlig / fagperson'}
function fmtDate(v){if(!v)return'Ingen frist';try{return new Intl.DateTimeFormat('nb-NO',{day:'numeric',month:'short',year:'numeric'}).format(new Date(v))}catch{return String(v)}}
function fmtTime(v){if(!v)return'–';try{return new Intl.DateTimeFormat('nb-NO',{hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return String(v)}}
function openStatus(s){return['OPEN','IN_PROGRESS','WAITING'].includes(String(s||'').toUpperCase())}
function tone(t){const overdue=openStatus(t?.status)&&t?.due_at&&new Date(t.due_at)<new Date();const sev=String(t?.severity||'GREEN').toUpperCase();return sev==='RED'||overdue?'RED':sev==='YELLOW'?'YELLOW':'GREEN'}
function statusLabel(s){return({OPEN:'Åpen',IN_PROGRESS:'I gang',WAITING:'Venter',DONE:'Ferdig'})[String(s||'').toUpperCase()]||String(s||'')}
function friendlyTitle(v){return String(v||'Oppgave').replace(/Ny interesse\s*[–-]\s*triage/gi,'Ny interesse – første avklaring')}

function style(){
 if(document.querySelector('#demo-showcase-safe-style'))return;
 const s=document.createElement('style');s.id='demo-showcase-safe-style';s.textContent=`
 html.aidme-demo-showcase-safe #overviewDataState{display:none!important}
 html.aidme-demo-showcase-safe #mainNav .nav-item[data-view="checkin"]{display:flex!important;visibility:visible!important;pointer-events:auto!important}
 html.aidme-demo-showcase-safe #mainNav .nav-item[data-view="checkin"].nav-mobile-secondary,html.aidme-demo-showcase-safe #mainNav .nav-item[data-view="checkin"].nav-ia-demoted{display:flex!important}
 #view-analysis.demo-safe-pending{position:relative;min-height:520px}
 #view-analysis.demo-safe-pending .analysis-card{opacity:0!important;pointer-events:none!important}
 #view-analysis.demo-safe-pending:after{content:'Klargjør analyse…';position:absolute;left:18px;right:18px;top:118px;padding:18px;border:1px solid #d8d5cb;border-radius:16px;background:#fffdf8;color:#526268;font-weight:750;text-align:center;z-index:3}
 #view-tasks .demo-safe-task-note{padding:10px 12px;border:1px solid rgba(200,164,93,.42);border-radius:13px;background:rgba(200,164,93,.08);font-size:12px;line-height:1.45;color:#566469;margin-bottom:12px}
 #view-tasks .demo-safe-phase-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:17px 2px 7px;padding-bottom:6px;border-bottom:1px solid #e2ded5;color:#123f3d}
 #view-tasks .demo-safe-phase-head b{font-size:14px}#view-tasks .demo-safe-phase-head span{font-size:10px;color:#718084}
 #view-overview .metric[data-demo-safe-focus]{cursor:pointer;outline:none}#view-overview .metric[data-demo-safe-focus]:focus-visible{box-shadow:0 0 0 3px rgba(200,164,93,.42)}
 #demoSafeInterestDialog{width:min(920px,calc(100vw - 24px));max-height:min(820px,calc(100vh - 24px));border:0;border-radius:22px;padding:0;background:#f9f6ee;color:#1d2b31;box-shadow:0 24px 80px rgba(0,0,0,.28)}
 #demoSafeInterestDialog::backdrop{background:rgba(10,26,28,.52);backdrop-filter:blur(2px)}
 .demo-safe-interest-shell{padding:22px}.demo-safe-interest-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}.demo-safe-interest-head h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,5vw,48px);line-height:1;margin:4px 0 8px;color:#14253a}.demo-safe-interest-head p{margin:0;color:#647277;line-height:1.4}
 .demo-safe-interest-grid{display:grid;grid-template-columns:minmax(230px,.8fr) minmax(0,1.4fr);gap:14px}.demo-safe-interest-list,.demo-safe-interest-detail{border:1px solid #d9d6cd;border-radius:17px;background:#fffdf8;padding:12px}.demo-safe-interest-list{display:grid;gap:7px;align-content:start;max-height:520px;overflow:auto}.demo-safe-interest-card{border:1px solid transparent;background:#f5f2ea;border-radius:13px;padding:11px;text-align:left;color:inherit}.demo-safe-interest-card.active{border-color:#2a6863;background:#eef5f2}.demo-safe-interest-card b,.demo-safe-interest-card small{display:block}.demo-safe-interest-card small{margin-top:3px;color:#6a787c}.demo-safe-interest-detail h3{font-family:Georgia,'Times New Roman',serif;font-size:28px;margin:4px 0 12px;color:#14253a}.demo-safe-interest-meta{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.demo-safe-interest-copy{line-height:1.55;color:#405056}.demo-safe-interest-next{margin-top:14px;padding:13px;border-radius:13px;background:#edf4f1;border:1px solid #d1e0db;color:#244946;line-height:1.45}.demo-safe-interest-footer{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
 @media(max-width:700px){#view-analysis.demo-safe-pending{min-height:560px}.demo-safe-interest-shell{padding:16px}.demo-safe-interest-grid{grid-template-columns:1fr}.demo-safe-interest-list{max-height:210px}.demo-safe-interest-head h2{font-size:34px}}
 `;document.head.appendChild(s)
}

async function snapshot(force=false){
 if(!eligible()||typeof client==='undefined')return null;if(snapCache&&!force)return snapCache;if(snapPromise)return snapPromise;
 snapPromise=(async()=>{const ids=Array.isArray(window.participants)?window.participants.map(p=>p.id).filter(Boolean):[];let r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}});if(r.error||r.data?.error){await client.functions.invoke('uat-overview-command',{body:{action:'ACTIVATE',reason:'Demovisning – stabil presentasjonsfullmakt på syntetiske data'}});r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}})}if(r.error||r.data?.error)throw new Error(r.data?.error||'UAT_SNAPSHOT_FAILED');snapCache=r.data;return snapCache})().finally(()=>{snapPromise=null});return snapPromise
}
function pmap(snap){return new Map((snap?.participants||[]).map(p=>[String(p.id),p]))}
function taskStage(t,map){return stage(map.get(String(t.participant_id))?.stage)}
function filterRows(rows,focus,map){if(focus==='RED')return rows.filter(t=>tone(t)==='RED');if(focus==='YELLOW')return rows.filter(t=>tone(t)==='YELLOW');if(['VIA','SER','VIDA','NEW_VIA'].includes(focus))return rows.filter(t=>taskStage(t,map)===focus);return rows}
function focusTitle(f){return f==='RED'?'Kritiske / forfalte demooppgaver':f==='YELLOW'?'Demooppgaver som trenger avklaring':f==='VIA'?'VÍA-oppgaver':f==='SER'?'SER-oppgaver':f==='VIDA'?'VIDA-oppgaver':f==='NEW_VIA'?'ny VÍA-oppgaver':'Åpne demooppgaver · alle faser'}
function filterButtons(){return[['ALL','Alle'],['RED','Kritisk / forfalt'],['YELLOW','Avklaring'],['VIA','VÍA'],['SER','SER'],['VIDA','VIDA'],['NEW_VIA','ny VÍA']].map(([v,l])=>`<button type="button" class="chip ${taskFocus===v?'active':''}" data-demo-safe-task-focus="${v}">${l}</button>`).join('')}
function taskRow(t,map){const p=map.get(String(t.participant_id)),ph=taskStage(t,map),tn=tone(t);return `<button type="button" class="task-row" data-showcase-task-id="${esc(t.id)}"><i class="task-dot ${tn}"></i><div><b>${esc(friendlyTitle(t.title))}</b><small>${esc(alias(p?.code_name))} · ${esc(stageLabel(ph))} · ordinært ansvar: ${esc(owner(ph))}</small></div><div class="task-meta"><span class="pill ${tn}">${esc(statusLabel(t.status))}</span><span class="pill">${esc(fmtDate(t.due_at))}</span></div></button>`}

async function paintTasks(focus=taskFocus){
 if(!eligible()||!document.querySelector('#view-tasks')?.classList.contains('active'))return;taskFocus=focus;lastTaskPaint=Date.now();
 const list=document.querySelector('#taskList'),filters=document.querySelector('#view-tasks .task-filter-row'),heading=document.querySelector('#tasksHeading');if(!list||!filters)return;
 if(heading)heading.textContent=focusTitle(focus);filters.innerHTML=filterButtons();filters.querySelectorAll('[data-demo-safe-task-focus]').forEach(b=>b.addEventListener('click',()=>paintTasks(b.dataset.demoSafeTaskFocus)));
 list.innerHTML='<div class="demo-safe-task-note">Henter syntetiske demooppgaver…</div>';
 try{const snap=await snapshot(),map=pmap(snap);if(!snap)return;const all=(snap.tasks||[]).filter(t=>openStatus(t.status));const rows=filterRows(all,focus,map).sort((a,b)=>({VIA:0,SER:1,VIDA:2,NEW_VIA:3}[taskStage(a,map)]??9)-({VIA:0,SER:1,VIDA:2,NEW_VIA:3}[taskStage(b,map)]??9)||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));
  let html=`<div class="demo-safe-task-note"><strong>Demo-fullmakt:</strong> ${focus==='ALL'?'syntetiske oppgaver fra hele VÍA → SER → VIDA → ny VÍA.':'viser bare valgt kategori.'} Ordinære rollegrenser gjelder utenfor demospor. Fullmakt til ${esc(fmtTime(snap.expires_at))}.</div>`;let current='';
  for(const t of rows){const ph=taskStage(t,map);if(ph!==current){current=ph;html+=`<div class="demo-safe-phase-head"><b>${esc(stageLabel(ph))}</b><span>${rows.filter(x=>taskStage(x,map)===ph).length} oppgaver</span></div>`}html+=taskRow(t,map)}
  if(!rows.length)html+='<p class="empty-state">Ingen åpne syntetiske demooppgaver i dette utvalget.</p>';list.innerHTML=html;
 }catch(e){list.innerHTML='<div class="demo-safe-task-note">Kunne ikke hente demosettet akkurat nå. Gå tilbake til Oversikt og prøv igjen.</div>';console.warn('Demo safe task drilldown failed',e)}
}

function metricFocus(card){const id=card?.querySelector('strong')?.id||'';return id==='metricRed'?'RED':id==='metricYellow'?'YELLOW':id==='metricOpen'?'ALL':id==='metricParticipants'?'PARTICIPANTS':''}
function markMetrics(){for(const card of document.querySelectorAll('#view-overview .metric')){const f=metricFocus(card);if(!f)continue;card.dataset.demoSafeFocus=f;card.tabIndex=0;card.setAttribute('role','button')}}
function openMetric(f){if(f==='PARTICIPANTS'){show('participants');return}taskFocus=f;show('tasks');setTimeout(()=>paintTasks(f),40);setTimeout(()=>paintTasks(f),260)}

function ensureInterestDialog(){
 let d=document.querySelector('#demoSafeInterestDialog');if(d)return d;d=document.createElement('dialog');d.id='demoSafeInterestDialog';d.innerHTML='<div class="demo-safe-interest-shell"><header class="demo-safe-interest-head"><div><p class="eyebrow">Interesse · første avklaring</p><h2>Fra interesse til tydelig neste steg</h2><p>Syntetiske eksempler for demovisning. Interesse er ikke godkjenning.</p></div><button type="button" class="ghost" data-demo-safe-close>Lukk</button></header><div class="demo-safe-interest-grid"><div class="demo-safe-interest-list"></div><div class="demo-safe-interest-detail"></div></div></div>';document.body.appendChild(d);d.querySelector('[data-demo-safe-close]').addEventListener('click',()=>d.close());return d
}
function paintInterest(id){const d=ensureInterestDialog(),rows=d.querySelector('.demo-safe-interest-list'),detail=d.querySelector('.demo-safe-interest-detail');let selected=INTERESTS.find(x=>x.id===id)||INTERESTS[0];rows.innerHTML=INTERESTS.map(x=>`<button type="button" class="demo-safe-interest-card ${x.id===selected.id?'active':''}" data-demo-interest-id="${x.id}"><b>${esc(x.name)}</b><small>${esc(x.state)} · ${esc(x.channel)}</small></button>`).join('');rows.querySelectorAll('[data-demo-interest-id]').forEach(b=>b.addEventListener('click',()=>paintInterest(b.dataset.demoInterestId)));detail.innerHTML=`<p class="eyebrow">${esc(selected.state)}</p><h3>${esc(selected.name)}</h3><div class="demo-safe-interest-meta"><span class="pill">Foretrukket kontakt: ${esc(selected.channel)}</span><span class="pill">VÍA · før</span></div><p class="demo-safe-interest-copy">${esc(selected.text)}</p><div class="demo-safe-interest-next"><strong>Foreslått neste handling</strong><br>${esc(selected.next)}</div><div class="demo-safe-interest-footer"><span class="pill GREEN">VÍA-samtale</span><span class="pill YELLOW">Mer informasjon</span><span class="pill">Avslutte / senere</span></div>`}
function openInterests(id=''){const d=ensureInterestDialog();paintInterest(INTERESTS.some(x=>x.id===id)?id:'demo-nora');if(!d.open)d.showModal()}

function normalizeCheckin(){if(!eligible())return;const item=document.querySelector('#mainNav .nav-item[data-view="checkin"]');if(!item)return;item.classList.remove('hidden','nav-mobile-secondary','nav-ia-demoted');item.style.removeProperty('display');item.style.removeProperty('visibility')}
function pickerReady(){return !!document.querySelector('#analysisParticipants [data-demo-analysis-mode="PEOPLE"]')&&!!document.querySelector('#analysisChart')}
function stabilizeAnalysis(){
 const view=document.querySelector('#view-analysis');if(!view?.classList.contains('active')){analysisStableHits=0;view?.classList.remove('demo-safe-pending');return}
 if(pickerReady()){analysisStableHits++;if(analysisStableHits>=3)view.classList.remove('demo-safe-pending');return}
 analysisStableHits=0;view.classList.add('demo-safe-pending');const now=Date.now();if(now-lastAnalysisKick<650)return;lastAnalysisKick=now;window.AidMeDemoPresentationV2?.refresh?.()
}
function stabilizeOverview(){
 if(!document.querySelector('#view-overview')?.classList.contains('active'))return;markMetrics();const canvas=document.querySelector('#overviewChart'),legend=document.querySelector('#overviewLegend');const ready=canvas&&!canvas.classList.contains('hidden')&&legend&&legend.children.length>0;if(ready)return;const now=Date.now();if(now-lastOverviewKick<900)return;lastOverviewKick=now;window.AidMeDemoPresentationV2?.refresh?.()
}
function currentView(){return document.querySelector('#appView .view.active')?.id||''}
function tick(){
 if(!eligible())return;document.documentElement.classList.add('aidme-demo-showcase-safe');normalizeCheckin();const v=currentView();if(v!==lastView){lastView=v;if(v==='view-analysis'){document.querySelector('#view-analysis')?.classList.add('demo-safe-pending');analysisStableHits=0;lastAnalysisKick=0}else if(v==='view-overview'){lastOverviewKick=0}else if(v==='view-tasks'&&Date.now()-lastTaskPaint>800){setTimeout(()=>paintTasks(taskFocus),80)}}stabilizeAnalysis();stabilizeOverview();if(v==='view-tasks'&&taskFocus!=='ALL'&&Date.now()-lastTaskPaint>1400&&!document.querySelector('#taskList [data-demo-safe-task-focus]'))paintTasks(taskFocus)
}
function capture(e){
 if(!eligible())return;const metric=e.target.closest?.('#view-overview .metric[data-demo-safe-focus]');if(metric){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMetric(metric.dataset.demoSafeFocus);return}
 const a=e.target.closest?.('a[href*="intake.html"]');if(a){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();let id='';try{id=new URL(a.href,location.href).searchParams.get('intake')||''}catch{}openInterests(id);return}
}
function keyCapture(e){if(!eligible()||!['Enter',' '].includes(e.key))return;const metric=e.target.closest?.('#view-overview .metric[data-demo-safe-focus]');if(!metric)return;e.preventDefault();openMetric(metric.dataset.demoSafeFocus)}
function install(){if(installed)return;installed=true;style();document.addEventListener('click',capture,true);document.addEventListener('keydown',keyCapture,true);setInterval(tick,180);[0,220,700,1500].forEach(ms=>setTimeout(tick,ms));window.AidMeDemoShowcaseSafe=Object.freeze({version:VERSION,refresh:()=>{snapCache=null;tick()},openInterests})}

setTimeout(install,250);
document.addEventListener('aidme:portal-rendered',()=>setTimeout(install,40),{once:true});
})();
