import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

const runner=read('./form-runner.js');
const fast=read('./form-runner-task-fastpath.js');
const phase=read('./app-phase-workspace.js');
const nav=read('./app-mobile-nav-scroll.js');
const physical=read('./app-mobile-physical-feedback.js');
const access=read('./app-access-state.js');
const profileBadge=read('./app-profile-unread-badge.js');
const handoff=read('./app-ser-vida-handoff.js');
const inbox=read('./inbox.html');
const inboxJs=read('./inbox.js');

assert(runner.includes('TARGETED_CONTEXT')&&runner.includes('if(!TARGETED_CONTEXT)init()'),'Targeted participant/pilot form route must not race the generic form init.');
assert(runner.includes("if(TARGETED_CONTEXT)return")&&fast.includes('bootstrap();'),'Targeted fastpath must be the only auth/bootstrap owner for targeted routes.');
assert(fast.includes("requestedPilot=q.get('pilot')")&&fast.includes("'Laster valgt pilot og skjema…'"),'Pilot-targeted fastpath must stay explicit.');

for(const token of ['selectedPilotId','showArchived','participantInPilot','taskInPilot','aidme-focus-controls'])assert(phase.includes(token),`Phase workspace missing ${token}.`);
assert(phase.includes("PHASES=['VÍA','SER','VIDA','ny VÍA']"),'All four journey phases must stay represented.');
assert(phase.includes("['new_via','new_via_review']")&&phase.includes("ty==='VIA_NEXT'"),'New VÍA tasks must be classifiable outside the participant list.');
assert(phase.includes('Visningen endrer ikke tilgangen din.'),'Focus/filter UI must state that it does not change authorization.');
assert(phase.includes('grid-template-columns:repeat(4')&&phase.includes('VÍA · SER · VIDA · ny VÍA'),'Process selector must stay one-row/four-phase and visibly filterable.');
for(const cls of ['phase-via','phase-ser','phase-vida','phase-new-via'])assert(phase.includes(cls),`Shared phase styling missing ${cls}.`);
assert(phase.includes("p.active!==false")&&phase.includes('Vis arkiverte'),'Inactive/archived participants must be hidden by default and explicitly revealable.');

assert(nav.includes("MOBILE_NAV_SCROLL_VERSION='2026-09-13b'"),'Mobile nav helper must be cache-busted after physical feedback.');
assert(nav.includes('app-profile-unread-badge.js?v=20260913a'),'Profile unread count must load outside the presentation-only semantic badge layer.');
assert(access.includes('app-mobile-physical-feedback.js?v=20260913a'),'Portal must load the physical mobile feedback correction layer.');
assert(physical.includes("PHYSICAL_MOBILE_UX_VERSION='2026-09-13a'")&&physical.includes('VELOCITY_COMMIT=.34'),'Content swipe must be versioned and velocity-aware.');
assert(physical.includes('translate3d(${visual}px,0,0)')&&physical.includes('settleBack')&&physical.includes("cubic-bezier(.16,1,.3,1)"),'Active content must follow the finger and settle with inertia rather than instant page snapping.');
assert(physical.includes("['touchstart','touchmove','touchend','touchcancel']")&&physical.includes('suppressLegacyContentTouch'),'Old instant workspace swipe must be suppressed before the inertia-aware replacement runs.');
assert(physical.includes('grid-template-columns:repeat(4,minmax(0,1fr))')&&physical.includes('.aidme-focus-controls{display:grid!important'),'Process and group/task controls must stay within the mobile frame instead of creating horizontal overflow.');
assert(physical.includes('#view-tasks .task-filter-row{display:flex!important;flex-wrap:wrap!important'),'Task controls must wrap inside their card on narrow screens.');
assert(profileBadge.includes("client.from('notifications')")&&profileBadge.includes("head:true")&&profileBadge.includes(".is('read_at',null)"),'Profile badge may query only an unread notification count through existing owner RLS.');
assert(!profileBadge.includes("select('*')")&&!profileBadge.includes('service_role'),'Profile badge must not fetch notification content or use privileged credentials.');

assert(handoff.includes('participant-inline-toggle-hint')&&handoff.includes("'Mer info ↓'")&&handoff.includes("'Minimer ↑'"),'Mobile participant card needs explicit same-card expand/collapse affordance.');
assert(handoff.includes('border-top:0!important')&&handoff.includes('border-bottom-color:transparent!important'),'Expanded participant detail must visually fuse with the selected card.');

assert(inbox.includes('lagres varig under <strong>Mine dokumenter</strong>')&&inbox.includes('Nylig lastet opp'),'Inbox must explain durable file location and show recent uploads.');
assert(inbox.includes('./documents.html#dine-filer')&&inboxJs.includes('Mine dokumenter'),'Inbox must provide a direct path to Dine filer in the durable document archive.');
assert(inboxJs.includes("category:'OTHER'")&&inboxJs.includes("sensitivity:'NORMAL'"),'Inbox metadata must keep canonical live schema values.');
assert(inbox.includes('scope, utløp/tilbakekalling og revisjonslogg'),'Future document sharing must remain an explicit controlled action, not implicit upload sharing.');

console.log('Early-UAT polish 2026-09-13 invariants OK');
