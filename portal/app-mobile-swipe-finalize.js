(()=>{
'use strict';
const BP=780;
const mobile=()=>window.innerWidth<=BP;
const nav=()=>document.querySelector('.sidebar nav');
const views=()=>[...document.querySelectorAll('#appView .workspace .view,.app-shell .workspace .view')];

function installStyle(){
  if(document.getElementById('aidme-mobile-swipe-finalize-style'))return;
  const s=document.createElement('style');s.id='aidme-mobile-swipe-finalize-style';s.textContent=`
  @media(max-width:${BP}px){
    .sidebar nav{scroll-snap-type:x mandatory!important;scroll-padding-inline:18px!important}
    .sidebar nav .nav-item:not(.hidden):not(.nav-mobile-secondary):not(.nav-ia-demoted){scroll-snap-align:center!important;scroll-snap-stop:always!important}
  }`;
  document.head.appendChild(s);
}
function clearPreviewState(){
  for(const view of views()){
    if(!view.classList.contains('aidme-flow-preview')&&!view.hasAttribute('style'))continue;
    view.classList.remove('aidme-flow-preview');
    for(const k of ['transition','transform','opacity','willChange','position','top','left','width','zIndex','pointerEvents'])view.style[k]='';
  }
}
function wrapShow(){
  if(typeof show!=='function'||show.__aidmeSwipeFinalize)return;
  const prior=show;
  const wrapped=function(name){
    if(mobile())clearPreviewState();
    prior(name);
    if(mobile()&&(window.scrollX||window.scrollY))window.scrollTo({left:0,top:0,behavior:'auto'});
  };
  wrapped.__aidmeSwipeFinalize=true;show=wrapped;
}
function snapActiveIntoView(){
  if(!mobile())return;const n=nav(),a=n?.querySelector('.nav-item.active,[aria-current="page"]');
  if(!n||!a)return;
  requestAnimationFrame(()=>a.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'}));
}
function apply(){if(!mobile())return;installStyle();wrapShow();snapActiveIntoView()}

installStyle();apply();
document.addEventListener('aidme:portal-rendered',()=>setTimeout(apply,0));
document.addEventListener('aidme:navigation-normalized',()=>setTimeout(apply,0));
window.addEventListener('pageshow',()=>setTimeout(apply,20));
window.addEventListener('resize',()=>setTimeout(apply,0),{passive:true});
})();