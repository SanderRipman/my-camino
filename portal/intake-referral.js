(()=>{
'use strict';

function intakeTypeLabel(type){
  return ({PARTICIPANT:'Egen interesse',REFERRAL:'Henvisning',PARTNER:'Partner',PROFESSIONAL:'Faglig henvendelse',FINANCIER:'Finansiering',OTHER:'Annet'})[String(type||'').toUpperCase()]||'Ikke angitt';
}
function contactMethodLabel(method){return String(method||'').toUpperCase()==='PHONE'?'Telefon':'E-post'}

const baseSourceLabel=sourceLabel;
sourceLabel=function(source){
  const s=String(source||'').toUpperCase();
  if(s==='REFERRAL_CONFIRMED')return'Bekreftet henvisning';
  if(s==='PUBLIC_WEB'||s==='AIDME.NO')return'aidme.no';
  return baseSourceLabel(source);
};

function ensureReferralDialog(){
  if(document.querySelector('#referralConfirmDialog'))return;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="referralConfirmDialog" class="task-dialog"><form class="dialog-shell" id="referralConfirmForm"><div class="dialog-head"><div><p class="eyebrow">Henvisning → direkte deltakerkontakt</p><h2>Bekreft personens eget ønske om kontakt</h2></div><button class="icon-btn" type="button" id="closeReferralDialog" aria-label="Lukk">×</button></div><div class="n2-dialog-note"><strong>Henviser og deltaker er to forskjellige personer.</strong> Registrer først deltakerens kontakt når personen selv har sagt ja til videre kontakt. Henviserens kontaktdata kopieres aldri inn som deltakeridentitet. Dette er en medarbeiderbekreftelse på kontaktvilje – ikke deltakerens formelle programsamtykke.</div><label><span>Deltakerens navn</span><input id="referralParticipantName" required maxlength="120" autocomplete="name"></label><label><span>Deltakerens e-post</span><input id="referralParticipantEmail" type="email" required maxlength="254" autocomplete="email"></label><label><span>Deltakerens telefon (valgfritt)</span><input id="referralParticipantPhone" type="tel" maxlength="40" autocomplete="tel"></label><label><span>Foretrukket kontakt</span><select id="referralParticipantContact"><option value="EMAIL">E-post</option><option value="PHONE">Telefon</option></select></label><label class="check-row"><input id="referralContactWillingness" type="checkbox" required> Jeg har avklart at personen selv ønsker at AidMe tar kontakt / går videre i dialog.</label><div class="dialog-actions"><button type="button" class="ghost" id="cancelReferralDialog">Avbryt</button><button type="submit" class="primary">Opprett egen deltakerinteresse</button></div><p id="referralConfirmMessage" class="message" aria-live="polite"></p></form></dialog>`);
  const dialog=document.querySelector('#referralConfirmDialog');
  const close=()=>dialog.close();
  document.querySelector('#closeReferralDialog')?.addEventListener('click',close);
  document.querySelector('#cancelReferralDialog')?.addEventListener('click',close);
  document.querySelector('#referralParticipantContact')?.addEventListener('change',()=>{
    const phone=document.querySelector('#referralParticipantPhone');
    if(phone)phone.required=document.querySelector('#referralParticipantContact').value==='PHONE';
  });
  document.querySelector('#referralConfirmForm')?.addEventListener('submit',async event=>{
    event.preventDefault();
    const form=event.currentTarget;if(!form.reportValidity())return;
    const message=document.querySelector('#referralConfirmMessage');message.textContent='Oppretter separat deltakerinteresse…';
    if(QA_MODE){message.textContent='Henvisningsbekreftelse skriver ikke data i N2-syretest.';return;}
    const contactWillingnessConfirmed=document.querySelector('#referralContactWillingness').checked;
    const body={
      intakeId:selectedId,
      contactWillingnessConfirmed,
      // Midlertidig kompatibilitet med eldre intake-command. Dette er ikke et formelt consent-event.
      consentConfirmed:contactWillingnessConfirmed,
      participant:{
        name:document.querySelector('#referralParticipantName').value.trim(),
        email:document.querySelector('#referralParticipantEmail').value.trim(),
        phone:document.querySelector('#referralParticipantPhone').value.trim(),
        preferredContact:document.querySelector('#referralParticipantContact').value
      }
    };
    const {data,error}=await cmd('CONFIRM_REFERRAL',body);
    if(error||data?.error){message.textContent=`Kunne ikke opprette deltakerinteressen (${data?.error||'ukjent feil'}).`;return;}
    dialog.close();selectedId=data?.intake?.id||null;
    setWorkspaceMessage('Henvisningen er lukket. En separat deltakerinteresse er opprettet etter bekreftet eget ønske om kontakt. Formelt programsamtykke skjer senere i deltakerens sikre spor.','success');
    form.reset();await refresh();
  });
}

const baseRenderDetail=renderDetail;
renderDetail=function(){
  baseRenderDetail();
  const r=rows.find(x=>x.id===selectedId);if(!r)return;
  const known=document.querySelector('#detail .n2-known-grid');
  if(known && !known.querySelector('[data-intake-type]')){
    known.insertAdjacentHTML('beforeend',`<div class="n2-known" data-intake-type><span>Kontaktspor</span><strong>${esc(intakeTypeLabel(r.interest_type))}</strong></div><div class="n2-known"><span>Foretrukket svar</span><strong>${esc(contactMethodLabel(r.preferred_contact))}</strong></div>`);
  }
  const flow=document.querySelector('#detail .n2-flow-note');
  if(flow && String(r.interest_type||'').toUpperCase()==='REFERRAL')flow.innerHTML='<strong>Henvisning mottatt – ikke deltakerinteresse ennå.</strong> Kontakt henviseren først. Før en VÍA-reise kan opprettes må personen selv ønske videre kontakt; henviserens identitet skal aldri bli deltakerens identitet.';
  if(String(r.interest_type||'').toUpperCase()!=='REFERRAL')return;
  const old=document.querySelector('#toVia');if(!old)return;
  const next=old.cloneNode(true);old.replaceWith(next);next.id='confirmReferral';next.textContent='Bekreft personens eget ønske om kontakt';
  const copy=next.closest('.n2-section')?.querySelector('.n2-next-copy');
  if(copy)copy.textContent='Dette oppretter en separat deltakerinteresse med personens egne kontaktopplysninger etter at medarbeider har avklart personens eget ønske om kontakt. Dette er ikke et formelt programsamtykke; det skjer senere i deltakerens sikre spor.';
  next.addEventListener('click',()=>{ensureReferralDialog();const dialog=document.querySelector('#referralConfirmDialog');document.querySelector('#referralConfirmMessage').textContent='';dialog.showModal();});
};

ensureReferralDialog();
})();
