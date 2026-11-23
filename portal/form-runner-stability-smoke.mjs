import fs from 'node:fs';
import vm from 'node:vm';
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
must(runner.includes('const TARGETED_CONTEXT=')&&runner.includes('if(!TARGETED_CONTEXT)init()'),'exact participant/pilot routes must not race the generic bootstrap');
must(runner.includes('if(TARGETED_CONTEXT)return'),'auth reinit must leave targeted routes under one bootstrap owner');

must(runnerHtml.includes('form-runner-task-fastpath.js?v=20261123a'),'targeted form routes must load the current bounded bootstrap');
must(runnerHtml.includes('form-runner.js?v=20261122c'),'targeted race fix must be cache-busted in the base runtime');
must(taskFast.includes("client.functions.invoke('case-command'"),'staff targeted participant bootstrap must use server-side participant context instead of broad participant reads');
must(taskFast.includes("action:'LIST_CONTEXT'"),'staff targeted participant bootstrap must resolve the exact requested participant context');
must(taskFast.includes("requestedPilot=q.get('pilot')")&&taskFast.includes('if(!requestedParticipant&&requestedPilot)'),'pilot-level forms must have an exact targeted bootstrap and not depend on participant context');
must(taskFast.includes('!pilots.some(p=>p.id===requestedPilot)'),'pilot-level targeted bootstrap must reject unknown/inaccessible pilot context');
must(taskFast.includes('const preflightGrants=gRes.data||[]')&&taskFast.includes('if(!preflightGrants.some(active))'),'targeted bootstrap must distinguish real participant sessions before invoking staff-only context paths');
must(taskFast.indexOf('if(!preflightGrants.some(active))')<taskFast.indexOf('const seq=++initSeq;initPromise=null'),'participant RLS bootstrap must remain alive; broad init may only be invalidated after staff scope is proven');
must(taskFast.includes('if(!initPromise)await init()'),'participant route must fall back to the ordinary caller-RLS form bootstrap');
must(taskFast.includes('function showSecurityStep()')&&taskFast.includes("link.href='./#security'")&&taskFast.includes("link.textContent='Bekreft Authenticator og fortsett'"),'AAL1 participant form must route to MFA security instead of looping back to the task');
must(taskFast.indexOf("if(!aal2){showSecurityStep();return}")>=0,'AAL1 exact form route must use the dedicated security action, not generic return/failure behavior');
must(taskFast.includes('FORM_TASK_BOOTSTRAP_TIMEOUT')&&taskFast.includes('showFailure'),'targeted form bootstrap must fail visibly instead of leaving a blank page');

for(const html of [runnerHtml,intake]){
  for(const label of ['Oversikt','Deltakere','Oppgaver','Innsjekk','Interesse / VÍA'])must(html.includes(`<b>${label}</b>`),`standalone first paint missing ${label}`);
  must(html.includes('app-mobile.js?v=20260906b'),'standalone must cache-bust current mobile shell');
}
must(runnerHtml.includes('standalone-chrome.js?v=20260913a'),'targeted form runner must cache-bust the updated standalone shell load');
must(intake.includes('standalone-chrome.js?v=20260906b'),'unchanged intake standalone chrome reference must remain explicit');

must(nav.includes("NAV_SNAPSHOT_KEY='aidme:navigation-snapshot:v7'"),'navigation snapshot must invalidate the previous menu ordering');
must(nav.includes("const primaryOrder=['overview','participants','tasks','checkin','#sosNav','settings']"),'final primary mobile ordering must prioritize daily work, safety and profile');
must(nav.includes("'#intakeNav','#ownersNav','#pilotOpsNav','#guideNav'")&&nav.includes('setMobileSecondary'),'phase-specific workspaces must be contextual rather than permanent mobile primary tabs');
must(nav.includes("'aidme:navigation-snapshot:v6'"),'navigation IA must purge stale v6 snapshots');
must(mobile.includes("'aidme:navigation-snapshot:v5'"),'mobile shell must purge stale pre-v6 navigation snapshots');
must(mobile.includes('function prefetchVisibleStandalone()'),'visible standalone primary pages should be prefetched');
must(mobile.includes("nav.querySelectorAll('a.nav-item[href]')"),'prefetch must follow visible standalone nav links');


const roleGuidance=read('./form-role-gate-guidance.js');
const authContinuity=read('./form-auth-continuity.js');
// Real callback execution regression: DOM writes observed under a childList
// MutationObserver must settle after the first normalization. The old
// unconditional textContent setters would re-trigger indefinitely.
function simulateBlockedObserver({participant,roleCodes,authScript}){
  let writes=0,pending=0,callback=null,noted=null;
  const textNode=initial=>{
    let value=initial;
    return {get textContent(){return value},set textContent(v){value=v;writes++;pending++}};
  };
  const heading=textNode('Skjema er låst');
  const details=textNode(authScript?'Versjonerte programskjema krever Authenticator.':'Ingen tilgang med denne rollen.');
  const link=textNode('Bekreft Authenticator og fortsett');
  let href='./';
  link.getAttribute=name=>name==='href'?href:null;
  link.setAttribute=(name,value)=>{if(name==='href'){href=value;writes++;pending++}};
  const blocked={
    classList:{contains:name=>name==='hidden'?false:false},
    querySelector:sel=>sel==='h2'?heading:sel==='a.primary'?link:sel==='[data-via-ser-gate-note]'?noted:null,
    appendChild:el=>{noted=el;writes++;pending++}
  };
  const doc={
    body:{},hidden:false,
    querySelector:sel=>sel==='#blocked'?blocked:sel==='#blockedText'?details:null,
    createElement:()=>({dataset:{},className:'',innerHTML:''}),
    addEventListener:()=>{}
  };
  const ctx={
    location:{search:'?key=via_roadmap&participant=synthetic',pathname:'/portal/form-runner.html'},
    document:doc,
    URLSearchParams,
    MutationObserver:class {constructor(fn){callback=fn} observe(){}},
    setTimeout:fn=>{fn();return 1},
    grants:roleCodes.map(role_code=>({role_code})),
    active:()=>true,
    ownParticipant:()=>participant?{id:'synthetic'}:null,
    window:{addEventListener:()=>{}},
    client:{auth:{onAuthStateChange:()=>{},getSession:async()=>({data:{session:{}}})}},
    sessionStorage:{setItem:()=>{}},
  };
  vm.runInNewContext(authScript?authContinuity:roleGuidance,ctx,{timeout:1000});
  for(let i=0;i<8&&pending>0;i++){
    pending=0;
    callback?.([]);
    if(writes>4)throw Error('Self-triggered mutation observer loop in '+(authScript?'auth continuity':'role gate'));
  }
  must(pending===0,'Form guard observer must settle without additional DOM writes');
  if(participant&&!authScript){
    must(details.textContent==='Ingen tilgang med denne rollen.','Participant gate must preserve participant-specific denial');
    must(writes===0,'Staff role guidance must never mutate participant error surfaces');
  }
  if(authScript){
    must(link.textContent==='Velg sikker bekreftelse','MFA advice must link to security');
    must(writes===3,'MFA link must be normalized exactly once');
  }
}
simulateBlockedObserver({participant:false,roleCodes:['system_admin'],authScript:false});
simulateBlockedObserver({participant:true,roleCodes:[],authScript:false});
simulateBlockedObserver({participant:true,roleCodes:[],authScript:true});
console.log('Form denial observer runtime / participant safety regression: PASS');


const participantNext=read('./app-participant-next.js');
const primaryHomeAction=read('./participant-next-now-uat.js');
must(primaryHomeAction.includes("href='./form-runner.html#my-via-roadmap'"),'Participant homepage primary CTA must use own VIA hash route, not legacy query UUID');
must(!primaryHomeAction.includes("form-runner.html?key=via_roadmap"),'No stale VIA direct query-link is allowed on the participant homepage');

must(participantNext.includes("href:'./form-runner.html#my-via-roadmap'"),'Participant VIA action must not depend on problematic query-parameter document navigation');
must(runner.includes("location.hash==='#my-via-roadmap'&&!!ownParticipant()"),'Queryless VIA target must only select the authenticated owner and preserve RLS');
must(runner.includes("participant=selfVia?ownParticipant().id:q.get('participant')"),'Queryless VIA routing must derive participant ID exclusively from authenticated ownership');
must(runner.includes('if([pRes,gRes,dRes,vRes,pilotRes,ppRes].some(res=>res.error)){formDataUnavailable();return}'),'Failed reads must never silently become empty role/form datasets');
must(runner.includes("$('#blockedText').textContent='Innsjekk av kontoen"),'Temporary identity/read failure must have its own safe failure explanation');
const retryStart=runner.indexOf('async function retryFormRead(');
const retryEnd=runner.indexOf('\nfunction formDataUnavailable()',retryStart);
must(retryStart>0&&retryEnd>retryStart,'Bounded JWT retry must exist as independently testable helper');
const retryFn=vm.runInNewContext(runner.slice(retryStart,retryEnd)+'\nretryFormRead',{Promise,setTimeout},{timeout:1000});
let calls=0,delays=[];
let result=await retryFn(async()=>{calls++;return calls===1?{status:401,error:{code:'PGRST303'}}:{status:200,error:null,data:['own participant']}},
  async ms=>{delays.push(ms)});
must(calls===2&&delays.length===1&&result.data?.[0]==='own participant','Transient PGRST303 must recover without dropping owner');
calls=0;delays=[];
result=await retryFn(async()=>{calls++;return {status:403,error:{code:'42501'}}},async ms=>{delays.push(ms)});
must(calls===1&&delays.length===0&&result.status===403,'Actual RLS denial must fail closed without auth retry');
calls=0;delays=[];
result=await retryFn(async()=>{calls++;return {status:401,error:{code:'PGRST303'}}},async ms=>{delays.push(ms)});
must(calls===4&&delays.length===3&&result.error.code==='PGRST303','Persistent auth validation error must be bounded and reported, not loop forever');
console.log('Form PGRST303 recovery, negative RLS, and hash-only participant owner route: PASS');


// When transient auth/form availability changes between consecutive reads, a
// stale 'no assigned forms' denial must disappear only after the current form
// and scope are actually valid. AAL2, context and save gates remain unchanged.
must(runner.includes("const authorized=contextOk();if(authorized){$('#blocked').classList.add('hidden');$('#runner').classList.remove('hidden')}"),'A previously visible no-forms warning must be hidden after valid form and ownership are restored');
must(runner.includes("if(!currentVersion||!contextOk())return"),'Saving still requires a current form version and verified matching scope');
must(runner.includes("if(!aal2){$('#blocked').classList.remove('hidden')"),'AAL2 denial must still remain blocking');

console.log('Form runner single-flight, sole-owner participant/pilot targeted bootstrap and simplified mobile IA invariants: PASS');
