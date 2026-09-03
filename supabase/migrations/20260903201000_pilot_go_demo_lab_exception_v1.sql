-- AidMe VIDA QA lab exception for final Pilot-GO.
-- DEMO · Camino Português is intentionally a mixed-stage synthetic UI/role lab.
-- Production pilots MUST still require participant agreement, closed agreement tasks
-- and explicit consent before a final GO can be submitted.

create or replace function aidme_private.pilot_go_participant_agreement_gate()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  form_key text;
  pilot_decision text;
  pilot_status text;
  agreement_definition uuid;
  active_consent uuid;
  participant_row record;
begin
  if new.status <> 'SUBMITTED' or (tg_op = 'UPDATE' and old.status = 'SUBMITTED') then
    return new;
  end if;

  select fd.key into form_key
  from public.form_versions fv
  join public.form_definitions fd on fd.id = fv.form_definition_id
  where fv.id = new.form_version_id;

  if form_key <> 'pilot_go' or new.pilot_id is null then
    return new;
  end if;

  pilot_decision := coalesce(new.payload->>'pilot_decision','');
  if pilot_decision <> 'GO' then
    return new;
  end if;

  select p.status::text into pilot_status
  from public.pilots p
  where p.id = new.pilot_id;

  if pilot_status is null then
    raise exception 'PILOT_GO_REQUIRES_PILOT';
  end if;

  -- Explicit synthetic-lab exception only. Never extend this to normal pilot states.
  if pilot_status = 'DEMO' then
    return new;
  end if;

  select fd.id into agreement_definition
  from public.form_definitions fd
  where fd.key = 'participant_agreement'
  limit 1;
  if agreement_definition is null then
    raise exception 'PARTICIPANT_AGREEMENT_FORM_REQUIRED';
  end if;

  select cv.id into active_consent
  from public.consent_versions cv
  where cv.key = 'participant_program_agreement'
    and cv.effective_from <= coalesce(new.submitted_at, now())
    and (cv.retired_at is null or cv.retired_at > coalesce(new.submitted_at, now()))
  order by cv.version desc
  limit 1;
  if active_consent is null then
    raise exception 'ACTIVE_PARTICIPANT_AGREEMENT_VERSION_REQUIRED';
  end if;

  for participant_row in
    select pa.id, pa.user_id
    from public.pilot_participants pp
    join public.participants pa on pa.id = pp.participant_id
    where pp.pilot_id = new.pilot_id
      and pp.status = 'ACTIVE'
      and pa.active
  loop
    if not exists (
      select 1
      from public.form_submissions fs
      join public.form_versions fv on fv.id = fs.form_version_id
      where fs.participant_id = participant_row.id
        and fs.status = 'SUBMITTED'
        and fv.form_definition_id = agreement_definition
    ) then
      raise exception 'PILOT_GO_REQUIRES_PARTICIPANT_AGREEMENT';
    end if;

    if exists (
      select 1 from public.tasks t
      where t.participant_id = participant_row.id
        and t.workflow_key in ('participant_agreement_ack','participant_agreement_identity','via_agreement_review')
        and t.status in ('OPEN','IN_PROGRESS','WAITING')
    ) then
      raise exception 'PILOT_GO_REQUIRES_AGREEMENT_TASKS_CLOSED';
    end if;

    if participant_row.user_id is not null and not exists (
      select 1 from public.consent_events ce
      where ce.participant_id = participant_row.id
        and ce.consent_version_id = active_consent
        and ce.decision = 'GRANTED'
    ) then
      raise exception 'PILOT_GO_REQUIRES_PARTICIPANT_CONSENT';
    end if;
  end loop;

  return new;
end
$$;
