(()=>{
'use strict';
const page=(location.pathname.split('/').filter(Boolean).pop()||'index.html').replace('.html','');
if(page!=='kontakt')return;
const params=new URLSearchParams(location.search);
const noStore=params.get('previewIntake')==='1'||['localhost','127.0.0.1','aidme.no','www.aidme.no','dev.aidme.no'].includes(location.hostname);
const bi=(no,en)=>`<span class="lang-no">${no}</span><span class="lang-en">${en}</span>`;
const chosen=()=>{const raw=String(params.get('spor')||'').toUpperCase();return raw==='PARTNER'?'PARTNER':raw==='DELTAKER'||raw==='PARTICIPANT'?'PARTICIPANT':raw==='HENVISER'||raw==='REFERRAL'?'REFERRAL':''};

function style(){
 if(document.getElementById('contact-polish-20260902-style'))return;
 const s=document.createElement('style');s.id='contact-polish-20260902-style';s.textContent=`
 .split>.panel{display:flex;flex-direction:column}
 .split>.panel .n1-contact-choice{margin-top:auto;align-self:flex-start}
 .n1-interest-card>.eyebrow{display:none!important}
 .n1-interest-form .n1-contact-context{grid-column:1/-1;display:grid;gap:6px}
 .n1-interest-form .n1-direct-link{white-space:nowrap}
 .n1-interest-form .n1-form-actions{align-items:center;flex-wrap:wrap}
 .contact-card#direkte-kontakt{scroll-margin-top:90px}
 @media(max-width:650px){.n1-interest-form .n1-form-actions{justify-content:flex-start}.n1-interest-form .n1-form-actions small{flex-basis:100%}}
 `;document.head.appendChild(s);
}
function topCards(){
 const panels=[...document.querySelectorAll('.split .panel')];
 const partner=panels.find(p=>/partnerdialog|partner dialogue/i.test(p.textContent||''));
 const participant=panels.find(p=>/interesse som deltaker|participant interest/i.test(p.textContent||''));
 const ensure=(panel,kind)=>{
   if(!panel)return;
   let a=panel.querySelector('a.btn');
   if(!a){a=document.createElement('a');a.className='btn teal n1-contact-choice';panel.appendChild(a)}
   a.classList.add('n1-contact-choice');
   a.href=`?spor=${kind==='PARTNER'?'partner':'deltaker'}&fra=kontakt-kort#deltaker-interesse`;
   a.innerHTML=bi('Meld interesse','Express interest');
 };
 ensure(partner,'PARTNER');ensure(participant,'PARTICIPANT');
}
function directContact(){
 const card=document.querySelector('.contact-card');if(!card)return;
 card.id='direkte-kontakt';
 const p=card.querySelector('p:not(.eyebrow)');if(!p||p.querySelector('a[href^="tel:"]'))return;
 const mail=p.querySelector('a[href^="mailto:"]');
 if(mail)mail.insertAdjacentHTML('afterend','<br><a href="tel:+4793040588">+47 930 40 588</a>');
}
function ensureInquiry(select){
 if(!select)return;
 const en=document.documentElement.dataset.lang==='en';
 const labels=en?{PARTICIPANT:'Participant – for myself',PARTNER:'Partner / collaboration',REFERRAL:'Referrer – for someone else'}:{PARTICIPANT:'Deltaker – for meg selv',PARTNER:'Partner / samarbeid',REFERRAL:'Henviser – for en annen'};
 let blank=[...select.options].find(o=>o.value==='');
 if(!blank){blank=new Option(en?'Choose':'Velg','');select.insertBefore(blank,select.firstChild)}else blank.textContent=en?'Choose':'Velg';
 for(const [value,label] of Object.entries(labels)){
   let option=[...select.options].find(o=>o.value===value);
   if(!option){option=new Option(label,value);select.appendChild(option)}else option.textContent=label;
 }
 if(select.dataset.contactPolishPreset!=='1'){
   const initial=chosen();select.value=initial||'';select.dataset.contactPolishPreset='1';
   select.dispatchEvent(new Event('change',{bubbles:true}));
 }
}
function contextField(form){
 let wrap=form.querySelector('.n1-contact-context');
 if(!wrap){
   wrap=document.createElement('div');wrap.className='n1-contact-context';
   const contact=form.querySelector('[name="preferred_contact"]')?.closest('.n1-field');
   (contact||form.querySelector('.n1-form-note'))?.insertAdjacentElement('afterend',wrap);
 }
 const type=form.querySelector('[name="inquiry_type"]')?.value||'';
 if(wrap.dataset.forType===type)return;
 wrap.dataset.forType=type;
 if(type==='PARTNER'){
   wrap.hidden=false;wrap.innerHTML=`<label for="n1-interest-context">${bi('Hva ønsker dere å utforske? (valgfritt)','What would you like to explore? (optional)')}</label><select id="n1-interest-context" name="interest_context"><option value="">Velg</option><option value="PILOT">Pilot / målgruppe</option><option value="COOPERATION">Samarbeid</option><option value="FUNDING">Finansiering</option><option value="WORK">Arbeidsrettet / NAV</option><option value="OTHER">Annet</option></select><small>${bi('Ikke skriv eller legg inn sensitive personopplysninger i første kontakt.','Do not enter sensitive personal data in the first contact.')}</small>`;
 }else if(type==='PARTICIPANT'){
   wrap.hidden=false;wrap.innerHTML=`<label for="n1-interest-context">${bi('Hva vil du vite mer om? (valgfritt)','What would you like to know more about? (optional)')}</label><select id="n1-interest-context" name="interest_context"><option value="">Velg</option><option value="FIT">Om dette kan passe</option><option value="PROCESS">Hvordan løpet fungerer</option><option value="PRACTICAL">Praktisk</option><option value="FUNDING">Pris / finansiering</option><option value="OTHER">Annet</option></select><small>${bi('Ingen helseopplysninger eller andre sensitive personopplysninger skal oppgis her.','Do not enter health information or other sensitive personal data here.')}</small>`;
 }else{wrap.hidden=true;wrap.innerHTML=''}
}
function formActions(form){
 const button=form.querySelector('button[type="submit"]');if(button)button.innerHTML=bi('Send','Send');
 const actions=form.querySelector('.n1-form-actions');if(!actions)return;
 let direct=actions.querySelector('.n1-direct-link');
 if(!direct){direct=document.createElement('a');direct.className='btn ghost n1-direct-link';direct.href='#direkte-kontakt';direct.innerHTML=bi('Kontakt direkte','Direct contact');actions.insertBefore(direct,actions.querySelector('small')||null)}
 const fallback=actions.querySelector('.n1-intake-fallback');if(fallback)fallback.hidden=true;
}
function copy(form){
 const type=form.querySelector('[name="inquiry_type"]')?.value||'';
 const card=form.closest('.n1-interest-card');const h=card?.querySelector('h2');const lead=card?.querySelector('.lead');
 if(h)h.innerHTML=type==='PARTNER'?bi('Fortell kort hva dere vil utforske.','Tell us briefly what you want to explore.'):bi('Se om dette kan passe for deg.','See if this could fit you.');
 if(lead)lead.innerHTML=type==='PARTNER'?bi('Første steg er en kort og uforpliktende partnerinteresse. Vi trenger bare nok til å kunne svare og finne et logisk neste steg.','The first step is a short, non-binding partner enquiry. We only need enough to reply and identify a logical next step.'):bi('Første steg er en kort interesse – ikke en påmelding. Vi trenger bare nok informasjon til å kunne svare og finne et logisk neste steg.','The first step is a short expression of interest – not enrolment. We only need enough information to reply and identify a logical next step.');
 const note=form.querySelector('.n1-form-note');
 if(note&&type==='PARTNER')note.innerHTML=bi(`<strong>Ikke oppgi sensitive personopplysninger.</strong> Første kontakt handler bare om virksomheten, behovet og hvordan vi kan svare.${noStore?' Ingen persondata lagres eller sendes i denne testen.':''}`,`<strong>Do not enter sensitive personal data.</strong> The first contact is only about the organisation, the need and how we can reply.${noStore?' No personal data is stored or sent in this test.':''}`);
 if(note&&type==='PARTICIPANT'&&noStore)note.innerHTML=bi('<strong>Ikke skriv helseopplysninger eller andre sensitive personopplysninger her.</strong> Dette er bare første kontakt. Ingen persondata lagres eller sendes i denne testen.','<strong>Do not enter health information or other sensitive personal data here.</strong> This is only the first contact. No personal data is stored or sent in this test.');
}
function enhanceForm(){
 const form=document.querySelector('form.n1-interest-form');if(!form)return false;
 ensureInquiry(form.querySelector('[name="inquiry_type"]'));contextField(form);formActions(form);copy(form);
 if(form.dataset.contactPolishBound!=='1'){
   form.dataset.contactPolishBound='1';
   form.addEventListener('change',()=>setTimeout(()=>{contextField(form);formActions(form);copy(form)},0));
   document.querySelectorAll('.lang-toggle').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{ensureInquiry(form.querySelector('[name="inquiry_type"]'));formActions(form);copy(form)},0)));
 }
 return true;
}
function apply(){style();topCards();directContact();enhanceForm()}
apply();
for(const delay of [0,80,240,700,1400])setTimeout(apply,delay);
window.addEventListener('load',apply,{once:true});
})();
