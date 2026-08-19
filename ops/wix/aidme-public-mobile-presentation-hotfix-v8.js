/* SUPERSEDED FOR LIVE MOBILE PRESENTATION 2026-08-19.
   Historical v8 attempt retained for traceability.
   Active mobile presentation fallback is ops/wix/aidme-public-mobile-hard-fallback-v9.js.
   Do not reactivate v8 without a new physical mobile QA decision. */

(function(){
  'use strict';
  const RAW_BASE='https://raw.githubusercontent.com/SanderRipman/my-camino/ccc7646a98a134833072292a84db099c977c04b7/public-site/current/';
  const MEDIA_BASE='https://6a818fb0563075817cf6ffdd--aidme-public-preview.netlify.app/';
  const MOBILE_MAX=650;
  const bound=new WeakSet();
  let resizeTimer=0;

  function isTarget(f){
    const src=(f.getAttribute('src')||'').toLowerCase();
    const doc=(f.getAttribute('srcdoc')||'');
    return src.includes('aidme-public-preview.netlify.app') || f.dataset.aidmeGitBridge==='1' || doc.includes('AidMe VIDA') || doc.includes(RAW_BASE);
  }
  function isMobile(){
    return Math.min(window.innerWidth||9999,document.documentElement.clientWidth||9999)<=MOBILE_MAX;
  }
  function patchMediaBase(f){
    const doc=f.getAttribute('srcdoc')||'';
    if(!doc || !doc.includes(RAW_BASE)) return false;
    const patched=doc.split(RAW_BASE).join(MEDIA_BASE);
    if(patched===doc) return false;
    f.dataset.aidmeMediaOrigin='netlify-immutable';
    f.setAttribute('srcdoc',patched);
    return true;
  }
  function releaseDesktop(f){
    if(f.dataset.aidmeMobileWidth!=='1') return;
    ['width','min-width','max-width','margin-left'].forEach(k=>f.style.removeProperty(k));
    delete f.dataset.aidmeMobileWidth;
    delete f.dataset.aidmeMobileShift;
  }
  function expandMobile(f){
    if(!isMobile()){
      releaseDesktop(f);
      return;
    }
    const vw=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    if(!vw) return;
    f.dataset.aidmeMobileWidth='1';
    f.style.setProperty('display','block','important');
    f.style.setProperty('width',vw+'px','important');
    f.style.setProperty('min-width',vw+'px','important');
    f.style.setProperty('max-width','none','important');

    if(!f.dataset.aidmeMobileShift){
      const left=Math.round(f.getBoundingClientRect().left);
      f.dataset.aidmeMobileShift=String(-left);
    }
    f.style.setProperty('margin-left',f.dataset.aidmeMobileShift+'px','important');

    let n=f.parentElement,depth=0;
    while(n&&n!==document.body&&n!==document.documentElement&&depth<8){
      const r=n.getBoundingClientRect();
      if(r.width<vw*.92){
        n.style.setProperty('overflow','visible','important');
        n.style.setProperty('max-width','none','important');
      }
      n=n.parentElement;
      depth++;
    }
  }
  function stabilize(f){
    patchMediaBase(f);
    expandMobile(f);
    requestAnimationFrame(()=>expandMobile(f));
  }
  function bind(f){
    if(!isTarget(f)) return;
    if(!bound.has(f)){
      bound.add(f);
      new MutationObserver(()=>stabilize(f)).observe(f,{attributes:true,attributeFilter:['srcdoc','src']});
      f.addEventListener('load',()=>stabilize(f));
    }
    stabilize(f);
  }
  function scan(){
    document.querySelectorAll('iframe').forEach(bind);
  }
  function resetWidth(){
    document.querySelectorAll('iframe').forEach(f=>{
      delete f.dataset.aidmeMobileShift;
      if(isTarget(f)) stabilize(f);
    });
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcdoc']});
  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type!=='aidme-vida:content-height') return;
    document.querySelectorAll('iframe').forEach(f=>{
      if(isTarget(f)&&(!f.contentWindow||e.source===f.contentWindow)) requestAnimationFrame(()=>expandMobile(f));
    });
  });
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(resetWidth,80);
  },{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(resetWidth,120),{passive:true});
  setInterval(scan,1500);
})();
