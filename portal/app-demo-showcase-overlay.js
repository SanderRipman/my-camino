(()=>{
'use strict';
const V='2026-09-25c';
const N={'DEMO-VIA-01':'Ingrid Demo','DEMO-SER-02':'Martin Demo','DEMO-VIDA-03':'Eva Demo','QA-ROLE-VIA-01':'Daniel Demo','DEMO-STRESS-SER':'Sofia Demo','DEMO-STRESS-GO':'Henrik Demo','DEMO-STRESS-VIDA':'Aisha Demo','DEMO-SHOW-KARI':'Kari Demo','DEMO-STRESS-NYVIA':'Thomas Demo'};
const I=[['Nora Demo','Ønsker retning tilbake mot arbeid etter en periode med lav motivasjon. Trives med praktiske oppgaver, tydelige mål og fellesskap.','VÍA-samtale'],['Amalie Demo','Har mistet tydelig arbeidsretning etter flere skifter og ønsker et strukturert før–under–etter-løp.','Avklar ønsket endring hjemme'],['Markus Demo','Ønsker tydeligere rytme og arbeidsretning, men trenger fleksibilitet dersom en etappe blir for krevende.','Avklar trygg tilpasning'],['Elias Demo','Har god arbeidskapasitet, men lite erfaring med lengre vandringer.','Avklar realistisk forberedelse'],['Jonas Demo','Er motivert for endring, men har praktiske forhold hjemme som må avklares før en lengre reise.','Avklar tidspunkt og bindinger'],['Selma Demo','Ønsker å utforske programmet, men er usikker på om tidspunktet passer.','Gi informasjon eller avslutt ryddig']];
let snap=null,pending=null,focus='ALL';
const demo=()=>{const h=location.hostname;return h==='demo.aidme.no'||h.endsWith('--mycamino-demo.netlify.app')||h==='mycamino-demo.netlify.app'};
const ok=()=>{try{return demo()&&typeof hasRole==='function'&&hasRole('system_admin')}catch{return false}};
const esc=v=>typeof escapeHtml==='function'?escapeHtml(v):String(v??'');
const phase=s=>{s=String(s||'VIA').toUpperCase();return s==='SER'?'SER':s==='VIDA'?'VIDA':s==='NEW_VIA'?'NEW_VIA':'VIA'};
const pl=p=>p==='VIA'?'VÍA':p==='NEW_VIA'?'ny VÍA':p;
const own=p=>p==='SER'?'SER-/turleder':p==='VIDA'?'VIDA-eier':p==='NEW_VIA'?'VÍA-ansvarlig / programleder':'VÍA-ansvarlig / fagperson';
const fmt=d=>{try{return new Intl.DateTimeFormat('nb-NO',{day:'numeric',month:'short',year:'numeric'}).format(new Date(d))}catch{return'–'}};
const open=s=>['OPEN','IN_PROGRESS','WAITING'].includes(String(s||'').toUpperCase());
const tone=t=>{const overdue=open(t.status)&&t.due_at&&new Date(t.due_at)<new Date(),sev=String(t.severity||'GREEN').toUpperCase();return sev==='RED'||overdue?'RED':sev==='YELLOW'?'YELLOW':'GREEN'};
const st=s=>({OPEN:'Åpen',IN_PROGRESS:'I gang',WAITING:'Venter',DONE:'Ferdig'})[String(s||'').toUpperCase()]||String(s||'');
function style(){if(document.querySelector('#demo-overlay-style'))return;const s=document.createElement('style');s.id='demo-overlay-style';s.textContent=`html.demo-overlay #mainNav .nav-item[data-view="checkin"]{display:flex!important;visibility:visible!important}#demoOverlayInterest{width:min(880px,calc(100vw - 24px));max-height:calc(100vh - 24px);border:0;border-radius:20px;padding:0;background:#f9f6ee}#demoOverlayInterest::backdrop{background:rgba(10,26,28,.52)}.doi{padding:18px}.doi h2{font-family:Georgia,serif;font-size:clamp(30px,5vw,46px);margin:4px 0 12px}.doi-grid{display:grid;grid-template-columns:minmax(210px,.7fr) 1.3fr;gap:12px}.doi-list,.doi-detail{background:#fffdf8;border:1px solid #ddd8cf;border-radius:15px;padding:11px}.doi-list{display:grid;gap:7px}.doi-list button{padding:10px;border:1px solid transparent;border-radius:11px;background:#f3f0e8;text-align:left}.doi-list button.active{border-color:#2a6863;background:#eef5f2}.doi-next{margin-top:12px;padding:12px;border-radius:12px;background:#edf4f1}.demo-overlay-note{padding:10px 12px;border:1px solid rgba(200,164,93,.42);border-radius:13px;background:rgba(200,164,93,.08);font-size:12px;line-height:1.45;color:#566469;margin-bottom:12px}.demo-overlay-filter{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}.demo-overlay-filter .chip.active{background:#123f3d!important;color:#fff!important}@media(max-width:700px){.doi-grid{grid-template-columns:1fr}.doi-list{max-height:190px;overflow:auto}}`;s.textContent+=".demo-review-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px}.demo-review-facts>div{background:#fffdf8;border:1px solid #ddd8cf;border-radius:12px;padding:10px;min-width:0}.demo-review-facts span{display:block;color:#566469;font-size:12px;margin-bottom:3px}.demo-review-facts strong{display:block;overflow-wrap:anywhere;font-size:15px}.demo-review-reason{background:#f4f2eb;border-left:3px solid #bb8c50;padding:12px 14px;border-radius:9px;margin:10px 0}.demo-review-reason h3{margin:0 0 6px;font-size:16px}.demo-review-reason p{margin:5px 0;line-height:1.5;font-size:14px}.demo-review-actions{padding:10px 0}.demo-review-actions>strong{display:block;margin-bottom:8px}.demo-review-caution{color:#605442;font-size:13px;line-height:1.45}.demo-review-error{color:#8b2929;font-weight:600}.demo-review-intro{margin:0 0 12px;font-size:13px;color:#566469}.doi-close{float:right}.doi-list button{min-width:0;overflow-wrap:anywhere}.doi-list button b,.doi-list button small{display:block;line-height:1.35}.doi-list button small{margin-top:2px;color:#536567;font-size:11px;font-weight:500}.doi-detail p.eyebrow{margin:0 0 8px}.doi-next p{margin:7px 0;line-height:1.4}.demo-review-footer{display:flex;justify-content:flex-end;margin-top:12px}.doi .privacy-note{font-size:12px;line-height:1.5}#taskDialog .demo-overlay-filter{margin-top:7px}#taskDialog .demo-overlay-filter .chip{min-height:42px}@media(max-width:430px){.doi{padding:15px}.doi h2{font-size:clamp(28px,7vw,36px);line-height:1.05}.demo-review-facts strong{font-size:14px}}";document.head.appendChild(s)}
async function getSnap(force=false){if(!ok())return null;if(snap&&!force)return snap;if(pending)return pending;pending=(async()=>{const ids=Array.isArray(window.participants)?window.participants.map(x=>x.id).filter(Boolean):[];let r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}});if(r.error||r.data?.error){await client.functions.invoke('uat-overview-command',{body:{action:'ACTIVATE',reason:'Demovisning – syntetiske oppgaver og analyse'}});r=await client.functions.invoke('uat-overview-command',{body:{action:'SNAPSHOT',normalVisibleParticipantIds:ids}})}if(r.error||r.data?.error)throw new Error('UAT snapshot');snap=r.data;return snap})().finally(()=>pending=null);return pending}
function norm(){if(!ok())return;document.documentElement.classList.add('demo-overlay');const n=document.querySelector('#mainNav .nav-item[data-view="checkin"]');if(n){n.classList.remove('hidden','nav-mobile-secondary','nav-ia-demoted');n.removeAttribute('hidden')}}
function map(s){return new Map((s?.participants||[]).map(p=>[String(p.id),p]))}
function taskPhase(t,m){return phase(m.get(String(t.participant_id))?.stage)}
function filt(rows,f,m){if(f==='RED')return rows.filter(x=>tone(x)==='RED');if(f==='YELLOW')return rows.filter(x=>tone(x)==='YELLOW');if(['VIA','SER','VIDA','NEW_VIA'].includes(f))return rows.filter(x=>taskPhase(x,m)===f);return rows}
function ft(f){return f==='RED'?'Kritiske / forfalte demooppgaver':f==='YELLOW'?'Oppgaver som trenger avklaring':f==='VIA'?'VÍA-oppgaver':f==='SER'?'SER-oppgaver':f==='VIDA'?'VIDA-oppgaver':f==='NEW_VIA'?'ny VÍA-oppgaver':'Åpne demooppgaver · alle faser'}
function filters(){return[['ALL','Alle'],['RED','Kritisk / forfalt'],['YELLOW','Avklaring'],['VIA','VÍA'],['SER','SER'],['VIDA','VIDA'],['NEW_VIA','ny VÍA']].map(([v,l])=>`<button type="button" class="chip ${focus===v?'active':''}" data-do-focus="${v}">${l}</button>`).join('')}
async function tasks(f=focus){if(!ok()||!document.querySelector('#view-tasks')?.classList.contains('active'))return;focus=f;const l=document.querySelector('#taskList'),h=document.querySelector('#tasksHeading'),bar=document.querySelector('#view-tasks .task-filter-row');if(!l)return;if(h)h.textContent=ft(f);if(bar){bar.innerHTML=`<div class="demo-overlay-filter">${filters()}</div>`;bar.querySelectorAll('[data-do-focus]').forEach(b=>b.onclick=()=>tasks(b.dataset.doFocus))}l.innerHTML='<div class="demo-overlay-note">Henter syntetiske demooppgaver…</div>';try{const s=await getSnap(),m=map(s);let rows=filt((s.tasks||[]).filter(x=>open(x.status)),f,m);rows.sort((a,b)=>({VIA:0,SER:1,VIDA:2,NEW_VIA:3}[taskPhase(a,m)]??9)-({VIA:0,SER:1,VIDA:2,NEW_VIA:3}[taskPhase(b,m)]??9)||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));l.innerHTML=`<div class="demo-overlay-note"><strong>Demo-fullmakt:</strong> syntetiske oppgaver på tvers av VÍA → SER → VIDA → ny VÍA. Ordinære rollegrenser gjelder i normal drift.</div>${rows.map(t=>{const p=m.get(String(t.participant_id)),ph=taskPhase(t,m),tt=tone(t),title=String(t.title||'Oppgave').replace(/Ny interesse\s*[–-]\s*triage/gi,'Ny interesse – første avklaring');return `<button type="button" class="task-row" data-do-task="${esc(t.id)}"><i class="task-dot ${tt}"></i><div><b>${esc(title)}</b><small>${esc(N[p?.code_name]||p?.code_name||'Demo-deltaker')} · ${pl(ph)} · ordinært ansvar: ${own(ph)}</small></div><div class="task-meta"><span class="pill ${tt}">${st(t.status)}</span><span class="pill">${fmt(t.due_at)}</span></div></button>`}).join('')||'<p class="empty-state">Ingen åpne demooppgaver i utvalget.</p>'}`;l.querySelectorAll('[data-do-task]').forEach(b=>b.onclick=()=>{const t=(s.tasks||[]).find(x=>String(x.id)===b.dataset.doTask);if(t&&(/interesse/i.test(t.title||'')||String(t.source_type||'').toLowerCase()==='intake'))interest();else if(t)taskDialog(t,s)})}catch(e){l.innerHTML='<div class="demo-overlay-note">Kunne ikke hente demosettet. Gå tilbake til Oversikt og prøv igjen.</div>'}}
function taskDialog(t,s){
 const d=document.querySelector('#taskDialog');if(!d)return;
 const m=map(s),p=m.get(String(t.participant_id)),ph=taskPhase(t,m),tt=tone(t),critical=tt==='RED';
 const title=String(t.title||'Oppgave').replace(/Ny interesse\s*[–-]\s*triage/gi,'Ny interesse – første avklaring');
 const current=String(t.status||'OPEN').toUpperCase();
 const owner=own(ph);
 document.querySelector('#taskDialogEyebrow').textContent=`${pl(ph)} · ${st(t.status)}`;
 document.querySelector('#taskDialogTitle').textContent=title;
 const basis=critical
  ? 'Denne syntetiske oppgaven oppgir ikke en konkret årsak til RØD vurdering. Avklar hendelse, deltakerens situasjon, mulig pause/transport og ansvar før noen beslutter videre vandring.'
  : 'Dette er en syntetisk oppgave. Kontroller relevant sak og grunnlag i ordinær, rollebeskyttet arbeidsflyt før beslutning.';
 const actions=[
  ...(current==='IN_PROGRESS'?[]:[['IN_PROGRESS','Start vurdering']]),
  ...(current==='WAITING'?[]:[['WAITING','Sett på vent']]),
  ...(current==='OPEN'?[]:[['OPEN','Gjenåpne']]),
  ...(critical||current==='DONE'?[]:[['DONE','Marker ferdig']])
 ];
 const body=document.querySelector('#taskDialogBody');
 body.innerHTML=`<div class="demo-overlay-note"><strong>Demo-fullmakt</strong> · kun syntetiske data. Ordinært ansvar: ${esc(owner)}.</div>
 <div class="demo-review-facts">
  <div><span>Deltaker</span><strong>${esc(N[p?.code_name]||p?.code_name||'Demo')}</strong></div>
  <div><span>Prioritet</span><strong>${critical?'Kritisk':tt==='YELLOW'?'Avklaring':'Normal'}</strong></div>
  <div><span>Status</span><strong>${esc(st(t.status))}</strong></div>
  <div><span>Beslutningsansvar</span><strong>${esc(owner)}</strong></div>
 </div>
 <section class="demo-review-reason" aria-label="Vurderingsgrunnlag">
  <h3>Grunnlag for vurderingen</h3><p>${esc(basis)}</p>
  ${critical?'<p><strong>Før beslutning:</strong> følg sikkerhetsprosedyre og dokumenter en konkret faglig/operativ begrunnelse. Ingen automatisk GO/NO-GO.</p>':''}
 </section>
 <div class="demo-review-actions" aria-label="Neste mulige handling">
  <strong>Neste handling i demo</strong>
  <div class="demo-overlay-filter">${actions.map(([v,l])=>`<button type="button" class="chip" data-do-status="${v}">${l}</button>`).join('')}</div>
  ${critical?'<p class="demo-review-caution">«Ferdig» er ikke tilgjengelig for en kritisk oppgave i denne demoen: begrunnet sikkerhetsavgjørelse må dokumenteres gjennom godkjent ordinær flyt. Dette er en grense i brukergrensesnittet, ikke en serverbasert rettighetskontroll.</p>':''}
 </div>`;
 document.querySelector('#taskStart')?.classList.add('hidden');
 document.querySelector('#taskDone')?.classList.add('hidden');
 body.querySelectorAll('[data-do-status]').forEach(b=>b.onclick=async()=>{
  b.disabled=true;
  const r=await client.functions.invoke('uat-overview-command',{body:{action:'TASK_STATUS',taskId:t.id,status:b.dataset.doStatus}});
  if(!r.error&&!r.data?.error){snap=null;d.close();tasks(focus);metrics()}
  else {b.disabled=false;let msg=body.querySelector('.demo-review-error');if(!msg){msg=document.createElement('p');msg.className='demo-review-error';msg.setAttribute('role','alert');body.appendChild(msg)}msg.textContent='Status kunne ikke oppdateres. Behold eksisterende status og prøv igjen senere.'}
 });
 if(!d.open)d.showModal();
}
function ensureInterest(){let d=document.querySelector('#demoOverlayInterest');if(d)return d;d=document.createElement('dialog');d.id='demoOverlayInterest';document.body.appendChild(d);return d}
function interest(idx=0){
 const d=ensureInterest();
 const entry=I[idx]||I[0];
 d.innerHTML=`<div class="doi">
  <button type="button" class="ghost doi-close" data-do-close aria-label="Lukk interessedetaljer">Lukk</button>
  <p class="eyebrow">Interesse · første avklaring</p>
  <h2>Fra interesse til tydelig neste steg</h2>
  <p class="demo-review-intro">Fiktiv prøveoversikt – ikke en søknad eller godkjenningsbeslutning.</p>
  <div class="doi-grid">
   <div class="doi-list" role="group" aria-label="Velg syntetisk interesse">
    ${I.map((x,i)=>`<button type="button" class="${i===idx?'active':''}" data-do-interest="${i}" aria-pressed="${i===idx?'true':'false'}"><b>${esc(x[0])}</b><small>Syntetisk interesse</small></button>`).join('')}
   </div>
   <div class="doi-detail">
    <p class="eyebrow">${esc(entry[0])}</p>
    <section class="demo-review-reason"><h3>Innsendt notat · syntetisk eksempel</h3><p>${esc(entry[1])}</p></section>
    <div class="doi-next"><strong>Foreslått neste handling</strong><p>${esc(entry[2])}</p><p class="demo-review-caution">Interesse er ikke godkjenning. Faglig avklaring og riktig saksansvarlig kommer først.</p></div>
    <p class="privacy-note">Ingen reelle kontakt-, helse- eller deltakerdata vises. Faktiske interessenotater må hentes fra autorisert inntak – ikke denne demooversikten.</p>
   </div>
  </div>
  <div class="demo-review-footer"><button type="button" class="chip" data-do-back>Til oppgavene</button></div>
 </div>`;
 d.querySelector('[data-do-close]').onclick=()=>d.close();
 d.querySelector('[data-do-back]').onclick=()=>{d.close();show('tasks');setTimeout(()=>tasks(focus),80)};
 d.querySelectorAll('[data-do-interest]').forEach(b=>b.onclick=()=>interest(Number(b.dataset.doInterest)));
 if(!d.open)d.showModal();
}
async function metrics(){if(!ok()||!document.querySelector('#view-overview')?.classList.contains('active'))return;try{const s=await getSnap(),rows=(s.tasks||[]).filter(x=>open(x.status)),red=rows.filter(x=>tone(x)==='RED').length,yellow=rows.filter(x=>tone(x)==='YELLOW').length,defs=[['metricOpen',rows.length,'ALL'],['metricRed',red,'RED'],['metricYellow',yellow,'YELLOW'],['metricParticipants',(s.participants||[]).length,'PARTICIPANTS']];for(const [id,val,f] of defs){const strong=document.getElementById(id),card=strong?.closest('.metric');if(!card)continue;strong.textContent=String(val);card.dataset.doMetric=f;card.tabIndex=0;card.setAttribute('role','button')}}catch{}}
function analysis(){if(!ok()||!document.querySelector('#view-analysis')?.classList.contains('active'))return;window.AidMeDemoPresentationV2?.refresh?.();setTimeout(()=>window.AidMeDemoPresentationV2?.refresh?.(),220)}
function act(f){if(f==='PARTICIPANTS'){show('participants');return}focus=f;show('tasks');setTimeout(()=>tasks(f),100)}
function capture(e){if(!ok())return;const m=e.target.closest?.('#view-overview .metric[data-do-metric]');if(m){e.preventDefault();e.stopImmediatePropagation();act(m.dataset.doMetric);return}const a=e.target.closest?.('a[href*="intake.html"]');if(a){e.preventDefault();e.stopImmediatePropagation();interest();return}const nav=e.target.closest?.('#mainNav .nav-item[data-view]');if(nav){setTimeout(()=>{norm();if(nav.dataset.view==='analysis')analysis();if(nav.dataset.view==='overview')metrics();if(nav.dataset.view==='tasks'&&focus!=='ALL')tasks(focus)},120)}}
function init(){if(!ok())return;style();norm();metrics();document.addEventListener('click',capture,true);document.addEventListener('touchend',()=>setTimeout(norm,100),{passive:true});window.AidMeDemoOverlay=Object.freeze({version:V,refresh:()=>{snap=null;norm();metrics();analysis()}})}
document.addEventListener('aidme:portal-rendered',()=>setTimeout(init,320),{once:true});window.addEventListener('pageshow',()=>setTimeout(()=>{if(ok()&&!window.AidMeDemoOverlay)init()},1000),{once:true});
})();
