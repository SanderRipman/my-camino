(()=>{
'use strict';

const q=new URLSearchParams(location.search),requestedKey=q.get('key')||'';
const DECISION_KEYS=new Set(['via_roadmap','individual_go_no_go','participant_agreement','pilot_go']);
function roleCodes(){try{return [...new Set((grants||[]).filter(active).map(g=>String(g.role_code||'')))]}catch{return[]}}
function apply(){
  if(!DECISION_KEYS.has(requestedKey))return;
  const blocked=document.querySelector('#blocked');if(!blocked||blocked.classList.contains('hidden'))return;
  // This is staff-only guidance. Never replace a participant's own MFA/scope error.
  // AAL failures must keep their original "Bekreft Authenticator" instruction.
  let self=false;
  try{self=typeof ownParticipant==='function'&&!!ownParticipant()}catch{}
  const roles=roleCodes();
  if(self||!roles.length)return;
  const p=document.querySelector('#blockedText');
  if(/Authenticator|tofaktor|AAL2/i.test(p?.textContent||''))return;
  const h=blocked.querySelector('h2');
  // A missing SUBMITTED record or a transport/backend failure is not proof
  // of a missing role. Preserve the original reason and safe task return.
  const headingText=String(h?.textContent||'').trim();
  const roleDenied=headingText==='Denne handlingen er ikke tilgjengelig for rollen din'
    ||headingText==='Ingen tildelte skjema for denne rollen'
    ||/Du har ikke en aktiv VÍA-fagrolle/.test(p?.textContent||'');
  if(!roleDenied)return;
  const onlyAdmin=roles.every(r=>['system_admin','project_owner'].includes(r));
  const heading='Riktig rolle må overta dette beslutningspunktet';
  const explanation=onlyAdmin
    ?'Du er innlogget som systemadministrator/prosjekteier, men det gir ikke automatisk VÍA-faglig handlingsrett. Systemadministrator skal ikke være en skjult superrolle. Bruk en eksplisitt Programleder-, VÍA-ansvarlig- eller relevant fagrolle med riktig scope for individuell VÍA-vurdering.'
    :'Denne handlingen krever en eksplisitt rolle og riktig deltaker-/pilotscope. Portalen åpner ikke et annet skjema som reserve.';
  if(h&&h.textContent!==heading)h.textContent=heading;
  if(p&&p.textContent!==explanation)p.textContent=explanation;
  let note=blocked.querySelector('[data-via-ser-gate-note]');if(!note){note=document.createElement('div');note.dataset.viaSerGateNote='1';note.className='preview-strip';note.innerHTML='<strong>VÍA → SER er en kontrollert kjede.</strong><br>VÍA-veikart → individuell GO/NO-GO → deltakeravtale og navngitt VIDA-eier → samlet Pilot-GO → siste SER-kontroll. Et vanlig VÍA-skjema skal derfor ikke alene ha en knapp som «flytter til SER».';blocked.appendChild(note)}
}
const observer=new MutationObserver(apply);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
setTimeout(apply,120);setTimeout(apply,400);
})();