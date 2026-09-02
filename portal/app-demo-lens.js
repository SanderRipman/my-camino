(()=>{
'use strict';

const DEMO_LENS_KEY='aidme_portal_demo_lens_v1';
const DEMO_LENSES=new Set(['superuser','linelead','participant']);

function demoLensEligible(){return typeof hasRole==='function'&&hasRole('system_admin')}
function demoLens(){
  if(!demoLensEligible())return'';
  const saved=localStorage.getItem(DEMO_LENS_KEY);
  return DEMO_LENSES.has(saved)?saved:'superuser';
}
function demoLensLabel(lens){return({superuser:'Superbruker (demo)',linelead:'Linjeleder (demo)',participant:'Deltaker (demo)'})[lens]||'Visning'}
function demoLensNav(view,visible){
  const el=document.querySelector(`.nav-item[data-view="${view}"]`);
  if(el)el.classList.toggle('demo-lens-hidden',!visible);
}
function ensureDemoLensStyle(){
  if(document.getElementById('demo-lens-style'))return;
  const style=document.createElement('style');
  style.id='demo-lens-style';
  style.textContent=`
    .demo-lens-hidden{display:none!important}
    .demo-lens-control{display:flex;align-items:center;gap:7px;padding:5px 8px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.82)}
    .demo-lens-control span{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#687478}
    .demo-lens-control select{border:0;background:transparent;color:var(--navy);font-size:12px;font-weight:700;font-family:inherit;line-height:1.2;outline:none;max-width:170px}
    .demo-lens-banner{max-width:none;margin:0 0 16px;padding:10px 13px;border:1px solid rgba(200,164,93,.35);border-radius:12px;background:rgba(200,164,93,.08);font-size:12px;line-height:1.45;color:#46575b}
    .demo-lens-banner strong{color:var(--teal)}
    .demo-participant-preview{display:none}
    html[data-demo-lens="participant"] #view-overview>.hero-panel,
    html[data-demo-lens="participant"] #view-overview>.metric-grid,
    html[data-demo-lens="participant"] #view-overview>.dashboard-top,
    html[data-demo-lens="participant"] #view-overview>.dashboard-bottom{display:none!important}
    html[data-demo-lens="participant"] .demo-participant-preview{display:grid;gap:14px}
    .demo-participant-preview .demo-next{display:grid;grid-template-columns:1.1fr .9fr;gap:12px}
    .demo-participant-preview .demo-box{padding:18px;border:1px solid var(--line);border-radius:16px;background:#fff}
    .demo-participant-preview h2,.demo-participant-preview h3{margin:4px 0 8px}
    .demo-participant-preview p{margin:0;color:#5d6b70;line-height:1.55}
    .demo-participant-preview .demo-stage{font:500 42px/1 Georgia,serif;color:var(--teal)}
    .demo-participant-preview .demo-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    @media(max-width:760px){
      .demo-lens-control{order:4;width:100%;justify-content:space-between;border-radius:12px}
      .demo-lens-control select{max-width:none;flex:1;text-align:right}
      .demo-participant-preview .demo-next{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);
}
function ensureDemoLensControl(){
  if(!demoLensEligible())return;
  ensureDemoLensStyle();
  const actions=document.querySelector('.top-actions');
  if(!actions||actions.querySelector('.demo-lens-control'))return;
  const wrap=document.createElement('label');
  wrap.className='demo-lens-control';
  wrap.innerHTML='<span>Visning</span><select aria-label="Velg demo-visning"><option value="superuser">Superbruker (demo)</option><option value="linelead">Linjeleder (demo)</option><option value="participant">Deltaker (demo)</option></select>';
  const select=wrap.querySelector('select');
  select.value=demoLens();
  select.addEventListener('change',()=>{
    if(!DEMO_LENSES.has(select.value))return;
    localStorage.setItem(DEMO_LENS_KEY,select.value);
    applyDemoLens();
    if(typeof show==='function')show('overview');
  });
  const userWrap=actions.querySelector('.user-menu-wrap');
  actions.insertBefore(wrap,userWrap||null);
}
function ensureDemoLensBanner(lens){
  const preview=document.querySelector('.preview-strip');
  if(!preview)return;
  let banner=document.querySelector('.demo-lens-banner');
  if(!banner){banner=document.createElement('div');banner.className='demo-lens-banner';preview.insertAdjacentElement('afterend',banner)}
  const copy={
    superuser:'Administrasjon og testoversikt. Denne visningen gir ikke automatisk faglig eller sensitivt deltakerinnsyn; faktiske rettigheter følger fortsatt grants, RLS og AAL2.',
    linelead:'Samlet operativ visning for en liten oppstart der én person kan bære flere program-, logistikk-, VÍA-, SER- og VIDA-oppgaver. Innholdet under er fortsatt begrenset av kontoens faktiske grants.',
    participant:'Ren visningsdemo av deltakeropplevelsen. Ingen ekstra deltakerdata hentes, og ingen staff-rettighet gjøres om til deltakerrettighet. Bruk LAB for ekte syntetisk deltaker-RLS.'
  };
  banner.innerHTML=`<strong>${demoLensLabel(lens)}</strong> · ${copy[lens]}`;
}
function ensureParticipantPreview(){
  const view=document.querySelector('#view-overview');
  if(!view||view.querySelector('.demo-participant-preview'))return;
  const wrap=document.createElement('section');
  wrap.className='demo-participant-preview';
  wrap.innerHTML=`
    <article class="demo-box"><p class="eyebrow">Deltaker · visningsdemo</p><h2>Min reise</h2><p>Det viktigste først: hvor jeg er, hva jeg skal gjøre nå, og hvem som følger meg videre.</p></article>
    <div class="demo-next">
      <article class="demo-box"><p class="eyebrow">Min fase</p><div class="demo-stage">VÍA</div><p>Før · retning og avklaring. Fasen endres i den virkelige reisen etter godkjente handlinger og gates.</p></article>
      <article class="demo-box"><p class="eyebrow">Din neste handling</p><h3>Fullfør ett tydelig steg</h3><p>Deltakeren skal se én forståelig neste handling, ikke interne arbeidsmarkører eller hele organisasjonens kontrollflate.</p><div class="demo-actions"><a class="ghost link-btn" href="./qa-role-pack.html">Åpne LAB for ekte rolletest</a></div></article>
    </div>
    <article class="demo-box"><p class="eyebrow">Mine steg og skjemaer</p><h3>Kun det som gjelder min fase og min reise</h3><p>Dette panelet er statisk og datafritt. Ekte deltakerdata og fasefiltrering testes med separat syntetisk deltakerkonto i LAB.</p></article>`;
  view.prepend(wrap);
}
function resetDemoNav(){
  ['participants','tasks','checkin','analysis','forms','documents','settings'].forEach(v=>demoLensNav(v,true));
  const admin=document.querySelector('#adminLink');if(admin)admin.classList.remove('demo-lens-hidden');
}
function applyDemoLens(){
  if(!demoLensEligible()){
    document.documentElement.removeAttribute('data-demo-lens');
    document.querySelector('.demo-lens-control')?.remove();
    document.querySelector('.demo-lens-banner')?.remove();
    return;
  }
  ensureDemoLensControl();ensureParticipantPreview();
  const lens=demoLens();document.documentElement.dataset.demoLens=lens;ensureDemoLensBanner(lens);resetDemoNav();
  const admin=document.querySelector('#adminLink');
  if(lens==='superuser'){
    if(admin)admin.classList.remove('demo-lens-hidden');
    const h=document.querySelector('#homeHeading'),e=document.querySelector('#homeEyebrow'),i=document.querySelector('#homeIntro'),c=document.querySelector('#contextMini');
    if(e)e.textContent='Superbruker · demo';if(h)h.textContent='Administrasjon og testoversikt';if(i)i.textContent='Teknisk administrasjon, teststatus og neste sikre handling. Faglig innsyn følger fortsatt egne grants.';if(c)c.textContent='Visning ≠ tilgang';
  }else if(lens==='linelead'){
    if(admin)admin.classList.add('demo-lens-hidden');
    const h=document.querySelector('#homeHeading'),e=document.querySelector('#homeEyebrow'),i=document.querySelector('#homeIntro'),c=document.querySelector('#contextMini');
    if(e)e.textContent='Linjeleder · demo';if(h)h.textContent='Det viktigste i driften nå';if(i)i.textContent='Ett operativt situasjonsbilde for program, logistikk, VÍA, SER og VIDA – uten å endre hvem som faktisk har lov til å se eller gjøre hva.';if(c)c.textContent='Flere fagroller · én arbeidsflate';
  }else{
    if(admin)admin.classList.add('demo-lens-hidden');
    ['participants','tasks','checkin','analysis','forms'].forEach(v=>demoLensNav(v,false));
    const h=document.querySelector('#homeHeading'),e=document.querySelector('#homeEyebrow'),i=document.querySelector('#homeIntro'),c=document.querySelector('#contextMini');
    if(e)e.textContent='Deltaker · demo';if(h)h.textContent='Din neste handling';if(i)i.textContent='Visningsdemo uten ekstra data. Ekte deltakerrolle testes i LAB.';if(c)c.textContent='Min reise';
  }
}

const demoLensRenderAll=renderAll;
renderAll=function(){demoLensRenderAll();applyDemoLens()};
const demoLensShow=show;
show=function(name){demoLensShow(name);window.setTimeout(applyDemoLens,0)};
window.setTimeout(applyDemoLens,220);

})();
