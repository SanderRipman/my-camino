import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const access=read('./app-access-state.js');
const checkin=read('./app-participant-checkin-nav.js');
const security=read('./app-participant-security-stepup.js');
const swipe=read('./app-mobile-swipe-finalize.js');
const formAuth=read('./form-auth-continuity.js');
const bankid=read('./bankid-auth-test.js');
const attest=read('../ops/bankid-auth-preview/functions/bankid-auth-attestation/index.ts');
const errors=[];const must=(v,m)=>{if(!v)errors.push(m)};

must(access.includes('app-participant-checkin-nav.js?v=20260917a'),'stable participant check-in helper not loaded');
must(access.includes('app-participant-security-stepup.js?v=20260917a'),'participant security helper not loaded');
must(access.includes('app-mobile-swipe-finalize.js?v=20260917b'),'latest swipe finalizer cache key missing');

must(checkin.includes("item.classList.remove('hidden','nav-mobile-secondary','nav-ia-demoted')"),'participant Innsjekk must remain in stable primary navigation');
must(checkin.includes("const ser=phase()==='SER'"),'check-in write availability must stay SER-constrained');
must(checkin.includes("el.disabled=true;el.dataset.aidmePhaseDisabled='1'"),'non-SER check-in controls must fail closed');

must(swipe.includes('scroll-snap-stop:always'),'mobile top nav must stop on each primary item');
must(swipe.includes("behavior:'auto'"),'mobile view handoff must suppress smooth-scroll frame');
must(swipe.includes('aidme-swipe-committing'),'mobile handoff must suppress transition flash while canonical view switches');

must(security.includes('BankID er valgt som foretrukket metode for deltakere'),'participant BankID-first decision missing');
must(security.includes('BankID · testspor'),'unverified BankID must be labelled as test track');
must(security.includes('Bruk Authenticator'),'Authenticator fallback missing');
must(security.includes("a[href*=\"form-runner.html\"]"),'protected-form click boundary must route participant to security choice');
must(security.includes("el.remove()")&&security.includes('data-participant-action-view="security"'),'premature global security task must be removed');
must(formAuth.includes('Velg sikker bekreftelse'),'protected form blocked copy must be method-neutral');

must(bankid.includes("const DEMO_HOST='demo.aidme.no'"),'BankID test track must be available on demo');
must(bankid.includes('function isTestHost(){return isPreview()||isDemo()}'),'BankID test track must remain demo/preview only');
must(bankid.includes('isPreview()&&!inviteAttempted'),'preview-only invitations must not become available on demo');
must(attest.includes("const DEMO_ORIGIN = 'https://demo.aidme.no'"),'read-only attestation must permit demo origin');
must(attest.includes("authorizationEffect: 'NONE_RLS_AND_ROLE_SCOPE_UNCHANGED'"),'BankID attestation must not authorize');
must(!attest.includes("'https://my.aidme.no'"),'BankID test attestation must remain off production');

if(errors.length){console.error(errors.map(x=>'FAIL: '+x).join('\n'));process.exit(1)}
console.log('PRE_FLIGHT_20260917_SMOKE PASS');
