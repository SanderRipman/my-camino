import fs from 'node:fs';

const ui=fs.readFileSync(new URL('./vida-plan-revision-ui.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./form-runner.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./form-review.css',import.meta.url),'utf8');

function must(source,needle,label){if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}

must(ui,"currentDef?.key!=='vida_plan'",'VIDA-only guard');
must(ui,"Planversjon",'living-plan version label');
must(ui,"Gjeldende · Plan v",'current revision marker');
must(ui,"Skjemamal v",'template version provenance');
must(ui,'vidaRevisionBaseLoadSubmissions','event-driven history hook');
must(ui,'vidaRevisionBaseChooseForm','event-driven form switch hook');
must(ui,'requestAnimationFrame','single-frame UI scheduling');
must(ui,"dataset.vidaReviewReturnBound==='1'",'single return-handler binding');
must(html,'vida-plan-revision-ui.js?v=20260906a','revision UI loader');
must(html,'form-review.css?v=20260906a','review CSS cache bust');
must(css,'#closeSubmissionReview','mobile close containment');
must(css,'@media(max-width:420px)','narrow mobile fallback');
if(/MutationObserver|characterData|queueMicrotask/.test(ui))throw new Error('VIDA revision UI must not continuously observe the large form DOM; this previously caused mobile renderer storms/freezes.');
if(/\.(insert|update|upsert|delete)\s*\(/.test(ui))throw new Error('Revision UI helper must remain read-only');

console.log('VIDA living-plan revision UI and mobile-freeze regression invariants passed.');
