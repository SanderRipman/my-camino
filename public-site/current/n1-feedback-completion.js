(() => {
  'use strict';

  const page = (location.pathname.split('/').filter(Boolean).pop() || 'index.html').replace('.html','');
  const bi = (no,en) => `<span class="lang-no">${no}</span><span class="lang-en">${en}</span>`;
  const setBi = (el,no,en) => {
    if(!el) return;
    const n=el.querySelector('.lang-no');
    const e=el.querySelector('.lang-en');
    if(n) n.textContent=no;
    if(e) e.textContent=en;
  };

  if(!document.getElementById('n1-feedback-completion-style')){
    const style=document.createElement('style');
    style.id='n1-feedback-completion-style';
    style.textContent=`
      .n1-milestones{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 18px}
      .n1-milestone{padding:10px 11px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.7);color:var(--navy)}
      .n1-milestone b{display:block;font-size:12px;color:var(--teal)}
      .n1-milestone span{display:block;margin-top:3px;font-size:10px;line-height:1.35;color:#687478}
      .n1-home-rhythm,.n1-vida-home-rhythm{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0 0}
      .n1-home-rhythm span,.n1-vida-home-rhythm span{padding:7px 10px;border-radius:999px;border:1px solid rgba(200,164,93,.35);background:rgba(200,164,93,.08);font-size:11px;font-weight:800;color:var(--navy)}
      .n1-pause-section{max-width:var(--max);margin:0 auto 52px;padding:0 18px}
      .n1-pause-card{display:grid;grid-template-columns:.82fr 1.18fr;overflow:hidden;border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.78);box-shadow:var(--soft-shadow)}
      .n1-pause-mark{display:flex;align-items:center;justify-content:center;min-height:240px;padding:32px;background:linear-gradient(145deg,var(--teal),var(--navy));color:#fff;text-align:center}
      .n1-pause-mark strong{font:500 clamp(30px,4vw,50px)/1.05 Georgia,serif}
      .n1-pause-copy{padding:32px 34px;display:flex;flex-direction:column;justify-content:center}
      .n1-pause-copy h2{margin:5px 0 11px;font-size:clamp(28px,3.2vw,42px)}
      .n1-pause-copy p{margin:0;color:#56656a;line-height:1.65}
      .n1-status-language{max-width:var(--max);margin:0 auto 50px;padding:0 18px}
      .n1-status-language-inner{padding:24px;border:1px solid var(--line);border-radius:20px;background:rgba(245,240,230,.52)}
      .n1-status-language h2{margin:5px 0 8px;font-size:clamp(25px,3vw,36px)}
      .n1-status-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}
      .n1-status-chip{padding:12px;border-radius:12px;background:#fff;border:1px solid var(--line);font-size:12px;line-height:1.4;color:#536166}
      .n1-status-chip strong{display:block;color:var(--teal);margin-bottom:3px}
      @media(max-width:650px){
        .n1-milestones{grid-template-columns:1fr 1fr;gap:6px}
        .n1-pause-section,.n1-status-language{padding:0 11px;margin-bottom:42px}
        .n1-pause-card{grid-template-columns:1fr}
        .n1-pause-mark{min-height:150px;padding:24px}
        .n1-pause-copy{padding:24px 21px}
        .n1-status-language-inner{padding:20px 16px}
        .n1-status-chips{grid-template-columns:1fr 1fr}
        .stage-row{padding-top:8px!important;padding-bottom:8px!important}
        .stage-purpose span{line-height:1.35}
        .photo-note{font-size:10px!important;background:rgba(20,33,43,.62)!important;backdrop-filter:blur(4px)}
      }
      @media(max-width:380px){.n1-status-chips,.n1-milestones{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  const milestones = () => `<div class="n1-milestones" aria-label="Utvalgte milepæler på Camino Portugués">
    <div class="n1-milestone"><b>Porto</b><span>${bi('Start og trygg ankomst','Start and safe arrival')}</span></div>
    <div class="n1-milestone"><b>Valença / Tui</b><span>${bi('Portugal → Spania','Portugal → Spain')}</span></div>
    <div class="n1-milestone"><b>Pontevedra</b><span>${bi('VIDA-broen begynner','The VIDA bridge begins')}</span></div>
    <div class="n1-milestone"><b>Santiago</b><span>${bi('Målgang – ikke slutten','Arrival – not the end')}</span></div>
  </div>`;

  if(page==='index'){
    const heroP=document.querySelector('.hero-copy > p');
    setBi(heroP,
      'AidMe VIDA er et strukturert før–under–etter-løp for mennesker som fortsatt har ressurser og kapasitet, men trenger ny retning, struktur, mestring eller tilhørighet. VÍA avklarer veien før, SER bruker Camino som erfaringsarena under, og VIDA gjør erfaring til konkret handling hjemme.',
      'AidMe VIDA is a structured before–during–after journey for people who still have resources and capacity but need renewed direction, structure, mastery or belonging. VÍA clarifies the path before, SER uses the Camino as a real-life arena during, and VIDA turns the experience into concrete action at home.'
    );
    const clarifier=document.querySelector('.camino-clarifier');
    if(clarifier){
      const spans=clarifier.querySelectorAll(':scope > span');
      if(spans[0]) spans[0].textContent='En virkelig vandring – og en arena for veien videre. Ingen tro, religiøs praksis eller bestemt livssyn kreves. Ingen forkynnelse eller press til religiøse eller personlige handlinger – og du trenger ikke dele mer personlig enn du selv ønsker.';
      if(spans[1]) spans[1].textContent='A real walk – and an arena for the way forward. No faith, religious practice or particular worldview is required. There is no preaching or pressure toward religious or personal acts, and you do not have to share more personally than you choose.';
    }
    const rs=document.querySelector('.route-shell');
    if(rs){
      setBi(rs.querySelector('h2'),'Fra Porto til Santiago. Et landsskifte du går til fots.','From Porto to Santiago. A border you cross on foot.');
      setBi(rs.querySelector('p:not(.eyebrow)'),
        'Camino Portugués er anbefalt hovedrute: ca. 230–270 km og rundt 14 vandredager, i tillegg til hvile- og fagdager. Ruten gir en konkret rytme fra Portugal til Spania, samtidig som etapper kan tilpasses sikkerhet, dagsform og den enkeltes behov.',
        'Camino Portugués is the recommended main route: about 230–270 km and around 14 walking days, plus rest and programme days. The route creates a concrete rhythm from Portugal to Spain while stages can be adapted to safety, daily condition and individual needs.'
      );
      const map=rs.querySelector('.n1-route-map');
      if(map && !rs.querySelector('.n1-milestones')) map.insertAdjacentHTML('afterend',milestones());
    }
    const arrival=document.querySelector('.n1-arrival-card');
    if(arrival){
      const p=arrival.querySelector('.n1-arrival-copy p:not(.eyebrow)');
      setBi(p,
        'Målet er stort nettopp fordi veien dit er virkelig. Santiago skal ikke være et prestasjonskrav, men et konkret anker for det du faktisk har gjennomført. Santiago er ikke slutten på historien – det er overgangen fra erfaring til de første konkrete stegene hjemme.',
        'The goal matters because the road there is real. Santiago should not be a performance demand, but a concrete anchor for what you actually completed. Santiago is not the end of the story – it is the transition from experience to the first concrete steps at home.'
      );
      const copy=arrival.querySelector('.n1-arrival-copy');
      if(copy && !copy.querySelector('.n1-home-rhythm')) copy.querySelector('.btn')?.insertAdjacentHTML('beforebegin',`<div class="n1-home-rhythm"><span>Santiago</span><span>72 t</span><span>14 d</span><span>30 d</span><span>90 d</span></div>`);
    }
  }

  if(page==='ser'){
    const hero=document.querySelector('.page-hero');
    if(hero && !document.querySelector('.n1-pause-section')) hero.insertAdjacentHTML('afterend',`<section class="n1-pause-section"><div class="n1-pause-card"><div class="n1-pause-mark"><strong>${bi('Pause er også fremdrift.','A pause is progress too.')}</strong></div><div class="n1-pause-copy"><p class="eyebrow">${bi('Tilpasning er en del av SER','Adaptation is part of SER')}</p><h2>${bi('Det er lov å være sliten.','It is okay to be tired.')}</h2><p>${bi('Camino handler ikke om å bevise at du tåler mest. Noen dager betyr fremdrift å gå videre. Andre dager betyr det pause, kortere etappe, transport eller å be om hjelp. Mestring kan være å stå i håndterbart ubehag – og like viktig å kjenne når du skal tilpasse.','The Camino is not about proving who can endure the most. Some days progress means walking on. Other days it means a pause, a shorter stage, transport or asking for help. Mastery can mean staying with manageable discomfort – and just as importantly knowing when to adapt.')}</p></div></div></section>`);
  }

  if(page==='deltakere'){
    const journey=document.querySelector('#deltakerreise');
    if(journey && !document.querySelector('.n1-status-language')) journey.insertAdjacentHTML('afterend',`<section class="n1-status-language"><div class="n1-status-language-inner"><p class="eyebrow">${bi('Avklaring uten dom','Clarification without judgement')}</p><h2>${bi('Neste steg skal passe deg – ikke omvendt.','The next step should fit you – not the other way around.')}</h2><p>${bi('Internt må vi kunne ta tydelige faglige beslutninger. Overfor deg bruker vi språk som forklarer hva beslutningen betyr i praksis.','Internally we need clear professional decisions. With you, we use language that explains what the decision means in practice.')}</p><div class="n1-status-chips"><div class="n1-status-chip"><strong>${bi('Klar for neste steg','Ready for the next step')}</strong></div><div class="n1-status-chip"><strong>${bi('Klar når noen ting er på plass','Ready when a few things are in place')}</strong></div><div class="n1-status-chip"><strong>${bi('Vi venter litt og avklarer mer','We wait a little and clarify more')}</strong></div><div class="n1-status-chip"><strong>${bi('En annen vei passer bedre nå','Another path fits better right now')}</strong></div></div></div></section>`);
  }

  if(page==='vida'){
    const strip=document.querySelector('.data-strip');
    if(strip && !document.querySelector('.n1-vida-home-rhythm')) strip.insertAdjacentHTML('afterend',`<div class="n1-vida-home-rhythm" aria-label="VIDA oppfølging"><span>72 t</span><span>14 d</span><span>30 d</span><span>90 d</span><span>${bi('Én levende plan','One living plan')}</span></div>`);
  }

  if(page==='ruter'){
    const intro=document.querySelector('.route-intro > div');
    const map=intro?.querySelector('.n1-route-map');
    if(map && !intro.querySelector('.n1-milestones')) map.insertAdjacentHTML('afterend',milestones());
  }
})();

/* 2026-08-22 post-cutover owner feedback — DEV ONLY until owner QA approves promotion. */
(() => {
  'use strict';
  if(location.hostname !== 'dev.aidme.no') return;

  const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');
  const params=new URLSearchParams(location.search);
  const mobile=window.matchMedia('(max-width:650px)');

  if(!document.getElementById('post-cutover-feedback-dev-style')){
    const style=document.createElement('style');
    style.id='post-cutover-feedback-dev-style';
    style.textContent=`
      .n1-referral-fields[hidden]{display:none!important}
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

        .route-shell .n1-milestones{display:block;margin:7px 0 18px;padding:0;border-top:1px solid rgba(255,255,255,.16)}
        .route-shell .n1-milestone{position:relative;padding:8px 0 8px 20px;border:0;border-bottom:1px solid rgba(255,255,255,.13);border-radius:0;background:transparent;color:#dbe5e2}
        .route-shell .n1-milestone:before{content:'';position:absolute;left:2px;top:15px;width:7px;height:7px;border-radius:50%;background:var(--gold2);box-shadow:0 0 0 3px rgba(229,207,154,.13)}
        .route-shell .n1-milestone b{display:inline;color:var(--gold2);font-size:12px;margin-right:5px}
        .route-shell .n1-milestone>span{display:inline;margin:0;font-size:11px;line-height:1.35;color:#dbe5e2}
        .route-shell .n1-milestone>span>span{display:inline;margin:0;font-size:inherit;line-height:inherit;color:inherit}
        .route-intro .n1-milestones{display:block;margin:8px 0 17px;padding:0;border-top:1px solid var(--line)}
        .route-intro .n1-milestone{position:relative;padding:8px 0 8px 20px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:transparent}
        .route-intro .n1-milestone:before{content:'';position:absolute;left:2px;top:15px;width:7px;height:7px;border-radius:50%;background:var(--gold)}
        .route-intro .n1-milestone b{display:inline;font-size:12px;margin-right:5px}
        .route-intro .n1-milestone>span{display:inline;margin:0;font-size:11px;line-height:1.35}
        .route-intro .n1-milestone>span>span{display:inline;margin:0;font-size:inherit;line-height:inherit;color:inherit}
        html[data-lang="no"] .n1-milestone .lang-en{display:none!important}
        html[data-lang="no"] .n1-milestone .lang-no{display:inline!important}
        html[data-lang="en"] .n1-milestone .lang-no{display:none!important}
        html[data-lang="en"] .n1-milestone .lang-en{display:inline!important}
        .route-mini{gap:0}
        .route-mini div{grid-template-columns:34px minmax(0,1fr) auto;gap:8px;padding:9px 0;align-items:baseline}
        .route-mini div span:last-child{grid-column:auto;font-size:12px;white-space:nowrap;color:#d7e2df}
      }
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
    if(no && noVerbs[index]) no.textContent=noVerbs[index];
    if(en && enVerbs[index]) en.textContent=enVerbs[index];
  });

  const placeClarifier=()=>{
    if(page!=='index') return;
    const copy=document.querySelector('.hero-copy');
    const lead=copy?.querySelector(':scope > p');
    const clarifier=document.querySelector('.camino-clarifier');
    const photo=document.querySelector('.hero-photo');
    if(!lead||!clarifier||!photo) return;
    if(mobile.matches){
      photo.insertAdjacentElement('afterend',clarifier);
      clarifier.classList.add('n1-mobile-after-photo');
    }else{
      lead.insertAdjacentElement('afterend',clarifier);
      clarifier.classList.remove('n1-mobile-after-photo');
    }
  };
  placeClarifier();
  if(typeof mobile.addEventListener==='function') mobile.addEventListener('change',placeClarifier);

  const configureDevPreview=(form)=>{
    if(!form) return;
    if(form.dataset.devPreviewBound!=='1'){
      form.dataset.devPreviewBound='1';
      form.addEventListener('submit',event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        if(!form.reportValidity()) return;
        sessionStorage.setItem('aidme_n1_dev_preview_intake','1');
        location.href='takk.html?devPreview=1';
      },true);
    }
    if(form.dataset.intakeState!=='dev-preview') form.dataset.intakeState='dev-preview';
    form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el=>{if(el.disabled) el.disabled=false;});
    form.querySelector('.n1-turnstile')?.remove();
    const fallback=form.querySelector('.n1-intake-fallback');
    if(fallback) fallback.hidden=true;

    const inquiry=form.querySelector('[name="inquiry_type"]');
    const participantOption=inquiry?.querySelector('option[value="PARTICIPANT"]');
    const referralOption=inquiry?.querySelector('option[value="REFERRAL"]');
    const roleWrap=form.querySelector('.n1-referral-fields');
    const role=form.querySelector('[name="referral_role"]');
    const organization=form.querySelector('[name="organization_name"]');
    const note=form.querySelector('.n1-form-note');

    const syncLabels=()=>{
      const en=document.documentElement.dataset.lang==='en';
      if(participantOption) participantOption.textContent=en?'I am considering AidMe VIDA for myself':'Jeg vurderer AidMe VIDA for meg selv';
      if(referralOption) referralOption.textContent=en?'I want to refer or recommend someone':'Jeg vil henvise eller anbefale noen';
    };
    const syncFlow=()=>{
      const referral=inquiry?.value==='REFERRAL';
      if(roleWrap){
        roleWrap.hidden=!referral;
        roleWrap.setAttribute('aria-hidden',String(!referral));
      }
      if(role) role.required=referral;
      if(!referral){
        if(role) role.value='';
        if(organization) organization.value='';
      }
      if(note){
        note.dataset.devPreviewNote='1';
        note.innerHTML=referral
          ? '<strong>DEV-test · henviserspor:</strong> Bruk dine egne kontaktopplysninger. Ikke skriv navn, helseopplysninger eller andre private opplysninger om personen du vurderer å henvise. Ingen persondata lagres eller sendes i denne testen.'
          : '<strong>DEV-test · deltakerspor:</strong> Dette er bare en kort interesse for deg selv. Ingen helseopplysninger trengs her, og ingen persondata lagres eller sendes i denne testen.';
      }
    };
    syncLabels();
    syncFlow();
    if(inquiry && inquiry.dataset.devFlowBound!=='1'){
      inquiry.dataset.devFlowBound='1';
      inquiry.addEventListener('change',syncFlow);
    }
    if(document.documentElement.dataset.devLangObserver!=='1'){
      document.documentElement.dataset.devLangObserver='1';
      new MutationObserver(syncLabels).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
    }
  };

  if(page==='kontakt'){
    const bind=()=>{
      const form=document.querySelector('form.n1-interest-form');
      if(!form) return false;
      configureDevPreview(form);
      const observer=new MutationObserver(()=>configureDevPreview(form));
      observer.observe(form,{subtree:true,childList:true});
      window.setTimeout(()=>configureDevPreview(form),0);
      window.setTimeout(()=>configureDevPreview(form),700);
      return true;
    };
    if(!bind()){
      const observer=new MutationObserver(()=>{if(bind()) observer.disconnect();});
      observer.observe(document.documentElement,{subtree:true,childList:true});
    }
  }

  if(page==='takk' && params.get('devPreview')==='1'){
    const apply=()=>{
      const p=document.querySelector('.page-hero-copy p:not(.eyebrow)');
      if(!p) return false;
      p.innerHTML='<span class="lang-no">DEV-testreisen er fullført. Ingen persondata ble lagret eller sendt. Neste produksjonssteg forblir stengt til sikkerhets- og personverngatene er eksplisitt godkjent.</span><span class="lang-en">The DEV test journey is complete. No personal data was stored or sent. The production intake remains closed until the security and privacy gates are explicitly approved.</span>';
      return true;
    };
    if(!apply()) window.addEventListener('DOMContentLoaded',apply,{once:true});
  }
})();
