(()=>{
'use strict';

const VERSION='2026-09-25a';
const boot=document.querySelector('#formBoot');
const runner=document.querySelector('#runner');
const blocked=document.querySelector('#blocked');
const workspace=document.querySelector('.workspace');
let settled=false,failed=false,timer=null,observer=null;

function visible(el){return !!el&&!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none'}
function taskLoader(){return document.querySelector('#taskFastLoading')}
function returnHref(){
  const q=new URLSearchParams(location.search),task=q.get('returnTask');
  if(!task)return'./';
  const out=new URLSearchParams({returnTask:task,returnView:q.get('returnView')||'tasks'});
  return`./?${out.toString()}`;
}
function cleanup(){if(timer){clearTimeout(timer);timer=null}if(observer){observer.disconnect();observer=null}}
function finish(){if(settled||failed)return;settled=true;boot?.classList.add('hidden');cleanup()}
function check(){
  if(failed||settled)return;
  if(visible(runner)||visible(blocked)){finish();return}
  if(taskLoader())boot?.classList.add('hidden');
}
function fail(detail='Skjemaet svarte ikke som forventet.'){
  if(settled||failed)return;failed=true;cleanup();
  taskLoader()?.classList.add('hidden');
  runner?.classList.add('hidden');
  blocked?.classList.add('hidden');
  if(!boot)return;
  boot.classList.remove('hidden');
  boot.innerHTML=`<p class="eyebrow">Skjema · trygg retur</p><h2>Skjemaet kunne ikke åpnes</h2><p>${detail} Ingen data er endret. Du kan prøve igjen eller gå tilbake til oppgaven/portalen.</p><div class="form-actions"><button id="formBootRetry" type="button" class="primary">Prøv igjen</button><a class="ghost" href="${returnHref()}">Tilbake</a></div><p class="privacy-note">Hvis ekstra sikkerhetsbekreftelse kreves, blir du sendt til Sikkerhet uten at valgt deltaker, oppgave eller skjema skal gå tapt.</p>`;
  boot.querySelector('#formBootRetry')?.addEventListener('click',()=>location.reload());
}

window.AidMeFormEntryGuard={version:VERSION,check,fail,ready:finish};
window.addEventListener('error',event=>{if(!settled)fail('En nødvendig del av skjemasiden kunne ikke lastes.')});
window.addEventListener('unhandledrejection',event=>{if(!settled)fail('Tilgang eller skjemakontekst kunne ikke kontrolleres ferdig.')});
observer=new MutationObserver(check);
if(workspace)observer.observe(workspace,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
timer=setTimeout(()=>fail('Tilgangskontrollen tok for lang tid.'),15000);
check();
})();