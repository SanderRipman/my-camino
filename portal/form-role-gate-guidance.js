(()=>{
'use strict';

const q=new URLSearchParams(location.search),requestedKey=q.get('key')||'';
const DECISION_KEYS=new Set(['via_roadmap','individual_go_no_go','participant_agreement','pilot_go']);
function roleCodes(){try{return [...new Set((grants||[]).filter(active).map(g=>String(g.role_code||'')))]}catch{return[]}}
function apply(){
  if(!DECISION_KEYS.has(requestedKey))return;
  const blocked=document.querySelector('#blocked');if(!blocked||blocked.classList.contains('hidden'))return;
  const roles=roleCodes(),onlyAdmin=roles.length>0&&roles.every(r=>['system_admin','project_owner'].includes(r));
  const h=blocked.querySelector('h2'),p=document.querySelector('#blockedText');
  if(h)h.textContent='Riktig rolle må overta dette beslutningspunktet';
  if(p)p.textContent=onlyAdmin
    ?'Du er innlogget som systemadministrator/prosjekteier, men det gir ikke automatisk VÍA-faglig handlingsrett. Systemadministrator skal ikke være en skjult superrolle. Bruk en eksplisitt Programleder-, VÍA-ansvarlig- eller relevant fagrolle med riktig scope for individuell VÍA-vurdering.'
    :'Denne handlingen krever en eksplisitt rolle og riktig deltaker-/pilotscope. Portalen åpner ikke et annet skjema som reserve.';
  let note=blocked.querySelector('[data-via-ser-gate-note]');if(!note){note=document.createElement('div');note.dataset.viaSerGateNote='1';note.className='preview-strip';note.innerHTML='<strong>VÍA → SER er en kontrollert kjede.</strong><br>VÍA-veikart → individuell GO/NO-GO → deltakeravtale og navngitt VIDA-eier → samlet Pilot-GO → siste SER-kontroll. Et vanlig VÍA-skjema skal derfor ikke alene ha en knapp som «flytter til SER».';blocked.appendChild(note)}
}
const observer=new MutationObserver(apply);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
setTimeout(apply,120);setTimeout(apply,400);
})();