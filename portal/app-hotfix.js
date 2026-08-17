(()=>{
'use strict';
const BAD="const ordered=[...open].sort((a,b)=>({RED:0,YELLOW:1,GREEN:2}[severity(a)]-({RED:0,YELLOW:1,GREEN:2}[severity(b)])||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));";
const GOOD="const rank={RED:0,YELLOW:1,GREEN:2};const ordered=[...open].sort((a,b)=>(rank[severity(a)]-rank[severity(b)])||(new Date(a.due_at||'2999')-new Date(b.due_at||'2999')));";
const fallbacks=['https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'];
function showFailure(text){const loading=document.querySelector('#loading'),auth=document.querySelector('#authView'),msg=document.querySelector('#authMessage');loading?.classList.add('hidden');auth?.classList.remove('hidden');if(msg)msg.textContent=text;console.error('[AidMe VIDA hotfix]',text)}
function loadScript(src,ms=5000){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const t=setTimeout(()=>{if(done)return;done=true;s.remove();reject(new Error('timeout'))},ms);s.src=src;s.async=true;s.onload=()=>{if(done)return;done=true;clearTimeout(t);resolve()};s.onerror=()=>{if(done)return;done=true;clearTimeout(t);reject(new Error('load'))};document.head.appendChild(s)})}
async function ensureSupabase(){if(window.supabase?.createClient)return;for(const src of fallbacks){try{await loadScript(src);if(window.supabase?.createClient)return}catch{}}throw new Error('Sikker innloggingsmodul kunne ikke lastes')}
async function boot(){
  const watchdog=setTimeout(()=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure('Oppstart tar for lang tid. Last siden på nytt; ingen data er endret.')},12000);
  try{
    await ensureSupabase();
    const res=await fetch('./app-core-broken.js?v=20260817d',{cache:'no-store'});if(!res.ok)throw new Error('Portalkjerne mangler');let code=await res.text();
    if(!code.includes(BAD))throw new Error('Forventet hotfix-punkt ble ikke funnet');
    code=code.replace(BAD,GOOD);
    (0,eval)(`${code}\n//# sourceURL=aidme-portal-core-hotfixed.js`);
  }catch(e){clearTimeout(watchdog);showFailure(`Portalen kunne ikke starte (${e.message}).`)}
}
window.addEventListener('error',e=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure(`Oppstartsfeil: ${e.message||'ukjent feil'}.`)});
boot();
})();
