(()=>{
'use strict';

const requestedIntake=new URLSearchParams(location.search).get('intake')||'';
function contactLabel(v){return String(v||'EMAIL').toUpperCase()==='PHONE'?'Telefon':'E-post'}
function esc2(v=''){try{return esc(v)}catch{return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}}
function selectRequested(){if(!requestedIntake||!Array.isArray(rows))return;const found=rows.find(r=>String(r.id)===String(requestedIntake));if(found)selectedId=found.id}
function enhanceDetail(){
  const r=Array.isArray(rows)?rows.find(x=>x.id===selectedId):null,detail=document.querySelector('#detail');if(!r||!detail||detail.querySelector('[data-intake-contact-path]'))return;
  const preferred=String(r.preferred_contact||'EMAIL').toUpperCase();
  const phone=String(r.contact_phone||'').trim(),email=String(r.contact_email||'').trim();
  const canPhone=preferred==='PHONE'&&phone,href=canPhone?`tel:${phone.replace(/\s+/g,'')}`:email?`mailto:${email}`:phone?`tel:${phone.replace(/\s+/g,'')}`:'';
  const action=href?`<a class="primary link-btn" href="${esc2(href)}">${canPhone?'Ring interessenten':'Send e-post til interessenten'}</a>`:'<span class="pill">Kontaktinformasjon mangler</span>';
  const box=document.createElement('section');box.className='n2-section';box.dataset.intakeContactPath='1';
  box.innerHTML=`<h3>Kontakt og neste handling</h3><div class="n2-known-grid"><div class="n2-known"><span>Navn</span><strong>${esc2(r.contact_name||'Interessent')}</strong></div><div class="n2-known"><span>Foretrukket kontakt</span><strong>${esc2(contactLabel(preferred))}</strong></div></div><p class="n2-next-copy">Bruk personens valgte kontaktkanal når den er tilgjengelig. Kontakt er en triagehandling – ikke en godkjenning til VÍA eller SER.</p><div class="n2-outcomes">${action}</div>`;
  const firstSection=detail.querySelector('.n2-section');if(firstSection)firstSection.insertAdjacentElement('afterend',box);else detail.appendChild(box)
}
const baseRenderAll=renderAll;
renderAll=function(){selectRequested();const out=baseRenderAll();enhanceDetail();return out};
const baseRenderDetail=renderDetail;
renderDetail=function(){const out=baseRenderDetail();enhanceDetail();return out};
setTimeout(()=>{selectRequested();renderAll()},160);
})();