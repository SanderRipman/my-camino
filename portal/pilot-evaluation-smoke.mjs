import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-pilot-evaluation.js');
const build=read('./build-app.mjs');
const runner=read('./form-runner.js');
const journey=read('./END_TO_END_ROLE_JOURNEY.md');

assert(build.includes("app-pilot-evaluation.js")&&build.includes("'+pilotEvaluation+'"),'Pilot evaluation entry must be in the deterministic production bundle');
assert(layer.includes("hasRole('project_owner')"),'Pilot evaluation write entry must stay on the current manage_program/project-owner UI path');
assert(layer.includes('key=pilot_evaluation&pilot='),'Evaluation entry must carry explicit pilot context and no participant context');
assert(layer.includes('Aggregert læring')&&layer.includes('ikke en ny deltakerport'),'Evaluation UX must be program learning, not a participant gate');
assert(layer.includes('view_aggregated')&&layer.includes('manage_program'),'UI must explain the current read/write role boundary');
assert(!layer.includes('client.from(')&&!layer.includes('functions.invoke('),'Evaluation entry layer must be presentation/navigation only');
assert(runner.includes("project_owner:['info_before_via','interest_referral','via_roadmap','participant_agreement','pilot_go','pilot_evaluation']"),'Existing form runner must keep pilot_evaluation available to project owner');
assert(!runner.includes("evaluator:['pilot_evaluation']")&&!runner.includes("observer:['pilot_evaluation']"),'Do not silently widen evaluator/observer write UI');
assert(journey.includes('| 11. Evaluering |')&&journey.includes('Aggregert læring → forbedring'),'Implementation must align with the documented evaluation journey');
assert(journey.includes('Observatør/evaluator har aggregert tilgang som standard'),'Evaluator/observer boundary must remain source-aligned');

console.log('Aggregated pilot evaluation entry invariants OK');
