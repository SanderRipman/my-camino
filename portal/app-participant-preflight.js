(()=>{
'use strict';
const COPY={
  'VÍA':{title:'Hva er riktig vei nå?',text:'VÍA handler om å finne retning, ressurser og det som kan gjøre neste steg trygt og gjennomførbart. Du trenger ikke ha alle svarene nå.'},
  'SER':{title:'Frihet innen en trygg ramme',text:'På reisen er målet ikke å prestere mest mulig. Rytme, fellesskap, pauser og tilpasning er en del av det å komme fram på din måte.'},
  'VIDA':{title:'Hva tar du med deg hjem?',text:'VIDA handler om å gjøre erfaringen konkret hjemme. Ett lite neste steg er nok – det kan justeres underveis.'},
  'ny VÍA':{title:'Neste retning',text:'En ny VÍA starter fra det du allerede har erfart – ikke fra null. Nå handler det om hva som er riktig neste vei.'}
};
function phase(){try{return stageLabel(ownParticipant()?.stage||'VIA')}catch{return'VÍA'}}
function enhanceParticipantJourney(){
  if(typeof isStaff!=='function'||isStaff())return;const host=document.querySelector('#participantDetail');if(!host)return;
  const ph=phase(),copy=COPY[ph]||COPY['VÍA'];
  let story=host.querySelector('.participant-story-card');if(!story){story=document.createElement('section');story.className='participant-story-card';const grid=host.querySelector('.detail-grid');(grid||host.firstElementChild)?.insertAdjacentElement(grid?'beforebegin':'afterend',story)}
  story.innerHTML=`<p class="eyebrow">${ph==='VÍA'?'Før':ph==='SER'?'Under':ph==='VIDA'?'Etter':'Videre'}</p><h3>${copy.title}</h3><p>${copy.text}</p><div class="participant-quicklinks"><a class="ghost" href="./inbox.html">Innboks</a><a class="ghost" href="./documents.html#myFiles">Mine dokumenter</a><a class="ghost participant-sos-link" href="./sos.html">Hjelp &amp; SOS</a></div>`;
  const grid=host.querySelector('.detail-grid');if(grid&&!grid.closest('details.participant-practical')){const details=document.createElement('details');details.className='participant-practical';const summary=document.createElement('summary');summary.textContent='Praktisk info';grid.replaceWith(details);details.append(summary,grid)}
  const intro=document.querySelector('#participantsIntro');if(intro)intro.textContent='Her ser du hvor du er, hva som er neste steg og hvem som følger deg videre.';
  if(!document.querySelector('#participant-preflight-style')){const s=document.createElement('style');s.id='participant-preflight-style';s.textContent=`.participant-story-card{margin:10px 0 14px;padding:16px;border-radius:16px;background:linear-gradient(145deg,rgba(227,239,237,.78),rgba(255,253,248,.96));border:1px solid rgba(23,104,94,.16)}.participant-story-card h3{margin:2px 0 6px}.participant-story-card p{margin:0 0 10px;line-height:1.5}.participant-quicklinks{display:flex;gap:7px;flex-wrap:wrap}.participant-practical{margin:8px 0 14px}.participant-practical summary{cursor:pointer;font-weight:800;color:#526065;margin-bottom:8px}.participant-sos-link{border-color:#b4433f!important;color:#8c302e!important}@media(max-width:780px){.participant-story-card{padding:13px}.participant-quicklinks{display:grid;grid-template-columns:1fr 1fr}.participant-quicklinks .participant-sos-link{grid-column:1/-1;text-align:center}}`;document.head.appendChild(s)}
}
const baseRenderParticipantDetail=typeof renderParticipantDetail==='function'?renderParticipantDetail:null;if(baseRenderParticipantDetail){renderParticipantDetail=function(){const r=baseRenderParticipantDetail();setTimeout(enhanceParticipantJourney,0);return r}}
document.addEventListener('aidme:portal-rendered',()=>setTimeout(enhanceParticipantJourney,0));window.addEventListener('pageshow',()=>setTimeout(enhanceParticipantJourney,80));setTimeout(enhanceParticipantJourney,240);
})();