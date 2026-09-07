(()=>{
'use strict';

const VIA_INTENTION_HELP='Hva vil du avklare, utforske eller bevege deg mot i denne VÍA-en? Én enkel setning er nok. Ta den med inn i SER som noe å øve på eller legge merke til, og videre til VIDA som konkret handling hjemme. Ikke et motto eller prestasjonsmål.';

function normalizeLabel(text){return String(text||'').trim().replace(/\s*\*\s*$/,'')}
function polishViaIntention(root=document){
  root.querySelectorAll?.('.field-wrap label>span,.field-wrap legend').forEach(label=>{
    if(normalizeLabel(label.textContent)!=='Min VÍA-setning')return;
    const required=/\*\s*$/.test(label.textContent.trim());
    const next=`Min VÍA-intensjon${required?' *':''}`;
    if(label.textContent!==next)label.textContent=next;
  });
  const input=root.querySelector?.('[name="via_sentence"]');
  if(!input)return;
  const wrap=input.closest('.field-wrap');
  const help=wrap?.querySelector('small');
  if(help&&help.textContent!==VIA_INTENTION_HELP)help.textContent=VIA_INTENTION_HELP;
}

function apply(){polishViaIntention(document)}
apply();
const runner=document.getElementById('runner');
if(runner)new MutationObserver(apply).observe(runner,{childList:true,subtree:true,characterData:true});
document.addEventListener('aidme:portal-rendered',apply);
})();
