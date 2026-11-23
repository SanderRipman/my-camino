/* Restore catalog and precise form card when returning from AidMe knowledge.
 * Adds no data scope; this is navigation only. Safe for repeated SPA renders.
 */
(()=>{
'use strict';
const host=document.querySelector('#formLibrary');if(!host)return;
let done=false;
function restore(){
 if(done)return;
 const hash=location.hash||'';
 if(!hash.startsWith('#forms/'))return;
 const key=decodeURIComponent(hash.slice('#forms/'.length));
 const K=window.AIDME_KNOWLEDGE;
 if(!K?.getForm(key))return;
 const card=[...host.querySelectorAll('[data-knowledge-card-link]')].find(x=>x.dataset.key===key)?.closest('.form-module');
 if(!card)return;
 try{show('forms')}catch{return}
 done=true;
 requestAnimationFrame(()=>card.scrollIntoView({block:'center',behavior:'instant'}));
}
new MutationObserver(restore).observe(host,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{done=false;restore()});
restore();
})();
