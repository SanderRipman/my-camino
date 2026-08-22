import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(dir,'app-core-broken.js');
const opsPath=path.join(dir,'app-ops.js');
const uxPath=path.join(dir,'app-ux.js');
const onboardingPath=path.join(dir,'app-onboarding.js');
const mobilePath=path.join(dir,'app-mobile.js');
const contextPath=path.join(dir,'app-context.js');
const participantPath=path.join(dir,'app-participant.js');
const participantNextPath=path.join(dir,'app-participant-next.js');
const viaHandoffPath=path.join(dir,'app-via-handoff.js');
const goDecisionPath=path.join(dir,'app-go-decision.js');
const serVidaPath=path.join(dir,'app-ser-vida.js');
const serVidaHandoffPath=path.join(dir,'app-ser-vida-handoff.js');
const vidaNewViaPath=path.join(dir,'app-vida-new-via.js');
const outPath=path.join(dir,'app.js');
let code=fs.readFileSync(sourcePath,'utf8');
const ops=fs.readFileSync(opsPath,'utf8');
const ux=fs.readFileSync(uxPath,'utf8');
const onboarding=fs.readFileSync(onboardingPath,'utf8');
const mobile=fs.readFileSync(mobilePath,'utf8');
const context=fs.readFileSync(contextPath,'utf8');
const participant=fs.readFileSync(participantPath,'utf8');
const participantNext=fs.readFileSync(participantNextPath,'utf8');
const viaHandoff=fs.readFileSync(viaHandoffPath,'utf8');
const goDecision=fs.readFileSync(goDecisionPath,'utf8');
const serVida=fs.readFileSync(serVidaPath,'utf8');
const serVidaHandoff=fs.readFileSync(serVidaHandoffPath,'utf8');
const vidaNewVia=fs.readFileSync(vidaNewViaPath,'utf8');

function replaceOnce(label,needle,replacement){
 const first=code.indexOf(needle);if(first<0)throw new Error(`${label}: source pattern missing`);if(code.indexOf(needle,first+1)>=0)throw new Error(`${label}: source pattern is not unique`);code=code.replace(needle,replacement);
}

replaceOnce('task sort',
 "const ordered=[...open].sort((a,b)=>({RED:0,YELLOW:1,GREEN:2}[severity(a)]-({RED:0,YELLOW:1,GREEN:2}[severity(b)])||new Date(a.due_at||'2999')-new Date(b.due_at||'2999'));",
 "const rank={RED:0,YELLOW:1,GREEN:2};const ordered=[...open].sort((a,b)=>(rank[severity(a)]-rank[severity(b)])||(new Date(a.due_at||'2999')-new Date(b.due_at||'2999')));"
);

replaceOnce('navigation priority counts',
 "const red=open.filter(t=>severity(t)==='RED').length,yellow=open.filter(t=>severity(t)==='YELLOW').length,green=open.filter(t=>severity(t)==='GREEN').length;",
 "const overdue=t=>!!t.due_at&&new Date(t.due_at)<new Date();const red=open.filter(t=>severity(t)==='RED'||overdue(t)).length,yellow=open.filter(t=>severity(t)==='YELLOW'&&!overdue(t)).length,green=open.filter(t=>severity(t)==='GREEN'&&!overdue(t)).length;"
);

const taskRowRe=/function taskRow\(t\)\{[\s\S]*?\n\}/;
if(!taskRowRe.test(code))throw new Error('taskRow: function missing');
code=code.replace(taskRowRe,`function taskRow(t){
  const p=participantById(t.participant_id),pilot=pilotById(t.pilot_id),r=routeToday(t.pilot_id),sev=severity(t);
  const context=[p?.code_name,pilot?.route_name,r?\`Dag \${r.day_number}: \${r.from_place} → \${r.to_place}\${r.distance_km?\` · \${r.distance_km} km\`:''}\`:null].filter(Boolean).join(' · ');
  const overdue=!!t.due_at&&['OPEN','IN_PROGRESS','WAITING'].includes(t.status)&&new Date(t.due_at)<new Date();
  const due=overdue?\`<span class="pill RED">Forfalt · \${formatDate(t.due_at)}</span>\`:\`<span class="pill">\${formatDate(t.due_at)}</span>\`;
  return \`<button class="task-row" data-task-id="\${t.id}"><i class="task-dot \${sev}"></i><div><b>\${escapeHtml(t.title)}</b><small>\${escapeHtml(context||t.description||'')}</small></div><div class="task-meta"><span class="pill \${sev}">\${sev==='RED'?'Kritisk':sev==='YELLOW'?'Avklar':'Normal'}</span>\${due}</div></button>\`;
}`);

const updateRe=/async function updateTaskStatus\(status\)\{[\s\S]*?\n\}/;
if(!updateRe.test(code))throw new Error('updateTaskStatus: function missing');
code=code.replace(updateRe,`async function updateTaskStatus(status){
  const t=tasks.find(x=>x.id===selectedTaskId);if(!t)return;$('#taskDialogMessage').textContent='Lagrer…';
  const {data,error}=await client.functions.invoke('task-command',{body:{taskId:t.id,status}});
  if(error||data?.error){$('#taskDialogMessage').textContent='Kunne ikke oppdatere oppgaven med din tilgang.';return}
  t.status=data?.task?.status||status;$('#taskDialog').close();renderAll();
}`);

const renderFormsRe=/function renderForms\(\)\{[^\n]*\}/;
if(!renderFormsRe.test(code))throw new Error('renderForms: function missing');
code=code.replace(renderFormsRe,`function renderForms(){const phaseFor={info_before_via:'VÍA',interest_referral:'VÍA',via_roadmap:'VÍA',individual_go_no_go:'VÍA',participant_agreement:'VÍA',pilot_go:'VÍA/SER',ser_daily:'SER',incident:'SER',vida_plan:'VIDA',pilot_evaluation:'VIDA'},participant=selectedParticipantId||ownParticipant()?.id||'';$('#formLibrary').innerHTML=formDefs.map((f,i)=>\`<a class="form-module" style="text-decoration:none;color:inherit" href="./form-runner.html?key=\${encodeURIComponent(f.key)}\${participant?'&participant='+encodeURIComponent(participant):''}"><span class="num">\${String(i).padStart(2,'0')}</span><h3>\${escapeHtml(f.title_no)}</h3><p>\${escapeHtml(f.scope==='staff'?'Arbeidsflate for navngitt rolle/ansvar.':f.scope==='participant_staff'?'Deltaker og ansvarlig medarbeider – etter tilgang.':'Deltakerrettet steg.')}</p><div class="meta"><span>\${escapeHtml(phaseFor[f.key]||'VÍA/SER/VIDA')}</span><span>Åpne →</span></div></a>\`).join('')}`);

code += '\n\n/* Operational extensions are maintained separately and concatenated at build time. */\n'+ops+'\n';
code += '\n\n/* UX/auth/mobile hardening is maintained separately and concatenated after operations. */\n'+ux+'\n';
code += '\n\n/* Role onboarding navigation is maintained separately. */\n'+onboarding+'\n';
code += '\n\n/* Mobile parity and navigation behavior are maintained separately. */\n'+mobile+'\n';
code += '\n\n/* Role-aware context drill-down / action resolver is concatenated last so it wraps the final task dialog behavior. */\n'+context+'\n';
code += '\n\n/* Participant-first presentation is concatenated after shared role-aware behavior. */\n'+participant+'\n';
code += '\n\n/* Participant next-action routing is last so shared staff gates cannot leak into the participant task dialog. */\n'+participantNext+'\n';
code += '\n\n/* Staff VÍA review handoff is final for staff tasks and is a no-op for participants. */\n'+viaHandoff+'\n';
code += '\n\n/* GO decision handoff is appended last so agreement, Pilot-GO and SER-start routing can refine shared task shortcuts. */\n'+goDecision+'\n';
code += '\n\n/* SER day-zero / normal-day and VIDA living-plan guidance is appended last and remains presentation-only. */\n'+serVida+'\n';
code += '\n\n/* Explicit staff SER→VIDA handoff uses the existing workflow command and preserves participant-only phase actions. */\n'+serVidaHandoff+'\n';
code += '\n\n/* Optional new VÍA remains an explicit staff-triggered new start point after VIDA, never an automatic fourth step. */\n'+vidaNewVia+'\n';
fs.writeFileSync(outPath,code,'utf8');
console.log(`Built ${path.relative(process.cwd(),outPath)} (${code.length} bytes)`);
