(() => {
  'use strict';

  const ROOT_ID = 'aidme-public-git-shell';
  const SOURCE = 'https://6a84e458653a15b76ca8f95e--aidme-public-candidate-20260817.netlify.app/?aidme-shell=1';
  const TRUSTED_HOST = 'aidme-public-candidate-20260817.netlify.app';
  const SAFE_BOOT_HEIGHT = 12000;
  const MIN_HEIGHT = 500;
  const MAX_HEIGHT = 20000;
  const MOBILE_MAX = 650;

  if (document.getElementById(ROOT_ID)) return;

  function viewportWidth() {
    const vv = Number(window.visualViewport && window.visualViewport.width) || 0;
    const doc = Number(document.documentElement && document.documentElement.clientWidth) || 0;
    const win = Number(window.innerWidth) || 0;
    const candidates = [vv, doc, win].filter((v) => Number.isFinite(v) && v > 0);
    return Math.max(1, Math.round(candidates.length ? Math.min(...candidates) : 0));
  }

  function shouldUseMobileShell() {
    const width = viewportWidth();
    return width > 0 && width <= MOBILE_MAX;
  }

  // Presentation bridge is intentionally mobile-only. The owner-approved
  // desktop Wix revision 7 remains untouched on wider viewports.
  if (!shouldUseMobileShell()) return;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.dataset.state = 'booting';
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = [
    'position:absolute',
    'left:0',
    'top:0',
    'min-width:0',
    'box-sizing:border-box',
    `height:${SAFE_BOOT_HEIGHT}px`,
    'opacity:0',
    'pointer-events:none',
    'overflow:hidden',
    'background:transparent',
    'z-index:2147483000'
  ].join(';');

  const frame = document.createElement('iframe');
  frame.src = SOURCE;
  frame.title = 'AidMe VIDA';
  frame.setAttribute('loading', 'eager');
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.style.cssText = [
    'display:block',
    'min-width:0',
    'box-sizing:border-box',
    `height:${SAFE_BOOT_HEIGHT}px`,
    'border:0',
    'margin:0',
    'padding:0',
    'background:#f5f0e6'
  ].join(';');
  root.appendChild(frame);

  document.body.insertBefore(root, document.body.firstChild);

  let activated = false;

  function syncWidth() {
    const measuredViewport = viewportWidth();
    if (!measuredViewport) return;
    const px = `${measuredViewport}px`;
    root.dataset.viewportWidth = String(measuredViewport);
    root.style.setProperty('width', px, 'important');
    root.style.setProperty('max-width', px, 'important');
    frame.style.setProperty('width', px, 'important');
    frame.style.setProperty('max-width', px, 'important');
    frame.setAttribute('width', String(measuredViewport));
    requestAnimationFrame(() => {
      root.dataset.hostWidth = String(Math.round(root.getBoundingClientRect().width));
    });
  }

  function setHeight(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return false;
    const height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.ceil(numeric)));
    root.style.setProperty('height', `${height}px`, 'important');
    frame.style.setProperty('height', `${height}px`, 'important');
    frame.setAttribute('height', String(height));
    root.dataset.height = String(height);
    return true;
  }

  function activate() {
    if (activated) return;
    activated = true;
    root.dataset.state = 'active';
    root.removeAttribute('aria-hidden');
    root.style.setProperty('position', 'relative', 'important');
    root.style.setProperty('left', 'auto', 'important');
    root.style.setProperty('top', 'auto', 'important');
    root.style.setProperty('opacity', '1', 'important');
    root.style.setProperty('pointer-events', 'auto', 'important');
    root.style.setProperty('background', '#f5f0e6', 'important');

    const legacy = document.getElementById('SITE_CONTAINER');
    if (legacy) {
      legacy.dataset.aidmeLegacyHidden = '1';
      legacy.style.setProperty('display', 'none', 'important');
    }

    document.documentElement.style.setProperty('background', '#f5f0e6', 'important');
    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('margin', '0', 'important');
    document.body.style.setProperty('padding', '0', 'important');
    document.body.style.setProperty('background', '#f5f0e6', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    syncWidth();
  }

  window.addEventListener('message', (event) => {
    if (event.source !== frame.contentWindow) return;

    let host = '';
    try {
      host = new URL(event.origin).hostname.toLowerCase();
    } catch (_) {
      return;
    }
    if (host !== TRUSTED_HOST && !host.endsWith(`--${TRUSTED_HOST}`)) return;

    const data = event.data || {};
    if (data.type !== 'aidme-vida:content-height') return;
    if (!setHeight(data.height)) return;

    root.dataset.path = String(data.path || '');
    activate();
  });

  frame.addEventListener('error', () => {
    root.dataset.state = 'failed';
    // Fail safe: legacy Wix remains visible because activate() has not run.
  });

  syncWidth();
  window.addEventListener('resize', syncWidth, { passive: true });
  window.addEventListener('orientationchange', syncWidth, { passive: true });

  // Never hide legacy Wix on a timer. A valid height message from the
  // immutable trusted Netlify frame is the only release gate.
})();
