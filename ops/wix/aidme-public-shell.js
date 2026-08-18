(() => {
  'use strict';

  const ROOT_ID = 'aidme-public-git-shell';
  const SOURCE = 'https://aidme-public-preview.netlify.app/?aidme-shell=1';
  const TRUSTED_HOST = 'aidme-public-preview.netlify.app';
  const SAFE_BOOT_HEIGHT = 12000;
  const MIN_HEIGHT = 500;
  const MAX_HEIGHT = 20000;

  if (document.getElementById(ROOT_ID)) return;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.dataset.state = 'booting';
  root.style.cssText = [
    'position:absolute',
    'left:-200vw',
    'top:0',
    'width:100vw',
    'max-width:100vw',
    'min-width:0',
    'box-sizing:border-box',
    `height:${SAFE_BOOT_HEIGHT}px`,
    'visibility:hidden',
    'overflow:hidden',
    'background:#f5f0e6',
    'z-index:2147483000'
  ].join(';');

  const frame = document.createElement('iframe');
  frame.src = SOURCE;
  frame.title = 'AidMe VIDA';
  frame.setAttribute('loading', 'eager');
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.style.cssText = [
    'display:block',
    'width:100vw',
    'max-width:100vw',
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
    root.style.setProperty('position', 'relative', 'important');
    root.style.setProperty('left', 'auto', 'important');
    root.style.setProperty('top', 'auto', 'important');
    root.style.setProperty('visibility', 'visible', 'important');

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
    // Fail safe: the legacy Wix page remains visible because activate() has not run.
  });

  // Do not hide the legacy Wix page on a timer. A valid message from the
  // trusted Netlify frame is the release gate for switching the presentation.
})();
