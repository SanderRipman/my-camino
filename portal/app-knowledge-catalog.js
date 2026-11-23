/* Optional knowledge preview for EVERY card in the existing form catalog.
 * Does not change visibility, capability, role, task, or the real form engine.
 * The original catalog is allowed to re-render; the observer reattaches exactly
 * one internal guide link to each known card with a stable definition key.
 */
(()=>{
'use strict';
const K=window.AIDME_KNOWLEDGE,host=document.querySelector('#formLibrary');
if(!K||!host)return;
function sync(){
 let defs=[];try{defs=typeof formDefs!=='undefined'&&Array.isArray(formDefs)?formDefs:[]}catch{}
 const cards=[...host.querySelectorAll('.form-module')];
 cards.forEach((card,i)=>{
  const key=defs[i]?.key,f=K.getForm(key);
  const prev=card.querySelector('[data-knowledge-card-link]');
  if(!f){prev?.remove();return}
  if(prev?.dataset.key===key)return;
  prev?.remove();
  const link=document.createElement('a');link.dataset.knowledgeCardLink='1';link.dataset.key=key;
  link.href=K.hrefForForm(key);link.target='_blank';link.rel='noopener noreferrer';link.className='context-link';link.textContent='Mer info / forhåndsvisning';
  link.title='Åpnes i en ny fane. Operativ utfylling krever fortsatt riktig arbeidsrolle og scope.';
  const wrap=document.createElement('div');wrap.className='form-knowledge-catalog-link';wrap.appendChild(link);card.appendChild(wrap);
 });
}
new MutationObserver(sync).observe(host,{childList:true});sync();
})();
