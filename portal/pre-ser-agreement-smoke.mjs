import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const migration=read('../supabase/migrations/20260822032000_participant_agreement_readiness_v2.sql');
const guard=read('./form-runner-guard.js');
const review=read('./form-review.js');
const decision=read('./app-go-decision.js');

for(const key of [
  'voluntary_participation','peer_privacy','leader_safety_authority',
  'emergency_contact_ready','vida_owner_known','routine_sharing_boundary',
  'yellow_sharing_boundary','red_emergency_understood','media_consent_separate'
]) assert(migration.includes(`'${key}'`),`Agreement v2 missing active-template field: ${key}`);

assert(migration.includes("version=2")&&migration.includes("'participant_program_agreement',2"),'Program agreement must be explicitly versioned to v2');
assert(migration.includes("'pilot_evaluation_optional',1"),'Optional evaluation must have a separate consent purpose');
assert(migration.includes("case when eval_choice then 'GRANTED' else 'DECLINED' end"),'Optional evaluation choice must be recorded independently');
assert(migration.includes('Foto/media')||migration.includes('foto/media'),'Program agreement must keep media consent separate');
assert(migration.includes('Dette er ikke en ny helse- eller risikokartlegging'),'Participant agreement must not become a second health journal');

assert(guard.includes('Denne bekreftelsen er påkrevd.')&&guard.includes('validateGroups()'),'Required agreement confirmations must be blocked in the UI before submit');
assert(decision.includes('Se fullført avtale / beredskap'),'Staff agreement-review task must open the submitted evidence before Pilot-GO');
assert(decision.includes("key=participant_agreement")&&decision.includes('latest=1'),'Staff review must open the latest read-only agreement submission');
assert(review.includes("key==='participant_agreement'"),'Participant submission must have an explicit agreement handoff');
assert(review.includes('dette betyr ikke at SER har startet'),'Participant must be told agreement completion is not SER start');
assert(review.includes('Neste formelle beslutningspunkt:')&&review.includes('samlet Pilot-GO'),'Staff read-only review must explain the next formal decision point');

console.log('Pre-SER agreement/readiness v2 invariants OK');
