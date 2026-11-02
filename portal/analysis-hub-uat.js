(() => {
  'use strict';
  // Presentation-only tabs; all operative access checks remain the portal's responsibility.
  const tabs=document.getElementById('analysisHubTabs');
  const frame=document.getElementById('analysisEmbeddedFrame');
  if(!tabs||!frame)return;
  const panels={
    aidme:document.getElementById('analysisHubAidme'),
    sources:document.getElementById('analysisHubSources'),
    report:document.getElementById('analysisHubReport')
  };
  function activate(mode,focus=false){
    if(!Object.hasOwn(panels,mode)||!panels[mode])return;
    for(const [name,panel] of Object.entries(panels)){
      panel.hidden=(name!==mode);
      panel.setAttribute('aria-hidden',String(name!==mode));
    }
    const buttons=[...tabs.querySelectorAll('[data-analysis-mode]')];
    for(const button of buttons){
      const on=button.dataset.analysisMode===mode;
      button.setAttribute('aria-pressed',String(on));
      if(on&&focus)button.focus();
    }
    // Other scripts may own the current operative graph. Never replace it or change access.
    if(mode==='aidme')requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  tabs.addEventListener('click',event=>{
    const selected=event.target.closest('[data-analysis-mode]');
    if(selected&&tabs.contains(selected))activate(selected.dataset.analysisMode);
  });
  tabs.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=[...tabs.querySelectorAll('[data-analysis-mode]')];
    const current=buttons.indexOf(document.activeElement);
    if(current===-1)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    activate(buttons[next].dataset.analysisMode,true);
  });
  // Opaque-origin, sandboxed iframe shares *only its height* with the parent, never data.
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow)return;
    const payload=event.data;
    if(!payload||payload.type!=='aidme:synthetic-report-height'||!Number.isFinite(payload.height))return;
    const height=Math.round(Math.max(650,Math.min(8500,payload.height)));
    frame.style.height=height+'px';
  });
  activate('aidme');
})();
