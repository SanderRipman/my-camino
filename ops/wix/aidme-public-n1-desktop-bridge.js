'use strict';

const AIDME_N1_COMMIT = 'dd4d67583b1cde88c91a0ea9e58e097b8599a857';
const AIDME_N1_RAW = `https://raw.githubusercontent.com/SanderRipman/my-camino/${AIDME_N1_COMMIT}/public-site/current/`;
const AIDME_N1_PAGES = new Set(['index.html','via.html','ser.html','vida.html','deltakere.html','partnere.html','ruter.html','om.html','kontakt.html','takk.html']);
const AIDME_N1_CACHE = new Map();

async function aidmeFetchText(path) {
  if (AIDME_N1_CACHE.has(path)) return AIDME_N1_CACHE.get(path);
  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(AIDME_N1_RAW + path, { mode: 'cors', cache: 'force-cache', signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${path}`);
      return await response.text();
    } finally { clearTimeout(timeout); }
  })();
  AIDME_N1_CACHE.set(path, promise);
  return promise;
}
function aidmeSafeScript(js) { return js.replace(/<\/script/gi, '<\\/script'); }
function aidmeStripLocalAssets(html) {
  return html
    .replace(/<link\b[^>]*href=["'][^"']*(?:site|refine)\.css(?:\?[^"']*)?["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*src=["'][^"']*site\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, '')
    .replace(/<script\b[^>]*src=["'][^"']*n1-intake-safe\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, '');
}
function aidmePatchSiteJs(js, virtualPath) {
  return js
    .replace('const storedLanguage = localStorage.getItem("aidme_public_lang");', 'let storedLanguage = null; try { storedLanguage = localStorage.getItem("aidme_public_lang"); } catch (_) {}')
    .replace('localStorage.setItem("aidme_public_lang", language);', 'try { localStorage.setItem("aidme_public_lang", language); } catch (_) {}')
    .replace(/const shellPresentation = [^;]+;/, 'const shellPresentation = true;')
    .replaceAll('window.location.pathname', JSON.stringify('/' + virtualPath))
    .replace(/\s*const style = document\.createElement\("link"\);[\s\S]*?document\.head\.appendChild\(style\);/, '\n  /* mobile-ux.css is inlined by the Wix N1 bridge. */')
    .replace(/\/\* 2026-08-21 owner-approved N1 public journey layer\. \*\/[\s\S]*$/, '/* N1 layer is inlined by the Wix N1 bridge. */\n');
}
function aidmePatchN1Js(js, virtualPath, virtualSearch) {
  return js
    .replace(/\s*const css = document\.createElement\('link'\);[\s\S]*?document\.head\.appendChild\(css\);/, '\n  /* n1-ux.css is inlined by the Wix N1 bridge. */')
    .replaceAll('location.pathname', JSON.stringify('/' + virtualPath))
    .replaceAll('location.search', JSON.stringify(virtualSearch));
}
function aidmePatchIntakeJs(js, virtualSearch) {
  return js
    .replaceAll('location.search', JSON.stringify(virtualSearch))
    .replace("location.href = 'takk.html?preview=1';", "parent.postMessage({type:'aidme-vida:git-nav',path:'takk.html?preview=1'},'*');")
    .replace("location.href = 'takk.html';", "parent.postMessage({type:'aidme-vida:git-nav',path:'takk.html'},'*');");
}
function aidmeBridgeNavScript() {
  return `(function(){document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a)return;var h=a.getAttribute('href')||'';if(!h||h[0]==='#'||/^mailto:|^tel:|^https?:/i.test(h))return;var u;try{u=new URL(h,'https://aidme.local/');}catch(_){return;}var p=u.pathname.split('/').filter(Boolean).pop()||'index.html';if(!${JSON.stringify([...AIDME_N1_PAGES])}.includes(p))return;e.preventDefault();parent.postMessage({type:'aidme-vida:git-nav',path:p+u.search+u.hash},'*');},true);})();`;
}
async function aidmeMakePage(pathWithQuery) {
  const virtual = new URL(pathWithQuery || 'index.html', 'https://aidme.local/');
  const page = virtual.pathname.split('/').filter(Boolean).pop() || 'index.html';
  if (!AIDME_N1_PAGES.has(page)) throw new Error(`Unsupported page ${page}`);
  const virtualSearch = virtual.search || '';
  const [html, siteCss, refineCss, mobileCss, n1Css, siteJs, n1Js, intakeJs] = await Promise.all([
    aidmeFetchText(page), aidmeFetchText('site.css'), aidmeFetchText('refine.css'), aidmeFetchText('mobile-ux.css'), aidmeFetchText('n1-ux.css'), aidmeFetchText('site.js'), aidmeFetchText('n1-ux.js'), aidmeFetchText('n1-intake-safe.js')
  ]);
  let out = aidmeStripLocalAssets(html);
  const head = `<base href="${AIDME_N1_RAW}"><style data-aidme-git="site">${siteCss}</style><style data-aidme-git="refine">${refineCss}</style><style data-aidme-git="mobile">${mobileCss}</style><style data-aidme-git="n1">${n1Css}</style>`;
  out = out.replace(/<head([^>]*)>/i, `<head$1>${head}`);
  const scripts = `<script>${aidmeSafeScript(aidmePatchSiteJs(siteJs, page))}<\/script><script>${aidmeSafeScript(aidmePatchN1Js(n1Js, page, virtualSearch))}<\/script><script>${aidmeSafeScript(aidmePatchIntakeJs(intakeJs, virtualSearch))}<\/script><script>${aidmeSafeScript(aidmeBridgeNavScript())}<\/script>`;
  out = out.replace(/<\/body>/i, scripts + '</body>');
  return out;
}
async function aidmeN1Preflight() {
  await Promise.all(['index.html','kontakt.html','takk.html','site.css','refine.css','mobile-ux.css','n1-ux.css','site.js','n1-ux.js','n1-intake-safe.js'].map(aidmeFetchText));
  return true;
}

(() => {
  const MARK = 'data-aidme-n1-bridge';
  const BASE_HEIGHT = 500;
  let currentPath = 'index.html';
  let activeFrame = null;
  function isAidmeFrame(frame) {
    if (frame.dataset.aidmeTopShell === '1') return false;
    const src = (frame.getAttribute('src') || '').toLowerCase();
    const h = Number(frame.getAttribute('height') || 0);
    return src.includes('aidme-public-preview') || src.includes('aidme-public-candidate') || h >= 1800 || frame.dataset.aidmeGitBridge === '1';
  }
  function findFrame() { return [...document.querySelectorAll('iframe')].find(isAidmeFrame) || null; }
  function setBox(el, height) { const px = `${height}px`; ['height','min-height','max-height','block-size','min-block-size','max-block-size'].forEach(prop => el.style.setProperty(prop, px, 'important')); }
  function resizeChain(frame, height) {
    const h = Math.max(BASE_HEIGHT, Math.min(22000, Math.ceil(Number(height) || BASE_HEIGHT)));
    setBox(frame, h); frame.setAttribute('height', String(h)); frame.style.setProperty('width','100%','important');
    let node = frame.parentElement, depth = 0;
    while (node && node !== document.body && node !== document.documentElement && depth < 12) {
      const r = node.getBoundingClientRect(), fr = frame.getBoundingClientRect();
      const desired = Math.max(h, Math.ceil((fr.top - r.top) + h));
      if (node.querySelectorAll('iframe').length === 1 && node.contains(frame) && r.height > desired + 80) setBox(node, desired);
      node = node.parentElement; depth++;
    }
  }
  function frameTop(frame) { return Math.max(0, Math.round(frame.getBoundingClientRect().top + window.scrollY)); }
  async function load(path, scroll = true) {
    const frame = activeFrame || findFrame(); if (!frame) return false;
    const virtual = new URL(path || 'index.html', 'https://aidme.local/');
    const page = virtual.pathname.split('/').filter(Boolean).pop() || 'index.html'; if (!AIDME_N1_PAGES.has(page)) return false;
    const doc = await aidmeMakePage(page + virtual.search + virtual.hash);
    currentPath = page + virtual.search + virtual.hash; activeFrame = frame; frame.dataset.aidmeGitBridge = '1'; frame.dataset.aidmeN1Commit = AIDME_N1_COMMIT; frame.srcdoc = doc;
    if (scroll) window.scrollTo({ top: frameTop(frame), left: 0, behavior: 'auto' }); return true;
  }
  async function bind(frame) {
    if (!isAidmeFrame(frame) || frame.hasAttribute(MARK)) return;
    frame.setAttribute(MARK, '1'); activeFrame = frame;
    try { await aidmeN1Preflight(); await load('index.html', false); console.info('[AidMe N1 bridge] active', AIDME_N1_COMMIT); }
    catch (error) { console.warn('[AidMe N1 bridge] preflight failed; existing Wix/Netlify frame remains available.', error); }
  }
  window.addEventListener('message', event => {
    const frame = activeFrame || findFrame(); if (!frame || event.source !== frame.contentWindow) return; const data = event.data || {};
    if (data.type === 'aidme-vida:git-nav') { load(String(data.path || currentPath)).catch(error => console.warn('[AidMe N1 bridge] navigation failed', error)); return; }
    if (data.type === 'aidme-vida:content-height') resizeChain(frame, data.height);
  });
  function scan() { document.querySelectorAll('iframe').forEach(bind); }
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
