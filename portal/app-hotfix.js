(()=>{
'use strict';
const BAD_SORT="const ordered=[...open].sort((a,b)=>({RED:0,YELLOW:1,GREEN:2}[severity(a)]-({RED:0,YELLOW:1,GREEN:2}[severity(b)])||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));";
const GOOD_SORT="const rank={RED:0,YELLOW:1,GREEN:2};const ordered=[...open].sort((a,b)=>(rank[severity(a)]-rank[severity(b)])||(new Date(a.due_at||'2999')-new Date(b.due_at||'2999')));";
const BAD_TASK=`async function updateTaskStatus(status){
  const t=tasks.find(x=>x.id===selectedTaskId);if(!t)return;$('#taskDialogMessage').textContent='Lagrer…';const {error}=await client.from('tasks').update({status,updated_at:new Date().toISOString()}).eq('id',t.id);if(error){$('#taskDialogMessage').textContent='Kunne ikke oppdatere oppgaven med din tilgang.';return}t.status=status;$('#taskDialog').close();renderAll();
}`;
const GOOD_TASK=`async function updateTaskStatus(status){
  const t=tasks.find(x=>x.id===selectedTaskId);if(!t)return;$('#taskDialogMessage').textContent='Lagrer…';const {data,error}=await client.functions.invoke('task-command',{body:{taskId:t.id,status}});if(error||data?.error){$('#taskDialogMessage').textContent='Kunne ikke oppdatere oppgaven med din tilgang.';return}t.status=data?.task?.status||status;$('#taskDialog').close();renderAll();
}`;
const fallbacks=['https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'];
function showFailure(text){const loading=document.querySelector('#loading'),auth=document.querySelector('#authView'),msg=document.querySelector('#authMessage');loading?.classList.add('hidden');auth?.classList.remove('hidden');if(msg)msg.textContent=text;console.error('[AidMe VIDA hotfix]',text)}
function loadScript(src,ms=5000){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const t=setTimeout(()=>{if(done)return;done=true;s.remove();reject(new Error('timeout'))},ms);s.src=src;s.async=true;s.onload=()=>{if(done)return;done=true;clearTimeout(t);resolve()};s.onerror=()=>{if(done)return;done=true;clearTimeout(t);reject(new Error('load'))};document.head.appendChild(s)})}
async function ensureSupabase(){if(window.supabase?.createClient)return;for(const src of fallbacks){try{await loadScript(src);if(window.supabase?.createClient)return}catch{}}throw new Error('Sikker innloggingsmodul kunne ikke lastes')}
async function boot(){
  const watchdog=setTimeout(()=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure('Oppstart tar for lang tid. Last siden på nytt; ingen data er endret.')},12000);
  try{
    await ensureSupabase();
    const res=await fetch('./app-core-broken.js?v=20260817e',{cache:'no-store'});if(!res.ok)throw new Error('Portalkjerne mangler');let code=await res.text();
    if(!code.includes(BAD_SORT))throw new Error('Forventet oppstartsreparasjon ble ikke funnet');
    code=code.replace(BAD_SORT,GOOD_SORT);
    if(!code.includes(BAD_TASK))throw new Error('Forventet oppgavefunksjon ble ikke funnet');
    code=code.replace(BAD_TASK,GOOD_TASK);
    (0,eval)(`${code}\n//# sourceURL=aidme-portal-core-hotfixed.js`);
  }catch(e){clearTimeout(watchdog);showFailure(`Portalen kunne ikke starte (${e.message}).`)}
}
window.addEventListener('error',e=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure(`Oppstartsfeil: ${e.message||'ukjent feil'}.`)});
boot();
})();
