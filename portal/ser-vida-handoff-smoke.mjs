import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-ser-vida-handoff.js');
const ops=read('./app-ops.js');
const build=read('./build-app.mjs');

assert(build.includes("app-ser-vida-handoff.js")&&build.includes("'+serVidaHandoff+'"),'SER→VIDA handoff layer must be included in deterministic portal build');
assert(!layer.includes("hasRole('project_owner')")&&layer.includes("hasRole('program_lead')")&&layer.includes("hasRole('ser_lead')"),'SER→VIDA control must stay hidden from project_owner and remain available only to operational transition roles');
assert(layer.includes("p.stage!=='SER'")||layer.includes("p.stage==='SER'"),'SER→VIDA action must be stage constrained');
assert(layer.includes("client.functions.invoke('workflow-command'")&&layer.includes("action:'START_VIDA'"),'Transition must use the existing workflow command and START_VIDA action');
assert(!layer.includes('client.from('),'Handoff layer must not add direct database writes');
assert(layer.includes('NAMED_VIDA_OWNER_REQUIRED')&&layer.includes('MFA_REQUIRED')&&layer.includes('FORBIDDEN'),'Known server-side transition gates must be surfaced safely');
assert(layer.includes('loadData()')&&layer.includes('renderAll()'),'Successful transition must reload participants/tasks before rendering');
assert(layer.includes('ikke automatisk')&&layer.includes('åpne SER-oppgave'),'Handoff copy must make the human transition explicit and avoid silently closing SER work');
assert(layer.includes("document.querySelector('#participantDetail')")&&layer.includes('Neste handling'),'SER→VIDA must be surfaced in the participant next-action area rather than buried after journey/status cards');
assert(layer.includes("empty.textContent='Ingen andre åpne SER-oppgaver.'"),'Empty task copy must not contradict the explicit SER→VIDA next action');
assert(layer.includes('const serVidaHandoffRenderParticipants=renderParticipants')&&layer.includes('refreshSelectedParticipantAugmentations'),'Changing the selected participant must rerender SER/VIDA augmentations without waiting for renderAll');
assert(layer.includes("typeof renderSerVidaToday==='function'")&&layer.includes('renderSerVidaHandoff()'),'Participant selection must refresh both the phase card and explicit handoff');
assert(layer.includes('restoreParticipantDetailHost()')&&layer.includes("active.insertAdjacentElement('afterend',detail)"),'Mobile participant detail must move inline under the selected participant and be restored safely before list rerender');
assert(layer.includes('participantInlineCollapsed')&&layer.includes('participant-inline-collapsed'),'Selected participant must support inline expand/collapse on mobile');
assert(layer.includes('window.confirm'),'Stage transition must require an explicit staff confirmation click');
assert(ops.includes("p.stage==='SER'||p.stage==='VIDA'")&&!ops.includes("action='START_VIDA'")&&!ops.includes("action='START_NEW_VIA'"),'Generic ops layer must not render duplicate SER/VIDA transition controls');

console.log('SER→VIDA explicit staff handoff, selection lifecycle, inline participant detail and least-privilege invariants OK');
