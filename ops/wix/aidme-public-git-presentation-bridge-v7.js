(function(){
  'use strict';
  const MARK='data-aidme-nav-top', BASE=420;
  const COMMIT='ccc7646a98a134833072292a84db099c977c04b7';
  const RAW='https://raw.githubusercontent.com/SanderRipman/my-camino/'+COMMIT+'/public-site/current/';
  const PAGES=['index.html','via.html','ser.html','vida.html','deltakere.html','partnere.html','ruter.html','om.html','kontakt.html'];
  const ASSETS=['assets/aidme-logo.webp','assets/alone-trail.webp','assets/arrival-expectation.webp','assets/border-bridge.webp','assets/compostela.webp','assets/credential.webp','assets/cruz-de-ferro.webp','assets/dawn.webp','assets/hero-group.webp','assets/journal.webp','assets/santiago-team.webp','assets/social-meal.webp','assets/zero-km.webp'];
  const H320={'index.html':7869,'via.html':3825,'ser.html':4067,'vida.html':3988,'deltakere.html':5386,'partnere.html':4065,'ruter.html':8368,'om.html':3583,'kontakt.html':2508};
  const H412={'index.html':7589,'via.html':3545,'ser.html':3817,'vida.html':3745,'deltakere.html':5063,'partnere.html':3823,'ruter.html':8260,'om.html':3358,'kontakt.html':2400};
  const cache=new Map();
  let bridgeReady=false, bridgeStarted=false, currentPage='index.html';

  function isAidmeFrame(f){if(f.dataset.aidmeTopShell==='1')return false;const src=(f.getAttribute('src')||'').toLowerCase();const h=Number(f.getAttribute('height')||0);return src.includes('aidme-public-preview')||h>=1800||f.dataset.aidmeGitBridge==='1';}
  function frame(){return [...document.querySelectorAll('iframe')].find(isAidmeFrame)||null;}
  function topOf(f){return Math.max(0,Math.round(f.getBoundingClientRect().top+window.scrollY));}
  function px(el,k,v){el.style.setProperty(k,v+'px','important');}
  function setBox(el,h){px(el,'height',h);px(el,'min-height',h);px(el,'max-height',h);el.style.setProperty('block-size',h+'px','important');el.style.setProperty('min-block-size',h+'px','important');el.style.setProperty('max-block-size',h+'px','important');}
  function resizeChain(f,h){const fr=f.getBoundingClientRect();setBox(f,h);f.setAttribute('height',String(h));f.style.setProperty('width','100%','important');let n=f.parentElement,depth=0;while(n&&n!==document.body&&n!==document.documentElement&&depth<12){const r=n.getBoundingClientRect();const desired=Math.max(h,Math.ceil((fr.top-r.top)+h));if(n.querySelectorAll('iframe').length===1&&n.contains(f)&&r.height>desired+80){setBox(n,desired);n.style.setProperty('--height',desired+'px','important');const cs=getComputedStyle(n);if(cs.display.includes('grid')){n.style.setProperty('grid-template-rows','auto','important');n.style.setProperty('grid-auto-rows','auto','important');n.style.setProperty('align-content','start','important');}if(cs.display.includes('flex'))n.style.setProperty('align-items','stretch','important');}n=n.parentElement;depth++;}requestAnimationFrame(function(){let a=f.parentElement,d=0;const rr=f.getBoundingClientRect();while(a&&a!==document.body&&a!==document.documentElement&&d<12){const ar=a.getBoundingClientRect();const desired=Math.max(h,Math.ceil((rr.top-ar.top)+h));if(a.querySelectorAll('iframe').length===1&&a.contains(f)&&ar.height>desired+80)setBox(a,desired);a=a.parentElement;d++;}});}
  function mobileFallback(path){if(window.innerWidth>650)return null;let key=(path||'').split('/').filter(Boolean).pop()||'index.html';if(!key.includes('.'))key+='.html';if(!H320[key]||!H412[key])return null;const w=Math.max(320,Math.min(412,window.innerWidth));const t=(w-320)/92;return Math.ceil(H320[key]+(H412[key]-H320[key])*t+90);}
  function reset(f){resizeChain(f,BASE);}

  async function fetchWithTimeout(url,asText=true){
    const c=new AbortController();const t=setTimeout(()=>c.abort(),6500);
    try{const r=await fetch(url,{mode:'cors',cache:'force-cache',signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status+' '+url);return asText?r.text():r.blob();}
    finally{clearTimeout(t);}
  }
  async function text(path){if(cache.has(path))return cache.get(path);const p=fetchWithTimeout(RAW+path,true);cache.set(path,p);return p;}
  function safeScript(js){return js.replace(/<\/script/gi,'<\\/script');}
  function stripLocalAssets(html){
    return html
      .replace(/<link\b[^>]*href=["'][^"']*(?:site|refine)\.css(?:\?[^"']*)?["'][^>]*>/gi,'')
      .replace(/<script\b[^>]*src=["'][^"']*site\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');
  }
  function patchSiteJs(js){
    return js
      .replace('const storedLanguage = localStorage.getItem("aidme_public_lang");','let storedLanguage = null; try { storedLanguage = localStorage.getItem("aidme_public_lang"); } catch (_) {}')
      .replace('localStorage.setItem("aidme_public_lang", language);','try { localStorage.setItem("aidme_public_lang", language); } catch (_) {}')
      .replace(/\s*const style = document\.createElement\("link"\);[\s\S]*?document\.head\.appendChild\(style\);/,'\n  /* mobile-ux.css is inlined by the Wix Git presentation bridge. */');
  }
  function bridgeNavScript(page){return `(function(){document.documentElement.dataset.aidmeGitPage=${JSON.stringify(page.replace('.html',''))};document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a)return;var h=a.getAttribute('href')||'';var m=h.match(/(?:^|\\/)(index|via|ser|vida|deltakere|partnere|ruter|om|kontakt)\\.html(?:[?#].*)?$/);if(!m)return;e.preventDefault();parent.postMessage({type:'aidme-vida:git-nav',path:m[1]+'.html'},'*');},true);})();`;}
  async function makePage(page){
    const [html,siteCss,refineCss,mobileCss,siteJs]=await Promise.all([text(page),text('site.css'),text('refine.css'),text('mobile-ux.css'),text('site.js')]);
    let out=stripLocalAssets(html);
    const head=`<base href="${RAW}"><style data-aidme-git="site">${siteCss}</style><style data-aidme-git="refine">${refineCss}</style><style data-aidme-git="mobile">${mobileCss}</style>`;
    out=out.replace(/<head([^>]*)>/i,`<head$1>${head}`);
    const scripts=`<script>${safeScript(patchSiteJs(siteJs))}<\/script><script>${safeScript(bridgeNavScript(page))}<\/script>`;
    out=out.replace(/<\/body>/i,scripts+'</body>');
    return out;
  }
  async function preflight(){
    await Promise.all([text('site.css'),text('refine.css'),text('mobile-ux.css'),text('site.js'),...PAGES.map(text)]);
    await Promise.all(['assets/aidme-logo.webp','assets/hero-group.webp','assets/cruz-de-ferro.webp'].map(p=>fetchWithTimeout(RAW+p,false)));
    return true;
  }
  async function loadGitPage(page){
    if(!PAGES.includes(page))return;
    const f=frame();if(!f)return;
    try{const doc=await makePage(page);currentPage=page;f.dataset.aidmeGitBridge='1';f.srcdoc=doc;window.scrollTo({top:topOf(f),left:0,behavior:'auto'});}catch(err){console.warn('[AidMe Git bridge] navigation kept on current page:',err);}
  }
  async function activate(f){
    if(bridgeStarted)return;bridgeStarted=true;
    try{await preflight();bridgeReady=true;await loadGitPage('index.html');console.info('[AidMe Git bridge] active at '+COMMIT);}
    catch(err){bridgeReady=false;console.warn('[AidMe Git bridge] preflight failed; canonical Netlify source remains active.',err);}
  }
  function bind(f){
    if(!isAidmeFrame(f)||f.hasAttribute(MARK))return;
    f.setAttribute(MARK,'1');reset(f);
    f.addEventListener('load',function(){if(f.dataset.aidmeGitBridge!=='1')reset(f);window.scrollTo({top:topOf(f),left:0,behavior:'auto'});});
    activate(f);
  }
  function scan(){document.querySelectorAll('iframe').forEach(bind);}

  window.addEventListener('message',function(e){
    const f=frame();if(!f||e.source!==f.contentWindow)return;
    const d=e.data||{};
    if(d.type==='aidme-vida:git-nav'&&bridgeReady){loadGitPage(String(d.path||''));return;}
    if(d.type!=='aidme-vida:content-height')return;
    const n=Number(d.height);if(!Number.isFinite(n)||n<=0)return;
    let h;
    if(f.dataset.aidmeGitBridge==='1')h=Math.max(BASE,Math.min(20000,Math.ceil(n)));
    else {
      let host='';try{host=new URL(e.origin).hostname.toLowerCase();}catch(_){return;}
      if(!host.endsWith('aidme-public-preview.netlify.app'))return;
      const fallback=mobileFallback(d.path);h=fallback||Math.max(BASE,Math.min(20000,Math.ceil(n)));
    }
    resizeChain(f,h);
  });
  scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
})();
