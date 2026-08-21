(() => {
  'use strict';
  // Production live-first override approved 2026-08-21.
  // N1 becomes visible after successful preflight + srcdoc assignment.
  // Natural iframe height is preferred, but lack of a Wix load/height event is not a release gate.
  if (Math.min(window.innerWidth || 9999, document.documentElement.clientWidth || 9999) > 650) return;

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    const root = document.getElementById('aidme-public-git-shell');
    if (!root) {
      if (attempts > 80) clearInterval(timer);
      return;
    }
    if (root.dataset.state === 'active') {
      clearInterval(timer);
      return;
    }
    if (root.dataset.preflight !== 'ok' || root.dataset.srcdocSet !== '1') {
      if (attempts > 80) clearInterval(timer);
      return;
    }

    const frame = root.querySelector('iframe');
    let height = 0;
    try {
      const doc = frame && frame.contentDocument;
      if (doc && doc.body) {
        height = Math.max(doc.documentElement?.scrollHeight || 0, doc.body.scrollHeight || 0);
      }
    } catch (_) {}

    const validated = Number.isFinite(height) && height >= 1200 && height <= 22000;
    if (!validated && attempts < 16) return;

    if (validated) {
      const px = Math.ceil(height) + 'px';
      ['height','min-height','max-height','block-size','min-block-size','max-block-size']
        .forEach(property => root.style.setProperty(property, px, 'important'));
      if (frame) {
        ['height','min-height','max-height','block-size','min-block-size','max-block-size']
          .forEach(property => frame.style.setProperty(property, px, 'important'));
      }
      root.dataset.height = String(Math.ceil(height));
      root.dataset.liveFirstMeasured = '1';
    } else {
      root.dataset.liveFirstMeasured = '0';
    }

    root.dataset.state = 'active';
    root.dataset.activation = validated ? 'live-first-measured' : 'live-first-provisional';
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
    clearInterval(timer);
  }, 100);
})();
