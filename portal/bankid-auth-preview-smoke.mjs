import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8')}
function must(ok,msg){if(!ok)throw new Error(msg)}

const invite=read('ops/bankid-auth-preview/functions/admin-invite-user-preview/index.ts');
const attest=read('ops/bankid-auth-preview/functions/bankid-auth-attestation/index.ts');
const page=read('portal/bankid-auth-test.html');
const app=read('portal/bankid-auth-test.js');
const redirects=read('_redirects');
const all=`${invite}\n${attest}\n${page}\n${app}`.toLowerCase();

must(invite.includes('deploy-preview-\\d+--mycamino\\.netlify\\.app'),'preview invite must use strict Netlify Deploy Preview origin');
must(invite.includes("claims.aal !== 'aal2'"),'preview invite must preserve AAL2 gate');
must(invite.includes(".eq('role_code', 'system_admin')"),'preview invite must preserve system_admin gate');
must(invite.includes('`${origin}/portal/welcome.html`'),'preview invitation must land on same-origin portal onboarding');
must(invite.includes('TEST_ONLY_CONFIRMATION_REQUIRED'),'preview invite must require explicit test-only confirmation');
must(!invite.includes('https://my.aidme.no/welcome.html'),'preview invite must have no production redirect fallback');
must(invite.includes("action: 'USER_INVITED'"),'preview invite audit must use active action column');
must(invite.includes("resource_type: 'auth_user'"),'preview invite audit must use active resource_type column');
must(invite.includes('resource_id: invitedUserId'),'preview invite audit must use active resource_id column');
must(!/event_type\s*:|entity_type\s*:|entity_id\s*:/.test(invite),'preview invite must not use legacy audit column names');
must(invite.includes("runtimeKey('SUPABASE_PUBLISHABLE_KEYS')"),'preview invite must use active publishable key contract');
must(invite.includes("runtimeKey('SUPABASE_SECRET_KEYS')"),'preview invite must use active secret key contract');
must(!/SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY/.test(invite),'preview invite must not depend on legacy key env names');
must(invite.includes('auditPersisted: true'),'successful preview invite must report persisted audit');

must(attest.includes("const BANKID_PROVIDER = 'custom:bankid-preprod'"),'attestation must use isolated BankID preprod provider');
must(attest.includes("'urn:bankid:bid;LOA=4'"),'BankID High assurance mapping missing');
must(attest.includes("'urn:bankid:bis;LOA=3'"),'BankID biometric assurance mapping missing');
must(attest.includes("authorizationEffect: 'NONE_RLS_AND_ROLE_SCOPE_UNCHANGED'"),'BankID attestation must not authorize');
must(attest.includes('piiReturned: false'),'attestation must explicitly avoid identity payload return');
must(attest.includes("runtimeKey('SUPABASE_PUBLISHABLE_KEYS')"),'attestation must use active publishable key contract');
must(!/SUPABASE_SECRET_KEYS|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY/.test(attest),'read-only attestation must not require elevated or legacy keys');
must(attest.includes('getUserIdentities'),'attestation must read only the authenticated user identities');

must(app.includes("provider:BANKID_PROVIDER"),'BankID provider not wired');
must(app.includes('signInWithOAuth'),'BankID sign-in flow missing');
must(app.includes('linkIdentity'),'manual identity-linking flow missing');
must(app.includes("assurance.currentLevel!=='aal2'"),'staff identity linking must preserve AAL2 step-up');
must(app.includes("client.functions.invoke('admin-invite-user-preview'"),'preview-only invite function not wired');
must(app.includes("new URL('/portal/bankid-auth-test.html',location.origin)"),'auth return must remain same preview origin');
must(app.includes('RELOAD_AUTH_EVENTS'),'auth test must use an explicit relevant-event allowlist');
must(app.includes('loadFlight')&&app.includes('loadEpoch')&&app.includes('stale(epoch)'),'auth test must use single-flight and stale-state guards');
must(!app.includes('onAuthStateChange(()=>setTimeout(loadState,0))'),'broad auth-state full reload regression detected');
must(!/RELOAD_AUTH_EVENTS[^;]*TOKEN_REFRESHED/.test(app),'token refresh must not trigger full auth-test state reload');
must(app.includes('inviteAttempted=false')&&app.includes('function lockInviteAttempt()'),'preview invitation UI must lock after one server attempt');
must(app.includes("if(inviteAttempted){setMessage('#inviteMessage'"),'repeated invitation submit must fail closed in-page');
must(!app.includes("$('#inviteButton').disabled=false"),'preview invitation must not re-enable after a server attempt');
must(page.includes('Bruk eksisterende innlogging'),'Authenticator/email fallback must remain visible');

must(!/fødselsnummer|national[ _-]?identity|\bnnin\b/i.test(all),'test track must not collect or model national identity number');
must(redirects.trim()==='/* /index.html 200','unexpected root routing baseline: re-check onboarding path assumptions');
console.log('BANKID_AUTH_PREVIEW_SMOKE PASS');
