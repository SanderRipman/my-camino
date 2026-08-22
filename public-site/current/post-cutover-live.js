(() => {
  'use strict';

  const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');
  const isDev=location.hostname==='dev.aidme.no';
  const root=document.documentElement;

  if(!document.getElementById('post-cutover-live-style')){
    const style=document.createElement('style');
    style.id='post-cutover-live-style';
    style.textContent=`
      .n1-arrival-copy .n1-home-rhythm{margin:16px 0 14px;gap:7px;align-items:center}
      .n1-arrival-copy .n1-home-rhythm span{color:#fff;border-color:rgba(200,164,93,.55);background:rgba(255,255,255,.08)}
      .n1-vida-followup-label{margin:4px 0 0;color:var(--gold)!important;font-size:11px!important;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      html[data-lang="no"] .n1-milestone .lang-en,html[data-lang="en"] .n1-milestone .lang-no{display:none!important}
      @media(max-width:650px){
        .three-steps .step{min-height:0;padding:23px 20px 24px}
        .three-steps .step .num{display:block;margin-bottom:5px}
        .three-steps .step h3{display:inline-block;margin:8px 0 6px;font-size:44px;line-height:1}
        .three-steps .step .n1-step-verb{display:inline-flex;vertical-align:middle;margin:0 0 0 8px;padding:3px 8px;font-size:13px;transform:translateY(-5px)}
        .three-steps .step h4{margin:3px 0 10px;line-height:1.35}
        .three-steps .step p{margin:0 0 7px;line-height:1.5}
        .three-steps .step .phase{margin-top:7px}
        .three-steps .step-link{display:inline-flex;margin-top:5px}
        .hero-grid>.camino-clarifier.n1-mobile-after-photo{margin:13px 18px 18px;padding:11px 12px}
        .n1-milestones{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin:10px 0 17px!important}
        .n1-milestone{padding:9px 11px!important;border-radius:11px!important;min-height:0!important}
        .n1-milestone b{font-size:12px!important}
        .n1-milestone span{font-size:10px!important;line-height:1.3!important;margin-top:2px!important}
        .stage-row{padding-top:7px!important;padding-bottom:7px!important}
        .n1-arrival-copy .n1-home-rhythm{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0 14px}
        .n1-arrival-copy .n1-home-rhythm span{padding:7px 4px;text-align:center;font-size:11px}
      }
      @media(max-width:380px){.n1-milestones{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  const noVerbs=['Ve!','Sé!','Vive!'];
  const enVerbs=['Go!','Be!','Live!'];
  document.querySelectorAll('.three-steps .step').forEach((card,index)=>{
    const badge=card.querySelector('.n1-step-verb');
    if(!badge) return;
    const no=badge.querySelector('.lang-no');
    const en=badge.querySelector('.lang-en');
    if(no&&noVerbs[index]) no.textContent=noVerbs[index];
    if(en&&enVerbs[index]) en.textContent=enVerbs[index];
  });

  const placeClarifier=()=>{
    if(page!=='index') return;
    const copy=document.querySelector('.hero-copy');
    const lead=copy?.querySelector(':scope > p');
    const clarifier=document.querySelector('.camino-clarifier');
    const photo=document.querySelector('.hero-photo');
    if(!lead||!clarifier||!photo) return;
    const strong=clarifier.querySelector('strong');
    if(strong) strong.textContent='Camino Portugués';
    const spans=clarifier.querySelectorAll(':scope > span');
    if(spans[0]) spans[0].textContent='En virkelig vandring fra Portugal til Spania – og en arena for veien videre. Ingen tro, religiøs praksis eller bestemt livssyn kreves. Ingen forkynnelse eller press til religiøse eller personlige handlinger – og du trenger ikke dele mer personlig enn du selv ønsker.';
    if(spans[1]) spans[1].textContent='A real walk from Portugal to Spain – and an arena for the way forward. No faith, religious practice or particular worldview is required. There is no preaching or pressure toward religious or personal acts, and you do not have to share more personally than you choose.';
    if(window.matchMedia('(max-width:650px)').matches){
      photo.insertAdjacentElement('afterend',clarifier);
      clarifier.classList.add('n1-mobile-after-photo');
    }else{
      lead.insertAdjacentElement('afterend',clarifier);
      clarifier.classList.remove('n1-mobile-after-photo');
    }
  };
  placeClarifier();
  const mq=window.matchMedia('(max-width:650px)');
  if(typeof mq.addEventListener==='function') mq.addEventListener('change',placeClarifier);

  if(page==='index'){
    const rhythm=document.querySelector('.n1-arrival-copy .n1-home-rhythm');
    if(rhythm){
      const spans=[...rhythm.querySelectorAll(':scope > span')];
      if(spans[0]&&/santiago/i.test(spans[0].textContent)) spans[0].remove();
      if(!rhythm.previousElementSibling?.classList?.contains('n1-vida-followup-label')){
        rhythm.insertAdjacentHTML('beforebegin','<p class="n1-vida-followup-label"><span class="lang-no">Oppfølging hjemme</span><span class="lang-en">Follow-up at home</span></p>');
      }
    }
  }

  const updateNativeOptions=(form)=>{
    const inquiry=form?.querySelector('[name="inquiry_type"]');
    if(!inquiry) return;
    const no=root.dataset.lang!=='en';
    const participant=inquiry.querySelector('option[value="PARTICIPANT"]');
    const referral=inquiry.querySelector('option[value="REFERRAL"]');
    if(participant) participant.textContent=no?'Jeg vurderer AidMe VIDA for meg selv':'I am considering AidMe VIDA for myself';
    if(referral) referral.textContent=no?'Jeg vil henvise eller anbefale noen':'I want to refer or recommend someone';
  };

  const ensureDevStructure=(form)=>{
    if(!isDev||!form) return;
    if(!form.querySelector('[name="inquiry_type"]')){
      const first=form.querySelector('.n1-field');
      first?.insertAdjacentHTML('beforebegin',`<div class="n1-field full n1-inquiry-type"><label for="n1-inquiry-type"><span class="lang-no">Hva gjelder henvendelsen?</span><span class="lang-en">What is this enquiry about?</span></label><select id="n1-inquiry-type" name="inquiry_type" required><option value="PARTICIPANT"></option><option value="REFERRAL"></option></select><small><span class="lang-no">Bare nok til å finne riktig neste steg. Ingen helseopplysninger trengs her.</span><span class="lang-en">Only enough to find the right next step. No health information is needed here.</span></small></div>`);
    }
    const contactField=form.querySelector('[name="preferred_contact"]')?.closest('.n1-field');
    if(contactField&&!form.querySelector('.n1-referral-fields')){
      contactField.insertAdjacentHTML('afterend',`<div class="n1-field full n1-referral-fields" hidden><label for="n1-referral-role"><span class="lang-no">Din rolle i henvisningen</span><span class="lang-en">Your role in the referral</span></label><select id="n1-referral-role" name="referral_role"><option value="">Velg</option><option value="NAV">NAV / offentlig oppfølging</option><option value="EMPLOYER">Arbeidsgiver / arbeidsrettet oppfølging</option><option value="PROFESSIONAL">Fagperson / tjeneste</option><option value="FAMILY_FRIEND">Familie / nærperson</option><option value="OTHER">Annet</option></select><label for="n1-organization"><span class="lang-no">Virksomhet (valgfritt)</span><span class="lang-en">Organisation (optional)</span></label><input id="n1-organization" name="organization_name" maxlength="120" autocomplete="organization"><small><span class="lang-no">Bruk dine egne kontaktopplysninger. Ikke legg inn private eller sensitive opplysninger om personen du vurderer å henvise.</span><span class="lang-en">Use your own contact details. Do not enter private or sensitive information about the person you may refer.</span></small></div>`);
    }
  };

  const syncReferral=(form)=>{
    if(!form) return;
    updateNativeOptions(form);
    const inquiry=form.querySelector('[name="inquiry_type"]');
    const referral=inquiry?.value==='REFERRAL';
    const wrap=form.querySelector('.n1-referral-fields');
    if(wrap) wrap.hidden=!referral;
    const role=form.querySelector('[name="referral_role"]');
    if(role){role.required=!!referral;if(!referral) role.value='';}
    const org=form.querySelector('[name="organization_name"]');
    if(org&&!referral) org.value='';
  };

  const hardenDevPreview=(form)=>{
    if(!isDev||!form) return;
    ensureDevStructure(form);
    const enforce=()=>{
      form.dataset.intakeState='dev-preview';
      form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el=>{el.disabled=false;});
      form.querySelector('.n1-turnstile')?.remove();
      const fallback=form.querySelector('.n1-intake-fallback');
      if(fallback) fallback.hidden=true;
      const note=form.querySelector('.n1-form-note');
      if(note) note.innerHTML='<strong>DEV-test:</strong> Skjemaet kan fylles ut for å teste hele første kontaktflyt, men ingen persondata lagres eller sendes.';
      syncReferral(form);
    };
    enforce();
    if(form.dataset.postCutoverDevBound!=='1'){
      form.dataset.postCutoverDevBound='1';
      form.addEventListener('change',()=>syncReferral(form));
      form.addEventListener('submit',event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        if(!form.reportValidity()) return;
        sessionStorage.setItem('aidme_n1_dev_preview_intake','1');
        location.href='takk.html?devPreview=1';
      },true);
      const observer=new MutationObserver(enforce);
      observer.observe(form,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','data-intake-state','hidden']});
    }
  };

  if(page==='kontakt'){
    const bind=()=>{
      const form=document.querySelector('form.n1-interest-form');
      if(!form) return false;
      syncReferral(form);
      hardenDevPreview(form);
      return true;
    };
    if(!bind()){
      const observer=new MutationObserver(()=>{if(bind()) observer.disconnect();});
      observer.observe(document.documentElement,{subtree:true,childList:true});
    }
    document.querySelectorAll('.lang-toggle').forEach(button=>button.addEventListener('click',()=>window.setTimeout(()=>updateNativeOptions(document.querySelector('form.n1-interest-form')),0)));
  }
})();
