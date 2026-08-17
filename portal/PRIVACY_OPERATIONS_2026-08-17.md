# AidMe VIDA portal – privacy & production operations

Status: **operational draft / production gate**, 2026-08-17. This document does not decide legal basis or replace DPIA, DPO/lawyer review or a partner's healthcare/journal obligations.

Project basis:
- `12_Personvern_dataflyt_og_systemvalg_v0_1_UTKAST.docx`
- `04_Deltakeravtale_og_personvernvalg_v0_2_UTKAST.docx`
- current role/scoped Supabase architecture and active VÍA–SER–VIDA malpakke.

## 1. Non-negotiable operating rules

1. Purpose, controller/processor role and lawful basis are decided **before** a real data category is opened.
2. Health/risk data are treated as special-category/sensitive data. Ordinary email/chat is not an approved channel for those details.
3. Program operations, optional evaluation, media/marketing and any healthcare/journal processing are separate purposes. One bundled consent must not be used to force unrelated purposes.
4. If a psychologist/other healthcare professional is actually providing healthcare, clinical notes stay in the healthcare provider's compliant journal/system – not in ordinary AidMe project/portal fields.
5. Participant-facing operational screens use code names when identity is not needed. Identity and operational minimum are separate resources.
6. System administration is not automatic participant/fag access.
7. Real sensitive data remain disabled until the DPIA/privacy, supplier/DPA, retention, backup/restore and incident-response gates have named owners and recorded decisions.

## 2. Portal data zones

| Zone | Examples | Default handling |
|---|---|---|
| P0 public/minimal | public interest type, privacy-notice version | minimal, rate-limited, no health details |
| P1 identity/contact | legal name, account email, phone, emergency contact | separate identity resource; need-to-know |
| P2 programme/operations | stage, tasks, pilot, route, role, deadlines | role + participant/pilot scope |
| P3 sensitive safety/VÍA | necessary allergy/medication safety info, early warning signs, VÍA assessment, incidents | AAL2 + specific capability + scope |
| P4 healthcare journal | diagnosis, clinical notes, healthcare documentation | **outside ordinary AidMe portal unless a separate compliant healthcare architecture is formally approved** |

## 3. Collection rules

Before adding a new field, record:
- exact purpose;
- who needs it;
- whether a less sensitive field can do the job;
- system/table and sensitivity zone;
- retention/deletion rule;
- whether participant sees/corrects it;
- whether it is disclosed to a partner;
- legal/privacy owner approval where required.

Do not add free text merely because it is convenient. Prefer structured choices and bounded text where they reduce accidental collection.

## 4. Current technical safeguards

Implemented:
- Supabase Auth + TOTP MFA/AAL2 step-up for staff/sensitive modules;
- row-level security, capability + participant/pilot scope;
- participant owns only own participant-facing resources;
- system-admin/sensitive-case separation verified transactionally;
- versioned forms and versioned participant programme agreement;
- append-style audit/change trail without copying sensitive payloads;
- neutral notification previews;
- private, participant-initiated and time-limited SOS location snapshot; no general remote tracking;
- private personal-document bucket prepared with own-user path policies, 15 MB limit and executable/HTML/SVG types excluded;
- public intake server endpoint fail-closed until CAPTCHA/rate-limit/privacy configuration is complete;
- PWA cache excludes Supabase/API traffic and the clean build is syntax-tested in CI.

Known technical gate:
- Supabase Auth leaked-password protection is still disabled and must be enabled when configuration access is available.

## 5. Data-subject request procedure – operational skeleton

Until a controller/legal owner finalises the formal procedure:

1. Record the request and verify identity using an appropriate channel; do not request unnecessary identity documents by ordinary email.
2. Classify: access / correction / deletion / restriction / objection / portability / consent withdrawal.
3. Identify all relevant systems and partners. The portal alone may not contain the full record.
4. Preserve audit evidence of the request and actions without copying sensitive content into the audit trail.
5. Check whether any information must or may lawfully be retained before deletion.
6. Execute approved export/correction/deletion across the controller's systems and required processors/partners.
7. Confirm completion to the person in a safe channel.

**Gate:** final response timeframes, legal exceptions and controller contact details must be filled by the responsible privacy/legal owner before real-data launch.

## 6. Retention and deletion

No arbitrary retention period is invented in code. The active project privacy template explicitly requires a deletion/archive rule for each category.

Before real-data launch, set and approve a table covering at minimum:
- contact/intake;
- identity/contact agreement;
- operational safety minimum;
- GO/NO-GO decisions;
- daily SER status;
- incidents/deviations;
- VIDA follow-up;
- pilot/evaluation data;
- personal documents;
- optional media/sitat;
- audit/security logs;
- SOS location snapshots.

Already enforced: SOS location snapshots are event-bound, expire automatically and are removed on resolve/cancel.

## 7. Personal documents

Prepared bucket: `aidme-personal-documents` (private).

Rules:
- path begins with authenticated user ID;
- only that user has ordinary storage object access;
- no public URLs;
- allowed file types are limited to PDF, JPEG/PNG/WebP, DOCX, XLSX and plain text;
- max file size 15 MB;
- HTML/SVG/executable uploads are not allowed by the bucket whitelist;
- metadata has own-user RLS and audit trigger.

**UI remains gated** until export/delete/retention and malware/content-handling expectations are formally accepted. Preparing storage is not permission to upload real sensitive documents yet.

## 8. Privacy/security incident response

Project-source sequence:
1. stop or limit the leak/incorrect access;
2. notify the named privacy/security responsible person immediately and register the incident;
3. identify affected people, systems and data categories;
4. preserve technical evidence and access logs;
5. assess risk and whether notification to authorities/affected people is required under applicable rules and deadlines;
6. correct access/credentials/configuration;
7. document measures and learning in the incident/deviation log;
8. verify the fix and update prevention controls.

Do not send affected sensitive data in the incident notification itself unless the approved secure channel requires it.

## 9. Backup / restore gate

Before real sensitive data:
- identify authoritative database + storage backup mechanism;
- document RPO/RTO target appropriate for the pilot;
- perform at least one restore rehearsal to a non-production environment;
- verify restored RLS/roles, not just row counts;
- verify deleted/expired SOS locations and retention rules do not reappear indefinitely through uncontrolled restore processes;
- record result and named owner.

The portal must not be declared production-ready for real sensitive data merely because the application deploy succeeds.

## 10. Partner/system exit

For every material processor/partner connection, record:
- controller/processor role;
- DPA/contract owner;
- subprocessors and transfer basis where relevant;
- export format;
- deletion/return on termination;
- API credential rotation/revocation;
- who confirms completion.

## 11. Launch gate status

| Gate | Current status |
|---|---|
| MFA/AAL2 | Implemented |
| Capability + participant/pilot scope | Implemented; synthetic QA recorded |
| Audit/change logging | Implemented |
| Versioned programme forms/agreement | Implemented |
| Public intake abuse controls | Code prepared; secrets/public parity not yet opened |
| Sensitive email/chat prohibition | Project rule; operational training still required |
| DPIA | Required project P0 before intended high-risk processing; not closed |
| Controller/legal basis matrix | Not closed |
| DPA/subprocessor register | Not closed |
| Retention schedule | Not closed |
| Backup/restore rehearsal | Not closed |
| Data-subject request procedure | Skeleton only; legal owner fields not closed |
| Incident owner/rehearsal | Technical/logging prepared; owner/rehearsal not closed |
| Leaked-password protection | Not enabled |
| Real sensitive data | **NO-GO** until the above gates are closed |
