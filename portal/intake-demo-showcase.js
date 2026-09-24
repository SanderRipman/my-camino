(()=>{
'use strict';
const params=new URLSearchParams(location.search),requested=params.get('intake');let selected=false;
function demoOrigin(){const h=location.hostname;return h==='demo.aidme.no'||h==='mycamino-demo.netlify.app'||h.endsWith('--mycamino-demo.netlify.app')}
function replaceCopy(){
  if(!demoOrigin())return;
  document.title='AidMe VIDA · Mottak og første avklaring';
  const h1=document.querySelector('.topbar h1');if(h1)h1.textContent='Mottak og første avklaring';
  const blocked=document.querySelector('#blocked p');if(blocked&&/inntakstriage|intake-tjenesten|triage/i.test(blocked.textContent||''))blocked.textContent=(blocked.textContent||'').replace(/VÍA-\/inntakstriage/gi,'mottak og første avklaring').replace(/autoriserte intake-tjenesten/gi,'autoriserte mottakstjenesten').replace(/triage/gi,'avklaring');
  const summary=document.querySelector('.n2-summary');if(summary)summary.setAttribute('aria-label','Oversikt over første avklaring');
  for(const el of document.querySelectorAll('#workspace,#blocked')){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){const t=node.nodeValue||'';if(!/triage|intake-tjenesten/i.test(t))continue;node.nodeValue=t.replace(/VÍA-triage/gi,'Første avklaring').replace(/triageoppsummering/gi,'oppsummering').replace(/aktiv triage/gi,'aktiv avklaring').replace(/triage/gi,'avklaring').replace(/intake-tjenesten/gi,'mottakstjenesten')}
  }
}
function selectRequested(){
  if(!demoOrigin()||!requested||selected)return;const safe=window.CSS?.escape?CSS.escape(requested):requested.replace(/[^a-zA-Z0-9_-]/g,'');const button=document.querySelector(`#intakeList [data-id="${safe}"]`);if(!button)return;selected=true;button.click();setTimeout(()=>document.querySelector('#detail')?.scrollIntoView({behavior:'smooth',block:'start'}),80)
}
const root=document.querySelector('.workspace')||document.body;new MutationObserver(()=>{replaceCopy();selectRequested()}).observe(root,{childList:true,subtree:true,characterData:true});
replaceCopy();setTimeout(selectRequested,250);setTimeout(selectRequested,900);
})();
