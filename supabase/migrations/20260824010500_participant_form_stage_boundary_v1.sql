-- AidMe VIDA: keep participant form writes aligned with the canonical journey stage.
-- The participant SER check-in is the dedicated ser_checkins surface; ser_daily is the staff operational log.
-- This helper is called by form_submissions RLS, so direct URL/API attempts cannot bypass the same stage boundary as the UI.

create or replace function aidme_private.participant_form_allowed(p_form_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select exists (
    select 1
    from public.form_versions fv
    join public.form_definitions fd on fd.id=fv.form_definition_id
    join public.participants p
      on p.user_id=auth.uid()
     and p.active=true
    where fv.id=p_form_version_id
      and fd.scope in ('participant','participant_staff')
      and fv.published_at is not null
      and (fv.retired_at is null or fv.retired_at>now())
      and (
        (fd.key='info_before_via' and upper(p.stage::text) in ('VIA','READY_FOR_GO','INTEREST','NEW_VIA'))
        or (fd.key='via_roadmap' and upper(p.stage::text) in ('VIA','READY_FOR_GO','INTEREST','NEW_VIA'))
        or (fd.key='participant_agreement' and upper(p.stage::text) in ('GO','GO_WITH_CONDITIONS'))
        or (fd.key='vida_plan' and upper(p.stage::text)='VIDA')
      )
  );
$function$;

comment on function aidme_private.participant_form_allowed(uuid) is
'Participant form RLS gate. Allows only the canonical participant-owned form for the participant current stage. SER participant self-check-in uses ser_checkins; ser_daily remains staff operational.';
