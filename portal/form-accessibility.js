(()=>{
'use strict';

function fieldId(key,suffix=''){
  const safe=String(key||'field').replace(/[^a-zA-Z0-9_-]/g,'-');
  return `field-${safe}${suffix}`;
}
function helpMarkup(f,id){return f.help?`<small id="${id}">${esc(f.help)}</small>`:''}
function describedBy(f,id){return f.help?` aria-describedby="${id}"`:''}
function fieldLegend(f){return `${esc(f.label)}${f.required?' *':''}`}

renderField=function renderAccessibleField(f){
  const full=['textarea','action','multi_select'].includes(f.type)?' full':'';
  const required=f.required?' required':'';
  const id=fieldId(f.key),helpId=`${id}-help`,desc=describedBy(f,helpId),legend=fieldLegend(f);
  const wrapOpen=`<div class="field-wrap${full}" data-required="${f.required?'true':'false'}">`;
  const help=helpMarkup(f,helpId);

  if(f.type==='tri_state'){
    const options=[['YES','Ja'],['NO','Nei'],['UNRESOLVED','Ikke avklart']].map(([value,label],index)=>{
      const optionId=`${id}-${index}`;
      return `<label for="${optionId}"><input id="${optionId}" type="radio" name="${esc(f.key)}" value="${value}"${required}${desc}> ${label}</label>`;
    }).join('');
    return `${wrapOpen}<fieldset class="field-group"><legend>${legend}</legend><div class="tri-state">${options}</div>${help}</fieldset></div>`;
  }

  if(f.type==='multi_select'){
    const options=(f.options||[]).map((option,index)=>{
      const optionId=`${id}-${index}`;
      return `<label for="${optionId}"><input id="${optionId}" type="checkbox" name="${esc(f.key)}" value="${esc(option)}"${desc}> ${esc(String(option).replaceAll('_',' '))}</label>`;
    }).join('');
    return `${wrapOpen}<fieldset class="field-group"><legend>${legend}</legend><div class="multi-select">${options}</div>${help}</fieldset></div>`;
  }

  if(f.type==='checkbox'){
    return `${wrapOpen}<fieldset class="field-group"><legend>${legend}</legend><label class="check-row" for="${id}"><input id="${id}" type="checkbox" name="${esc(f.key)}"${desc}> Bekreft</label>${help}</fieldset></div>`;
  }

  if(f.type==='action'){
    const actionId=`${id}-action`,supportId=`${id}-support`,deadlineId=`${id}-deadline`;
    return `${wrapOpen}<fieldset class="field-group"><legend>${legend}</legend><div class="action-fields"><label for="${actionId}"><span>Konkret handling${f.required?' *':''}</span><input id="${actionId}" name="${esc(f.key)}__action"${required}${desc}></label><label for="${supportId}"><span>Støtte/eier</span><input id="${supportId}" name="${esc(f.key)}__support"${desc}></label><label for="${deadlineId}"><span>Frist</span><input id="${deadlineId}" name="${esc(f.key)}__deadline" type="date"${desc}></label></div>${help}</fieldset></div>`;
  }

  let control='';
  if(f.type==='textarea')control=`<textarea id="${id}" name="${esc(f.key)}" rows="4"${required}${desc}></textarea>`;
  else if(f.type==='select')control=`<select id="${id}" name="${esc(f.key)}"${required}${desc}><option value="">Velg</option>${(f.options||[]).map(option=>`<option value="${esc(option)}">${esc(String(option).replaceAll('_',' '))}</option>`).join('')}</select>`;
  else if(f.type==='range')control=`<input id="${id}" type="range" name="${esc(f.key)}" min="${f.min??0}" max="${f.max??10}" value="5"${desc}><small data-range-for="${esc(f.key)}">5</small>`;
  else if(f.type==='datetime')control=`<input id="${id}" type="datetime-local" name="${esc(f.key)}"${required}${desc}>`;
  else control=`<input id="${id}" type="text" name="${esc(f.key)}"${required}${desc}>`;
  return `${wrapOpen}<label for="${id}"><span>${legend}</span></label>${control}${help}</div>`;
};

const sections=document.querySelector('#formSections');
if(sections&&!document.querySelector('#requiredFieldNote')){
  const note=document.createElement('p');
  note.id='requiredFieldNote';
  note.className='form-required-note';
  note.textContent='Obligatoriske felt er merket med *.';
  sections.insertAdjacentElement('beforebegin',note);
}
const message=document.querySelector('#formMessage');
if(message){message.setAttribute('aria-live','polite');message.setAttribute('aria-atomic','true')}

const style=document.createElement('style');
style.dataset.aidmeFormA11y='1';
style.textContent='.field-group{border:0;padding:0;margin:0;min-width:0}.field-group legend{font-weight:600;margin:0 0 7px;padding:0}.action-fields>label{display:block}.action-fields>label>span{display:block;margin-bottom:5px}.form-required-note{font-size:12px;color:var(--muted);margin:0 0 12px}';
document.head.appendChild(style);

(async()=>{
  try{
    const {data:{session}}=await client.auth.getSession();
    if(!session)return;
    const {data}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if(data?.currentLevel==='aal2')sessionStorage.removeItem('aidme:return-intent:v1');
    else{
      const link=document.querySelector('#blocked a.primary');
      if(link)link.textContent='Bekreft Authenticator og fortsett';
    }
  }catch{}
})();
})();
