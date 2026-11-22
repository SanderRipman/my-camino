import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('./'+name,import.meta.url),'utf8');
const source=read('app-participant-completion-clarity.js');
const build=read('build-app.mjs');
const nav=read('app-next-nav.js');
const ux=read('app-ux.js');
const participant=read('app-participant.js');
const portal=read('index.html');

assert(build.includes("const participantCompletionClarityPath=path.join(dir,'app-participant-completion-clarity.js')"));
assert(build.indexOf("'+accessState+'")<build.indexOf("'+participantCompletionClarity+'"),'Completion presentation must run after all earlier task/action wrappers');
assert(source.includes("task.status==='DONE'")&&source.includes('task.assignee_user_id===session?.user?.id'));
assert(source.includes("task.participant_id===self.id"),'Completed view must be scoped to the authenticated owner');
assert(source.includes("task.workflow_key==='participant_via_start'"),'Read-only CTA must not be offered on unrelated tasks');
assert(source.includes('?latest=1#my-via-roadmap'),'Read-only owner hash is required; do not regress to legacy participant query links');
assert(!/client\.from\(|client\.functions\.invoke\(|service_role|fetch\(/.test(source),'UX patch must not introduce DB/API writes or new access path');

function fixture(staff){
  const self={id:'mina'};
  const session={user:{id:'mina-user'}};
  const tasks=[];
  const body={innerHTML:''};
  const message={textContent:''};
  const header={textContent:''};
  const title={textContent:''};
  const hidden=()=>({classList:{add(){}},textContent:''});
  const dialog={open:true,querySelector:k=>({
    '#taskDialogTitle':title,
    '#taskDialogEyebrow':header,
    '#taskStart':hidden(),
    '#taskDone':hidden(),
    '#taskDialogMessage':message
  })[k]??null};
  const document={
    querySelector:k=>({'#taskDialog':dialog,'#taskDialogBody':body})[k]??null,
    createElement:()=>({id:'',textContent:''}),
    head:{appendChild(){}}
  };
  const factory=new Function('taskRow','openTask','renderParticipantDetail','renderAll','isStaff','ownParticipant','session','tasks','document','window','formatDate','escapeHtml',source+';return {taskRow,openTask,renderParticipantDetail,renderAll}');
  const app=factory(t=>'<button>BASE:'+t.title+'</button>',()=>{},()=>{},()=>{},()=>staff,()=>self,session,tasks,document,{aidmeParticipantViaAwaitingReview:()=>true},v=>String(v).slice(0,10),v=>String(v));
  return {app,tasks,body,header};
}
const mine={id:'my-task',participant_id:'mina',assignee_user_id:'mina-user',workflow_key:'participant_via_start',status:'DONE',title:'Min VÍA – start her',updated_at:'2026-11-22T16:16:10Z'};
const open={...mine,id:'new-task',status:'OPEN'};
let f=fixture(false);
f.tasks.push(mine);
assert.match(f.app.taskRow(mine),/✓ Utført/,'Done task must be green/completed, not a yellow Next step');
assert(!f.app.taskRow(mine).includes('Neste steg'));
assert.match(f.app.taskRow(open),/BASE:/,'Open workflow must keep existing task behavior');
f.app.openTask('my-task');
assert.match(f.body.innerHTML,/Oppgaven er utført/);
assert.match(f.body.innerHTML,/VÍA-ansvarlig følger opp/);
assert.match(f.body.innerHTML,/Se innsendt VÍA-veikart/);
assert.doesNotMatch(f.body.innerHTML,/Neste gate|Start mitt VÍA|Åpne individuell GO/);
assert.match(f.header.textContent,/Fullført/);
f=fixture(true);f.tasks.push(mine);
assert.match(f.app.taskRow(mine),/BASE:/,'Staff display is unchanged');
assert(!f.app.taskRow(mine).includes('✓ Utført'));
f=fixture(false);f.tasks.push({...mine,assignee_user_id:'another-user'});
assert.match(f.app.taskRow(f.tasks[0]),/BASE:/,'Do not reinterpret other users tasks as own completed history');

assert(nav.includes("if(typeof isStaff==='function'&&!isStaff())return;"),'Participant optional KPI may not be overwritten by staff participant counts');
assert(nav.includes("(typeof isStaff==='function'&&!isStaff())return;"),'Late staff count responses must not overwrite a participant KPI after a role switch');
assert(ux.includes("isStaff()?'participants':'forms'"),'Participant optional KPI must open forms, not their journey');
assert(source.includes('removeRedundantParticipantWorkflow(detail)'),'Redundant participant workflow card must be suppressed');
assert(source.includes('Veikart innsendt')&&source.includes('VÍA · avventer vurdering'),'Must explicitly distinguish submitted document from formal GO');
assert(participant.includes("if(participantViaAwaitingReview(p))return[]"),'Submitted VÍA cannot remain a required next action');
assert(portal.includes('data-task-filter="ALL"'),'Completed history must remain accessible through All tasks');

console.log('UAT 3L participant clarity: ownership, completed task, staff boundary, optional KPI, navigation and read-only link OK');