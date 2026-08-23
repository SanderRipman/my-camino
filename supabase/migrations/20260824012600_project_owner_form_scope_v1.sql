-- AidMe VIDA: least-privilege hardening for versioned form payloads.
-- Project owner keeps program-level pilot GO/evaluation, but not individual VÍA/intake/agreement payload access solely via manage_program/view_case_status.

create or replace function aidme_private.staff_form_allowed_v2(
  p_org uuid,
  p_participant uuid,
  p_pilot uuid,
  p_form_version_id uuid
)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select coalesce((
    select case fd.key
      when 'info_before_via' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
      when 'interest_referral' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
        or aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_tasks')
      when 'via_roadmap' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
      when 'individual_go_no_go' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'decide_go')
      when 'participant_agreement' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
      when 'pilot_go' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_program')
        or aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_tasks')
        or aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_logistics')
      when 'ser_daily' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_ser')
      when 'incident' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_incidents')
      when 'vida_plan' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_vida')
      when 'pilot_evaluation' then
        aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_program')
      else false
    end
    from public.form_versions fv
    join public.form_definitions fd on fd.id=fv.form_definition_id
    where fv.id=p_form_version_id
      and fv.published_at is not null
      and (fv.retired_at is null or fv.retired_at>now())
  ),false);
$function$;

comment on function aidme_private.staff_form_allowed_v2(uuid,uuid,uuid,uuid) is
'Least-privilege form authorization. Individual form payload access follows form-specific capabilities; manage_program is limited to pilot_go and pilot_evaluation.';

-- Do not let the generic case-status capability become a side door to every versioned form payload.
drop policy if exists form_submission_read on public.form_submissions;
create policy form_submission_read
on public.form_submissions
for select
to authenticated
using (
  ((participant_id is not null) and aidme_private.is_own_participant(participant_id))
  or submitted_by = (select auth.uid())
  or aidme_private.staff_form_allowed_v2(organization_id, participant_id, pilot_id, form_version_id)
);
