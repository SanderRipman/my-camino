(()=>{
'use strict';

const GUIDE_BY_FORM={
  via_roadmap:{
    eyebrow:'Spør og fortell · VÍA',
    question:'Hvor mye skal jeg skrive – og finnes det riktige svar?',
    answer:'Nei. Dette er en første bli-kjent- og avklaringsrunde, ikke en test. Noen få ord kan være nok. Skriv det første som virker relevant, og ikke del mer personlig eller helserelatert informasjon enn det som er nødvendig for planlegging og trygg gjennomføring.',
    next:'Ta ett felt om gangen. Eksemplene under feltene er bare hjelp til å forstå hva vi spør om – ikke en fasit eller en forventning om lange svar.'
  },
  participant_agreement:{
    eyebrow:'Spør og fortell · før SER',
    question:'Betyr individuell GO at SER allerede er bestemt?',
    answer:'Nei. GO betyr at VÍA-vurderingen kan gå videre. Før SER må du selv kjenne og bekrefte rammene, kontaktvalgene og beredskapen, og den samlede Pilot-GO-gaten må være lukket.',
    next:'Neste steg her er å lese hvert punkt i ro og bekrefte bare det du faktisk forstår og er enig i. Be om avklaring før du fullfører hvis noe er uklart.'
  },
  pilot_go:{
    eyebrow:'Spør og fortell · siste gate før SER',
    question:'Er Pilot-GO bare en oppsummering av individuell GO?',
    answer:'Nei. Pilot-GO er en egen samlet operativ gate. Individuell GO, deltakeravtale, navngitt VIDA-eier, praktisk beredskap og eventuelle vilkår må fortsatt være på plass.',
    next:'Neste lovlige handling etter en godkjent Pilot-GO er siste SER-oppstartskontroll. Selve SER-starten skjer fortsatt gjennom den eksisterende servergaten.'
  },
  ser_daily:{
    eyebrow:'Spør og fortell · SER',
    question:'Skal deltakerens egen dagsform føres i denne loggen?',
    answer:'Nei. Dette er teamets korte operative SER-logg. Deltakeren bruker sin separate Innsjekk. Registrer bare det operative minimumet som er nødvendig for rute, tiltak, ansvar og oppfølging.',
    next:'Ved en faktisk hendelse eller et avvik brukes hendelsesloggen i stedet for å gjøre normaldagsloggen til et journalnotat.'
  },
  vida_plan:{
    eyebrow:'Spør og fortell · VIDA',
    question:'Skal 72 timer, 14, 30 og 90 dager bli fire nye planer?',
    answer:'Nei. VIDA er én levende plan. Kontrollpunktene er tidspunkter for å se på samme plan igjen, justere neste handling og avklare støtte.',
    next:'Hold neste handling konkret og liten nok til å gjennomføre. Unngå å kopiere VÍA-, SER- eller hendelsesdetaljer som ikke trengs for oppfølgingen hjemme.'
  },
  pilot_evaluation:{
    eyebrow:'Spør og fortell · evaluering',
    question:'Er dette en ny individuell vurdering av deltakeren?',
    answer:'Nei. Pilotevalueringen er for aggregert læring om program og gjennomføring. Individuell sensitiv sakstilgang følger egne rettigheter og skal ikke oppstå som følge av evalueringen.',
    next:'Bruk det som kan forbedre programmet, og hold personlig/sensitiv informasjon ute når aggregert læring er tilstrekkelig.'
  }
};

function activeFormKey(){
  try{return typeof currentDef!=='undefined'&&currentDef?.key?currentDef.key:new URLSearchParams(location.search).get('key')||''}catch{return new URLSearchParams(location.search).get('key')||''}
}
function renderFormQnaGuidance(){
  const host=document.querySelector('#formQnaGuidance');if(!host)return;
  const guide=GUIDE_BY_FORM[activeFormKey()];
  if(!guide){host.classList.add('hidden');host.innerHTML='';return}
  host.innerHTML=`<p class="eyebrow">${esc(guide.eyebrow)}</p><h3>${esc(guide.question)}</h3><p><strong>Kort svar:</strong> ${esc(guide.answer)}</p><p class="privacy-note"><strong>Hva gjør jeg nå?</strong> ${esc(guide.next)}</p>`;
  host.classList.remove('hidden');
}

const originalChooseForm=typeof chooseForm==='function'?chooseForm:null;
if(originalChooseForm){
  chooseForm=async function(...args){const result=await originalChooseForm.apply(this,args);renderFormQnaGuidance();return result};
}
document.querySelector('#formSelect')?.addEventListener('change',()=>setTimeout(renderFormQnaGuidance,0));
setTimeout(renderFormQnaGuidance,160);
})();

if(!document.querySelector('script[data-form-streamline-provenance]')){
  const script=document.createElement('script');
  script.src='./form-streamline-provenance.js?v=20260902b';
  script.dataset.formStreamlineProvenance='1';
  document.body.appendChild(script);
}
