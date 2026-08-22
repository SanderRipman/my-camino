import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const layer=read('./app-vida-new-via.js');
const build=read('./build-app.mjs');
const journey=read('./USER_JOURNEY.md');

assert(build.includes("app-vida-new-via.js")&&build.includes("'+vidaNewVia+'"),'Optional new VÍA layer must be included in deterministic portal build');
assert(layer.includes('if(!isStaff())return'),'Participant sessions must never receive the staff stage-transition control');
assert(layer.includes("p.stage!=='VIDA'")||layer.includes("p.stage==='VIDA'"),'New VÍA action must only be available from VIDA');
assert(layer.includes("client.functions.invoke('workflow-command'")&&layer.includes("action:'START_NEW_VIA'"),'Transition must use existing workflow command START_NEW_VIA');
assert(!layer.includes('client.from('),'Optional new VÍA layer must not add direct database writes');
assert(layer.includes('ikke et obligatorisk fjerde programsteg')&&layer.includes('aldri automatisk'),'UI must preserve the three-step public journey and optional nature of new VÍA');
assert(layer.includes('window.confirm'),'New VÍA stage transition must require an explicit staff confirmation');
assert(layer.includes('loadData()')&&layer.includes('renderAll()'),'Successful transition must reload canonical portal state');
assert(journey.includes('ny VÍA')&&journey.includes('ikke et obligatorisk fjerde steg'),'Implementation must remain aligned with the documented journey rule');

console.log('Optional new VÍA handoff invariants OK');
