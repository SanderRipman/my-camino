// UAT safety contract: this validates the ACTIVE BUILT portal, not a demo-only overlay.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const core=read('./app-core-broken.js'), built=read('./app.js'), html=read('./index.html');
const build=read('./build-app.mjs'), edge=read('../supabase/functions/task-command/index.ts');

assert.match(core,/taskReasonTitle=taskReason\?'Registrert oppgavegrunnlag':'Begrunnelse mangler'/);
assert.match(core,/criticalTask\?'<div class="task-critical-note"/);
assert.match(core,/id="taskDecisionNote"/);
assert.match(core,/maxlength="800"/);
assert.match(html,/id="taskWait"[^>]*type="button"|id="taskWait" type="button"/);
assert.match(core,/updateTaskStatus\('WAITING'\)/);
assert.match(build,/taskId:t\.id,status,note/);
assert.match(build,/data\?\.error==='DECISION_NOTE_REQUIRED'/);
assert.match(build,/\['WAITING','DONE'\]\.includes\(status\)&&note\.length<3/);
assert.match(edge,/String\(body\?\.note\?\?''\)/);
assert.match(edge,/String\(task\.severity\)==='RED'&&\['WAITING','DONE'\]\.includes\(nextStatus\)&&note\.length<3/);
assert.match(built,/id="taskDecisionNote"/,'Compiled portal must include the active note control');
assert.match(built,/taskId:t\.id,status,note/,'Compiled portal must actually forward note to AAL2 task-command');
assert.match(built,/data\?\.error==='DECISION_NOTE_REQUIRED'/);
assert.match(built,/updateTaskStatus\('WAITING'\)/);
assert.doesNotMatch(built,/from\('tasks'\)\.update\(\{status,updated_at:/,'No bypass direct SQL task status update in built runtime');
console.log('SER critical task decision-note: compiled UI/backend contract PASS; physical AAL2/mobile UAT still needed');
