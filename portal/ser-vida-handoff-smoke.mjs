import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-ser-vida-handoff.js');
const prep=read('./app-vida-transition-prep.js');
const formPrep=read('./form-vida-transition-prep.js');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260915165000_ser_to_vida_preparation_bridge.sql',import.meta.url),'utf8');
const ops=read('./app-ops.js');
const build=read('./build-app.mjs');
const runner=read('./form-runner.html');

assert(build.includes("app-ser-vida-handoff.js")&&build.includes("'+serVidaHandoff+'"),'SER→VIDA handoff layer must be included in deterministic portal build');
assert(!layer.includes("hasRole('project_owner')")&&layer.includes("hasRole('program_lead')")&&layer.includes("hasRole('ser_lead')"),'SER→VIDA control must stay hidden from project_owner and remain available only to operational transition roles');
assert(layer.includes("p.stage!=='SER'")||layer.includes("p.stage==='SER'"),'SER→VIDA action must be stage constrained');
assert(layer.includes("client.functions.invoke('workflow-command'")&&layer.includes("action:'START_VIDA'"),'Transition must use the existing workflow command and START_VIDA action');
assert(!layer.includes('client.from('),'Handoff layer must not add direct database writes');
assert(layer.includes('NAMED_VIDA_OWNER_REQUIRED')&&layer.includes('MFA_REQUIRED')&&layer.includes('FORBIDDEN'),'Known server-side transition gates must be surfaced safely');
assert(layer.includes('loadData()')&&layer.includes('renderAll()'),'Successful transition must reload participants/tasks before rendering');
assert(layer.includes('åpne SER-oppgave'),'Handoff copy must make the human transition explicit and avoid silently closing SER work');
assert(layer.includes('VIDA forberedes i siste del av SER')&&layer.includes('72-timersbroen'),'Handoff copy must separate late-SER VIDA preparation from the formal transition that starts follow-up clocks');
assert(layer.includes('Fullfør SER og aktiver VIDA'),'Formal transition control must say that SER is completed when VIDA is activated');
assert(layer.includes("document.querySelector('#participantDetail')")&&layer.includes('Neste handling'),'SER→VIDA must be surfaced in the participant next-action area rather than buried after journey/status cards');
assert(layer.includes("empty.textContent='Ingen andre åpne SER-oppgaver.'"),'Empty task copy must not contradict the explicit SER→VIDA next action');
assert(layer.includes('const serVidaHandoffRenderParticipants=renderParticipants')&&layer.includes('refreshSelectedParticipantAugmentations'),'Changing the selected participant must rerender SER/VIDA augmentations without waiting for renderAll');
assert(layer.includes("typeof renderSerVidaToday==='function'")&&layer.includes('renderSerVidaHandoff()'),'Participant selection must refresh both the phase card and explicit handoff');
assert(layer.includes('restoreParticipantDetailHost()')&&layer.includes("active.insertAdjacentElement('afterend',detail)"),'Mobile participant detail must move inline under the selected participant and be restored safely before list rerender');
assert(layer.includes('let participantInlineCollapsed=true')&&layer.includes('participant-inline-collapsed'),'Mobile participant list must load compact by default and support inline expand/collapse');
assert(layer.includes('#participantList{display:grid!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important'),'Mobile participant list must not clip an expanded participant detail to a fixed viewport region');
assert(layer.includes('participantRagText')&&layer.includes("YELLOW:'Gul'")&&layer.includes('localizeParticipantDetailRag'),'Expanded participant status must use Norwegian RAG labels without changing backend enum values');
assert(layer.includes('window.confirm'),'Stage transition must require an explicit staff confirmation click');
assert(ops.includes("p.stage==='SER'||p.stage==='VIDA'")&&!ops.includes("action='START_VIDA'")&&!ops.includes("action='START_NEW_VIA'"),'Generic ops layer must not render duplicate SER/VIDA transition controls');

assert(build.includes("app-vida-transition-prep.js")&&build.includes("'+vidaTransitionPrep+'"),'Late-SER VIDA preparation layer must be included in the deterministic portal build');
assert(prep.includes("hasRole('ser_lead')||hasRole('vida_owner')")&&prep.includes('Forbered VIDA før hjemkomst'),'Scoped SER/VIDA staff must get an explicit preparation entry without changing stage');
assert(prep.includes('Forbered mitt første VIDA-steg')&&prep.includes("String(p.stage||'').toUpperCase()!=='SER'"),'Participant preparation must be explicitly SER-only and optional');
assert(!prep.includes("START_VIDA")&&!prep.includes('client.from('),'Presentation layer must not advance stage or write directly to data tables');
assert(runner.includes('form-vida-transition-prep.js'),'Form runner must load the controlled transition-prep authorization/UI layer');
assert(formPrep.includes("if(stage==='SER')return new Set([PREP_KEY])"),'Participant form runner must expose only the transition-prep form while in SER');
assert(formPrep.includes("currentDef.key==='vida_plan'")&&formPrep.includes("stage!=='VIDA'"),'Form runner must block premature formal VIDA-plan context');
assert(formPrep.includes('latestSubmittedPrep')&&formPrep.includes('seedVidaPlanFromSerPrep'),'Formal VIDA plan may seed only from a submitted handoff after VIDA starts');
assert(migration.includes("'vida_transition_prep'")&&migration.includes("upper(p.stage::text)='SER'"),'Database RLS helper must constrain transition preparation to SER');
assert(migration.includes("when 'vida_plan' then")&&migration.includes("upper(p.stage::text)='VIDA'"),'Staff database authorization must constrain formal VIDA-plan writes to VIDA stage');
assert(migration.includes("'edit_ser'")&&migration.includes("'edit_vida'"),'Transition preparation must be limited to scoped SER or VIDA editing capabilities');

console.log('SER→VIDA handoff, optional late-SER VIDA preparation, timing guidance and least-privilege invariants OK');
