(() => {
  const endpoint = 'https://ibloovohuhrceivrvhvn.supabase.co/functions/v1/public-intake';
  const params = new URLSearchParams(location.search);
  const fallbackConfig = {
    enabled: false,
    turnstileSiteKey: '',
    privacyNoticeVersion: 'aidme-public-interest-v0.2-2026-08-22'
  };

  async function resolveConfig(){
    const explicit = window.AIDME_PUBLIC_INTAKE;
    if (explicit?.enabled && explicit?.turnstileSiteKey) return {...fallbackConfig,...explicit};
    try {
      const response = await fetch(endpoint,{method:'GET',headers:{Accept:'application/json'},cache:'no-store'});
      if (!response.ok) return fallbackConfig;
      const status = await response.json();
      return {
        enabled: status?.enabled === true && !!status?.turnstileSiteKey,
        turnstileSiteKey: String(status?.turnstileSiteKey || ''),
        privacyNoticeVersion: String(status?.privacyNoticeVersion || fallbackConfig.privacyNoticeVersion)
      };
    } catch (_) { return fallbackConfig; }
  }

  function sourceContext(){
    const raw=String(params.get('fra')||params.get('source')||'kontakt').toLowerCase().replace(/[^a-z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,48);
    return raw || 'kontakt';
  }

  function enhance(form){
    if(form.dataset.n1Unified==='1')return;
    form.dataset.n1Unified='1';
    const first=form.querySelector('.n1-field');
    if(first){
      const label=first.querySelector('label > span');
      if(label && !label.querySelector('.lang-no')) label.textContent='Navn';
      const input=first.querySelector('input[name="first_name"]');
      if(input){input.autocomplete='name';input.setAttribute('aria-label','Navn');}
      first.insertAdjacentHTML('beforebegin',`<div class="n1-field full n1-inquiry-type"><label for="n1-inquiry-type"><span class="lang-no">Hva gjelder henvendelsen?</span><span class="lang-en">What is this enquiry about?</span></label><select id="n1-inquiry-type" name="inquiry_type" required><option value="PARTICIPANT"><span class="lang-no">Jeg vurderer AidMe VIDA for meg selv</span>Jeg vurderer AidMe VIDA for meg selv</option><option value="REFERRAL">Jeg vil henvise eller anbefale noen</option></select><small><span class="lang-no">Velg bare første kontaktspor. Ingen helseopplysninger trengs her.</span><span class="lang-en">Choose only the first-contact path. No health information is needed here.</span></small></div>`);
    }
    const inquiry=form.querySelector('[name="inquiry_type"]');
    const contactField=form.querySelector('[name="preferred_contact"]')?.closest('.n1-field');
    if(contactField && !form.querySelector('.n1-referral-fields')){
      contactField.insertAdjacentHTML('afterend',`<div class="n1-field full n1-referral-fields" hidden><label for="n1-referral-role"><span class="lang-no">Din rolle i henvisningen</span><span class="lang-en">Your role in the referral</span></label><select id="n1-referral-role" name="referral_role"><option value="">Velg</option><option value="NAV">NAV / offentlig oppfølging</option><option value="EMPLOYER">Arbeidsgiver / arbeidsrettet oppfølging</option><option value="PROFESSIONAL">Fagperson / tjeneste</option><option value="FAMILY_FRIEND">Familie / nærperson</option><option value="OTHER">Annet</option></select><label for="n1-organization"><span class="lang-no">Virksomhet (valgfritt)</span><span class="lang-en">Organisation (optional)</span></label><input id="n1-organization" name="organization_name" maxlength="120" autocomplete="organization"><small><strong><span class="lang-no">Bruk dine egne kontaktopplysninger.</span><span class="lang-en">Use your own contact details.</span></strong> <span class="lang-no">Ikke skriv navn, helseopplysninger eller andre private opplysninger om personen du vurderer å henvise.</span><span class="lang-en">Do not enter the name, health information or other private details of the person you may refer.</span></small></div>`);
    }
    if(!form.querySelector('[name="source_context"]'))form.insertAdjacentHTML('beforeend',`<input type="hidden" name="source_context" value="${sourceContext()}"><label class="n1-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>`);
    const sync=()=>{
      const referral=inquiry?.value==='REFERRAL';
      const wrap=form.querySelector('.n1-referral-fields');if(wrap)wrap.hidden=!referral;
      const role=form.querySelector('[name="referral_role"]');if(role)role.required=referral;
      const note=form.querySelector('.n1-form-note');
      if(note)note.innerHTML=referral
        ? '<strong>Ikke skriv opplysninger om den mulige deltakeren her.</strong> Vi tar eventuell deltakerinformasjon i et senere, riktig og sikkert steg. Dette er bare første kontakt med deg som henviser.'
        : '<strong>Ikke skriv helseopplysninger eller andre sensitive personopplysninger her.</strong> Dette skjemaet brukes bare som første kontaktpunkt.';
    };
    inquiry?.addEventListener('change',sync);sync();
  }

  async function activate(form,config){
    if (form.dataset.n1SafeBound === '1') return;
    form.dataset.n1SafeBound = '1';
    enhance(form);

    // Never use Netlify Forms as the participant-data backend. Canonical path:
    // hardened public-intake -> intakes -> authorised N2 triage in my.aidme.no.
    form.removeAttribute('data-netlify');
    form.removeAttribute('netlify-honeypot');
    form.removeAttribute('action');
    form.removeAttribute('method');
    form.querySelector('input[name="form-name"]')?.remove();
    form.querySelector('textarea[name="interest_note"]')?.closest('.n1-field')?.remove();

    const previewMode = params.get('previewIntake') === '1' || ['localhost','127.0.0.1'].includes(location.hostname);
    const note=form.querySelector('.n1-form-note');
    if(previewMode && note)note.insertAdjacentHTML('beforeend',' <span class="n1-preview-only"><strong>Preview:</strong> skjemaet kan testes, men ingen persondata lagres.</span>');

    if(!config.enabled && !previewMode){
      form.dataset.intakeState='closed';
      form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el=>{el.disabled=true;});
      if(note)note.innerHTML='<strong>Digital innsending er midlertidig ikke tilgjengelig.</strong> Skjemaet viser hvilke få opplysninger vi vil be om når den sikre mottaksflyten er åpnet. Ikke legg inn personopplysninger nå.';
      const actions=form.querySelector('.n1-form-actions');
      if(actions && !actions.querySelector('.n1-intake-fallback'))actions.insertAdjacentHTML('beforeend','<a class="btn teal n1-intake-fallback" href="mailto:sander@aidme.no?subject=AidMe%20VIDA%20-%20interesse"><span class="lang-no">Kontakt AidMe på e-post</span><span class="lang-en">Contact AidMe by email</span></a>');
      return;
    }

    let turnstileToken='';
    if(config.enabled && !previewMode){
      const holder=document.createElement('div');holder.className='n1-field full n1-turnstile';holder.innerHTML='<div class="cf-turnstile"></div>';
      form.querySelector('.n1-form-actions')?.insertAdjacentElement('beforebegin',holder);
      const render=()=>window.turnstile?.render(holder.querySelector('.cf-turnstile'),{sitekey:config.turnstileSiteKey,callback:token=>{turnstileToken=token;},'expired-callback':()=>{turnstileToken='';}});
      if(!window.turnstile){const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.defer=true;s.onload=render;document.head.appendChild(s);}else render();
    }

    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const button=form.querySelector('button[type="submit"]'),original=button?.innerHTML;
      if(button){button.disabled=true;button.textContent='Sender…';}

      if(previewMode){sessionStorage.setItem('aidme_n1_preview_intake','1');location.href = 'takk.html?preview=1';return;}
      if(!config.enabled){if(button){button.disabled=false;button.innerHTML=original;}return;}
      if(!turnstileToken){if(button){button.disabled=false;button.innerHTML=original;}alert('Bekreft at du ikke er en robot før du sender.');return;}

      const data=new FormData(form),interestType=String(data.get('inquiry_type')||'PARTICIPANT').toUpperCase();
      const payload={
        name:String(data.get('first_name')||'').trim(),
        email:String(data.get('email')||'').trim(),
        phone:String(data.get('phone')||'').trim(),
        interestType,
        preferredContact:String(data.get('preferred_contact')||'email').toUpperCase(),
        privacyNoticeVersion:config.privacyNoticeVersion,
        locale:document.documentElement.dataset.lang==='en'?'en':'nb',
        sourceContext:String(data.get('source_context')||sourceContext()),
        referralRole:interestType==='REFERRAL'?String(data.get('referral_role')||''):'',
        organizationName:interestType==='REFERRAL'?String(data.get('organization_name')||'').trim():'',
        website:String(data.get('website')||''),
        turnstileToken
      };
      try{
        const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        if(!response.ok)throw new Error(`INTAKE_${response.status}`);
        location.href = 'takk.html';
      }catch(error){
        console.error(error);if(button){button.disabled=false;button.innerHTML=original;}
        alert('Henvendelsen ble ikke sendt. Prøv igjen senere eller bruk kontaktinformasjonen nederst på siden.');
      }
    });
  }

  async function boot(){
    const config=await resolveConfig();
    const bind=()=>{const form=document.querySelector('form.n1-interest-form');if(form){activate(form,config);return true;}return false;};
    if(!bind()){
      const observer=new MutationObserver(()=>{if(bind())observer.disconnect();});
      observer.observe(document.documentElement,{childList:true,subtree:true});
    }
    if((params.get('previewIntake')==='1'||['localhost','127.0.0.1'].includes(location.hostname))&&params.get('preview')==='1'&&location.pathname.endsWith('/takk.html')){
      const p=document.querySelector('.page-hero-copy p:not(.eyebrow)');
      if(p)p.innerHTML='<span class="lang-no">Testreisen er fullført. Ingen persondata ble lagret. Når den sikre intake-gaten er aktivert, går samme flyt videre til triage og VÍA.</span><span class="lang-en">The test journey is complete. No personal data was stored. Once the secure intake gate is enabled, the same flow continues to triage and VÍA.</span>';
    }
  }
  boot();
})();
