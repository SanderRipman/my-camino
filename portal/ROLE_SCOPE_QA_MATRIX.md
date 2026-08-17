# Portal role/scope QA matrix

Canonical detailed QA baseline is stored in SharePoint as `MY_AIDME_ROLE_SCOPE_QA_MATRIX_2026-08-17.md`. This file is the implementation-side mirror used during portal releases.

## Source rules

- Responsibility follows competence and written mandate.
- VÍA owns clarification/preparation and must not promise SER before GO is closed.
- SER/tour lead owns route, group, safety, incidents and simple method; it is not a treatment/diagnostic role.
- VIDA must have a named owner and 72h + 14/30/90 follow-up.
- System administration is not automatic professional/sensitive participant access.
- Observer/evaluator default to aggregated learning, not individual sensitive data.
- Healthcare/journal data belongs to the responsible healthcare entity if healthcare is actually delivered.

## Current backend capabilities

| Role | Capabilities |
|---|---|
| system_admin | manage_config, manage_roles, manage_users, view_audit |
| project_owner | manage_program, view_case_status, view_reports |
| program_lead | manage_intakes, manage_tasks, respond_sos, view_case_status, view_go, view_participant_core, view_ser, view_vida |
| via_owner | decide_go, edit_via, manage_intakes, view_go, view_identity, view_operational_min, view_participant_core, view_sensitive_via |
| clinical_professional | decide_go, edit_via, view_go, view_identity, view_incidents, view_sensitive_via |
| ser_lead | edit_incidents, edit_ser, manage_ser_tasks, respond_sos, view_incidents, view_operational_min, view_participant_core, view_ser |
| vida_owner | edit_vida, view_participant_core, view_vida |
| logistics | edit_logistics, respond_sos, view_operational_min, view_participant_core |
| observer | view_aggregated |
| evaluator | view_aggregated |
| break_glass | view_identity, view_incidents, view_operational_min, view_sensitive_via |

Participant access is not a staff grant. It follows `participants.user_id` and own-resource RLS.

## Sensitive AAL2 tables

`audit_events`, `consent_events`, `form_submissions`, `go_no_go_decisions`, `incidents`, `operational_safety_profiles`, `participant_identity`, `ser_checkins`, `via_assessments`, `vida_plans` must keep `require_aal2_sensitive` as a **RESTRICTIVE** policy.

## Required test pattern for every release candidate

For each role use synthetic data and test:

1. positive in-scope access;
2. negative out-of-scope participant/pilot access;
3. AAL1 denial and AAL2 success where sensitive;
4. direct URL/API bypass denial;
5. role-specific write succeeds only through the intended server command;
6. audit event is written for the mutation;
7. grant expiry/revocation takes effect;
8. mobile navigation exposes the same allowed next action without hover-only help.

Specific negative assertions:

- participant never sees another participant;
- system_admin does not gain sensitive case content from the admin role alone;
- SER does not gain sensitive VÍA by default;
- VIDA does not gain VÍA/incidents by default;
- logistics cannot make professional participant decisions;
- observer/evaluator do not gain individual sensitive data;
- GO cannot be made by a role lacking `decide_go`;
- break-glass must be temporary, reasoned and audited.

## Context navigation acceptance rule

When authorized: KPI/badge → filtered queue → task → participant/owner/pilot/route → required gate/form → updated case state.

When not authorized: hide the control if awareness itself is unnecessary, otherwise show a lock + human explanation + safe next step. Mobile-critical guidance must not depend on hover.

## DEMO exception

`DEMO · Camino Portugués` is intentionally a mixed-stage UI lab (VÍA/SER/VIDA profiles at once). Production gate invariants must exclude `pilots.status='DEMO'`; this exception must never apply to normal pilot statuses.
