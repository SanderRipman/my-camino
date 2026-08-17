# Privacy and operations baseline before real data

The canonical working draft is in SharePoint as `MY_AIDME_PRIVACY_OPERATIONS_BASELINE_2026-08-17.md`. This implementation mirror defines release gates; it is not legal sign-off.

## Architecture rules

- P0 public: public information; anonymous interest never writes directly to the database.
- P1 identity: separate name/contact identity from pseudonymised program core.
- P2 program/core: participant ID/code name, stage, pilot, route, tasks, owner and minimal status.
- P3 sensitive program/safety: VÍA assessments, operational safety, GO, incidents and relevant check-ins; narrow role/scope + AAL2.
- P4 healthcare/journal: if healthcare is actually delivered, journal obligations/system must be owned by the responsible healthcare entity, not silently absorbed into the AidMe program portal.

## Data minimisation question before every new field

1. What is the exact purpose?
2. Who needs it to perform a written role?
3. Can less detail or pseudonymisation achieve the purpose?
4. How long is it needed?
5. What event triggers deletion/anonymisation?
6. Should the participant see/correct it?

No answer = keep the field test-only/off.

## P0 release gates

Do not open real sensitive participant data until all are documented and approved:

- DPIA / risk assessment and named controller responsibilities;
- legal basis and transparent information per processing purpose;
- DPA/subprocessor/data-location review;
- approved retention matrix including backup lifecycle;
- tested backup/restore procedure;
- access/correction/export/deletion/restriction procedure;
- personal-data-breach response runbook with named owners;
- full positive/negative role and scope E2E QA;
- Supabase leaked-password protection enabled;
- production auth/recovery assurance.

## Consent and information

Do not use “consent” as a generic label for every processing activity. Keep versioned information and decisions. Image/story/marketing consent remains separate from participation.

## SOS/location

Current rule: participant initiates SOS and explicitly shares location for that event; location expires. No general admin remote tracking. Any future staff-triggered location feature requires a separate necessity/proportionality and DPIA decision before implementation.

## Logging boundaries

Operational safety facts, professional assessments and participant private reflections must remain distinguishable. Audit/security logs should contain minimal metadata and must not become a second copy of sensitive case content.

## Release preflight

Run in this order:
1. `supabase/portal-health-check.sql`
2. Supabase Security Advisor
3. Supabase Performance Advisor
4. Portal Smoke CI
5. synthetic role/scope test
6. Netlify preview
7. only then controlled merge/deploy.
