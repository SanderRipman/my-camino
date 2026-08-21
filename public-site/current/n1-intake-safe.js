(() => {
  const endpoint = 'https://ibloovohuhrceivrvhvn.supabase.co/functions/v1/public-intake';
  const config = window.AIDME_PUBLIC_INTAKE || {
    enabled: false,
    turnstileSiteKey: '',
    privacyNoticeVersion: 'aidme-public-interest-v0.1-2026-08-21'
  };

  const activate = (form) => {
    if (form.dataset.n1SafeBound === '1') return;
    form.dataset.n1SafeBound = '1';

    // Never use Netlify Forms as the participant-data backend. The canonical
    // architecture is the hardened Supabase Edge Function -> intakes -> triage.
    form.removeAttribute('data-netlify');
    form.removeAttribute('netlify-honeypot');
    form.removeAttribute('action');
    form.removeAttribute('method');
    form.querySelector('input[name="form-name"]')?.remove();

    const noteField = form.querySelector('textarea[name="interest_note"]')?.closest('.n1-field');
    if (noteField) noteField.remove();

    const note = form.querySelector('.n1-form-note');
    if (note && !config.enabled) {
      note.insertAdjacentHTML('beforeend', ' <span class="n1-preview-only"><strong>Preview:</strong> skjemaet kan testes, men ingen persondata lagres før den sikre intake-gaten er aktivert.</span>');
    }

    let turnstileToken = '';
    if (config.enabled && config.turnstileSiteKey) {
      const holder = document.createElement('div');
      holder.className = 'n1-field full n1-turnstile';
      holder.innerHTML = '<div class="cf-turnstile"></div>';
      form.querySelector('.n1-form-actions')?.insertAdjacentElement('beforebegin', holder);
      const render = () => window.turnstile?.render(holder.querySelector('.cf-turnstile'), {
        sitekey: config.turnstileSiteKey,
        callback: token => { turnstileToken = token; },
        'expired-callback': () => { turnstileToken = ''; }
      });
      if (!window.turnstile) {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true; s.defer = true; s.onload = render; document.head.appendChild(s);
      } else render();
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const button = form.querySelector('button[type="submit"]');
      const original = button?.innerHTML;
      if (button) { button.disabled = true; button.textContent = 'Sender…'; }

      if (!config.enabled) {
        sessionStorage.setItem('aidme_n1_preview_intake', '1');
        location.href = 'takk.html?preview=1';
        return;
      }

      if (!turnstileToken) {
        if (button) { button.disabled = false; button.innerHTML = original; }
        alert('Bekreft at du ikke er en robot før du sender.');
        return;
      }

      const data = new FormData(form);
      const payload = {
        name: String(data.get('first_name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        interestType: 'PARTICIPANT',
        preferredContact: String(data.get('preferred_contact') || 'email').toUpperCase(),
        privacyNoticeVersion: config.privacyNoticeVersion,
        locale: document.documentElement.dataset.lang === 'en' ? 'en' : 'nb',
        turnstileToken
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`INTAKE_${response.status}`);
        location.href = 'takk.html';
      } catch (error) {
        console.error(error);
        if (button) { button.disabled = false; button.innerHTML = original; }
        alert('Interessen ble ikke sendt. Prøv igjen senere eller bruk e-postadressen nederst på siden.');
      }
    });
  };

  const bind = () => {
    const form = document.querySelector('form.n1-interest-form');
    if (form) { activate(form); return true; }
    return false;
  };

  if (!bind()) {
    const observer = new MutationObserver(() => { if (bind()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (new URLSearchParams(location.search).get('preview') === '1' && location.pathname.endsWith('/takk.html')) {
    const p = document.querySelector('.page-hero-copy p:not(.eyebrow)');
    if (p) p.innerHTML = '<span class="lang-no">Testreisen er fullført. Ingen persondata ble lagret. Når den sikre intake-gaten er aktivert, går samme flyt videre til triage og VÍA.</span><span class="lang-en">The test journey is complete. No personal data was stored. Once the secure intake gate is enabled, the same flow continues to triage and VÍA.</span>';
  }
})();
