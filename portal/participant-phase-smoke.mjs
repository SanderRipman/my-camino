import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const build=read('./build-app.mjs');
const phase=read('./app-participant-phase.js');
const errors=[];
const must=(ok,msg)=>{if(!ok)errors.push(msg)};
must(build.includes("app-participant-phase.js"),'participant phase module is not bundled');
must(build.includes("'+participantPhase+'"),'participant phase module is not appended to bundle');
must(phase.includes("const PHASES=['VÍA','SER','VIDA','ny VÍA']"),'canonical phases missing');
must(phase.includes("if(!staff()||aggregateOnly())return"),'participant filter must be staff-only and disabled for aggregate-only lens');
must(phase.includes("participantPhaseFilter='ALL'"),'default participant filter must be ALL');
must(phase.includes("data-participant-phase"),'phase filter controls missing');
must(phase.includes("data-participant-phase-hidden"),'phase filtering marker missing');
must(phase.includes('aidme-participant-phase-pill'),'single participant phase badge missing');
must(phase.includes('grid-column:3')&&phase.includes('grid-row:2'),'phase badge must remain right-aligned below status');
must(phase.includes("participants")&&phase.includes("selectedParticipantId"),'filter must operate on already-loaded participant set');
must(!phase.includes('uat-')&&!phase.includes('Early-UAT'),'promoted phase UI still carries UAT-only naming');
if(errors.length){console.error(errors.map(x=>'FAIL: '+x).join('\n'));process.exit(1)}
console.log('Participant phase filter/badge smoke: PASS');
