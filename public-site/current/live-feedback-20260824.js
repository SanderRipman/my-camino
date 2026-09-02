(() => {
  'use strict';

  const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');
  const demoHosts=new Set(['aidme.no','www.aidme.no','dev.aidme.no']);
  const demoMode=demoHosts.has(location.hostname);
  const root=document.documentElement;
  const bi=(no,en)=>`<span class="lang-no">${no}</span><span class="lang-en">${en}</span>`;

  if(!document.getElementById('live-feedback-20260824-style')){
    const style=document.createElement('style');
    style.id='live-feedback-20260824-style';
    style.textContent=`
      .site-header{transition:transform .22s ease,box-shadow .22s ease;will-change:transform}
      .site-header.n1-header-hidden{transform:translateY(-105%)}
      .site-header.n1-header-visible{transform:translateY(0)}
      .n1-demo-form-note{border-left:3px solid var(--gold);padding-left:12px}
      .n1-pause-mark.n1-pause-photo{position:relative;display:block;padding:0;min-height:0;overflow:hidden;background:#183d3b}
      .n1-pause-mark.n1-pause-photo img{display:block;width:100%;height:100%;min-height:260px;object-fit:cover;object-position:center 45%}
      .n1-pause-mark.n1-pause-photo .n1-pause-photo-note{position:absolute;left:12px;right:12px;bottom:12px;padding:7px 10px;border-radius:999px;background:rgba(20,33,43,.72);color:#fff;font-size:11px;text-align:center;backdrop-filter:blur(4px)}
      html[data-lang="no"] .n1-safety-foundation .lang-en{display:none!important}
      html[data-lang="no"] .n1-safety-foundation .lang-no{display:inline!important}
      html[data-lang="en"] .n1-safety-foundation .lang-no{display:none!important}
      html[data-lang="en"] .n1-safety-foundation .lang-en{display:inline!important}
      @media(min-width:651px){
        .three-steps .step h3{display:inline-block;vertical-align:middle}
        .three-steps .step .n1-step-verb{display:inline-flex;vertical-align:middle;margin-left:10px;transform:translateY(-6px)}
      }
      @media(max-width:650px){
        .journey-ribbon.n1-three{gap:6px;padding-bottom:6px}
        .journey-ribbon.n1-three>div{min-height:0!important;padding:9px 13px!important}
        .journey-ribbon.n1-three>div b{font-size:clamp(23px,7vw,31px);line-height:1}
        .journey-ribbon.n1-three>div>span{font-size:clamp(12px,3.5vw,15px);line-height:1.25}
        .n1-safety-foundation.n1-safety-line{margin:4px auto 12px;padding:0 7px;font-size:clamp(9.5px,2.75vw,11.5px);line-height:1.3;text-align:center;white-space:nowrap}
        .n1-safety-foundation.n1-safety-line strong{font-weight:800}
        .n1-pause-mark.n1-pause-photo img{min-height:0;aspect-ratio:3/4}
      }
    `;
    document.head.appendChild(style);
  }

  function applySafetyLine(){
    if(page!=='index')return;
    const ribbon=document.querySelector('.journey-ribbon');
    const foundation=document.querySelector('.n1-safety-foundation');
    if(ribbon)ribbon.classList.add('n1-three');
    if(!foundation)return;
    foundation.classList.add('n1-safety-line');
    const html='<span class="lang-no"><strong>Trygghet i alle tre steg</strong> · avklaring · erfaring · integrasjon</span><span class="lang-en"><strong>Safety across all three stages</strong> · clarification · experience · integration</span>';
    if(foundation.innerHTML!==html)foundation.innerHTML=html;
  }

  function applyHeaderAutoHide(){
    const header=document.querySelector('.site-header');
    if(!header||header.dataset.n1AutoHide==='1')return;
    header.dataset.n1AutoHide='1';
    let lastY=Math.max(0,window.scrollY),ticking=false;
    const update=()=>{
      const y=Math.max(0,window.scrollY);
      const menuOpen=document.querySelector('.mobile-nav.open');
      if(y<80||menuOpen||y<lastY-5){
        header.classList.remove('n1-header-hidden');
        header.classList.add('n1-header-visible');
      }else if(y>lastY+5&&y>130){
        header.classList.add('n1-header-hidden');
        header.classList.remove('n1-header-visible');
      }
      lastY=y;ticking=false;
    };
    window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
    document.querySelector('.menu-toggle')?.addEventListener('click',()=>{header.classList.remove('n1-header-hidden');header.classList.add('n1-header-visible')});
  }

  function applySerPhoto(){
    if(page!=='ser')return;
    const card=document.querySelector('.n1-pause-card');
    const mark=card?.querySelector('.n1-pause-mark');
    if(!card||!mark||mark.classList.contains('n1-pause-photo'))return;
    mark.classList.add('n1-pause-photo');
    mark.innerHTML=`<img src="assets/santiago-4-ser.jpg" alt="Deltaker sitter på Camino-stien etter en krevende etappe"><span class="n1-pause-photo-note">${bi('Sliten. Fornøyd. Fortsatt i bevegelse.','Tired. Content. Still moving forward.')}</span>`;
    const heading=card.querySelector('.n1-pause-copy h2');
    if(heading)heading.innerHTML=bi('Å stå i det – og vite når du skal tilpasse.','Stay with it – and know when to adapt.');
  }

  function syncReferral(form){
    const inquiry=form.querySelector('[name="inquiry_type"]');
    const referral=inquiry?.value==='REFERRAL';
    const wrap=form.querySelector('.n1-referral-fields');
    if(wrap){
      if(wrap.hidden===referral)wrap.hidden=!referral;
      wrap.setAttribute('aria-hidden',String(!referral));
    }
    const role=form.querySelector('[name="referral_role"]');
    if(role){role.required=!!referral;if(!referral&&role.value)role.value='';}
    const org=form.querySelector('[name="organization_name"]');
    if(org&&!referral&&org.value)org.value='';
    return referral;
  }

  function demoCopy(form){
    if(!form)return;
    const referral=syncReferral(form);
    const no=root.dataset.lang!=='en';
    const note=form.querySelector('.n1-form-note');
    if(note){
      note.classList.add('n1-demo-form-note');
      const html=referral
        ? bi('Takk for første steg. Her forteller du bare hvem du er som henviser og hvordan vi kan svare deg. Ikke legg inn opplysninger om den andre personen. I denne demoen sendes eller lagres ingen persondata.','Thank you for taking the first step. Here you only tell us who you are as the referrer and how we can reply. Do not enter information about the other person. No personal data is sent or stored in this demo.')
        : bi('Takk for første steg. Her sier du bare at du er interessert og hvordan vi kan svare deg. Dette er veien inn til en første avklaring. I denne demoen sendes eller lagres ingen persondata.','Thank you for taking the first step. Here you only tell us that you are interested and how we can reply. This is the way into a first clarification. No personal data is sent or stored in this demo.');
      if(note.innerHTML!==html)note.innerHTML=html;
    }
    const button=form.querySelector('button[type="submit"]');
    if(button){
      const text=no?(referral?'Gå videre som henviser':'Jeg er interessert – neste steg'):(referral?'Continue as referrer':'I am interested – next step');
      if(button.textContent!==text)button.textContent=text;
    }
  }

  function bindDemoForm(){
    if(!demoMode||page!=='kontakt')return;
    const form=document.querySelector('form.n1-interest-form');
    if(!form)return false;
    const enforce=()=>{
      if(form.dataset.intakeState!=='demo-preview')form.dataset.intakeState='demo-preview';
      form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el=>{if(el.disabled)el.disabled=false});
      form.querySelector('.n1-turnstile')?.remove();
      const fallback=form.querySelector('.n1-intake-fallback');
      if(fallback&&!fallback.hidden)fallback.hidden=true;
      demoCopy(form);
    };
    enforce();
    if(form.dataset.n1LiveDemoBound!=='1'){
      form.dataset.n1LiveDemoBound='1';
      form.addEventListener('change',enforce);
      document.querySelectorAll('.lang-toggle').forEach(btn=>btn.addEventListener('click',()=>setTimeout(enforce,0)));
      form.addEventListener('submit',event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        if(!form.reportValidity())return;
        const inquiry=form.querySelector('[name="inquiry_type"]')?.value||'PARTICIPANT';
        sessionStorage.setItem('aidme_n1_live_demo_intake','1');
        location.href=`takk.html?demo=1&spor=${encodeURIComponent(inquiry.toLowerCase())}`;
      },true);
      // Keep the demo no-write form usable if the fail-closed intake layer disables it after load.
      // Observe only the disabled attribute. Watching childList while rewriting note.innerHTML caused
      // a self-triggering MutationObserver loop on mobile contact navigation.
      const observer=new MutationObserver(enforce);
      observer.observe(form,{subtree:true,attributes:true,attributeFilter:['disabled']});
    }
    return true;
  }

  function bindDemoFormWhenReady(){
    if(bindDemoForm())return;
    if(!demoMode||page!=='kontakt')return;
    const observer=new MutationObserver(()=>{if(bindDemoForm())observer.disconnect()});
    observer.observe(document.documentElement,{subtree:true,childList:true});
  }

  function applyDemoThankYou(){
    if(page!=='takk'||new URLSearchParams(location.search).get('demo')!=='1')return;
    const eyebrow=document.querySelector('.page-hero-copy .eyebrow');
    const h1=document.querySelector('.page-hero-copy h1');
    const p=document.querySelector('.page-hero-copy p:not(.eyebrow)');
    if(eyebrow)eyebrow.innerHTML=bi('Første steg tatt','First step taken');
    if(h1)h1.innerHTML=bi('Takk. Her begynner veien videre.','Thank you. This is where the next step begins.');
    if(p)p.innerHTML=bi('I en reell flyt går henvendelsen nå til mottak og en kort avklaring av riktig neste steg. Denne siden er fortsatt i demo: ingen persondata ble sendt eller lagret. Du kan se hvordan VÍA bygger videre på denne første interessen.','In a real journey, the enquiry would now go to intake and a short clarification of the right next step. This site is still in demo: no personal data was sent or stored. You can see how VÍA builds on this first expression of interest.');
  }

  function applyContactRouting(){
    // Header navigation may still open the contact page. Text CTAs that promise direct contact use
    // the canonical AidMe mailbox and never a personal Gmail address.
    document.querySelectorAll('a').forEach(a=>{
      if(a.closest('.site-header'))return;
      const text=(a.textContent||'').trim().toLowerCase();
      if(text==='kontakt oss'||text==='contact us')a.href='mailto:sander@aidme.no?subject=AidMe%20VIDA%20-%20kontakt';
    });
    if(page==='partnere'){
      document.querySelectorAll('a').forEach(a=>{
        const text=(a.textContent||'').trim().toLowerCase();
        if(text.includes('ta en første samtale')||text.includes('start a conversation'))a.href='mailto:sander@aidme.no?subject=AidMe%20VIDA%20-%20partnerdialog';
      });
    }
    if(page==='kontakt'){
      const panels=[...document.querySelectorAll('.split .panel')];
      const partner=panels.find(p=>/partnerdialog|partner dialogue/i.test(p.textContent||''));
      const partnerButton=partner?.querySelector('a.btn');
      if(partnerButton)partnerButton.href='mailto:sander@aidme.no?subject=AidMe%20VIDA%20-%20partnerdialog';
      const participant=panels.find(p=>/interesse som deltaker|participant interest/i.test(p.textContent||''));
      const participantText=participant?.querySelector('p');
      if(participantText)participantText.innerHTML=bi('Skjemaet rett under er kun en uforpliktende interesse – ikke en påmelding. Start med noen få kontaktopplysninger; vi spør ikke om helseopplysninger her.','The form just below is only a non-binding expression of interest – not enrolment. Start with a few contact details; we do not ask for health information here.');
      participant?.querySelector('a.btn')?.remove();
    }
  }

  function applyStoryCopy(){
    if(page==='index'){
      [...document.querySelectorAll('h2')].forEach(h=>{
        if(/Fra systembygger til systembruker|From system builder to system user/i.test(h.textContent||''))h.innerHTML=bi('Fra Aimy til AidMe.','From Aimy to AidMe.');
      });
    }
    if(page==='om'){
      [...document.querySelectorAll('h2')].forEach(h=>{
        if(/Fra Aimy til AidMe VIDA|From Aimy to AidMe VIDA/i.test(h.textContent||''))h.innerHTML=bi('Fra Aimy til AidMe.','From Aimy to AidMe.');
      });
    }
  }

  function applyResponsiveCopy(){
    if(page!=='index')return;
    const mobile=window.matchMedia('(max-width:650px)').matches;
    [...document.querySelectorAll('h2')].forEach(h=>{
      const text=h.textContent||'';
      if(/Tre steg\. Én sammenhengende vei videre\.|Three stages\. One connected way forward\.|Én sammenhengende vei videre\.|One connected way forward\./i.test(text)){
        h.innerHTML=mobile?bi('Én sammenhengende vei videre.','One connected way forward.'):bi('Tre steg. Én sammenhengende vei videre.','Three stages. One connected way forward.');
      }
    });
  }

  const run=()=>{
    applySafetyLine();
    applyHeaderAutoHide();
    applySerPhoto();
    bindDemoFormWhenReady();
    applyDemoThankYou();
    applyContactRouting();
    applyStoryCopy();
    applyResponsiveCopy();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',()=>{applySafetyLine();applySerPhoto();bindDemoFormWhenReady();applyContactRouting();applyStoryCopy();applyResponsiveCopy()},{once:true});
  const mobileCopyMq=window.matchMedia('(max-width:650px)');
  if(typeof mobileCopyMq.addEventListener==='function')mobileCopyMq.addEventListener('change',applyResponsiveCopy);
})();
