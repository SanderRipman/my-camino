import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const branding=read('./app-mfa-branding.js');
const build=read('./build-app.mjs');

assert(branding.includes("MFA_TOTP_ISSUER='AidMe'"),'TOTP issuer must be the stable AidMe service identity.');
assert(branding.includes("MFA_TOTP_FRIENDLY_NAME='AidMe VIDA'"),'TOTP factor friendly name must be AidMe VIDA.');
assert(branding.includes("factorType:'totp'")&&branding.includes('friendlyName:MFA_TOTP_FRIENDLY_NAME')&&branding.includes('issuer:MFA_TOTP_ISSUER'),'Enrollment must send issuer and friendlyName through the official Supabase MFA API.');
assert(branding.includes("current.replaceWith(replacement)")&&branding.includes("replacement.addEventListener('click',brandedStartMfaEnrollment)"),'Late branding layer must replace the core button listener so the branded enrollment handler is the one users actually invoke.');
assert(!/localhost|3000:/.test(branding),'MFA branding layer must not reintroduce localhost/port labels.');
assert(branding.includes('session?.user?.email'),'Authenticator setup must retain the signed-in account identity for multi-account QA clarity.');
assert(branding.includes('QA_ROLE_LABELS')&&branding.includes('qa_key'),'Synthetic QA enrollment UI must show the role next to the account when safe QA metadata is available.');
assert(branding.includes("id='authenticatorHelp'")||branding.includes("help.id='authenticatorHelp'"),'Security view must include concise authenticator setup help.');
assert(branding.includes('AidMe bruker standard TOTP')&&branding.includes('Google Authenticator')&&branding.includes('1Password'),'Help must explain that AidMe is not tied to Microsoft Authenticator.');
assert(branding.includes('PC / Mac')&&branding.includes('Microsoft Authenticator finnes ikke som PC- eller Mac-app'),'Help must not falsely offer a Microsoft desktop authenticator.');
assert(branding.includes('samme telefon')&&branding.includes('manuelle nøkkelen'),'Mobile enrollment help must explain the no-camera/manual-key path.');
assert(branding.includes('support.microsoft.com/nb-no/authenticator/download-microsoft-authenticator'),'Help must link to Microsoft’s official Norwegian Android/iOS download guidance.');
assert(!/role_grants|client\.from\(|service_role|SUPABASE_SECRET/i.test(branding),'MFA branding must remain presentation/enrollment metadata only and must not create a new authorization path.');
assert(build.includes("app-mfa-branding.js")&&build.includes("'+mfaBranding+'"),'Clean portal build must append the MFA branding layer.');

console.log('MFA branding invariants passed');
