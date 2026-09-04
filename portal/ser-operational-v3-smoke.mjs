import fs from 'node:fs';

const html=fs.readFileSync(new URL('./form-runner.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./form-ser-operational.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./form-runner.css',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('./form-command-client.js',import.meta.url),'utf8');
const pilotOps=fs.readFileSync(new URL('./pilot-ops.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260903183500_fix_pilot_rls_and_ser_daily_v3_operational_assignments.sql',import.meta.url),'utf8');

function expect(label,condition){if(!condition){console.error(`FAIL ${label}`);process.exitCode=1}else console.log(`PASS ${label}`)}

expect('runner loads current SER operational extension',html.includes('form-ser-operational.js?v=20260903b'));
expect('runner cache-busts SER form styles',html.includes('form-runner.css?v=20260903c'));
expect('staff selector uses scoped RPC',js.includes("client.rpc('eligible_ser_operational_staff'")&&js.includes("f.type==='staff_select'"));
expect('staff selector presents name and job title',js.includes("person.full_name")&&js.includes("person.job_title"));
expect('follow-up is explicit yes/no radio',js.includes("f.type==='yes_no'")&&js.includes('value="NO"')&&js.includes('value="YES"'));
expect('follow-up control is compact and styled',css.includes('.yes-no-field{border:0')&&css.includes('.yes-no-options')&&css.includes(':has(input:checked)'));
expect('duplicate operational roles trigger a non-blocking warning',js.includes('updateSerRoleOverlapWarning')&&js.includes('Samme medarbeider er valgt i flere operative roller')&&css.includes('.ser-role-overlap-warning'));
expect('auth refresh does not re-render form',js.includes('refreshFormSessionWithoutRerender')&&js.includes("if(!session)location.replace('./')"));
expect('pilot ops participant query matches live schema',pilotOps.includes("client.from('pilot_participants').select('pilot_id,participant_id,status,joined_at')")&&!pilotOps.includes("pilot_id,participant_id,status,joined_at,left_at"));
expect('pilot RLS recursion is broken by helpers',migration.includes('current_user_owns_pilot')&&migration.includes('can_read_pilot_participant'));
expect('participant/pilot relationship is server validated',migration.includes("pp.participant_id = p_participant")&&migration.includes("pp.pilot_id = p_pilot")&&migration.includes("pp.status = 'ACTIVE'"));
expect('operational staff selection is server validated',migration.includes('validate_ser_daily_operational_staff')&&migration.includes('SER_OPERATIONAL_STAFF_NOT_ELIGIBLE'));
expect('v3 stores user ids, not free text names',migration.includes('front_anchor_user_id')&&migration.includes('rear_anchor_user_id')&&migration.includes('rover_user_id'));
expect('friendly SER validation errors exist',client.includes('SER_OPERATIONAL_STAFF_NOT_ELIGIBLE')&&client.includes('SER_FOLLOWUP_SELECTION_INVALID'));

if(process.exitCode)process.exit(process.exitCode);
