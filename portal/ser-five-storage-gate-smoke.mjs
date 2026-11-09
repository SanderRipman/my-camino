// Node-only static safety checks: no authentication or database writes.
// Run: node portal/ser-five-storage-gate-smoke.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('./ser-five-checkin-uat.html',import.meta.url),'utf8');
const runner=fs.readFileSync(new URL('./form-runner.js',import.meta.url),'utf8');
assert.match(html,/Ingen besvarelser lagres eller sendes/,'UAT must disclose no persistence');
assert.match(html,/const values=Array\(ITEMS.length\).fill\(null\)/,'Missing answers must remain null');
assert.match(html,/const complete=answered.length===5/,'Do not score partial responses');
assert.match(html,/ikke-validert/,'Illustrative score must be clearly labeled');
assert.match(html,/ingen automatisk sikkerhetsbeslutning|ingen automatisk sikkerhetsbeslutning/i,'No automated safety decision');
for(const key of ['agency','belonging','mood','energy','manageability']) assert.ok(html.includes("key:'"+key+"'"),'Missing SER5 item: '+key);
assert.doesNotMatch(html,/(?:\.from\(['"](?:ser_checkins|form_submissions)['"]\)|\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)/,'SER5 UAT must not send or persist answers');
assert.match(runner,/\.from\('form_submissions'\)\.insert\(row\)/,'Legacy versioned form persistence remains present');
assert.match(runner,/\.from\('form_submissions'\)\.update\(row\)/,'Legacy draft update remains present');
console.log('SER5 no-write / legacy form separation: PASS (static only; authenticated UAT not performed)');
