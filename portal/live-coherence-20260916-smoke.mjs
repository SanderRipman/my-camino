import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const mobile=read('app-mobile.js');
const role=read('app-role-home.js');
const access=read('app-access-state.js');
const roster=read('app-uat-superuser-roster.js');
const intakeTask=read('app-intake-task-link.js');
const intakeContact=read('intake-contact-ux.js');
const intakeHtml=read('intake.html');
const gate=read('form-role-gate-guidance.js');
const formHtml=read('form-runner.html');
const uatFn=fs.readFileSync(path.join(dir,'..','supabase','functions','uat-overview-command','index.ts'),'utf8');

function ok(condition,message){if(!condition)throw new Error(message)}

ok(mobile.includes("if(document.querySelector('#mainNav'))return;"),'Legacy shared swipe must not register on the main portal');
ok(mobile.includes('Shared swipe remains the standalone-page fallback'),'Swipe ownership intent must stay documented');

ok(role.includes('function demoSystemAdminAggregate()'),'Demo system-admin aggregate helper missing');
ok(role.includes("aggregate&&!demoAdmin"),'Ordinary aggregate roles must remain participant-nav restricted');
ok(role.includes("hasRole('system_admin')"),'Demo roster exception must require system_admin');
ok(role.includes("host==='demo.aidme.no'"),'Demo roster exception must be origin-scoped');

ok(access.includes('app-uat-superuser-roster.js?v=20260916a'),'Explicit demo UAT roster layer is not loaded');
ok(access.includes('app-intake-task-link.js?v=20260916a'),'Intake task routing layer is not loaded');

ok(roster.includes("assurance?.currentLevel==='aal2'")&&roster.includes("hasRole('system_admin')"),'UAT roster must require AAL2 + system_admin');
ok(roster.includes('synthetic_filter_enforced'),'Client must reject a UAT snapshot without server-side synthetic filtering proof');
ok(roster.includes("filter==='ARCHIVED'")&&roster.includes('p.active===false'),'Archived/inactive synthetic rows must remain explicitly testable');
ok(roster.includes("client.functions.invoke('uat-overview-command'"),'UAT roster must use the audited Edge Function');
ok(!roster.includes("client.from('participants')")&&!roster.includes('client.from("participants")'),'UAT roster must not bypass the Edge guard by querying participant rows directly');

ok(uatFn.includes('function syntheticName')&&uatFn.includes('safeParticipants=(participants??[]).filter'),'Server must enforce the synthetic participant filter before response');
ok(uatFn.includes('safeTasks=(tasks??[]).filter')&&uatFn.includes('outPilots=(pilots??[]).filter'),'Server must scope task/pilot output to synthetic participants');
ok(uatFn.includes('synthetic_filter_enforced:true')&&uatFn.includes('no_contact_data:true')&&uatFn.includes('no_health_data:true')&&uatFn.includes('no_documents:true'),'UAT snapshot guardrails must be explicit');
ok(uatFn.includes("(claims(token) as any).aal!=='aal2'")&&uatFn.includes(".eq('role_code','system_admin')"),'UAT snapshot must remain AAL2 + system_admin gated');

ok(intakeTask.includes("String(t.source_type||'').toLowerCase()==='intake'")&&intakeTask.includes("startsWith('intake_triage:')"),'Intake task detection missing');
ok(intakeTask.includes("./intake.html?intake=${encodeURIComponent(id)}"),'Intake task must deep-link to the authoritative intake record');
ok(intakeTask.includes('Navn, valgt kontaktkanal')&&intakeTask.includes('ikke i den generelle oppgavelisten'),'General task list must explain the identity/contact boundary');

ok(intakeHtml.includes('intake-contact-ux.js?v=20260916a'),'Intake contact guidance module is not loaded');
ok(intakeContact.includes("tel:${phone.replace(/\\s+/g,'')}")&&intakeContact.includes('mailto:${email}'),'Intake detail must expose phone/mail actions from stored contact data');
ok(intakeContact.includes('Foretrukket kontakt')&&intakeContact.includes('Kontakt er en triagehandling'),'Intake detail must explain contact preference and triage boundary');
ok(!intakeContact.includes('client.from(')&&!intakeContact.includes('functions.invoke'),'Contact UX layer must remain presentation-only');

ok(formHtml.includes('form-role-gate-guidance.js?v=20260916a'),'Role/gate explanation module is not loaded');
ok(gate.includes("['system_admin','project_owner']")&&gate.includes('gir ikke automatisk VÍA-faglig handlingsrett'),'System-admin/project-owner boundary explanation missing');
ok(gate.includes('VÍA-veikart → individuell GO/NO-GO → deltakeravtale og navngitt VIDA-eier → samlet Pilot-GO → siste SER-kontroll'),'VÍA→SER gate chain explanation missing');
ok(!gate.includes('client.')&&!gate.includes('.from(')&&!gate.includes('functions.invoke')&&!gate.includes('fetch('),'Role/gate guidance must remain presentation-only');

console.log('live coherence 2026-09-16 smoke: OK');
