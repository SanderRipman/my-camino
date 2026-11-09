// Regression guard for the existing SER/VIDA source boundaries.
// Run: node portal/ser-vida-boundaries-smoke.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=(name)=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
const participant=read('./app-participant.js');
const serVida=read('./app-ser-vida.js');
const streamline=read('./form-streamline-provenance.js');
const journey=read('./END_TO_END_ROLE_JOURNEY.md');
assert.match(participant,/function participantFormKeys\(stage\)/,'Participant form access must be phase-specific');
assert.match(participant,/if\(s==='SER'\)return new Set\(\)/,'SER participants must not receive staff-only form keys');
assert.match(serVida,/primaryView:participantMode\?'checkin':null/,'Participant SER action must open self-check-in');
assert.match(serVida,/key=ser_daily/,'Staff SER action must retain operational log');
assert.match(streamline,/\.from\('ser_checkins'\)/,'Staff provenance may reference the existing check-in');
assert.match(streamline,/\.select\('checkin_date,rag'\)/,'Staff provenance must remain minimal');
assert.doesNotMatch(streamline,/\.select\([^\n]*participant_note/,'Do not copy participant private notes into staff provenance');
assert.match(journey,/VIDA-eier/,'Handoff must retain a named VIDA owner');
console.log('SER/VIDA role boundaries: PASS (static checks only; RLS/browser UAT still required)');
