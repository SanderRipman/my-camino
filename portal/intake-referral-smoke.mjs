import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const html=read('./intake.html');
const ext=read('./intake-referral.js');
const command=read('../supabase/functions/intake-command/index.ts');
const publicIntake=read('../supabase/functions/public-intake/index.ts');
const publicClient=read('../public-site/current/n1-intake-safe.js');

assert(html.includes('intake-referral.js'),'N2 must load the referral-safe extension');
assert(ext.includes('Henviser og deltaker er to forskjellige personer'),'N2 must explain the identity boundary');
assert(ext.includes("cmd('CONFIRM_REFERRAL'"),'N2 referral confirmation must use the authorised command');
assert(ext.includes('contactWillingnessConfirmed'),'Referral handoff must model the person’s own wish for direct contact');
assert(ext.includes('ikke deltakerens formelle programsamtykke'),'Staff referral confirmation must not be presented as formal participant consent');
assert(ext.includes('Opprett egen deltakerinteresse'),'Referral flow must create a separate participant interest');
assert(command.includes("action==='CONFIRM_REFERRAL'"),'Backend must support referral confirmation');
assert(command.includes('PARTICIPANT_CONTACT_WILLINGNESS_REQUIRED'),'Referral intake must require documented contact willingness before direct participant contact');
assert(command.includes("body?.contactWillingnessConfirmed===true||body?.consentConfirmed===true"),'Backend must accept the new semantic flag while preserving legacy rollout compatibility');
assert(command.includes('contact_willingness_attested_by_staff:true'),'Referral transition must audit staff attestation of contact willingness');
assert(command.includes('formal_participant_consent_recorded:false'),'Referral transition must explicitly preserve the later participant-owned formal-consent boundary');
assert(command.includes('REFERRAL_REQUIRES_PARTICIPANT_CONFIRMATION'),'Referral intake must not convert directly to VÍA');
assert(command.includes("source:'REFERRAL_CONFIRMED'"),'Confirmed referral must create a separate intake source');
assert(command.includes("interest_type:'PARTICIPANT'"),'Confirmed referral must become a participant-owned interest only after confirmation');
assert(command.includes('REFERRAL_CONFIRMED_TO_PARTICIPANT_INTEREST'),'Referral transition must be workflow-audited');
assert(command.includes('interest_type,preferred_contact,locale'),'N2 list must expose structured public-intake context');
assert(!command.includes("from('consent_events')")&&!command.includes("from(\"consent_events\")"),'Referral contact-willingness handoff must not write a formal participant consent event');
assert(publicIntake.includes("'REFERRAL'"),'Public intake must accept the referral contact type');
assert(publicClient.includes('Bruk dine egne kontaktopplysninger')||publicClient.includes('Use your own contact details'),'Public referral form must tell referrer to use own contact details');
assert(publicClient.includes('Ikke skriv navn, helseopplysninger eller andre private opplysninger'),'Public referral form must prohibit third-party sensitive details');
assert(!publicClient.includes("data.get('interest_note')")&&!publicIntake.includes('body?.interestNote'),'Public first contact must not submit open narrative input');
assert(publicClient.includes("textarea[name=\"interest_note\"]")&&publicClient.includes('?.remove()'),'Legacy narrative fields must be actively removed if an older template reintroduces one');

console.log('Referral identity/contact-willingness boundary invariants passed');
