import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

const runner=read('./form-runner.js');
const runnerHtml=read('./form-runner.html');
const taskFast=read('./form-runner-task-fastpath.js');
const intake=read('./intake.html');
const mobile=read('./app-mobile.js');
const nav=read('./navigation-ia.js');

must(runner.includes('let initPromise=null,initSeq=0'),'form runner must single-flight initialization');
must(runner.includes("FORM_REINIT_EVENTS=new Set(['SIGNED_IN','USER_UPDATED','MFA_CHALLENGE_VERIFIED'])"),'form runner auth reinit events must be explicit');
must(runner.includes('if(initPromise)return initPromise'),'form runner must reuse active initialization');
must(runner.includes('if(seq!==initSeq)return'),'form runner must reject stale async initialization state');
must(!runner.includes('onAuthStateChange(()=>setTimeout(init,0))'),'form runner must not reinitialize for every auth event');
must(!runner.includes("FORM_REINIT_EVENTS=new Set(['TOKEN_REFRESHED'"),'token refresh must not trigger full form reload');
must(!runner.includes("FORM_REINIT_EVENTS=new Set(['INITIAL_SESSION'"),'initial session event must not duplicate explicit init');

must(runnerHtml.includes('form-runner-task-fastpath.js?v=20260907b'),'targeted task form routes must load the current bounded bootstrap');
must(taskFast.includes("client.functions.invoke('case-command'"),'staff targeted task bootstrap must use server-side participant context instead of broad participant reads');
must(taskFast.includes("action:'LIST_CONTEXT'"),'staff targeted task bootstrap must resolve the exact requested participant context');
must(taskFast.includes('const preflightGrants=gRes.data||[]')&&taskFast.includes('if(!preflightGrants.some(active))'),'targeted bootstrap must distinguish real participant sessions before invoking staff-only LIST_CONTEXT');
must(taskFast.indexOf('if(!preflightGrants.some(active))')<taskFast.indexOf('const seq=++initSeq;initPromise=null'),'participant RLS bootstrap must remain alive; broad init may only be invalidated after staff scope is proven');
must(taskFast.includes('if(!initPromise)await init()'),'participant route must fall back to the ordinary caller-RLS form bootstrap');
must(taskFast.includes('FORM_TASK_BOOTSTRAP_TIMEOUT')&&taskFast.includes('showFailure'),'targeted task bootstrap must fail visibly instead of leaving a blank page');

for(const html of [runnerHtml,intake]){
  for(const label of ['Oversikt','Deltakere','Oppgaver','Innsjekk','Interesse / VÍA'])must(html.includes(`<b>${label}</b>`),`standalone first paint missing ${label}`);
  must(html.includes('app-mobile.js?v=20260906b'),'standalone must cache-bust current mobile shell');
}
must(runnerHtml.includes('form-runner.js?v=20260906c'),'form runner must keep stabilized base runtime');
must(runnerHtml.includes('standalone-chrome.js?v=20260906b')&&intake.includes('standalone-chrome.js?v=20260906b'),'standalone chrome must be cache-busted');

must(nav.includes("NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v6'"),'navigation snapshot must invalidate pre-final ordering');
must(nav.includes("const primaryOrder=['overview','participants','tasks','checkin','#intakeNav'"),'final primary ordering must prioritize daily work before Interest/VÍA');
must(mobile.includes("'aidme:navigation-snapshot:v5'"),'mobile shell must purge stale v5 navigation snapshots');
must(mobile.includes('function prefetchVisibleStandalone()'),'visible standalone primary pages should be prefetched');
must(mobile.includes("nav.querySelectorAll('a.nav-item[href]')"),'prefetch must follow visible standalone nav links');

console.log('Form runner single-flight, participant-safe targeted bootstrap and standalone transition invariants: PASS');
