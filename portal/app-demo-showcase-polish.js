(()=>{
'use strict';

const DEMO_SHOWCASE_VERSION='2026-09-24b';
const ALIASES=Object.freeze({
  'DEMO-VIA-01':'Ingrid Demo',
  'DEMO-SER-02':'Martin Demo',
  'DEMO-VIDA-03':'Eva Demo',
  'QA-ROLE-VIA-01':'Daniel Demo',
  'DEMO-STRESS-SER':'Sofia Demo',
  'DEMO-STRESS-GO':'Henrik Demo',
  'DEMO-STRESS-VIDA':'Aisha Demo',
  'DEMO-SHOW-KARI':'Kari Demo',
  'DEMO-STRESS-NYVIA':'Thomas Demo'
});
let scheduled=false;
const OVERVIEW_NOTE='Fiktive, lagrede målepunkter for 8 demonstrasjonsdeltakere. Grafen viser ekte systemdata fra demo – ikke faktisk pilotresultat.';
const ANALYSIS_NOTE='<strong>Demo 2027:</strong> Grafene bruker lagrede, syntetiske gruppemålinger fra Camino Portugués-demoforløpet. Ingen reelle deltakerdata inngår.';

function demoOrigin(){const h=location.hostname;return h==='demo.aidme.no'||h==='mycamino-demo.netlify.app'||h.endsWith('--mycamino-demo.netlify.app')}
function eligible(){try{return demoOrigin()&&hasRole('system_admin')&&window.AidMeRoleLens?.demoSystemAdminAggregate?.()}catch{return false}}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;apply()},0)}
function aliasFor(code){return ALIASES[String(code||'').trim()]||''}
function polishRoster(){
  const list=document.querySelector('#participantList');if(!list)return;
  list.querySelectorAll('.uat-roster-card').forEach(card=>{
    const title=card.querySelector('.uat-roster-top b');if(!title)return;
    const code=title.dataset.demoCode||title.textContent.trim(),alias=aliasFor(code);if(!alias)return;
    if(title.dataset.demoCode!==code)title.dataset.demoCode=code;
    if(title.textContent!==alias)title.textContent=alias;
    if(card.dataset.demoShowcase!=='1')card.dataset.demoShowcase='1';
    if(!card.querySelector('.demo-tech-code')){
      const small=card.querySelector('small');if(small)small.insertAdjacentHTML('beforeend',`<span class="demo-tech-code"> · ${code}</span>`);
    }
  });
}
function polishOverview(){
  const chart=document.querySelector('#overviewChart'),card=chart?.closest('.panel-card');if(!card)return;
  const eyebrow=card.querySelector('.card-head .eyebrow'),heading=card.querySelector('.card-head h3');
  if(eyebrow&&eyebrow.textContent!=='Syntetisk utvikling')eyebrow.textContent='Syntetisk utvikling';
  if(heading&&heading.textContent!=='Demo 2027 · Camino Portugués')heading.textContent='Demo 2027 · Camino Portugués';
  let note=card.querySelector('.demo-showcase-note');
  if(!note){note=document.createElement('p');note.className='privacy-note demo-showcase-note';chart.insertAdjacentElement('afterend',note)}
  if(note.textContent!==OVERVIEW_NOTE)note.textContent=OVERVIEW_NOTE;
}
function polishAnalysis(){
  const view=document.querySelector('#view-analysis');if(!view)return;
  let note=view.querySelector('.demo-showcase-analysis-note');
  if(!note){note=document.createElement('article');note.className='preview-strip demo-showcase-analysis-note';const controls=view.querySelector('.analysis-controls')?.closest('.panel-card');controls?.insertAdjacentElement('beforebegin',note)}
  if(note&&note.dataset.ready!=='1'){note.innerHTML=ANALYSIS_NOTE;note.dataset.ready='1'}
}
function ensureStyle(){
  if(document.querySelector('#demo-showcase-style'))return;
  const s=document.createElement('style');s.id='demo-showcase-style';s.textContent=`
    .demo-tech-code{font-size:10px;color:#8a9497;font-weight:500}
    .demo-showcase-note{margin:7px 0 0;line-height:1.35}
    .demo-showcase-analysis-note{margin-bottom:12px}
  `;document.head.appendChild(s)
}
function apply(){if(!eligible())return;ensureStyle();polishRoster();polishOverview();polishAnalysis()}

const app=document.querySelector('#appView');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',schedule);
document.addEventListener('aidme:navigation-normalized',schedule);
window.addEventListener('pageshow',()=>setTimeout(schedule,80));
setTimeout(schedule,420);
})();
