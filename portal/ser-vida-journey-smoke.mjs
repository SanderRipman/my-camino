import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-ser-vida.js');
const build=read('./build-app.mjs');
const participant=read('./app-participant.js');
const participantNext=read('./app-participant-next.js');

assert(build.includes("app-ser-vida.js")&&build.includes("'+serVida+'"),'SER/VIDA layer must be included in deterministic portal build');
assert(layer.includes("phase==='SER'")&&layer.includes("phase==='VIDA'"),'Layer must handle SER and VIDA explicitly');
assert(layer.includes('Første SER-dag')||layer.includes('første dag'),'SER day-zero must be a first-class participant state');
assert(layer.includes('Pause, kortere etappe, transport')||layer.includes('pause, kortere etappe, transport'),'SER must preserve legitimate adaptation language');
assert(layer.includes('Én levende plan')&&layer.includes('parallelle planer'),'VIDA must be framed as one living plan, not duplicate plans');
assert(layer.includes('ser_daily')&&layer.includes('vida_plan'),'Participant actions must route only to canonical SER/VIDA forms');
assert(!layer.includes('client.from(')&&!layer.includes('functions.invoke('),'SER/VIDA presentation layer must not add backend writes or bypass commands');
assert(participant.includes("new Set(['ser_daily'])"),'Participant SER form scope must remain limited to ser_daily');
assert(participant.includes("new Set(['vida_plan'])"),'Participant VIDA form scope must remain limited to vida_plan');
assert(participantNext.includes("key=ser_daily")&&participantNext.includes("key=vida_plan"),'Existing canonical phase routing must remain present');

console.log('SER day-zero / normal-day and VIDA living-plan invariants OK');
