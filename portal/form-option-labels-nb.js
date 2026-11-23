(()=>{
'use strict';
const LABELS={
  GO:'GO',
  GO_WITH_CONDITIONS:'GO med vilkår',
  POSTPONE:'Utsett',
  NO_GO_NOW:'NO-GO nå',
  CONTINUE:'Fortsett',
  ADJUST:'Juster',
  PAUSE:'Pause',
  STOP:'Stopp'
};
function applyPublicGoTitles(root=document){
  // Display copy only; source keys, version IDs, submissions and audit remain unchanged.
  const formSelect=document.querySelector('#formSelect');
  for(const option of formSelect?.options||[]){
    if(option.textContent.includes('Pilot-GO')) option.textContent=option.textContent.replaceAll('Pilot-GO','Felles-GO');
    if(option.textContent.includes('Pilotevaluering')) option.textContent=option.textContent.replaceAll('Pilotevaluering','Felles evaluering');
  }
  const title=document.querySelector('#formTitle');
  if(title?.textContent.includes('Pilot-GO')) title.textContent=title.textContent.replaceAll('Pilot-GO','Felles-GO');
}
function apply(root=document){
  applyPublicGoTitles(root);
  root.querySelectorAll?.('select option').forEach(option=>{
    const label=LABELS[option.value];
    // Important: only mutate when the visible label actually differs.
    // The observer watches childList/subtree, so unconditional textContent writes
    // can retrigger the observer indefinitely on some mobile browsers.
    if(label&&option.textContent!==label)option.textContent=label;
  });
}
apply();
const title=document.querySelector('#formTitle');
const picker=document.querySelector('#formSelect');
if(title)new MutationObserver(()=>applyPublicGoTitles()).observe(title,{childList:true,subtree:true});
if(picker)new MutationObserver(()=>applyPublicGoTitles()).observe(picker,{childList:true});
const host=document.querySelector('#formSections');
if(host)new MutationObserver(()=>apply(host)).observe(host,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',()=>apply());
})();
