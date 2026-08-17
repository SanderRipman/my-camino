-- AidMe VIDA portal pre-release health checks
-- Safe read-only queries. Run before release/checkpoint against the target Supabase project.

-- 1) Core invariant summary: all values should be 0.
select
  (select count(*) from public.form_definitions fd where not exists (
    select 1 from public.form_versions fv
    where fv.form_definition_id=fd.id
      and fv.published_at is not null
      and (fv.retired_at is null or fv.retired_at>now())
  )) as forms_without_active_version,
  (select count(*) from public.role_grants rg
    where rg.revoked_at is null and rg.valid_until is not null and rg.valid_until<=now()) as unrevoked_expired_grants,
  (select count(*) from public.role_grants rg join public.participants p on p.id=rg.participant_id
    where rg.revoked_at is null and rg.organization_id<>p.organization_id) as participant_scope_org_mismatches,
  (select count(*) from public.role_grants rg join public.pilots pi on pi.id=rg.pilot_id
    where rg.revoked_at is null and rg.organization_id<>pi.organization_id) as pilot_scope_org_mismatches,
  (select count(*) from public.pilot_participants pp
    join public.participants p on p.id=pp.participant_id
    join public.pilots pi on pi.id=pp.pilot_id
    where pp.status='ACTIVE' and p.organization_id<>pi.organization_id) as participant_pilot_org_mismatches,
  (select count(*) from public.tasks t
    where t.status in ('OPEN','IN_PROGRESS','WAITING')
      and (t.severity='RED' or t.priority=1) and t.assignee_user_id is null) as critical_open_tasks_without_owner,
  (select count(*) from public.tasks t
    where t.status in ('OPEN','IN_PROGRESS','WAITING')
      and (t.severity='RED' or t.priority=1) and t.due_at is null) as critical_open_tasks_without_due,
  (select count(*) from public.sos_events s
    where s.status in ('OPEN','ACKNOWLEDGED')
      and (s.participant_id is null or s.initiated_by is null)) as open_sos_missing_core_context,
  (select count(*) from public.sos_location_snapshots l where l.expires_at<=now()) as expired_sos_locations_remaining,
  (select count(*) from public.role_onboarding_items i
    where i.required and i.status<>'DONE'
      and exists(select 1 from public.role_grants rg where rg.id=i.role_grant_id
        and (rg.revoked_at is not null or (rg.valid_until is not null and rg.valid_until<=now())))) as onboarding_open_for_inactive_grant;

-- 2) AAL2 must be RESTRICTIVE on every sensitive table listed here.
select tablename, policyname, permissive, cmd
from pg_policies
where schemaname='public' and policyname='require_aal2_sensitive'
order by tablename;

-- Expected sensitive table set:
-- audit_events, consent_events, form_submissions, go_no_go_decisions, incidents,
-- operational_safety_profiles, participant_identity, ser_checkins, via_assessments, vida_plans.
-- Every row must report permissive = RESTRICTIVE.

-- 3) Production-pilot gate check. DEMO pilots are intentionally excluded because the mixed-stage
-- demo collection is a UI laboratory, not a real cohort.
with active_pilot as (
  select pp.participant_id, pp.pilot_id
  from public.pilot_participants pp
  join public.pilots pi on pi.id=pp.pilot_id
  where pp.status='ACTIVE' and pi.status<>'DEMO'
), latest_go as (
  select distinct on (participant_id) participant_id, decision, decided_at
  from public.go_no_go_decisions
  order by participant_id, decided_at desc
), latest_via as (
  select distinct on (participant_id) participant_id, vida_owner_user_id, updated_at
  from public.via_assessments
  order by participant_id, updated_at desc
)
select p.code_name,p.stage::text as stage,pi.name as pilot,
       lg.decision::text as latest_individual_go,
       (lv.vida_owner_user_id is not null) as has_named_vida_owner
from public.participants p
join active_pilot ap on ap.participant_id=p.id
join public.pilots pi on pi.id=ap.pilot_id
left join latest_go lg on lg.participant_id=p.id
left join latest_via lv on lv.participant_id=p.id
where p.active and (
  (p.stage in ('GO','GO_WITH_CONDITIONS','SER','VIDA','NEW_VIA') and lg.participant_id is null)
  or (p.stage in ('GO','GO_WITH_CONDITIONS','SER','VIDA','NEW_VIA') and lv.vida_owner_user_id is null)
)
order by pi.name,p.code_name;
