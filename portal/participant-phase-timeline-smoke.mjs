import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(new URL('./'+name,import.meta.url),'utf8');
const timeline=read('app-participant-phase-timeline.js');
const bridge=read('app-form-workflow-bridge.js');
const build=read('build-app.mjs');
const participant=read('app-participant.js');
const css=read('participant-phase-timeline.css');
const badge=read('app-nav-badges.js');
const completion=read('app-participant-completion-clarity.js');
const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
assert(build.includes("app-participant-phase-timeline.js")&&build.indexOf("'+participantPhaseTimeline+'")>build.indexOf("'+participantCompletionClarity+'"),'Timeline must run after existing completion presentation');
assert(build.includes("replaceOnce('participant task ownership'"),'Core participant list must only include assigned tasks');
assert(bridge.includes('if(!isStaff())return;'),'Late async workflow bridge must stop in the actual producer for participants');
assert(bridge.includes("document.querySelectorAll('[data-participant-form-bridge]').forEach(el=>el.remove())"),'Remove previously inserted workflow card before staff gate');
assert(participant.includes("t.assignee_user_id===session?.user?.id"),'Participant next actions must not include staff tasks');
assert(badge.includes("t.assignee_user_id===uid&&(!t.participant_id"),'Navigation badges must not count staff-owned tasks');
assert(participant.includes("f.key!=='info_before_via'"),'Optional info must not use the legacy participant-targeted query URL');
assert(timeline.includes("form-runner.html?latest=1#my-via-roadmap"),'Submitted roadmap must retain read-only owner hash');
assert(completion.includes("task.workflow_key==='participant_via_start'"),'Completed task dialog still enforces exact workflow');
assert(!/client\.from\(|client\.functions\.invoke\(|fetch\(|service_role/.test(timeline),'Timeline UI must never access database independently');
assert(css.includes('.participant-milestone')&&css.includes('.participant-phase-hidden{display:none!important}'));

function fixture(staff=false,stage='VIA'){
 const self={id:'mina',stage};
 const session={user:{id:'mina-user'}};
 const ownTask={id:'own-done',participant_id:'mina',assignee_user_id:'mina-user',workflow_key:'participant_via_start',status:'DONE',title:'Min VÍA – start her',description:'Veikart',updated_at:'2026-11-22T16:16:10Z'};
 const staffTask={...ownTask,id:'staff-review',assignee_user_id:'staff',workflow_key:'via_go_review',status:'OPEN',title:'Staff gate'};
 const tasks=[ownTask,staffTask];
 const events={};
 const shown=[];
 const document={
  querySelector(){return null},
  querySelectorAll(){return []},
  createElement(){return {dataset:{},classList:{add(){},remove(){}},setAttribute(){}}},
  addEventListener(name,fn){events[name]=fn},
  head:{appendChild(){}}
 };
 const window={aidmeParticipantViaAwaitingReview:()=>true};
 const env={
  document,window,tasks,session,formDefs:[{key:'info_before_via',scope:'participant'}],
  isStaff:()=>staff,ownParticipant:()=>self,escapeHtml:escape,
  processMarkup:()=>'<div>STAFF PROCESS</div>',taskRow:t=>'<span>STAFF '+escape(t.title)+'</span>',
  renderTaskLists:()=>{},renderParticipantDetail:()=>{},renderAll:()=>{},
  show:name=>shown.push(name),taskFilter:'OPEN',formatDate:()=> '22. nov.'
 };
 vm.runInNewContext(timeline,env,{timeout:1500});
 return {env,events,shown,self,ownTask,staffTask};
}
let f=fixture();
let rendered=f.env.processMarkup(0);
assert.match(rendered,/data-participant-phase="0"/);
assert.match(rendered,/is-current/);
assert.match(rendered,/✓ 1 utført/);
assert.match(rendered,/data-participant-phase="1"/);
assert.match(rendered,/is-future/,'SER must not be made active just because the roadmap was submitted');
assert.match(f.env.taskRow(f.ownTask),/✓ Utført/);
assert.match(f.env.taskRow(f.ownTask),/participant-phase-pill">VÍA/);
assert.doesNotMatch(f.env.taskRow(f.ownTask),/Neste steg|Frist /);
assert.equal(f.env.taskRow(f.staffTask),'','Staff task cannot appear as a participant action');
assert.equal(f.env.window.AidMeParticipantTimelineUat.voluntaryInfoAvailable(f.self),true,'Info resource remains available after submission');
f.env.renderAll();
assert.equal(f.env.taskFilter,'ALL','Participant task history defaults to All');
function phaseClick(fixture,index,source='participants'){
 const phase={dataset:{participantPhase:String(index)},closest(selector){return selector==='#view-overview'&&source==='overview'?{}:null}};
 fixture.events.click({target:{closest(selector){return selector==='.participant-phase-step[data-participant-phase]'?phase:null}},preventDefault(){}});
}
phaseClick(f,1,'participants');
assert.deepEqual(f.shown,[],'Future phase must not route into a locked task or form');
phaseClick(f,0,'overview');
assert.equal(f.shown.at(-1),'tasks');
assert.equal(f.env.window.AidMeParticipantTimelineUat.selectedPhase,0);
assert.equal(f.env.taskFilter,'ALL');
f=fixture(true);
assert.match(f.env.processMarkup(0),/STAFF PROCESS/,'Staff phase UI unchanged');
assert.match(f.env.taskRow(f.ownTask),/STAFF Min VÍA/,'Staff task rendering unchanged');
f=fixture(false,'SER');
assert.match(f.env.processMarkup(1),/is-past/,'Past VÍA stays visible after formal phase progression');
assert.equal(f.env.window.AidMeParticipantTimelineUat.voluntaryInfoAvailable(f.self),false,'VÍA optional resource is not a new SER task');
f=fixture(false,'NEW_VIA');
assert.match(f.env.processMarkup(3),/is-current/,'New VÍA becomes available only on explicit NEW_VIA stage');
console.log('UAT 3M phase timeline regression PASS: DONE/OPEN, staff isolation, locked phase, All history, optional info and routing');