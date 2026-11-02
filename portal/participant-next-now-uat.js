(() => {
'use strict';
const panel=document.getElementById('participantNextNow');
const heading=document.getElementById('homeHeading');
if(!panel||!heading)return;
const stageValue=p=>String(p?.stage||'').toUpperCase();
function render(){
 let person=null,staff=false;
 try{if(typeof ownParticipant!=='function'||typeof isStaff!=='function')return;person=ownParticipant();staff=isStaff();}catch{return}
 const loginReady=!!document.getElementById('appView')&&!document.getElementById('appView').classList.contains('hidden');
 if(!loginReady||(staff===false&&!person)){panel.hidden=true;return}
 let label='',text='',href='',view='';
 if(staff){
  label='Åpne mine oppgaver';text='Arbeid fra tildelte oppgaver og gjeldende deltaker-/pilotscope. Flere fagroller gir ikke automatisk bredere innsyn.';view='tasks';
 } else{
  const stage=stageValue(person);
  if(['VIA','READY_FOR_GO','INTEREST','NEW_VIA'].includes(stage)){label='Fortsett mitt VÍA-veikart';text='Retning, ressurser og forberedelser. Beslutning om GO/NO-GO tas separat.';href='./form-runner.html?key=via_roadmap&participant='+encodeURIComponent(person.id)}
  else if(['GO','GO_WITH_CONDITIONS'].includes(stage)){label='Les og bekreft avtalen';text='Vilkår og sikkerhet må være avklart før SER.';href='./form-runner.html?key=participant_agreement&participant='+encodeURIComponent(person.id)}
  else if(stage==='SER'){label='Gå til dagens innsjekk';text='Kort daglig egenrapport. Den nye femspørsmålsutgaven er foreløpig syntetisk UAT uten lagring.';view='checkin'}
  else if(stage==='VIDA'){label='Se min VIDA-plan';text='Én levende handlingsplan med navngitt oppfølging.';href='./form-runner.html?key=vida_plan&participant='+encodeURIComponent(person.id)}
  else{panel.hidden=true;return}
 }
 panel.replaceChildren();
 const small=document.createElement('p');small.className='eyebrow';small.textContent=staff?'Min arbeidsflyt':'Min neste handling';
 const p=document.createElement('p');p.textContent=text;
 const control=href?document.createElement('a'):document.createElement('button');
 control.className='primary link-btn';control.textContent=label;
 if(href)control.href=href;
 else{control.type='button';control.addEventListener('click',()=>document.querySelector('[data-view="'+view+'"]')?.click())}
 panel.append(small,p,control);panel.hidden=false;
}
new MutationObserver(()=>requestAnimationFrame(render)).observe(heading,{childList:true,subtree:true});
window.addEventListener('pageshow',render);
setTimeout(render,500);
})();
