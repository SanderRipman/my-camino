(()=>{
'use strict';

function activeRoleCodes(){return new Set((accessGrants||[]).filter(activeGrant).map(g=>g.role_code))}
function roleSetHas(set,codes){return codes.some(code=>set.has(code))}
function roleHomeLens(){
  if(!isStaff())return null;
  const roles=activeRoleCodes();
  const operational=['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics'].filter(r=>roles.has(r));
  const aggregate=roleSetHas(roles,['project_owner','observer','evaluator']);
  if(!operational.length&&aggregate)return{
    key:'aggregate',eyebrow:'Programnivå',heading:'Status, porter og læring',badge:'PROGRAM',
    intro:'Se samlet status, åpne programoppgaver og læring. Individuelle operative handlinger vises ikke bare fordi du har prosjekt-, observatør- eller evaluatorrolle.',
    context:'Aggregert først · minste nødvendige innsyn',queue:'Programoppgaver og porter'
  };
  if(operational.length>1)return{
    key:'combined',eyebrow:'Samlet arbeidsflate',heading:'Trenger handling nå',badge:'LIVE',
    intro:'Du har flere operative roller. Oversikten samler bare det du allerede har tilgang til; prioriter kritisk/forfalt først, deretter avklaringer og neste lovlige gate.',
    context:`${operational.length} operative roller · ett situasjonsbilde`,queue:'Prioritert arbeidskø'
  };
  if(roles.has('ser_lead')||roles.has('logistics'))return{
    key:'ser',eyebrow:'SER · operativt',heading:'Det viktigste i dag',badge:'SER',
    intro:'Rute, dagsform, ansvar og sikker tilpasning først. Deltakerens egen innsjekk er et signal; teamets operative logg beskriver bare nødvendig handling og oppfølging.',
    context:'Under · erfaring, rytme og trygghet',queue:'SER – handling nå'
  };
  if(roles.has('vida_owner'))return{
    key:'vida',eyebrow:'VIDA · oppfølging',heading:'Neste handling hjemme',badge:'VIDA',
    intro:'Følg samme levende VIDA-plan fra første handling og 72 timer videre til 14, 30 og 90 dager. Bruk nødvendig handoff – ikke rå SER-notater.',
    context:'Etter · handling, eier og frister',queue:'VIDA – oppfølging nå'
  };
  if(roles.has('via_owner')||roles.has('clinical_professional'))return{
    key:'via',eyebrow:'VÍA · avklaring',heading:'Neste avklaring og gate',badge:'VÍA',
    intro:'Avklar retning, ressurser, sikkerhet og det som må være på plass før en formell beslutning. Veikart, vurdering og GO/NO-GO er separate steg.',
    context:'Før · retning, trygghet og beslutning',queue:'VÍA – avklaringer nå'
  };
  if(roles.has('program_lead'))return{
    key:'program',eyebrow:'Programflyt',heading:'Neste gate og ansvar',badge:'VÍA→VIDA',
    intro:'Hold flyten sammenhengende fra interesse til VÍA, SER og VIDA. Se etter manglende eier, frist eller gate – uten å overta faglige eller sensitive detaljer uten eget mandat.',
    context:'Hel reise · riktig eier til riktig tid',queue:'Neste gate og ansvar'
  };
  return{
    key:'staff',eyebrow:'Arbeidsflate',heading:'Trenger handling nå',badge:'VIDA',
    intro:'Visningen følger den tilgangen rollen din allerede har. Start med prioriterte oppgaver og neste lovlige handling.',
    context:'Minste nødvendige innsyn',queue:'Prioritert arbeidskø'
  };
}

function roleHomeStyles(){
  if(document.querySelector('#role-home-style'))return;
  const style=document.createElement('style');style.id='role-home-style';
  style.textContent=`
    #view-overview.role-home-aggregate .dashboard-top{grid-template-columns:1fr}
    #view-overview.role-home-aggregate .role-home-hide-aggregate{display:none!important}
    #contextMini{max-width:240px;line-height:1.35}
    @media(max-width:760px){
      #view-overview .hero-panel.compact-hero{align-items:flex-start;gap:14px}
      #view-overview .hero-badge{min-width:0;max-width:46%;padding-left:12px}
      #view-overview .hero-badge strong{font-size:clamp(20px,6vw,28px)}
      #view-overview #homeIntro{line-height:1.45}
    }
  `;document.head.appendChild(style);
}
function setOverviewMetricLabel(index,label,hint){
  const card=document.querySelectorAll('#view-overview .metric-grid .metric')[index];if(!card)return;
  const l=card.querySelector('span'),s=card.querySelector('small');if(l)l.textContent=label;if(s&&hint)s.textContent=hint;
}
function applyRoleAwareHome(){
  if(!isStaff())return;
  const lens=roleHomeLens();if(!lens)return;roleHomeStyles();
  const view=document.querySelector('#view-overview');if(!view)return;
  view.classList.toggle('role-home-aggregate',lens.key==='aggregate');
  const eyebrow=document.querySelector('#homeEyebrow'),heading=document.querySelector('#homeHeading'),intro=document.querySelector('#homeIntro'),badge=document.querySelector('#stageBadge'),context=document.querySelector('#contextMini');
  if(eyebrow)eyebrow.textContent=lens.eyebrow;if(heading)heading.textContent=lens.heading;if(intro)intro.textContent=lens.intro;if(badge)badge.textContent=lens.badge;if(context)context.textContent=lens.context;
  const queue=document.querySelector('#priorityQueue')?.closest('.panel-card');if(queue){const h=queue.querySelector('h3');if(h)h.textContent=lens.queue}
  const pulse=document.querySelector('#groupPulse')?.closest('.panel-card');if(pulse){pulse.classList.toggle('role-home-hide-aggregate',lens.key==='aggregate');const h=pulse.querySelector('h3');const e=pulse.querySelector('.eyebrow');if(lens.key==='ser'){if(e)e.textContent='SER · signaler';if(h)h.textContent='Gruppens puls'}else if(lens.key==='vida'){if(e)e.textContent='VIDA · oppfølging';if(h)h.textContent='Deltakere i oppfølging'}else if(lens.key==='via'){if(e)e.textContent='VÍA · avklaring';if(h)h.textContent='Deltakere som trenger avklaring'}}
  if(lens.key==='aggregate'){
    setOverviewMetricLabel(0,'Åpne programoppgaver','porter, rapportering og oppfølging');
    setOverviewMetricLabel(1,'Kritisk / forfalt','krever programoppmerksomhet');
    setOverviewMetricLabel(2,'Trenger avklaring','åpne programspørsmål');
    setOverviewMetricLabel(3,'Synlige forløp','kun innen eksisterende tilgang');
  }else if(lens.key==='vida'){
    setOverviewMetricLabel(0,'Åpne VIDA-steg','første handling og oppfølging');
    setOverviewMetricLabel(3,'Deltakere i scope','kun ditt eksisterende ansvar');
  }else if(lens.key==='ser'){
    setOverviewMetricLabel(0,'Åpne SER-oppgaver','rute, sikkerhet og oppfølging');
    setOverviewMetricLabel(3,'Aktive deltakere','innen operativt scope');
  }else if(lens.key==='via'){
    setOverviewMetricLabel(0,'Åpne VÍA-steg','avklaring, ansvar og beslutning');
    setOverviewMetricLabel(3,'Deltakere i VÍA','innen eksisterende scope');
  }
}

const roleHomeRenderAll=renderAll;
renderAll=function(){roleHomeRenderAll();applyRoleAwareHome()};
setTimeout(applyRoleAwareHome,180);

})();
