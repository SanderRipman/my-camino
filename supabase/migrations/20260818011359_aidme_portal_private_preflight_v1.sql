create or replace function aidme_private.portal_preflight()
returns table(check_name text, issue_count bigint, severity text, detail text)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select 'forms_without_active_published_version', count(*)::bigint, 'ERROR', 'Every form definition must have at least one published, non-retired version.'
  from public.form_definitions fd
  where not exists (
    select 1 from public.form_versions fv
    where fv.form_definition_id = fd.id
      and fv.published_at is not null
      and fv.retired_at is null
  )

  union all
  select 'expired_active_role_grants', count(*)::bigint, 'ERROR', 'A grant cannot remain active past valid_until.'
  from public.role_grants rg
  where rg.revoked_at is null and rg.valid_until is not null and rg.valid_until < now()

  union all
  select 'role_grant_participant_org_mismatch', count(*)::bigint, 'ERROR', 'Participant-scoped grants must belong to the same organization as the participant.'
  from public.role_grants rg
  join public.participants p on p.id = rg.participant_id
  where rg.organization_id <> p.organization_id

  union all
  select 'role_grant_pilot_org_mismatch', count(*)::bigint, 'ERROR', 'Pilot-scoped grants must belong to the same organization as the pilot.'
  from public.role_grants rg
  join public.pilots p on p.id = rg.pilot_id
  where rg.organization_id <> p.organization_id

  union all
  select 'pilot_participant_org_mismatch', count(*)::bigint, 'ERROR', 'Pilot membership must not cross organization boundaries.'
  from public.pilot_participants pp
  join public.pilots pi on pi.id = pp.pilot_id
  join public.participants pa on pa.id = pp.participant_id
  where pi.organization_id <> pa.organization_id

  union all
  select 'critical_open_tasks_without_owner_or_deadline', count(*)::bigint, 'ERROR', 'RED tasks that are not done/cancelled require both an owner and a deadline.'
  from public.tasks t
  where t.severity = 'RED'::aidme_rag
    and t.status not in ('DONE'::aidme_task_status, 'CANCELLED'::aidme_task_status)
    and (t.assignee_user_id is null or t.due_at is null)

  union all
  select 'expired_sos_locations_lingering', count(*)::bigint, 'ERROR', 'Expired SOS location snapshots should be purged.'
  from public.sos_location_snapshots s
  where s.expires_at < now()

  union all
  select 'unfinished_required_onboarding_for_inactive_grant', count(*)::bigint, 'WARN', 'Required onboarding should not remain actionable after its linked grant is revoked or expired.'
  from public.role_onboarding_items roi
  join public.role_grants rg on rg.id = roi.role_grant_id
  where roi.required = true
    and roi.status not in ('DONE'::aidme_onboarding_status, 'WAIVED'::aidme_onboarding_status)
    and (rg.revoked_at is not null or (rg.valid_until is not null and rg.valid_until < now()))

  union all
  select 'participant_user_crosslink_mismatch', count(*)::bigint, 'ERROR', 'A participant user link must reference an existing active profile for the same user.'
  from public.participants p
  left join public.profiles pr on pr.user_id = p.user_id
  where p.user_id is not null and (pr.user_id is null or pr.active is not true);
$$;

revoke all on function aidme_private.portal_preflight() from public;
grant execute on function aidme_private.portal_preflight() to service_role;
comment on function aidme_private.portal_preflight() is 'Private, repeatable AidMe VIDA portal preflight. Returns invariant counts only; no sensitive row payloads.';
