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
assert(ext.includes('consentConfirmed'),'Referral confirmation must require explicit participant willingness/consent');
assert(ext.includes('Opprett egen deltakerinteresse'),'Referral flow must create a separate participant interest');
assert(command.includes("action==='CONFIRM_REFERRAL'"),'Backend must support referral confirmation');
assert(command.includes('REFERRAL_REQUIRES_PARTICIPANT_CONFIRMATION'),'Referral intake must not convert directly to VÍA');
assert(command.includes("source:'REFERRAL_CONFIRMED'"),'Confirmed referral must create a separate intake source');
assert(command.includes("interest_type:'PARTICIPANT'"),'Confirmed referral must become a participant-owned interest only after confirmation');
assert(command.includes('REFERRAL_CONFIRMED_TO_PARTICIPANT_INTEREST'),'Referral transition must be workflow-audited');
assert(command.includes('interest_type,preferred_contact,locale'),'N2 list must expose structured public-intake context');
assert(publicIntake.includes("'REFERRAL'"),'Public intake must accept the referral contact type');
assert(publicClient.includes('Bruk dine egne kontaktopplysninger')||publicClient.includes('Use your own contact details'),'Public referral form must tell referrer to use own contact details');
assert(publicClient.includes('Ikke skriv navn, helseopplysninger eller andre private opplysninger'),'Public referral form must prohibit third-party sensitive details');
assert(!publicClient.includes('interest_note'),'Public first contact must not reintroduce open narrative input');

console.log('Referral identity-boundary invariants passed');
