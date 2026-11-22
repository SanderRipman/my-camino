import fs from 'node:fs';
import {Script} from 'node:vm';
const root=new URL('./',import.meta.url);
const src=fs.readFileSync(new URL('app-via-staff-review-worklist.js',root),'utf8');
const build=fs.readFileSync(new URL('build-app.mjs',root),'utf8');
const test=(ok,why)=>{if(!ok)throw Error(why)};
new Script(src,{filename:'app-via-staff-review-worklist.js'});
test(build.includes("app-via-staff-review-worklist.js")&&build.includes("'+viaStaffReviewWorklist+'"),'Staff review UI must be in built app');
test(src.includes("t.assignee_user_id===session.user.id"),'Review must only show tasks assigned to signed-in staff');
test(src.includes("t.workflow_key==='via_go_review'"),'Only the submitted-roadmap review should appear');
test(src.includes("assurance.currentLevel!=='aal2'"),'Staff review summary must stay behind AAL2');
test(src.includes("hasRole('via_owner')")&&src.includes("hasRole('clinical_professional')"),'Must check competent staff role');
test(!/client\.from|client\.functions\.invoke|fetch\(/.test(src),'Task-native read-only UI must never perform extra data fetching or writes');
test(!/form_submissions|payload|ser_checkins/.test(src),'No sensitive form or checkin data used in summary');
const start=src.indexOf('const OPEN='),end=src.indexOf('function assureCard(){');
const env={
 session:{user:{id:'gmail'}},assurance:{currentLevel:'aal2'},
 tasks:[
  {id:'correct',workflow_key:'via_go_review',status:'OPEN',assignee_user_id:'gmail',due_at:'2026-11-30T10:00:00Z'},
  {id:'another',workflow_key:'via_go_review',status:'OPEN',assignee_user_id:'other'},
  {id:'old',workflow_key:'via_go_review',status:'DONE',assignee_user_id:'gmail'},
  {id:'not-review',workflow_key:'via_first_contact',status:'OPEN',assignee_user_id:'gmail'}
 ],
 Date,isStaff:()=>true,hasRole:(x)=>x==='via_owner',formatDate:()=> '30. nov.',
 participants:[{id:'mina',code_name:'Mina-UAT-01'}]
};
new Script(src.slice(start,end)+'\nthis.read=ownReviewTasks;', {filename:'isolated-staff-review.js'}).runInNewContext(env);
test(env.read().length===1&&env.read()[0].id==='correct','Only correct open and owned VÍA review should render');
env.assurance.currentLevel='aal1';
test(env.read().length===0,'AAL1 must render no VÍA reviews');
env.assurance.currentLevel='aal2';env.isStaff=()=>false;
test(env.read().length===0,'Participants must render no reviewer task');
env.isStaff=()=>true;env.hasRole=()=>false;
test(env.read().length===0,'Non-review staff must render no VÍA reviews');
console.log('VÍA staff-owned review visibility AAL2/scope/status regression: PASS');