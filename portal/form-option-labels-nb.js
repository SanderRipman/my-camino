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
function apply(root=document){
  root.querySelectorAll?.('select option').forEach(option=>{
    const label=LABELS[option.value];
    if(label)option.textContent=label;
  });
}
apply();
const host=document.querySelector('#formSections');
if(host)new MutationObserver(()=>apply(host)).observe(host,{childList:true,subtree:true});
document.addEventListener('aidme:portal-rendered',()=>apply());
})();
