import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-ser-vida-handoff.js');
const build=read('./build-app.mjs');

assert(build.includes("app-ser-vida-handoff.js")&&build.includes("'+serVidaHandoff+'"),'SER→VIDA handoff layer must be included in deterministic portal build');
assert(layer.includes('if(!isStaff())return'),'Participant sessions must never receive the staff phase-transition control');
assert(layer.includes("p.stage!=='SER'")||layer.includes("p.stage==='SER'"),'SER→VIDA action must be stage constrained');
assert(layer.includes("client.functions.invoke('workflow-command'")&&layer.includes("action:'START_VIDA'"),'Transition must use the existing workflow command and START_VIDA action');
assert(!layer.includes('client.from('),'Handoff layer must not add direct database writes');
assert(layer.includes('NAMED_VIDA_OWNER_REQUIRED')&&layer.includes('MFA_REQUIRED')&&layer.includes('FORBIDDEN'),'Known server-side transition gates must be surfaced safely');
assert(layer.includes('loadData()')&&layer.includes('renderAll()'),'Successful transition must reload participants/tasks before rendering');
assert(layer.includes('ikke automatisk')&&layer.includes('åpne SER-oppgave'),'Handoff copy must make the human transition explicit and avoid silently closing SER work');
assert(layer.includes('window.confirm'),'Stage transition must require an explicit staff confirmation click');

console.log('SER→VIDA explicit staff handoff invariants OK');
