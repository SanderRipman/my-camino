import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

const runner=read('./form-runner.js');
const fast=read('./form-runner-task-fastpath.js');
const phase=read('./app-phase-workspace.js');
const physical=read('./app-mobile-physical-feedback.js');
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
assert(phase.includes('Visningen endrer ikke tilgangen din.'),'Focus/filter UI must state that it does not change authorization.');
for(const cls of ['phase-via','phase-ser','phase-vida','phase-new-via'])assert(phase.includes(cls),`Shared phase styling missing ${cls}.`);
assert(phase.includes("p.active!==false")&&phase.includes('Vis arkiverte'),'Inactive/archived participants must be hidden by default and explicitly revealable.');

assert(access.includes('app-profile-unread-badge.js?v=20260913a'),'Profile unread count must load independently of gesture/navigation code.');
assert(access.includes('app-mobile-physical-feedback.js?v=20260913b'),'Portal must load the current unified physical mobile flow layer.');
assert(!access.includes('app-mobile-nav-scroll.js'),'Competing top-nav drag layer must not be loaded after gesture consolidation.');
assert(physical.includes("PHYSICAL_MOBILE_UX_VERSION='2026-09-13b'")&&physical.includes('VELOCITY_COMMIT=.34'),'Fluid swipe must be versioned and velocity-aware.');
assert(physical.includes('prepareAdjacent')&&physical.includes('aidme-flow-preview')&&physical.includes('nextView.style.transform'),'Adjacent same-page view must be visible during drag instead of appearing only after release.');
assert(physical.includes('interpolateMarker')&&physical.includes('aidme-fluid-nav-marker')&&physical.includes('itemCenter'),'Active AidMe marker must move continuously between current and destination tabs during content swipe.');
assert(physical.includes('beginNav')&&physical.includes('moveNav')&&physical.includes('nav.scrollLeft')||physical.includes('n.scrollLeft=g.left-dx'),'Unified physical layer must own top-nav dragging across clickable and quiet areas.');
assert(physical.includes("['touchstart','touchmove','touchend','touchcancel']")&&physical.includes('stopLegacyContentTouch'),'Old instant workspace swipe must be suppressed before the fluid replacement runs.');
assert(physical.includes('aidme-process-accordion')&&physical.includes('flex-direction:column!important')&&physical.includes('aria-expanded'),'Mobile Process must return to vertically stacked, expandable VÍA/SER/VIDA/new-VÍA blocks.');
assert(physical.includes('.aidme-focus-controls{display:grid!important')&&physical.includes('#view-tasks .task-filter-row{display:flex!important;flex-wrap:wrap!important'),'Group/task controls must stay inside the mobile frame.');
assert(!/client\.from|functions\.invoke|service_role/i.test(physical),'Unified physical flow must remain presentation-only.');
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

console.log('Early-UAT polish 2026-09-13 invariants OK');