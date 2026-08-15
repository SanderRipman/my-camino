const STORAGE_KEY='aidme_vida_workspace_v1';
const METRICS={
  mood:{no:'Stemning',en:'Mood'},stress:{no:'Stress',en:'Stress'},energy:{no:'Energi',en:'Energy'},sleep:{no:'Søvnkvalitet',en:'Sleep quality'},
  belonging:{no:'Tilhørighet',en:'Belonging'},agency:{no:'Egenkraft',en:'Agency'},direction:{no:'Retning',en:'Direction'}
};
const COLORS=['#123f3d','#c8a45d','#405f7d','#8f6653','#6e8f88','#7b617d','#95773f','#3f7d67'];
const I18N={
  no:{navOverview:'Oversikt',navParticipants:'Deltakere',navCheckin:'Innsjekk',navAnalysis:'Analyse',navForms:'Skjema & rutiner',navSettings:'Innstillinger',quickCheckin:'Ny innsjekk',heroTitle:'Frihet innen trygge rammer',heroText:'Se utvikling uten å gjøre mennesker til datapunkter. Målinger støtter samtalen – de erstatter den ikke.',todayStatus:'Dagens situasjonsbilde',activeParticipants:'Aktive deltakere',checkins14:'Innsjekker · 14 dager',selfReported:'selvrapportert',greenToday:'Grønn i dag',needsNoAction:'ingen ekstra tiltak',followup:'Bør følges opp',yellowRed:'gul/rød vurdering',groupDevelopment:'Gruppeutvikling',last30:'Siste 30 dager',openAnalysis:'Åpne analyse',today:'I dag',groupPulse:'Gruppens puls',process:'Prosess',viaDesc:'Retning · ressurser · avklaring · GO/NO-GO',serDesc:'Rytme · fellesskap · ansvar · mestring',vidaDesc:'Oversett erfaring til handling hjemme',nextDesc:'Neste konkrete retning',participants:'Deltakere',pseudonymProfiles:'Pseudonymiserte profiler',addParticipant:'+ Ny deltaker',regularCheckin:'Regelmessig avstemning',dailyCheckin:'Daglig innsjekk',checkinHelp:'Kort nok til å bli brukt. Nyttig nok til å oppdage mønstre.',participant:'Deltaker',date:'Dato',phase:'Fase',dayStatus:'Dagsstatus',dayStatusHelp:'Operativ vurdering – ikke diagnose.',note:'Kort notat',notePlaceholder:'Bare det som er relevant for oppfølging.',demoValues:'Fyll demo',saveCheckin:'Lagre innsjekk',analysis:'Analyse',developmentComparison:'Utvikling og sammenligning',analysisHelp:'Velg periode, måling og én eller flere deltakere. Gruppegjennomsnitt kan vises som egen serie.',metric:'Måling',period:'Periode',groupAverage:'Vis gruppesnitt',formsAndRoutines:'Skjema & rutiner',oneJourney:'Én deltakerreise – minst mulig dobbelføring',settings:'Innstillinger',demoDataManagement:'Demo og databehandling',localStorage:'Lokal lagring',localStorageText:'Denne demoen lagrer data i nettleseren på denne enheten. Pseudonymet blir nøkkelen du ser – bruk ikke fødselsnummer, navn eller helseopplysninger.',exportJson:'Eksporter JSON',resetDemo:'Tilbakestill demo',resetDemoText:'Gjenoppretter realistiske, fiktive deltakere og målinger.',reset:'Tilbakestill',newParticipant:'Ny deltaker',pseudonym:'Pseudonym / kodenavn',status:'Status',internalNote:'Internt, ikke-sensitivt notat',cancel:'Avbryt',create:'Opprett'},
  en:{navOverview:'Overview',navParticipants:'Participants',navCheckin:'Check-in',navAnalysis:'Analysis',navForms:'Forms & routines',navSettings:'Settings',quickCheckin:'New check-in',heroTitle:'Freedom within safe boundaries',heroText:'See development without turning people into data points. Measurements support the conversation – they do not replace it.',todayStatus:'Today’s situation',activeParticipants:'Active participants',checkins14:'Check-ins · 14 days',selfReported:'self-reported',greenToday:'Green today',needsNoAction:'no extra action',followup:'Needs follow-up',yellowRed:'yellow/red assessment',groupDevelopment:'Group development',last30:'Last 30 days',openAnalysis:'Open analysis',today:'Today',groupPulse:'Group pulse',process:'Process',viaDesc:'Direction · resources · clarification · GO/NO-GO',serDesc:'Rhythm · community · responsibility · mastery',vidaDesc:'Translate experience into action at home',nextDesc:'Next concrete direction',participants:'Participants',pseudonymProfiles:'Pseudonymised profiles',addParticipant:'+ New participant',regularCheckin:'Regular pulse',dailyCheckin:'Daily check-in',checkinHelp:'Short enough to use. Useful enough to reveal patterns.',participant:'Participant',date:'Date',phase:'Phase',dayStatus:'Day status',dayStatusHelp:'Operational assessment – not a diagnosis.',note:'Short note',notePlaceholder:'Only what is relevant for follow-up.',demoValues:'Fill demo',saveCheckin:'Save check-in',analysis:'Analysis',developmentComparison:'Development and comparison',analysisHelp:'Choose period, metric and one or more participants. Group average can be shown as a separate series.',metric:'Metric',period:'Period',groupAverage:'Show group average',formsAndRoutines:'Forms & routines',oneJourney:'One participant journey – minimum duplicate entry',settings:'Settings',demoDataManagement:'Demo and data management',localStorage:'Local storage',localStorageText:'This demo stores data in this browser on this device. Use a pseudonym/code name – do not enter national ID, names or health information.',exportJson:'Export JSON',resetDemo:'Reset demo',resetDemoText:'Restores realistic fictional participants and measurements.',reset:'Reset',newParticipant:'New participant',pseudonym:'Pseudonym / code name',status:'Status',internalNote:'Internal, non-sensitive note',cancel:'Cancel',create:'Create'}
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let lang='no', selectedAnalysis=new Set(), activeParticipantId=null;
function iso(d){return new Date(d).toISOString().slice(0,10)}
function dayOffset(n){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return iso(d)}
function clamp(n,min=0,max=10){return Math.max(min,Math.min(max,Math.round(n*10)/10))}
function seeded(seed){let x=seed%2147483647;return()=>{x=x*16807%2147483647;return(x-1)/2147483646}}
function makeHistory(seed,offset,phasePath){
  const r=seeded(seed), out=[];
  for(let d=-58;d<=0;d+=2+(r()>.72?1:0)){
    const progress=(d+58)/58, phase=progress<phasePath[0]?'VÍA':progress<phasePath[1]?'SER':'VIDA';
    const base=4.4+progress*2.3+offset;
    const stressBase=6.6-progress*2.0-offset*.3;
    const mood=clamp(base+(r()-.5)*2.0), energy=clamp(base-.3+(r()-.5)*2.4), sleep=clamp(5.1+progress*1.0+(r()-.5)*2.5);
    const belonging=clamp(4.6+progress*2.4+(phase==='SER'?0.7:0)+(r()-.5)*1.7), agency=clamp(4.2+progress*2.8+(r()-.5)*1.5), direction=clamp(3.9+progress*3.1+(r()-.5)*1.7), stress=clamp(stressBase+(r()-.5)*2.0);
    const risk=(stress>=8 || mood<=2.5 || energy<=2.2)?'red':(stress>=6.7 || mood<=4 || sleep<=3.2)?'yellow':'green';
    out.push({date:dayOffset(d),phase,mood,stress,energy,sleep,belonging,agency,direction,status:risk,note:''});
  }
  return out;
}
function seedData(){
  const defs=[
    ['Nordlys-07','SER','green',0.4,[.18,.78],'Trives med tidlig start og korte alenestrekk.'],
    ['Furu-12','SER','yellow',-.3,[.22,.82],'Følg opp belastning etter lange etapper.'],
    ['Havglimt-03','VIDA','green',0.8,[.16,.68],'Har tydelig aktivitet å ta med hjem.'],
    ['Stein-19','VÍA','green',-.1,[.72,.94],'Avklar praktisk støtte før samlet GO.'],
    ['Morgen-05','SER','green',0.2,[.20,.80],'Sosialt sterk, trenger også stille tid.'],
    ['Pil-21','VIDA','yellow',0.0,[.17,.63],'VIDA-eier følger første 14 dager tett.']
  ];
  return {version:1,createdAt:new Date().toISOString(),participants:defs.map((d,i)=>({id:'demo-'+(i+1),pseudonym:d[0],phase:d[1],status:d[2],note:d[5],createdAt:dayOffset(-65+i),checkins:makeHistory(101+i*37,d[3],d[4]),vida:{goal:i%2?'Stabilisere aktivitet og døgnrytme':'Ta neste konkrete steg mot arbeid/utdanning',action:i%2?'Tre faste aktivitetsvinduer per uke':'Avtale én konkret samtale og én prøveaktivitet',owner:i%3?'Partner/veileder':'AidMe + partner',nextReview:dayOffset(7+i)}}))};
}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));if(x?.participants?.length)return x}catch{} const s=seedData();save(s);return s}
let state=load();
function save(s=state){localStorage.setItem(STORAGE_KEY,JSON.stringify(s))}
function participant(id){return state.participants.find(p=>p.id===id)}
function latest(p){return [...p.checkins].sort((a,b)=>b.date.localeCompare(a.date))[0]||null}
function applyLang(){
  document.documentElement.lang=lang; $('#langToggle').textContent=lang==='no'?'EN':'NO';
  $$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[lang][k])el.textContent=I18N[lang][k]});
  $$('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(I18N[lang][k])el.placeholder=I18N[lang][k]});
  renderAll();
}
function setView(name){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  const titles={overview:['VÍA → SER → VIDA',lang==='no'?'Operativ oversikt':'Operational overview'],participants:[lang==='no'?'Deltakerløp':'Participant journey',I18N[lang].pseudonymProfiles],checkin:[lang==='no'?'Måling':'Measurement',I18N[lang].dailyCheckin],analysis:[lang==='no'?'Mønstre, ikke diagnoser':'Patterns, not diagnoses',I18N[lang].developmentComparison],forms:[lang==='no'?'Arbeidsflyt':'Workflow',I18N[lang].oneJourney],settings:[lang==='no'?'Demo':'Demo',I18N[lang].demoDataManagement]};
  $('#viewEyebrow').textContent=titles[name][0];$('#viewTitle').textContent=titles[name][1];
  if(name==='analysis')setTimeout(renderAnalysis,30);if(name==='overview')setTimeout(renderOverviewChart,30);
}
function fillParticipantSelects(){
  const opts=state.participants.map(p=>`<option value="${p.id}">${p.pseudonym} · ${p.phase}</option>`).join('');
  ['globalParticipant','checkParticipant'].forEach(id=>{const el=$('#'+id), prev=el.value;el.innerHTML=opts;el.value=state.participants.some(p=>p.id===prev)?prev:(activeParticipantId||state.participants[0]?.id||'')});
  activeParticipantId=$('#globalParticipant').value;
}
function statusLabel(s){return lang==='no'?({green:'Grønn',yellow:'Gul',red:'Rød'}[s]):({green:'Green',yellow:'Yellow',red:'Red'}[s])}
function renderOverview(){
  $('#todayDate').textContent=new Intl.DateTimeFormat(lang==='no'?'nb-NO':'en-GB',{day:'2-digit',month:'short'}).format(new Date());
  $('#metricParticipants').textContent=state.participants.length;
  const phases=state.participants.reduce((a,p)=>(a[p.phase]=(a[p.phase]||0)+1,a),{});$('#metricPhaseMix').textContent=['VÍA','SER','VIDA'].map(x=>`${x} ${phases[x]||0}`).join(' · ');
  const cutoff=dayOffset(-14), recent=state.participants.flatMap(p=>p.checkins.filter(c=>c.date>=cutoff));$('#metricCheckins').textContent=recent.length;
  let green=0,follow=0;state.participants.forEach(p=>{const l=latest(p);if((l?.status||p.status)==='green')green++;else follow++});$('#metricGreen').textContent=green;$('#metricFollowup').textContent=follow;
  $('#groupPulse').innerHTML=state.participants.map(p=>{const l=latest(p);const s=l?.status||p.status;return `<div class="pulse-row"><i class="status-dot ${s}"></i><div><b>${p.pseudonym}</b><small>${p.phase} · ${lang==='no'?'sist':'last'} ${l?.date||'–'}</small></div><small>${statusLabel(s)}</small></div>`}).join('');
  renderOverviewChart();
}
function renderParticipants(){
  if(!activeParticipantId||!participant(activeParticipantId))activeParticipantId=state.participants[0]?.id;
  $('#participantList').innerHTML=state.participants.map(p=>`<button class="participant-card ${p.id===activeParticipantId?'active':''}" data-pid="${p.id}"><i class="status-dot ${(latest(p)?.status||p.status)}"></i><span><b>${p.pseudonym}</b><small>${p.note||''}</small></span><span class="phase-pill">${p.phase}</span></button>`).join('');
  $$('#participantList .participant-card').forEach(b=>b.onclick=()=>{activeParticipantId=b.dataset.pid;$('#globalParticipant').value=activeParticipantId;$('#checkParticipant').value=activeParticipantId;renderParticipants()});
  const p=participant(activeParticipantId);if(!p){$('#participantDetail').innerHTML='';return} const l=latest(p); const avg=k=>{const xs=p.checkins.slice(-8).map(c=>c[k]).filter(Number.isFinite);return xs.length?(xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(1):'–'};
  $('#participantDetail').innerHTML=`<div class="card-head"><div><p class="eyebrow">${p.phase} · ${statusLabel(l?.status||p.status)}</p><h2>${p.pseudonym}</h2><p>${p.note||''}</p></div><span class="phase-pill">ID ${p.id}</span></div>
    <div class="detail-grid"><div class="detail-stat"><span>${METRICS.mood[lang]}</span><strong>${avg('mood')}</strong></div><div class="detail-stat"><span>${METRICS.stress[lang]}</span><strong>${avg('stress')}</strong></div><div class="detail-stat"><span>${METRICS.agency[lang]}</span><strong>${avg('agency')}</strong></div></div>
    <h3>${lang==='no'?'Levende VIDA-plan':'Living VIDA plan'}</h3><div class="detail-grid"><div class="detail-stat"><span>${lang==='no'?'Mål':'Goal'}</span><b>${p.vida?.goal||'–'}</b></div><div class="detail-stat"><span>${lang==='no'?'Neste handling':'Next action'}</span><b>${p.vida?.action||'–'}</b></div><div class="detail-stat"><span>${lang==='no'?'VIDA-eier':'VIDA owner'}</span><b>${p.vida?.owner||'–'}</b></div></div>
    <h3>${lang==='no'?'Siste innsjekker':'Recent check-ins'}</h3><div class="timeline">${[...p.checkins].slice(-6).reverse().map(c=>`<div class="timeline-item"><time>${c.date}</time><i class="status-dot ${c.status}"></i><div><b>${c.phase} · ${statusLabel(c.status)}</b><small>${METRICS.mood[lang]} ${c.mood} · ${METRICS.stress[lang]} ${c.stress} · ${METRICS.direction[lang]} ${c.direction}</small></div></div>`).join('')}</div>`;
}
function sliderTemplate(k){return `<div class="slider-card"><div class="slider-title"><b>${METRICS[k][lang]}</b><span class="slider-value" id="val-${k}">5</span></div><input type="range" min="0" max="10" step="1" value="5" id="slider-${k}"><div class="range-labels"><span>0</span><span>10</span></div></div>`}
function renderCheckin(){
  $('#sliderGrid').innerHTML=Object.keys(METRICS).map(sliderTemplate).join('');Object.keys(METRICS).forEach(k=>{$('#slider-'+k).oninput=e=>$('#val-'+k).textContent=e.target.value});
  $('#checkDate').value=dayOffset(0);const p=participant($('#checkParticipant').value||activeParticipantId);if(p)$('#checkPhase').value=p.phase;
}
function renderForms(){
  const forms=[
    ['01','VÍA',lang==='no'?'Interesse / henvisning':'Interest / referral',lang==='no'?'Minimumsdata og første kontakt. Registrer bare det som trengs for neste steg.':'Minimum data and first contact.'],
    ['02','VÍA',lang==='no'?'VÍA-kartlegging & individuell GO/NO-GO':'VÍA mapping & individual GO/NO-GO',lang==='no'?'Ressurser, retning, praktiske forhold og trygg deltakelse.':'Resources, direction, practical conditions and safe participation.'],
    ['03','VÍA',lang==='no'?'Deltakeravtale & samtykker':'Participant agreement & consents',lang==='no'?'Forventninger, rammer, kontakt, avbrudd og valgfrihet.':'Expectations, boundaries, contact, interruption and choice.'],
    ['04','ALL',lang==='no'?'Samlet pilot-GO':'Overall pilot GO',lang==='no'?'Én endelig beslutningsflate for bemanning, forsikring, reise, roller og VIDA-eiere.':'One final decision surface for staffing, insurance, travel, roles and VIDA owners.'],
    ['05','SER',lang==='no'?'Daglig SER-logg':'Daily SER log',lang==='no'?'Kort operativ logg: dagsstatus, bemanning, avvik, justering og neste kontrollpunkt.':'Short operational log: day status, staffing, deviation, adaptation and next checkpoint.'],
    ['06','SER',lang==='no'?'Hendelse / avvik':'Incident / deviation',lang==='no'?'Åpnes bare når noe faktisk skjer. Unngå dobbelføring.':'Opened only when something actually happens. Avoid duplicate entry.'],
    ['07','SER',lang==='no'?'1:1-samtale – metadata':'1:1 conversation – metadata',lang==='no'?'Dato, ansvarlig og om oppfølging trengs. Ikke privat samtaleinnhold.':'Date, staff owner and whether follow-up is needed. No private conversation content.'],
    ['08','VIDA',lang==='no'?'Levende VIDA-plan':'Living VIDA plan',lang==='no'?'Mål → handling → frist → støtte/eier → status/læring. Oppdateres, ikke dupliseres.':'Goal → action → timing → support/owner → status/learning. Update, do not duplicate.'],
    ['09','VIDA',lang==='no'?'14/30/90 og pilotevaluering':'14/30/90 and pilot evaluation',lang==='no'?'Oppfølging av handling hjemme og samlet læring for neste VÍA.':'Follow action at home and capture learning for the next VÍA.']
  ];
  $('#formLibrary').innerHTML=forms.map(f=>`<article class="form-module"><span class="phase-ribbon ${f[1]}">${f[1]}</span><span class="num">${f[0]}</span><h3>${f[2]}</h3><p>${f[3]}</p><div class="meta"><span>${lang==='no'?'Digitaliserbar':'Digital-ready'}</span><span>${f[1]}</span></div></article>`).join('');
}
function pointsFor(p,metric,days){const cutoff=new Date();cutoff.setDate(cutoff.getDate()-days);return p.checkins.filter(c=>new Date(c.date)>=cutoff&&Number.isFinite(c[metric])).sort((a,b)=>a.date.localeCompare(b.date))}
function drawChart(canvas,series,metric){
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;canvas.width=Math.max(600,Math.floor(rect.width*dpr));canvas.height=Math.floor((rect.height||280)*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const W=canvas.width/dpr,H=canvas.height/dpr;ctx.clearRect(0,0,W,H);const pad={l:42,r:18,t:18,b:32};
  ctx.strokeStyle='#dedbd3';ctx.fillStyle='#7b8589';ctx.lineWidth=1;ctx.font='10px system-ui';for(let y=0;y<=10;y+=2){const py=pad.t+(10-y)/10*(H-pad.t-pad.b);ctx.beginPath();ctx.moveTo(pad.l,py);ctx.lineTo(W-pad.r,py);ctx.stroke();ctx.fillText(String(y),18,py+3)}
  const dates=[...new Set(series.flatMap(s=>s.points.map(p=>p.date)))].sort();if(!dates.length){ctx.fillStyle='#66737b';ctx.font='14px system-ui';ctx.fillText(lang==='no'?'Ingen data i perioden':'No data in this period',pad.l,H/2);return}
  const x=d=>pad.l+(dates.indexOf(d)/Math.max(1,dates.length-1))*(W-pad.l-pad.r), y=v=>pad.t+(10-v)/10*(H-pad.t-pad.b);
  const labelEvery=Math.max(1,Math.ceil(dates.length/6));dates.forEach((d,i)=>{if(i%labelEvery===0||i===dates.length-1){ctx.fillStyle='#7b8589';ctx.font='9px system-ui';ctx.fillText(d.slice(5),x(d)-13,H-10)}});
  series.forEach((s,idx)=>{ctx.strokeStyle=s.color||COLORS[idx%COLORS.length];ctx.lineWidth=s.average?3:2;ctx.setLineDash(s.average?[5,4]:[]);ctx.beginPath();s.points.forEach((p,i)=>{const px=x(p.date),py=y(p[metric]);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();ctx.setLineDash([]);if(!s.average)s.points.forEach(p=>{ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(x(p.date),y(p[metric]),2.4,0,Math.PI*2);ctx.fill()})});
}
function aggregateAverage(parts,metric,days){
  const buckets={};parts.forEach(p=>pointsFor(p,metric,days).forEach(c=>{(buckets[c.date]??=[]).push(c[metric])}));return Object.entries(buckets).sort().map(([date,v])=>({date,[metric]:v.reduce((a,b)=>a+b,0)/v.length}));
}
function renderOverviewChart(){const c=$('#overviewChart');if(!c||!c.offsetParent)return;const metric='agency',days=30,parts=state.participants;const avg=aggregateAverage(parts,metric,days);drawChart(c,[{name:lang==='no'?'Gruppesnitt':'Group average',points:avg,color:'#123f3d',average:true}],metric);$('#overviewLegend').innerHTML=`<span class="legend-item"><i class="legend-swatch" style="background:#123f3d"></i>${lang==='no'?'Gruppesnitt · egenkraft':'Group average · agency'}</span>`}
function renderAnalysis(){
  const metric=$('#analysisMetric').value||'agency',days=Number($('#analysisPeriod').value||30);if(!selectedAnalysis.size)state.participants.slice(0,3).forEach(p=>selectedAnalysis.add(p.id));
  $('#analysisParticipants').innerHTML=state.participants.map(p=>`<button class="chip ${selectedAnalysis.has(p.id)?'active':''}" data-id="${p.id}">${p.pseudonym}</button>`).join('');$$('#analysisParticipants .chip').forEach(b=>b.onclick=()=>{selectedAnalysis.has(b.dataset.id)?selectedAnalysis.delete(b.dataset.id):selectedAnalysis.add(b.dataset.id);renderAnalysis()});
  const parts=state.participants.filter(p=>selectedAnalysis.has(p.id));const series=parts.map((p,i)=>({name:p.pseudonym,points:pointsFor(p,metric,days),color:COLORS[i%COLORS.length]}));if($('#showAverage').checked&&parts.length>1)series.push({name:lang==='no'?'Gruppesnitt':'Group average',points:aggregateAverage(parts,metric,days),color:'#14212b',average:true});drawChart($('#analysisChart'),series,metric);
  const vals=parts.flatMap(p=>pointsFor(p,metric,days).map(c=>c[metric]));const latestVals=parts.map(p=>pointsFor(p,metric,days).at(-1)?.[metric]).filter(Number.isFinite);const mean=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'–';const startVals=parts.map(p=>pointsFor(p,metric,days)[0]?.[metric]).filter(Number.isFinite);const delta=latestVals.length&&startVals.length?(Number(mean(latestVals))-Number(mean(startVals))).toFixed(1):'–';
  $('#analysisSummary').innerHTML=`<div class="summary-cell"><span>${lang==='no'?'Valgte deltakere':'Selected participants'}</span><strong>${parts.length}</strong></div><div class="summary-cell"><span>${lang==='no'?'Gjennomsnitt':'Average'}</span><strong>${mean(vals)}</strong></div><div class="summary-cell"><span>${lang==='no'?'Siste snitt':'Latest average'}</span><strong>${mean(latestVals)}</strong></div><div class="summary-cell"><span>${lang==='no'?'Endring i perioden':'Change in period'}</span><strong>${delta==='–'?'–':(Number(delta)>0?'+':'')+delta}</strong></div>`;
}
function renderAll(){fillParticipantSelects();renderOverview();renderParticipants();renderForms();if(!$('#sliderGrid').children.length)renderCheckin();const m=$('#analysisMetric'),old=m.value;m.innerHTML=Object.keys(METRICS).map(k=>`<option value="${k}">${METRICS[k][lang]}</option>`).join('');m.value=old||'agency';if($('#view-analysis').classList.contains('active'))renderAnalysis()}
function init(){
  $$('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));$$('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));$('#quickCheckin').onclick=()=>{setView('checkin');$('#checkParticipant').value=activeParticipantId;renderCheckin()};
  $('#langToggle').onclick=()=>{lang=lang==='no'?'en':'no';applyLang()};$('#globalParticipant').onchange=e=>{activeParticipantId=e.target.value;$('#checkParticipant').value=activeParticipantId;renderParticipants()};$('#checkParticipant').onchange=e=>{activeParticipantId=e.target.value;$('#globalParticipant').value=activeParticipantId;const p=participant(activeParticipantId);if(p)$('#checkPhase').value=p.phase};
  $('#addParticipant').onclick=()=>$('#participantDialog').showModal();$('#saveParticipant').onclick=e=>{e.preventDefault();const pseudo=$('#newPseudo').value.trim();if(!pseudo)return;const id='p-'+Date.now().toString(36);state.participants.push({id,pseudonym:pseudo,phase:$('#newPhase').value,status:$('#newStatus').value,note:$('#newNote').value.trim(),createdAt:dayOffset(0),checkins:[],vida:{goal:'',action:'',owner:'',nextReview:''}});save();activeParticipantId=id;$('#participantForm').reset();$('#participantDialog').close();renderAll();};
  $('#fillDemoCheckin').onclick=()=>{const r=seeded(Date.now()%10000);Object.keys(METRICS).forEach(k=>{const v=k==='stress'?Math.round(3+r()*4):Math.round(5+r()*4);$('#slider-'+k).value=v;$('#val-'+k).textContent=v});$('#dayStatus').value='green'};
  $('#checkinForm').onsubmit=e=>{e.preventDefault();const p=participant($('#checkParticipant').value);if(!p)return;const rec={date:$('#checkDate').value,phase:$('#checkPhase').value,status:$('#dayStatus').value,note:$('#checkNote').value.trim()};Object.keys(METRICS).forEach(k=>rec[k]=Number($('#slider-'+k).value));p.phase=rec.phase;p.status=rec.status;p.checkins.push(rec);p.checkins.sort((a,b)=>a.date.localeCompare(b.date));save();activeParticipantId=p.id;$('#checkNote').value='';renderAll();setView('participants')};
  $('#analysisMetric').onchange=renderAnalysis;$('#analysisPeriod').onchange=renderAnalysis;$('#showAverage').onchange=renderAnalysis;window.addEventListener('resize',()=>{if($('#view-analysis').classList.contains('active'))renderAnalysis();if($('#view-overview').classList.contains('active'))renderOverviewChart()});
  $('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='aidme-vida-demo-'+dayOffset(0)+'.json';a.click();URL.revokeObjectURL(a.href)};
  $('#importData').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.participants))throw Error();state=x;save();activeParticipantId=state.participants[0]?.id;renderAll()}catch{alert(lang==='no'?'Kunne ikke lese filen.':'Could not read file.')}};
  $('#resetDemo').onclick=()=>{if(confirm(lang==='no'?'Tilbakestille til fiktive demodata?':'Reset to fictional demo data?')){state=seedData();save();activeParticipantId=state.participants[0].id;selectedAnalysis.clear();renderAll()}};
  activeParticipantId=state.participants[0]?.id;applyLang();setView('overview');
}
init();
