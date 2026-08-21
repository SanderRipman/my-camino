(() => {
'use strict';

const AIDME_N1_COMMIT = 'e6d62240f4c30e4346d447ebcb5506dffe316bf1';
const AIDME_N1_RAW = `https://raw.githubusercontent.com/SanderRipman/my-camino/${AIDME_N1_COMMIT}/public-site/current/`;
const AIDME_N1_PAGES = new Set(['index.html','via.html','ser.html','vida.html','deltakere.html','partnere.html','ruter.html','om.html','kontakt.html','takk.html']);
const AIDME_N1_CACHE = new Map();
async function aidmeFetchText(path) {
  if (AIDME_N1_CACHE.has(path)) return AIDME_N1_CACHE.get(path);
  const promise = (async () => { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 7000); try { const response = await fetch(AIDME_N1_RAW + path, { mode:'cors', cache:'force-cache', signal:controller.signal }); if(!response.ok) throw new Error(`HTTP ${response.status} ${path}`); return await response.text(); } finally { clearTimeout(timeout); } })();
  AIDME_N1_CACHE.set(path, promise); return promise;
}
function aidmeSafeScript(js){return js.replace(/<\/script/gi,'<\\/script');}
function aidmeStripLocalAssets(html){return html.replace(/<link\b[^>]*href=["'][^"']*(?:site|refine)\.css(?:\?[^"']*)?["'][^>]*>/gi,'').replace(/<script\b[^>]*src=["'][^"']*site\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'').replace(/<script\b[^>]*src=["'][^"']*n1-intake-safe\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,'');}
function aidmePatchSiteJs(js,virtualPath){return js.replace('const storedLanguage = localStorage.getItem("aidme_public_lang");','let storedLanguage = null; try { storedLanguage = localStorage.getItem("aidme_public_lang"); } catch (_) {}').replace('localStorage.setItem("aidme_public_lang", language);','try { localStorage.setItem("aidme_public_lang", language); } catch (_) {}').replace(/const shellPresentation = [^;]+;/,'const shellPresentation = true;').replaceAll('window.location.pathname',JSON.stringify('/'+virtualPath)).replace(/\s*const style = document\.createElement\("link"\);[\s\S]*?document\.head\.appendChild\(style\);/,'\n  /* mobile-ux.css is inlined by the Wix N1 bridge. */').replace(/\/\* 2026-08-21 owner-approved N1 public journey layer\. \*\/[\s\S]*$/,'/* N1 layer is inlined by the Wix N1 bridge. */\n');}
function aidmePatchN1Js(js,virtualPath,virtualSearch){return js.replace(/\s*const css = document\.createElement\('link'\);[\s\S]*?document\.head\.appendChild\(css\);/,'\n  /* n1-ux.css is inlined by the Wix N1 bridge. */').replaceAll('location.pathname',JSON.stringify('/'+virtualPath)).replaceAll('location.search',JSON.stringify(virtualSearch));}
function aidmePatchIntakeJs(js,virtualSearch){return js.replaceAll('location.search',JSON.stringify(virtualSearch)).replace("location.href = 'takk.html?preview=1';","parent.postMessage({type:'aidme-vida:git-nav',path:'takk.html?preview=1'},'*');").replace("location.href = 'takk.html';","parent.postMessage({type:'aidme-vida:git-nav',path:'takk.html'},'*');");}
function aidmeBridgeNavScript(){return `(function(){document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a)return;var h=a.getAttribute('href')||'';if(!h||h[0]==='#'||/^mailto:|^tel:|^https?:/i.test(h))return;var u;try{u=new URL(h,'https://aidme.local/');}catch(_){return;}var p=u.pathname.split('/').filter(Boolean).pop()||'index.html';if(!${JSON.stringify([...AIDME_N1_PAGES])}.includes(p))return;e.preventDefault();parent.postMessage({type:'aidme-vida:git-nav',path:p+u.search+u.hash},'*');},true);})();`;}
async function aidmeMakePage(pathWithQuery){const virtual=new URL(pathWithQuery||'index.html','https://aidme.local/');const page=virtual.pathname.split('/').filter(Boolean).pop()||'index.html';if(!AIDME_N1_PAGES.has(page))throw new Error(`Unsupported page ${page}`);const virtualSearch=virtual.search||'';const [html,siteCss,refineCss,mobileCss,n1Css,siteJs,n1Js,intakeJs]=await Promise.all([aidmeFetchText(page),aidmeFetchText('site.css'),aidmeFetchText('refine.css'),aidmeFetchText('mobile-ux.css'),aidmeFetchText('n1-ux.css'),aidmeFetchText('site.js'),aidmeFetchText('n1-ux.js'),aidmeFetchText('n1-intake-safe.js')]);let out=aidmeStripLocalAssets(html);const head=`<base href="${AIDME_N1_RAW}"><style data-aidme-git="site">${siteCss}</style><style data-aidme-git="refine">${refineCss}</style><style data-aidme-git="mobile">${mobileCss}</style><style data-aidme-git="n1">${n1Css}</style>`;out=out.replace(/<head([^>]*)>/i,`<head$1>${head}`);const scripts=`<script>${aidmeSafeScript(aidmePatchSiteJs(siteJs,page))}<\/script><script>${aidmeSafeScript(aidmePatchN1Js(n1Js,page,virtualSearch))}<\/script><script>${aidmeSafeScript(aidmePatchIntakeJs(intakeJs,virtualSearch))}<\/script><script>${aidmeSafeScript(aidmeBridgeNavScript())}<\/script>`;out=out.replace(/<\/body>/i,scripts+'</body>');return out;}
async function aidmeN1Preflight(){await Promise.all(['index.html','kontakt.html','takk.html','site.css','refine.css','mobile-ux.css','n1-ux.css','site.js','n1-ux.js','n1-intake-safe.js'].map(aidmeFetchText));return true;}

(() => {
  const ROOT_ID='aidme-public-git-shell'; const SAFE_BOOT_HEIGHT=12000,MIN_HEIGHT=500,MAX_HEIGHT=22000,MOBILE_MAX=650;
  if(document.getElementById(ROOT_ID))return;
  function viewportWidth(){const vv=Number(window.visualViewport&&window.visualViewport.width)||0;const doc=Number(document.documentElement&&document.documentElement.clientWidth)||0;const win=Number(window.innerWidth)||0;const values=[vv,doc,win].filter(v=>Number.isFinite(v)&&v>0);return Math.max(1,Math.round(values.length?Math.min(...values):0));}
  if(viewportWidth()>MOBILE_MAX)return;
  const root=document.createElement('div');root.id=ROOT_ID;root.dataset.state='booting';root.dataset.preflight='pending';root.dataset.aidmeTopShell='1';root.dataset.aidmeN1Commit=AIDME_N1_COMMIT;root.setAttribute('aria-hidden','true');root.style.cssText=`position:absolute;left:0;top:0;min-width:0;box-sizing:border-box;height:${SAFE_BOOT_HEIGHT}px;opacity:0;pointer-events:none;overflow:hidden;background:transparent;z-index:2147483000`;
  const frame=document.createElement('iframe');frame.title='AidMe VIDA';frame.dataset.aidmeTopShell='1';frame.setAttribute('loading','eager');frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');frame.style.cssText=`display:block;min-width:0;box-sizing:border-box;height:${SAFE_BOOT_HEIGHT}px;border:0;margin:0;padding:0;background:#f5f0e6`;root.appendChild(frame);document.body.insertBefore(root,document.body.firstChild);
  let activated=false,currentPath='index.html';
  function syncWidth(){const width=viewportWidth();if(!width)return;const px=`${width}px`;root.dataset.viewportWidth=String(width);root.style.setProperty('width',px,'important');root.style.setProperty('max-width',px,'important');frame.style.setProperty('width',px,'important');frame.style.setProperty('max-width',px,'important');frame.setAttribute('width',String(width));requestAnimationFrame(()=>{root.dataset.hostWidth=String(Math.round(root.getBoundingClientRect().width));});}
  function lockHeight(el,height){const px=`${height}px`;['height','min-height','max-height','block-size','min-block-size','max-block-size'].forEach(p=>el.style.setProperty(p,px,'important'));}
  function setHeight(value){const numeric=Number(value);if(!Number.isFinite(numeric)||numeric<=0)return false;const h=Math.max(MIN_HEIGHT,Math.min(MAX_HEIGHT,Math.ceil(numeric)));lockHeight(root,h);lockHeight(frame,h);frame.removeAttribute('height');root.dataset.height=String(h);return true;}
  function activate(source){if(activated)return;activated=true;root.dataset.state='active';root.dataset.activation=source||'unknown';root.removeAttribute('aria-hidden');root.style.setProperty('position','relative','important');root.style.setProperty('left','auto','important');root.style.setProperty('top','auto','important');root.style.setProperty('opacity','1','important');root.style.setProperty('pointer-events','auto','important');root.style.setProperty('background','#f5f0e6','important');const legacy=document.getElementById('SITE_CONTAINER');if(legacy){legacy.dataset.aidmeLegacyHidden='1';legacy.style.setProperty('display','none','important');}document.documentElement.style.setProperty('background','#f5f0e6','important');document.documentElement.style.setProperty('overflow-x','hidden','important');document.body.style.setProperty('margin','0','important');document.body.style.setProperty('padding','0','important');document.body.style.setProperty('background','#f5f0e6','important');document.body.style.setProperty('overflow-x','hidden','important');syncWidth();}
  function naturalFrameHeight(){
    const doc=frame.contentDocument;
    if(!doc||!doc.body||!doc.querySelector('main'))return 0;
    const text=(doc.body.innerText||doc.body.textContent||'').replace(/\s+/g,' ');
    if(!text.includes('Portugal → Spania'))return 0;
    const nodes=[...doc.body.children].filter(el=>{if(el.tagName==='SCRIPT'||el.tagName==='STYLE')return false;try{return doc.defaultView.getComputedStyle(el).position!=='fixed';}catch(_){return true;}});
    const bottom=nodes.reduce((max,el)=>{const r=el.getBoundingClientRect();return Math.max(max,r.bottom+(doc.defaultView?.scrollY||0));},0);
    return Math.max(MIN_HEIGHT,Math.ceil(bottom+2));
  }
  function tryActivateFromFrame(source){
    if(activated)return true;
    try{
      const height=naturalFrameHeight();
      root.dataset.measuredHeight=String(height||0);
      if(!Number.isFinite(height)||height<1200||height>MAX_HEIGHT)return false;
      if(!setHeight(height))return false;
      root.dataset.path=currentPath;
      activate(source);
      return true;
    }catch(error){root.dataset.measure='error';console.warn('[AidMe N1 mobile] validated frame measurement failed',error);return false;}
  }
  frame.addEventListener('load',()=>{
    root.dataset.frameLoaded='1';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(tryActivateFromFrame('srcdoc-load'))return;
      setTimeout(()=>tryActivateFromFrame('srcdoc-load-delayed'),250);
      setTimeout(()=>tryActivateFromFrame('srcdoc-load-delayed-2'),1000);
    }));
  });
  async function load(path){const virtual=new URL(path||'index.html','https://aidme.local/');const page=virtual.pathname.split('/').filter(Boolean).pop()||'index.html';if(!AIDME_N1_PAGES.has(page))return false;currentPath=page+virtual.search+virtual.hash;const doc=await aidmeMakePage(currentPath);frame.srcdoc=doc;root.dataset.srcdocSet='1';return true;}
  window.addEventListener('message',event=>{if(event.source!==frame.contentWindow)return;const data=event.data||{};if(data.type==='aidme-vida:git-nav'){load(String(data.path||currentPath)).catch(err=>console.warn('[AidMe N1 mobile] navigation failed',err));return;}if(data.type!=='aidme-vida:content-height'||!setHeight(data.height))return;root.dataset.path=currentPath;root.dataset.messageHeight=String(Math.ceil(Number(data.height)||0));activate('post-message');});
  syncWidth();window.addEventListener('resize',syncWidth,{passive:true});window.addEventListener('orientationchange',syncWidth,{passive:true});
  aidmeN1Preflight().then(()=>{root.dataset.preflight='ok';return load('index.html');}).catch(error=>{root.dataset.preflight='failed';root.dataset.state='failed';console.warn('[AidMe N1 mobile] preflight failed; legacy Wix remains visible.',error);});
})();
})();
