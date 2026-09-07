(()=>{
'use strict';

const form=document.querySelector('#dynamicForm');
const message=document.querySelector('#formMessage');
if(!form||!message)return;

const style=document.createElement('style');
style.textContent=`
.field-wrap.validation-error textarea,
.field-wrap.validation-error input,
.field-wrap.validation-error select{border-color:#b42318!important;box-shadow:0 0 0 2px rgba(180,35,24,.12)!important}
.field-wrap .validation-help{display:block;color:#b42318!important;font-size:12px!important;font-weight:700;line-height:1.35;margin-top:6px!important}
.message.validation-error-message{color:#b42318;font-weight:700}
`;
document.head.appendChild(style);

function wrapFor(control){return control?.closest?.('.field-wrap')||null}
function markInvalid(control){
  const wrap=wrapFor(control);if(!wrap)return;
  wrap.classList.add('validation-error');
  if(!wrap.querySelector('.validation-help')){
    const help=document.createElement('small');
    help.className='validation-help';
    help.textContent='Dette feltet må fylles ut før skjemaet kan fullføres.';
    wrap.appendChild(help);
  }
}
function clearIfValid(control){
  const wrap=wrapFor(control);if(!wrap)return;
  const invalid=[...wrap.querySelectorAll('input,textarea,select')].some(el=>!el.checkValidity());
  if(invalid)return;
  wrap.classList.remove('validation-error');
  wrap.querySelector('.validation-help')?.remove();
  if(!form.querySelector('.field-wrap.validation-error')){
    message.classList.remove('validation-error-message');
    if(message.textContent==='Fyll ut feltene markert med rødt før du fullfører skjemaet.')message.textContent='';
  }
}

form.addEventListener('invalid',event=>{
  const control=event.target;
  markInvalid(control);
  message.textContent='Fyll ut feltene markert med rødt før du fullfører skjemaet.';
  message.classList.add('validation-error-message');
},true);

form.addEventListener('input',event=>clearIfValid(event.target),true);
form.addEventListener('change',event=>clearIfValid(event.target),true);
})();
