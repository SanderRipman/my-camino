import './preflight-20260917-smoke.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const mobile=read('app-mobile.js');
const role=read('app-role-home.js');
const access=read('app-access-state.js');
const roster=read('app-uat-superuser-roster.js');
const showcase=read('app-demo-showcase-polish.js');
const demoV2=read('app-demo-presentation-v2.js');
const overlay=read('app-demo-showcase-overlay.js');
const uatOverview=read('uat-overview.js');
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

ok(access.includes('app-uat-superuser-roster.js?v=20260924a'),'Explicit demo UAT roster layer must use the showcase cache key');
ok(access.includes('app-demo-showcase-polish.js?v=20260924a'),'Demo showcase polish layer is not loaded');
ok(!access.includes("hotfix.src='./app-demo-showcase-hotfix.js"),'Legacy competing showcase renderer must stay unloaded');
ok(access.includes('app-demo-presentation-v2.js?v=20260924c'),'Stable Demo 2027 presentation layer is not loaded');
ok(access.includes('app-demo-showcase-overlay.js?v=20260925c'),'P0-safe event-driven showcase overlay is not loaded');
ok(!access.includes("safeDemo.src='./app-demo-showcase-safe.js"),'Polling showcase layer must remain unloaded');
ok(!access.includes("finalDemo.src='./app-demo-final-stabilizer.js"),'P0 final stabilizer must remain disabled after loader freeze');
ok(access.includes('app-mobile-swipe-finalize.js?v=20260925a'),'Current mobile swipe finalizer cache key is not loaded');
ok(access.includes('app-intake-task-link.js?v=20260924b'),'Intake task routing layer must use the showcase cache key');

ok(roster.includes("assurance?.currentLevel==='aal2'")&&roster.includes("hasRole('system_admin')"),'UAT roster must require AAL2 + system_admin');
ok(roster.includes('synthetic_filter_enforced'),'Client must reject a UAT snapshot without server-side synthetic filtering proof');
ok(roster.includes("filter==='ARCHIVED'")&&roster.includes('p.active===false'),'Archived/inactive synthetic rows must remain explicitly testable');
ok(roster.includes("client.functions.invoke('uat-overview-command'"),'UAT roster must use the audited Edge Function');
ok(!roster.includes("client.from('participants')")&&!roster.includes('client.from("participants")'),'UAT roster must not bypass the Edge guard by querying participant rows directly');

for(const name of ['Ingrid Demo','Martin Demo','Eva Demo','Daniel Demo','Sofia Demo','Henrik Demo','Aisha Demo','Kari Demo','Thomas Demo'])ok(showcase.includes(name)||demoV2.includes(name)||overlay.includes(name)||uatOverview.includes(name),`Relatable demo alias missing: ${name}`);
ok(showcase.includes("h==='demo.aidme.no'")&&showcase.includes("hasRole('system_admin')"),'Showcase polish must remain demo-origin + system_admin scoped');
ok(showcase.includes("window.AidMeRoleLens?.demoSystemAdminAggregate?.()"),'Showcase polish must stay on the explicit aggregate superuser lens');
ok(showcase.includes('Fiktive, lagrede målepunkter for 8 demonstrasjonsdeltakere'),'Graph context must state that showcase measurements are synthetic stored demo data');
ok(!/client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(showcase),'Showcase polish must remain presentation-only');
ok(demoV2.includes("client.functions.invoke('uat-overview-command'")&&demoV2.includes("hasRole('system_admin')"),'Stable demo presentation must use audited UAT boundary + system_admin');
ok(overlay.includes("client.functions.invoke('uat-overview-command'")&&overlay.includes("hasRole('system_admin')"),'Overlay must use audited UAT boundary + system_admin');
ok(!/MutationObserver|setInterval\(|show\s*=\s*function/.test(overlay),'P0-safe overlay must not use perpetual observers/intervals or wrap show()');
ok(overlay.includes("a[href*=\"intake.html\"]")&&overlay.includes('demoOverlayInterest'),'Overlay must intercept the old intake shell with an in-portal synthetic interest view');
ok(overlay.includes('data-do-metric')&&overlay.includes('Kritiske / forfalte demooppgaver'),'Overview metrics must drill down to exact synthetic subsets');
ok(overlay.includes("nav-item[data-view=\"checkin\"]")&&overlay.includes("classList.remove('hidden','nav-mobile-secondary','nav-ia-demoted')"),'Overlay must keep Innsjekk in primary navigation');
ok(uatOverview.includes('DEMO_ALIASES')&&uatOverview.includes('displayName(p.code_name)'),'Full UAT overview must use human-readable Demo aliases while preserving technical codes');

ok(uatFn.includes('function syntheticName')&&uatFn.includes('safeParticipants=(participants??[]).filter'),'Server must enforce the synthetic participant filter before response');
ok(uatFn.includes('safeTasks=(tasks??[]).filter')&&uatFn.includes('outPilots=(pilots??[]).filter'),'Server must scope task/pilot output to synthetic participants');
ok(uatFn.includes('synthetic_filter_enforced:true')&&uatFn.includes('no_contact_data:true')&&uatFn.includes('no_health_data:true')&&uatFn.includes('no_documents:true'),'UAT snapshot guardrails must be explicit');
ok(uatFn.includes("(claims(token) as any).aal!=='aal2'")&&uatFn.includes(".eq('role_code','system_admin')"),'UAT snapshot must remain AAL2 + system_admin gated');

ok(intakeTask.includes("String(t.source_type||'').toLowerCase()==='intake'")&&intakeTask.includes("startsWith('intake_triage:')"),'Intake task detection missing');
ok(intakeTask.includes("./intake.html?intake=${encodeURIComponent(id)}"),'Intake task must deep-link to the authoritative intake record outside demo interception');
ok(intakeTask.includes('Navn, valgt kontaktkanal')&&intakeTask.includes('ikke i den generelle oppgavelisten'),'General task list must explain the identity/contact boundary');

ok(intakeHtml.includes('intake-contact-ux.js?v=20260916a'),'Intake contact guidance module is not loaded');
ok(intakeHtml.includes('intake-demo-showcase.js?v=20260924b'),'Demo intake plain-language layer is not loaded');
ok(intakeContact.includes("tel:${phone.replace(/\\s+/g,'')}")&&intakeContact.includes('mailto:${email}'),'Intake detail must expose phone/mail actions from stored contact data');
ok(intakeContact.includes('Foretrukket kontakt')&&intakeContact.includes('Kontakt er en triagehandling'),'Intake detail must explain contact preference and triage boundary');
ok(!intakeContact.includes('client.from(')&&!intakeContact.includes('.from(')&&!intakeContact.includes('functions.invoke'),'Contact UX layer must remain presentation-only');

ok(formHtml.includes('form-role-gate-guidance.js?v=20260916a'),'Role/gate explanation module is not loaded');
ok(gate.includes("['system_admin','project_owner']")&&gate.includes('gir ikke automatisk VÍA-faglig handlingsrett'),'System-admin/project-owner boundary explanation missing');
ok(gate.includes('VÍA-veikart → individuell GO/NO-GO → deltakeravtale og navngitt VIDA-eier → samlet Pilot-GO → siste SER-kontroll'),'VÍA→SER gate chain explanation missing');
ok(!gate.includes('client.')&&!gate.includes('.from(')&&!gate.includes('functions.invoke')&&!gate.includes('fetch('),'Role/gate guidance must remain presentation-only');

console.log('live coherence 2026-09-25 event-driven showcase smoke: OK');
