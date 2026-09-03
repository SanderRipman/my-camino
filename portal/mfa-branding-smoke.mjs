import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const branding=read('./app-mfa-branding.js');
const build=read('./build-app.mjs');

assert(branding.includes("MFA_TOTP_ISSUER='AidMe'"),'TOTP issuer must be the stable AidMe service identity.');
assert(branding.includes("MFA_TOTP_FRIENDLY_NAME='AidMe'"),'TOTP factor friendly name must be AidMe.');
assert(branding.includes("factorType:'totp'")&&branding.includes('friendlyName:MFA_TOTP_FRIENDLY_NAME')&&branding.includes('issuer:MFA_TOTP_ISSUER'),'Enrollment must send issuer and friendlyName through the official Supabase MFA API.');
assert(!/localhost|3000:/.test(branding),'MFA branding layer must not reintroduce localhost/port labels.');
assert(branding.includes('session?.user?.email'),'Authenticator setup must retain the signed-in account identity for multi-account QA clarity.');
assert(branding.includes('QA_ROLE_LABELS')&&branding.includes('qa_key'),'Synthetic QA enrollment UI must show the role next to the account when safe QA metadata is available.');
assert(!/role_grants|client\.from\(|service_role|SUPABASE_SECRET/i.test(branding),'MFA branding must remain presentation/enrollment metadata only and must not create a new authorization path.');
assert(build.includes("app-mfa-branding.js")&&build.includes("'+mfaBranding+'"),'Clean portal build must append the MFA branding layer.');

console.log('MFA branding invariants passed');
