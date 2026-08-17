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
const BAD_FORMS=`function renderForms(){const phaseFor={info_before_via:'VÍA',interest_referral:'VÍA',via_roadmap:'VÍA',individual_go_no_go:'VÍA',participant_agreement:'VÍA',pilot_go:'VÍA/SER',ser_daily:'SER',incident:'SER',vida_plan:'VIDA',pilot_evaluation:'VIDA'};$('#formLibrary').innerHTML=formDefs.map((f,i)=>\`<article class="form-module"><span class="num">\${String(i).padStart(2,'0')}</span><h3>\${escapeHtml(f.title_no)}</h3><p>\${escapeHtml(f.scope==='staff'?'Arbeidsflate for navngitt rolle/ansvar.':f.scope==='participant_staff'?'Deltaker og ansvarlig medarbeider – etter tilgang.':'Deltakerrettet steg.')}</p><div class="meta"><span>\${escapeHtml(phaseFor[f.key]||'VÍA/SER/VIDA')}</span><span>\${escapeHtml(f.scope)}</span></div></article>\`).join('')}`;
const GOOD_FORMS=`function renderForms(){const phaseFor={info_before_via:'VÍA',interest_referral:'VÍA',via_roadmap:'VÍA',individual_go_no_go:'VÍA',participant_agreement:'VÍA',pilot_go:'VÍA/SER',ser_daily:'SER',incident:'SER',vida_plan:'VIDA',pilot_evaluation:'VIDA'},participant=selectedParticipantId||ownParticipant()?.id||'';$('#formLibrary').innerHTML=formDefs.map((f,i)=>\`<a class="form-module" style="text-decoration:none;color:inherit" href="./form-runner.html?key=\${encodeURIComponent(f.key)}\${participant?'&participant='+encodeURIComponent(participant):''}"><span class="num">\${String(i).padStart(2,'0')}</span><h3>\${escapeHtml(f.title_no)}</h3><p>\${escapeHtml(f.scope==='staff'?'Arbeidsflate for navngitt rolle/ansvar.':f.scope==='participant_staff'?'Deltaker og ansvarlig medarbeider – etter tilgang.':'Deltakerrettet steg.')}</p><div class="meta"><span>\${escapeHtml(phaseFor[f.key]||'VÍA/SER/VIDA')}</span><span>Åpne →</span></div></a>\`).join('')}`;
const fallbacks=['https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'];
function showFailure(text){const loading=document.querySelector('#loading'),auth=document.querySelector('#authView'),msg=document.querySelector('#authMessage');loading?.classList.add('hidden');auth?.classList.remove('hidden');if(msg)msg.textContent=text;console.error('[AidMe VIDA hotfix]',text)}
function loadScript(src,ms=5000){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const t=setTimeout(()=>{if(done)return;done=true;s.remove();reject(new Error('timeout'))},ms);s.src=src;s.async=true;s.onload=()=>{if(done)return;done=true;clearTimeout(t);resolve()};s.onerror=()=>{if(done)return;done=true;clearTimeout(t);reject(new Error('load'))};document.head.appendChild(s)})}
async function ensureSupabase(){if(window.supabase?.createClient)return;for(const src of fallbacks){try{await loadScript(src);if(window.supabase?.createClient)return}catch{}}throw new Error('Sikker innloggingsmodul kunne ikke lastes')}
async function boot(){
  const watchdog=setTimeout(()=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure('Oppstart tar for lang tid. Last siden på nytt; ingen data er endret.')},12000);
  try{
    await ensureSupabase();
    const res=await fetch('./app-core-broken.js?v=20260817f',{cache:'no-store'});if(!res.ok)throw new Error('Portalkjerne mangler');let code=await res.text();
    if(!code.includes(BAD_SORT))throw new Error('Forventet oppstartsreparasjon ble ikke funnet');code=code.replace(BAD_SORT,GOOD_SORT);
    if(!code.includes(BAD_TASK))throw new Error('Forventet oppgavefunksjon ble ikke funnet');code=code.replace(BAD_TASK,GOOD_TASK);
    if(!code.includes(BAD_FORMS))throw new Error('Forventet skjemafunksjon ble ikke funnet');code=code.replace(BAD_FORMS,GOOD_FORMS);
    (0,eval)(`${code}\n//# sourceURL=aidme-portal-core-hotfixed.js`);
  }catch(e){clearTimeout(watchdog);showFailure(`Portalen kunne ikke starte (${e.message}).`)}
}
window.addEventListener('error',e=>{const l=document.querySelector('#loading');if(l&&!l.classList.contains('hidden'))showFailure(`Oppstartsfeil: ${e.message||'ukjent feil'}.`)});
boot();
})();
