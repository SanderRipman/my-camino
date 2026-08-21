(function(){
  'use strict';
  const MOBILE_MAX=650;
  const NETLIFY='https://6a818fb0563075817cf6ffdd--aidme-public-preview.netlify.app/';
  const seen=new WeakSet();
  let resizeTimer=0;
  function mobile(){return Math.min(window.innerWidth||9999,document.documentElement.clientWidth||9999)<=MOBILE_MAX;}
  function target(f){const s=(f.getAttribute('src')||'').toLowerCase();return s.includes('aidme-public-preview.netlify.app')||f.dataset.aidmeGitBridge==='1';}
  function fullWidth(f){
    if(!mobile()) return;
    const vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0); if(!vw)return;
    const left=Math.round(f.getBoundingClientRect().left);
    f.style.setProperty('display','block','important');
    f.style.setProperty('width',vw+'px','important');
    f.style.setProperty('min-width',vw+'px','important');
    f.style.setProperty('max-width',vw+'px','important');
    f.style.setProperty('margin-left',(-left)+'px','important');
    let n=f.parentElement,d=0;
    while(n&&n!==document.body&&n!==document.documentElement&&d<10){
      n.style.setProperty('overflow','visible','important');
      n.style.setProperty('max-width','none','important');
      if(n.getBoundingClientRect().width<vw*.95)n.style.setProperty('width','100%','important');
      n=n.parentElement;d++;
    }
  }
  function forceNetlify(f){
    if(!mobile()||!target(f))return;
    let changed=false;
    if(f.getAttribute('srcdoc')){f.removeAttribute('srcdoc');changed=true;}
    const src=(f.getAttribute('src')||'');
    if(!src.startsWith(NETLIFY)){f.setAttribute('src',NETLIFY);changed=true;}
    f.dataset.aidmeGitBridge='1';
    f.dataset.aidmeMobileHardFallback='v9';
    fullWidth(f);
    if(changed)requestAnimationFrame(()=>fullWidth(f));
  }
  function bind(f){
    if(!target(f))return;
    if(!seen.has(f)){
      seen.add(f);
      new MutationObserver(()=>{if(mobile())forceNetlify(f);}).observe(f,{attributes:true,attributeFilter:['srcdoc','src']});
      f.addEventListener('load',()=>{if(mobile())forceNetlify(f);});
    }
    forceNetlify(f);
  }
  function scan(){if(!mobile())return;document.querySelectorAll('iframe').forEach(bind);}
  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='aidme-vida:content-height')scan();});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(scan,80);},{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(scan,120),{passive:true});
  setInterval(scan,1000);
})();
