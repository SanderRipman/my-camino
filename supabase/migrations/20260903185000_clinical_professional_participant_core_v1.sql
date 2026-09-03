-- AidMe VIDA: relevant fagperson must be able to resolve the assigned participant context
-- before form-specific capabilities (for example decide_go/edit_via) can be exercised.
-- This does not broaden grant scope: role_grants participant_id/pilot_id/org scope and AAL2 still apply.

insert into public.role_permissions(role_code, capability)
values ('clinical_professional','view_participant_core')
on conflict do nothing;

-- Pseudonymized participant core is a less-sensitive domain than the identity/VÍA capabilities
-- this role already holds. Keep identity, sensitive VÍA and form access separately capability-gated.
