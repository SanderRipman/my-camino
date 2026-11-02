import fs from 'node:fs';
function read(p){return fs.readFileSync(new URL(p,import.meta.url),'utf8')}
function must(ok,msg){if(!ok)throw new Error(msg)}
const layer=read('./app-task-decision-context.js');
const build=read('./build-app.mjs');
const admin=read('./admin.html');
const nav=read('./navigation-ia.js');
const task=read('../supabase/functions/task-command/index.ts');

must(layer.includes('Beslutningsgrunnlag'),'Task dialog must expose decision basis');
must(layer.includes('taskDecisionNote'),'Task dialog must expose decision note input');
must(layer.includes("severity(task)==='RED'")&&layer.includes("['WAITING','DONE']"),'Critical task waiting/done must require note client-side');
must(layer.includes("action:'CONTEXT'"),'Task dialog must retrieve prior decision notes');
must(build.includes('app-task-decision-context.js')&&build.includes('+taskDecisionContext+'),'Decision context must be appended in deterministic build');
must(task.includes("action==='CONTEXT'"),'Task command must support authorized context read');
must(task.includes('DECISION_NOTE_REQUIRED'),'Task command must enforce critical note server-side');
must(task.includes('decision_note:note||null'),'Task command must persist note with status history');
must(admin.includes('data-navigation-persistent="admin"'),'Admin nav must opt into persistent core navigation');
must(nav.includes("page==='admin'&&nav.dataset.navigationPersistent==='admin'"),'Navigation IA must not collapse admin core menu');
console.log('Task decision context and admin navigation invariants OK');
