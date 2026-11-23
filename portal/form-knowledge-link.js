/* Compact context help in the REAL versioned form runner; never leaves/saves the form.
 * The same knowledge-registry powers /portal/knowledge.html and onboarding references.
 */
(()=>{
'use strict';
const K=window.AIDME_KNOWLEDGE;const title=document.querySelector('#formTitle');
if(!title||!K)return;
const host=title.parentElement;
const details=document.createElement('details');details.className='form-knowledge-quick';
details.id='formKnowledgeQuick';
const summary=document.createElement('summary');summary.textContent='Mer info om dette skjemaet';details.appendChild(summary);
const content=document.createElement('section');content.className='form-knowledge-body';details.appendChild(content);
host.appendChild(details);
function paint(){
 let key='';
 try{key=typeof currentDef!=='undefined'&&currentDef?.key||new URLSearchParams(location.search).get('key')||''}catch{}
 const f=K.getForm(key);
 if(!f){details.hidden=true;return}
 details.hidden=false;
 if(details.dataset.key===key)return;
 details.dataset.key=key;details.open=false;content.replaceChildren();
 const add=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;content.appendChild(el);return el};
 add('p','Når: '+f.when+' · Ansvar: '+f.who);
 add('p',f.why);
 add('h4','Viktig å vite');
 const ul=document.createElement('ul');
 for(const p of f.points){const li=document.createElement('li');li.textContent=p;ul.appendChild(li)}content.appendChild(ul);
 add('p','Neste: '+f.next);
 const link=document.createElement('a');link.href=K.hrefForForm(key);link.target='_blank';link.rel='noopener noreferrer';link.className='context-link';
 link.textContent='Åpne full veiledning i ny fane';
 link.title='Åpnes i ny fane slik at utkastet ditt ikke forsvinner';
 content.appendChild(link);
 const caveat=add('small','Arbeidsreferanse – ingen faglig GO eller ny skjemaregistrering.');caveat.className='privacy-note';
}
title.addEventListener('change',paint);
document.querySelector('#formSelect')?.addEventListener('change',()=>setTimeout(paint,0));
new MutationObserver(paint).observe(title,{characterData:true,subtree:true,childList:true});
paint();
})();
