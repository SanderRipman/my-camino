// UAT safety contract: this validates the ACTIVE BUILT portal, not a demo-only overlay.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
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
// Synthetic behavior test of the exact compiled status handler: no real auth, API or data writes.
assert.match(build,/let taskStatusSaving=false;/);
assert.match(build,/if\(!t\|\|taskStatusSaving\)return;/);
assert.match(build,/actionButtons\.forEach\(button=>button\.disabled=true\)/);
assert.match(build,/actionButtons\.forEach\(button=>button\.disabled=false\)/);
const handler=built.match(/let taskStatusSaving=false;\nasync function updateTaskStatus\(status\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(handler,'Compiled SER status handler missing');
const noteField={value:'Faglig vurdering dokumentert',focused:false,focus(){this.focused=true}};
const buttons=Object.fromEntries(['#taskStart','#taskWait','#taskDone'].map(key=>[key,{disabled:false}]));
const message={textContent:''};
const dialog={busy:false,closed:0,setAttribute(key,value){if(key==='aria-busy')this.busy=value==='true'},removeAttribute(key){if(key==='aria-busy')this.busy=false},close(){this.closed++}};
const task={id:'synthetic-red-task',severity:'RED',status:'OPEN'};
let invocations=0,releaseWrite,renderCount=0;
const env={
  tasks:[task],selectedTaskId:task.id,document:{querySelector:sel=>sel==='#taskDecisionNote'?noteField:null},
  $:sel=>buttons[sel]??(sel==='#taskDialogMessage'?message:sel==='#taskDialog'?dialog:null),
  client:{functions:{invoke:async()=>{invocations++;return await new Promise(resolve=>{releaseWrite=resolve})}}},
  renderAll:()=>{renderCount++}
};
vm.createContext(env);
vm.runInContext(handler,env);
const first=env.updateTaskStatus('WAITING');
const duplicate=env.updateTaskStatus('DONE');
assert.equal(invocations,1,'Two rapid actions must start only one backend request');
assert.ok(Object.values(buttons).every(button=>button.disabled),'Actions disabled while pending');
assert.equal(dialog.busy,true,'Dialog should expose pending state');
releaseWrite({data:{task:{status:'WAITING'}}});
await Promise.all([first,duplicate]);
assert.equal(task.status,'WAITING');
assert.equal(dialog.closed,1);
assert.equal(renderCount,1);
assert.ok(Object.values(buttons).every(button=>!button.disabled),'Actions restored after success');
assert.equal(dialog.busy,false);
noteField.value='  ';
await env.updateTaskStatus('DONE');
assert.equal(invocations,1,'Missing RED note must fail before backend');
assert.match(message.textContent,/beslutningsmerknad/i);
noteField.value='Etterkontroll avtalt';
env.client.functions.invoke=async()=>{invocations++;return {error:new Error('synthetic unauthorized')}};
await env.updateTaskStatus('DONE');
assert.equal(invocations,2);
assert.equal(task.status,'WAITING','Failed backend response must not mark task done');
assert.equal(dialog.closed,1,'Failed operation must not close dialog');
assert.equal(dialog.busy,false);
assert.ok(Object.values(buttons).every(button=>!button.disabled),'Actions restored after failure');
assert.match(message.textContent,/Status ble ikke bekreftet/);

console.log('SER critical task decision-note + synthetic single-submit/failure behavior PASS; physical AAL2/mobile UAT still needed');
