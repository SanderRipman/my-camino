import fs from 'node:fs';

const src=fs.readFileSync(new URL('./form-streamline-provenance.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('./form-qna-guidance.js',import.meta.url),'utf8');
const must=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: missing ${needle}`)};

must(loader,'form-streamline-provenance.js?v=20260902b','streamline loader');
must(src,".from('ser_checkins')",'existing participant self-report source');
must(src,".select('checkin_date,rag')",'minimal read-only check-in projection');
must(src,"key==='ser_daily'",'staff daily-log boundary');
must(src,"key==='incident'",'incident-only lane');
must(src,"key==='vida_plan'",'VIDA handoff lane');
must(src,"key==='pilot_evaluation'",'aggregated evaluation lane');
must(src,"streamlineHasRole('vida_owner')",'VIDA owner/partner perspective');
must(src,'Dette er et signal – ikke tekst som skal kopieres inn i teamloggen.','no duplicate participant narrative');
must(src,'Vanlig slitenhet eller en legitim pause er ikke automatisk et avvik.','normal adaptation boundary');
must(src,'Rå SER-notater, hendelsesdetaljer og private refleksjoner skal ikke kopieres','partner minimization boundary');
must(src,'participant-context-compact','participant compact context');
must(src,'Skjemakontekst','participant static context label');
must(src,"if(typeof isStaff==='function'&&isStaff())",'staff keeps full context controls');
must(src,"controls.querySelectorAll(':scope > label,:scope > .form-version')",'participant-only selector presentation toggle');
if(src.includes('participant_note'))throw new Error('streamline layer must not fetch participant free-text');
if(/\.(insert|update|upsert|delete)\s*\(/.test(src))throw new Error('streamline layer must remain read-only');
console.log('SER/VIDA and participant form-context streamline invariants passed.');
