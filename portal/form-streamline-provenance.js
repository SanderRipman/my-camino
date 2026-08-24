(()=>{
'use strict';

let provenanceRequest=0;

function streamlineActiveFormKey(){
  try{return currentDef?.key||new URLSearchParams(location.search).get('key')||''}catch{return new URLSearchParams(location.search).get('key')||''}
}
function streamlineActiveGrant(g){
  const now=new Date();
  return !g?.revoked_at&&(!g.valid_from||new Date(g.valid_from)<=now)&&(!g.valid_until||new Date(g.valid_until)>now);
}
function streamlineHasRole(code){return (grants||[]).some(g=>streamlineActiveGrant(g)&&g.role_code===code)}
function streamlineParticipantId(){
  try{return selectedParticipant()?.id||ownParticipant()?.id||null}catch{return null}
}
function streamlineHost(){
  let host=document.querySelector('#formStreamlineGuidance');
  if(host)return host;
  const qna=document.querySelector('#formQnaGuidance');
  if(!qna)return null;
  host=document.createElement('article');
  host.id='formStreamlineGuidance';
  host.className='panel-card streamline-guidance hidden';
  host.setAttribute('aria-live','polite');
  qna.insertAdjacentElement('afterend',host);
  return host;
}
function streamlineStyle(){
  if(document.querySelector('#form-streamline-style'))return;
  const style=document.createElement('style');
  style.id='form-streamline-style';
  style.textContent=`
    .streamline-guidance{margin:14px 0;padding:16px 18px;border-left:4px solid #c8a45d;background:#fbf8ef}
    .streamline-guidance h3{margin:.15rem 0 .45rem}.streamline-guidance p{margin:.35rem 0}
    .streamline-lanes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
    .streamline-lane{padding:10px 12px;border:1px solid rgba(18,63,61,.15);border-radius:12px;background:#fff}
    .streamline-lane span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#62706f}.streamline-lane b{display:block;margin-top:3px}
    .streamline-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.streamline-actions a{display:inline-flex;text-decoration:none}
    @media(max-width:700px){.streamline-lanes{grid-template-columns:1fr}.streamline-guidance{padding:14px}}
  `;
  document.head.appendChild(style);
}
function streamlinePill(rag){
  const value=String(rag||'').toUpperCase();
  if(value==='RED')return'Rød';if(value==='YELLOW')return'Gul';if(value==='GREEN')return'Grønn';return'Ikke satt';
}
function streamlineLink(key,label,participantId){
  const p=participantId?`&participant=${encodeURIComponent(participantId)}`:'';
  return `<a class="ghost link-btn" href="./form-runner.html?key=${encodeURIComponent(key)}${p}">${esc(label)}</a>`;
}
function streamlineBaseLanes(){
  return `<div class="streamline-lanes"><div class="streamline-lane"><span>Deltaker</span><b>Egne ord / egen innsjekk</b></div><div class="streamline-lane"><span>Ansatt</span><b>Operativt minimum</b></div><div class="streamline-lane"><span>Partner / VIDA</span><b>Kun avtalt handoff</b></div></div>`;
}
async function streamlineLatestCheckin(participantId){
  if(!participantId)return null;
  const {data,error}=await client.from('ser_checkins')
    .select('checkin_date,rag')
    .eq('participant_id',participantId)
    .order('checkin_date',{ascending:false})
    .limit(1)
    .maybeSingle();
  return error?null:data||null;
}
async function renderFormStreamlineGuidance(){
  const host=streamlineHost();if(!host)return;
  streamlineStyle();
  const key=streamlineActiveFormKey(),participantId=streamlineParticipantId(),request=++provenanceRequest;
  if(!['ser_daily','incident','vida_plan','pilot_evaluation'].includes(key)){
    host.classList.add('hidden');host.innerHTML='';return;
  }
  host.classList.remove('hidden');
  if(key==='ser_daily'){
    host.innerHTML=`<p class="eyebrow">Én registrering · riktig kilde</p><h3>SER-dagsbildet skal ikke dobbelregistreres</h3>${streamlineBaseLanes()}<p>Laster deltakerens siste egeninnsjekk som read-only signal …</p>`;
    const checkin=await streamlineLatestCheckin(participantId);if(request!==provenanceRequest)return;
    const signal=checkin?`${esc(checkin.checkin_date)} · ${esc(streamlinePill(checkin.rag))}`:'Ingen egeninnsjekk funnet';
    host.innerHTML=`<p class="eyebrow">Én registrering · riktig kilde</p><h3>SER-dagsbildet skal ikke dobbelregistreres</h3>${streamlineBaseLanes()}<p><strong>Deltakerens egen innsjekk:</strong> ${signal}. Dette er et signal – ikke tekst som skal kopieres inn i teamloggen.</p><p><strong>Teamets ansvar her:</strong> før bare observérbare fakta, rute/tilpasning, tiltak, ansvar og nødvendig oppfølging. Vanlig slitenhet eller en legitim pause er ikke automatisk et avvik.</p><div class="streamline-actions">${streamlineLink('incident','Reell hendelse/avvik →',participantId)}</div>`;
    return;
  }
  if(key==='incident'){
    host.innerHTML=`<p class="eyebrow">Hendelse · bare ved behov</p><h3>Ikke gjør normal SER til avviksrapportering</h3>${streamlineBaseLanes()}<p>Bruk denne loggen bare når noe faktisk er en hendelse eller et avvik. Beskriv observerbare fakta, umiddelbar risiko, tiltak/varsling og hvem som lukker oppfølgingen. Ikke kopier deltakerens private refleksjoner.</p><div class="streamline-actions">${streamlineLink('ser_daily','Til normal SER-operativlogg →',participantId)}</div>`;
    return;
  }
  if(key==='vida_plan'){
    const staff=typeof isStaff==='function'&&isStaff();
    const owner=streamlineHasRole('vida_owner');
    const heading=staff?(owner?'VIDA-eier: overta handling, ikke historikken':'VIDA-handoff: bare det som trengs videre'):'Din levende VIDA-plan';
    const body=staff?'Overfør avtalte handlinger, støtte/eier og frister som er nødvendige hjemme. Rå SER-notater, hendelsesdetaljer og private refleksjoner skal ikke kopieres bare fordi de finnes.':'Dette er samme levende plan gjennom 72 timer, 14, 30 og 90 dager. Oppdater neste handling her – ikke lag nye parallelle planer.';
    host.innerHTML=`<p class="eyebrow">SER → VIDA · minst mulig dobbelføring</p><h3>${esc(heading)}</h3>${streamlineBaseLanes()}<p>${esc(body)}</p>`;
    return;
  }
  if(key==='pilot_evaluation'){
    host.innerHTML=`<p class="eyebrow">Evaluering · aggregert læring</p><h3>Lær av piloten uten å lage en ny deltakerjournal</h3>${streamlineBaseLanes()}<p>Bruk aggregert sikkerhet, erfaring, ressursbruk og forbedringspunkter. Individuelle SER-notater og private refleksjoner skal ikke kopieres inn når aggregert læring er tilstrekkelig.</p>`;
  }
}

const streamlineChooseForm=typeof chooseForm==='function'?chooseForm:null;
if(streamlineChooseForm){
  chooseForm=async function(...args){const result=await streamlineChooseForm.apply(this,args);await renderFormStreamlineGuidance();return result};
}
document.querySelector('#participantSelect')?.addEventListener('change',()=>setTimeout(renderFormStreamlineGuidance,20));
document.querySelector('#formSelect')?.addEventListener('change',()=>setTimeout(renderFormStreamlineGuidance,20));
setTimeout(renderFormStreamlineGuidance,220);
})();
