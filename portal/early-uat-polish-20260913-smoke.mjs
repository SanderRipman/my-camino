import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

const runner=read('./form-runner.js');
const fast=read('./form-runner-task-fastpath.js');
const phase=read('./app-phase-workspace.js');
const fluid=read('./app-mobile-fluid.js');
const access=read('./app-access-state.js');
const profileBadge=read('./app-profile-unread-badge.js');
const taskInline=read('./app-task-inline.js');
const handoff=read('./app-ser-vida-handoff.js');
const inbox=read('./inbox.html');
const inboxJs=read('./inbox.js');
const documents=read('./documents.html');

assert(runner.includes('TARGETED_CONTEXT')&&runner.includes('if(!TARGETED_CONTEXT)init()'),'Targeted participant/pilot form route must not race the generic form init.');
assert(runner.includes("if(TARGETED_CONTEXT)return")&&fast.includes('bootstrap();'),'Targeted fastpath must be the only auth/bootstrap owner for targeted routes.');
assert(fast.includes("requestedPilot=q.get('pilot')")&&fast.includes("'Laster valgt pilot og skjema…'"),'Pilot-targeted fastpath must stay explicit.');

for(const token of ['selectedPilotId','showArchived','participantInPilot','taskInPilot','aidme-focus-controls'])assert(phase.includes(token),`Phase workspace missing ${token}.`);
assert(phase.includes("PHASES=['VÍA','SER','VIDA','ny VÍA']"),'All four journey phases must stay represented.');
assert(phase.includes("['new_via','new_via_review']")&&phase.includes("ty==='VIA_NEXT'"),'New VÍA tasks must be classifiable outside the participant list.');
assert(phase.includes('Visningen endrer ikke tilgangen din.'),'Authorization helper copy must remain in source even when visually suppressed on compact mobile.');
for(const cls of ['phase-via','phase-ser','phase-vida','phase-new-via'])assert(phase.includes(cls),`Shared phase styling missing ${cls}.`);
assert(phase.includes("p.active!==false")&&phase.includes('Vis arkiverte'),'Inactive/archived participants must be hidden by default and explicitly revealable.');

assert(access.includes('app-profile-unread-badge.js?v=20260913a'),'Profile unread count must load independently of gesture/navigation code.');
assert(access.includes('app-mobile-fluid.js?v=20260913c'),'Portal must keep loading the unified mobile gesture owner from the existing static path.');
assert(!access.includes('app-mobile-nav-scroll.js')&&!access.includes('app-mobile-physical-feedback.js'),'Superseded competing mobile gesture layers must not be loaded.');
assert(fluid.includes("MOBILE_FLUID_VERSION='2026-09-14a'")&&fluid.includes('VELOCITY_COMMIT=.34'),'Unified mobile flow must be versioned and velocity-aware.');
assert(fluid.includes('function ensureMarker()')&&fluid.includes('function syncMarker(')&&fluid.includes('function setMarkerPoint('),'Fluid marker primitives must be explicit.');
const ensureMarkerBody=fluid.match(/function ensureMarker\(\)\{([\s\S]*?)\nfunction markerPoint/ )?.[1]||'';
assert(!ensureMarkerBody.includes('syncMarker(')&&!ensureMarkerBody.includes('setMarkerPoint('),'Marker creation must not recursively call marker synchronization/positioning.');
assert(fluid.includes('getBoundingClientRect()')&&fluid.includes('markerPoint(item)'),'Marker alignment must use live viewport geometry rather than stale tab offsets.');
assert(fluid.includes('interpolateMarker')&&fluid.includes('aidme-fluid-nav-marker'),'Active AidMe marker must interpolate continuously between current and destination tabs.');
assert(fluid.includes('function installNavGesture()')&&fluid.includes("aidmeFluidNavNative='1'")&&fluid.includes("n.addEventListener('scroll'"),'Top-nav must use the browser native horizontal scroller and only observe scrolling for marker sync.');
assert(!fluid.includes("surface.addEventListener('touchstart'")&&!fluid.includes('navSuppressClickUntil')&&!fluid.includes('n.scrollLeft=g.left-dx'),'Top-nav must not reintroduce a competing manual drag/click-suppression path over clickable labels.');
assert(fluid.includes('touch-action:pan-x pan-y!important')&&fluid.includes('overflow-x:auto!important'),'Clickable labels, badges and quiet nav areas must all participate in native horizontal panning.');
assert(fluid.includes("if(n?.contains(target))return")&&fluid.includes("gesture={zone:'content'"),'Document-level content swipe must yield immediately when a gesture starts inside the top nav.');
assert(fluid.includes("document.addEventListener('touchstart',begin")&&fluid.includes("document.addEventListener('touchmove',move")&&fluid.includes("document.addEventListener('touchend',end"),'Same-page content flow must keep its dedicated document-level touch owner.');
assert(fluid.includes('prepareAdjacent')&&fluid.includes('aidme-flow-preview')&&fluid.includes('nextView.style.transform'),'Adjacent same-page view must be visible during drag instead of appearing only after release.');
assert(fluid.includes('cleanupPreview(g);if(window.scrollY||window.scrollX)window.scrollTo({top:0,left:0,behavior:\'auto\'})')&&fluid.includes("if(name&&typeof show==='function')show(name)"),'Swipe commit must clear preview geometry and normalize scroll before canonical show() to avoid the final-frame jump.');
assert(fluid.includes('aidme-process-accordion')&&fluid.includes('grid-template-columns:auto minmax(0,1fr) auto!important')&&fluid.includes('compact-process>h3{white-space:nowrap!important'),'Mobile Process must stay clickable while using compact one-row phases and a single-line VÍA/SER/VIDA heading.');
assert(fluid.includes('.aidme-focus-note{display:none!important}')&&fluid.includes('font-size:0!important')&&fluid.includes('max-width:220px!important'),'Redundant visible group label/helper copy must be suppressed and the group selector must stay compact.');
assert(!/client\.from|functions\.invoke|service_role/i.test(fluid),'Unified mobile flow must remain presentation-only.');
assert(profileBadge.includes("client.from('notifications')")&&profileBadge.includes("head:true")&&profileBadge.includes(".is('read_at',null)"),'Profile badge may query only an unread notification count through existing owner RLS.');
assert(!profileBadge.includes("select('*')")&&!profileBadge.includes('service_role'),'Profile badge must not fetch notification content or use privileged credentials.');

assert(access.includes('app-task-inline.js?v=20260913a'),'Portal must load compact inline task expansion.');
assert(taskInline.includes("TASK_INLINE_VERSION='2026-09-13a'")&&taskInline.includes('aria-expanded')&&taskInline.includes("'Mer ↓'")&&taskInline.includes("'Minimer ↑'"),'Tasks must expose one compact expand/minimize affordance.');
assert(taskInline.includes("data-task-inline-open")&&taskInline.includes('openTask(id)'),'Expanded tasks must delegate authoritative action handling to the existing openTask/workflow path.');
assert(taskInline.includes('aidme:phase-workspace-changed'),'Changing phase/group context must collapse stale inline task detail.');
assert(taskInline.includes('grid-template-rows:0fr')&&taskInline.includes('grid-template-rows:1fr'),'Task detail must use a bounded height transition rather than detached modal-only navigation.');
assert(!/client\.from|functions\.invoke|fetch\(|XMLHttpRequest|service_role/i.test(taskInline),'Inline task presentation must not add a backend or authorization path.');

assert(handoff.includes('participant-inline-toggle-hint')&&handoff.includes("'Mer info ↓'")&&handoff.includes("'Minimer ↑'"),'Mobile participant card needs explicit same-card expand/collapse affordance.');
assert(handoff.includes('border-top:0!important')&&handoff.includes('border-bottom-color:transparent!important'),'Expanded participant detail must visually fuse with the selected card.');

assert(inbox.includes('lagres varig under <strong>Mine dokumenter</strong>')&&inbox.includes('Nylig lastet opp'),'Inbox must explain durable file location and show recent uploads.');
assert(inbox.includes('./documents.html#myFiles')&&documents.includes('id="myFiles"')&&documents.includes('<h2>Dine filer</h2>')&&inboxJs.includes('Mine dokumenter'),'Inbox must provide a direct path to Dine filer in the durable document archive.');
assert(inboxJs.includes("category:'OTHER'")&&inboxJs.includes("sensitivity:'NORMAL'"),'Inbox metadata must keep canonical live schema values.');
assert(inbox.includes('scope, utløp/tilbakekalling og revisjonslogg'),'Future document sharing must remain an explicit controlled action, not implicit upload sharing.');

console.log('Early-UAT polish 2026-09-14 invariants OK');