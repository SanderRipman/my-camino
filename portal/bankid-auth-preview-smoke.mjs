import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8')}
function must(ok,msg){if(!ok)throw new Error(msg)}

const invite=read('ops/bankid-auth-preview/functions/admin-invite-user-preview/index.ts');
const attest=read('ops/bankid-auth-preview/functions/bankid-auth-attestation/index.ts');
const page=read('portal/bankid-auth-test.html');
const app=read('portal/bankid-auth-test.js');
const participantStepup=read('portal/app-participant-security-stepup.js');
const redirects=read('_redirects');
const all=`${invite}\n${attest}\n${page}\n${app}\n${participantStepup}`.toLowerCase();

must(invite.includes('deploy-preview-\\d+--mycamino\\.netlify\\.app'),'preview invite must use strict Netlify Deploy Preview origin');
must(invite.includes("claims.aal !== 'aal2'"),'preview invite must preserve AAL2 gate');
must(invite.includes(".eq('role_code', 'system_admin')"),'preview invite must preserve system_admin gate');
must(invite.includes('`${origin}/portal/welcome.html`'),'preview invitation must land on same-origin portal onboarding');
must(invite.includes('TEST_ONLY_CONFIRMATION_REQUIRED'),'preview invite must require explicit test-only confirmation');
must(!invite.includes('https://my.aidme.no/welcome.html'),'preview invite must have no obsolete production redirect fallback');

must(attest.includes("const BANKID_PROVIDER = 'custom:bankid-preprod'"),'attestation must use isolated BankID preprod provider');
must(attest.includes("const DEMO_ORIGIN = 'https://demo.aidme.no'"),'read-only attestation must explicitly allow Early-UAT demo');
must(attest.includes('origin === DEMO_ORIGIN || PREVIEW_ORIGIN.test(origin)'),'attestation origin allowlist must remain demo/preview only');
must(!attest.includes("'https://my.aidme.no'"),'BankID test attestation must not be enabled on production');
must(attest.includes('body.testTrack !== true && body.previewTest !== true'),'attestation must require explicit test-track intent');
must(attest.includes("'urn:bankid:bid;LOA=4'"),'BankID High assurance mapping missing');
must(attest.includes("'urn:bankid:bis;LOA=3'"),'BankID biometric assurance mapping missing');
must(attest.includes("authorizationEffect: 'NONE_RLS_AND_ROLE_SCOPE_UNCHANGED'"),'BankID attestation must not authorize');
must(attest.includes('piiReturned: false'),'attestation must explicitly avoid identity payload return');
must(attest.includes('getUserIdentities'),'attestation must read only authenticated user identities');

must(app.includes("const DEMO_HOST='demo.aidme.no'"),'BankID test client must explicitly recognize demo host');
must(app.includes('function isTestHost(){return isPreview()||isDemo()}'),'BankID client must stay limited to demo/preview');
must(app.includes("provider:BANKID_PROVIDER"),'BankID provider not wired');
must(app.includes('signInWithOAuth'),'BankID sign-in flow missing');
must(app.includes('linkIdentity'),'manual identity-linking flow missing');
must(app.includes("assurance.currentLevel!=='aal2'"),'staff identity linking must preserve AAL2 step-up');
must(app.includes("client.functions.invoke('bankid-auth-attestation'"),'read-only BankID attestation not wired');
must(app.includes("body:{testTrack:true}"),'demo BankID track must explicitly identify itself to attestation');
must(app.includes('isPreview()&&!inviteAttempted'),'preview invitation must remain disabled on demo host');
must(page.includes('my.aidme.no: ikke mål'),'test page must clearly exclude production');
must(page.includes('BankID blir først en reell sikkerhetsgate'),'test page must not present unverified BankID as authorization');

must(participantStepup.includes('BankID er valgt som foretrukket metode for deltakere'),'participant security choice must reflect canonical BankID preference');
must(participantStepup.includes('BankID · testspor'),'unverified BankID must be labelled as test track, not a working production gate');
must(participantStepup.includes('Auth'), 'Authenticator fallback must remain available');

must(!/fødselsnummer|national[ _-]?identity|\bnnin\b/i.test(all),'test track must not collect or model national identity number');
must(redirects.trim()==='/* /index.html 200','unexpected root routing baseline: re-check onboarding path assumptions');
console.log('BANKID_DEMO_TEST_TRACK_SMOKE PASS');
