import fs from 'node:fs';

const html=fs.readFileSync(new URL('./kontakt.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('./contact-polish-20260902.js',import.meta.url),'utf8');
const intake=fs.readFileSync(new URL('./n1-intake-safe.js',import.meta.url),'utf8');
const ok=(v,m)=>{if(!v)throw new Error(m)};

ok(html.includes('spor=partner')&&html.includes('spor=deltaker'),'Both top cards must route to the unified form');
ok(html.includes('contact-polish-20260902.js?v=20260902a'),'Contact polish layer must be loaded');
ok(html.includes('id="direkte-kontakt"'),'Direct contact anchor missing');
ok(html.includes('tel:+4793040588'),'Direct phone missing');
ok(js.includes("raw==='PARTNER'?'PARTNER'"),'Partner preselection missing');
ok(js.includes("'Deltaker – for meg selv'")&&js.includes("'Partner / samarbeid'")&&js.includes("'Henviser – for en annen'"),'Short mobile enquiry labels missing');
ok(js.includes("bi('Send','Send')"),'Compact submit label missing');
ok(js.includes("href='#direkte-kontakt'"),'Direct-contact autoscroll missing');
ok(js.includes(".n1-interest-card>.eyebrow{display:none!important}"),'Redundant participant eyebrow must stay hidden');
ok(js.includes('Hva vil du vite mer om? (valgfritt)'),'Optional participant context missing');
ok(js.includes('Ingen helseopplysninger eller andre sensitive personopplysninger skal oppgis her.'),'Participant sensitive-data guidance missing');
ok(!js.includes('fetch(')&&!js.includes('supabase')&&!js.includes('client.from(')&&!js.includes('client.functions.invoke'),'Presentation layer must not create a new data path');
ok(!js.includes('MutationObserver'),'Contact polish must not reintroduce mobile observer loops');
ok(intake.includes("enabled: false"),'Fail-closed fallback must remain');
ok(!html.includes('data-netlify="true"'),'Netlify Forms must remain disabled');
console.log('Unified contact interest smoke: PASS');
