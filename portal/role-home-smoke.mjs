import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const role=fs.readFileSync(path.join(dir,'app-role-home.js'),'utf8');
const access=fs.readFileSync(path.join(dir,'app-access-state.js'),'utf8');
const build=fs.readFileSync(path.join(dir,'build-app.mjs'),'utf8');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(role.includes("['project_owner','observer','evaluator']"),'Aggregate/project/evaluation lens roles missing');
ok(role.includes("['program_lead','via_owner','clinical_professional','ser_lead','vida_owner','logistics']"),'Operational role lens set missing');
ok(role.includes("tasks=(allTasks||[]).filter(t=>!t.participant_id)"),'Aggregate-only queue must exclude participant-linked tasks');
ok(role.includes(".nav-item[data-view=\"participants\"]")&&role.includes(".nav-item[data-view=\"checkin\"]"),'Aggregate navigation must suppress participant casework/check-in entry points');
ok(role.includes("role-home-hide-aggregate")&&role.includes("metric-grid"),'Aggregate home must hide participant-centric metric/pulse presentation');
ok(role.includes('72 timer')&&role.includes('14, 30 og 90 dager'),'VIDA owner lens must preserve one living follow-up arc');
ok(role.includes('Veikart, vurdering og GO/NO-GO er separate steg.'),'VÍA lens must preserve separate roadmap/assessment/decision semantics');
ok(!role.includes('client.')&&!role.includes('.from(')&&!role.includes('functions.invoke')&&!role.includes('fetch('),'Role-aware home must remain presentation-only with no backend access');
ok(access.includes('!!session&&!isStaff()&&!ownParticipant()'),'Revoked/expired sessions must require either an active staff grant or participant identity');
ok(access.includes('Tilgangen din er ikke aktiv')&&access.includes('Ingen deltaker- eller arbeidsdata åpnes'),'No-access state must be explicit and fail closed');
ok(access.includes("!['overview','help','security'].includes(name)"),'No-access state must block ordinary portal navigation');
ok(!access.includes('client.')&&!access.includes('.from(')&&!access.includes('functions.invoke')&&!access.includes('fetch('),'No-access presentation layer must not add backend access');
ok(build.includes("app-role-home.js")&&build.includes("+roleHome+'\\n'"),'Role-aware home module is not concatenated by the deterministic build');
ok(build.includes("app-access-state.js")&&build.includes("+accessState+'\\n'"),'Revoked-access fail-closed layer is not concatenated by the deterministic build');

console.log('role-aware home smoke: OK');
