-- AidMe VIDA: individual GO/NO-GO -> participant communication -> agreement -> pilot gate.
-- Keeps the formal decision staff-only while materialising the participant-safe next step.

create or replace function aidme_private.individual_go_participant_summary_gate()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  form_key text;
begin
  if new.status <> 'SUBMITTED' or (tg_op = 'UPDATE' and old.status = 'SUBMITTED') then
    return new;
  end if;

  select fd.key into form_key
  from public.form_versions fv
  join public.form_definitions fd on fd.id = fv.form_definition_id
  where fv.id = new.form_version_id;

  if form_key = 'individual_go_no_go'
     and nullif(btrim(coalesce(new.payload->>'participant_summary','')), '') is null then
    raise exception 'INDIVIDUAL_GO_REQUIRES_PARTICIPANT_SUMMARY';
  end if;

  return new;
end
$$;

drop trigger if exists trg_individual_go_participant_summary_gate on public.form_submissions;
create trigger trg_individual_go_participant_summary_gate
before insert or update on public.form_submissions
for each row execute function aidme_private.individual_go_participant_summary_gate();

create or replace function aidme_private.pilot_go_participant_agreement_gate()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  form_key text;
  pilot_decision text;
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

drop trigger if exists trg_pilot_go_participant_agreement_gate on public.form_submissions;
create trigger trg_pilot_go_participant_agreement_gate
before insert or update on public.form_submissions
for each row execute function aidme_private.pilot_go_participant_agreement_gate();

create or replace function aidme_private.go_decision_workflow()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  old_stage public.aidme_stage;
  new_stage public.aidme_stage;
  assignee uuid;
  participant_user uuid;
  participant_text text;
  staff_text text;
begin
  select p.stage, p.user_id
    into old_stage, participant_user
  from public.participants p
  where p.id = new.participant_id
  for update;

  new_stage := case new.decision
    when 'GO' then 'GO'::public.aidme_stage
    when 'GO_WITH_CONDITIONS' then 'GO_WITH_CONDITIONS'::public.aidme_stage
    when 'POSTPONE' then 'POSTPONED'::public.aidme_stage
    else 'NO_GO'::public.aidme_stage
  end;

  participant_text := nullif(btrim(coalesce(new.participant_summary,'')), '');
  if participant_text is null then
    raise exception 'INDIVIDUAL_GO_REQUIRES_PARTICIPANT_SUMMARY';
  end if;
  staff_text := nullif(btrim(coalesce(new.conditions,'')), '');

  update public.participants
  set stage = new_stage, updated_at = now()
  where id = new.participant_id;

  -- The decision closes the review that led to it, and supersedes any previous
  -- unresolved decision-specific handoff before the new version is materialised.
  update public.tasks
  set status = 'DONE', updated_at = now()
  where participant_id = new.participant_id
    and workflow_key in (
      'via_go_review',
      'go_conditions',
      'go_postponed_review',
      'no_go_followup',
      'participant_agreement_ack',
      'participant_go_postponed',
      'participant_no_go_path'
    )
    and status in ('OPEN','IN_PROGRESS','WAITING');

  insert into public.workflow_events(
    organization_id, participant_id, actor_user_id,
    event_type, from_stage, to_stage, source_type, source_id, metadata
  ) values (
    new.organization_id,
    new.participant_id,
    new.decision_owner,
    'GO_DECISION',
    old_stage,
    new_stage,
    'go_no_go_decision',
    new.id::text,
    jsonb_build_object(
      'decision', new.decision,
      'decision_version', new.decision_version,
      'participant_handoff', true
    )
  );

  assignee := aidme_private.pick_role_user(
    new.organization_id,
    new.participant_id,
    null,
    array['via_owner','program_lead']
  );

  if new.decision = 'GO_WITH_CONDITIONS' then
    perform aidme_private.enqueue_workflow_task(
      new.organization_id,
      new.participant_id,
      null,
      'go_conditions',
      'GO med vilkår – lukk avklaringer',
      coalesce('Lukk navngitte vilkår før samlet Pilot-GO. ' || staff_text,
               'Lukk navngitte vilkår før samlet Pilot-GO. GO er ikke det samme som oppstart.'),
      coalesce(assignee,new.decision_owner),
      now()+interval '3 days',
      2,
      'YELLOW',
      'STAFF',
      'go_no_go_decision',
      new.id::text
    );
  elsif new.decision = 'POSTPONE' then
    perform aidme_private.enqueue_workflow_task(
      new.organization_id,
      new.participant_id,
      null,
      'go_postponed_review',
      'VÍA – ny vurdering etter utsettelse',
      coalesce('Avtal tidspunkt og eier for ny vurdering. ' || staff_text,
               'Avtal tidspunkt og eier for ny vurdering. Utsettelse er ikke avslag.'),
      coalesce(assignee,new.decision_owner),
      now()+interval '7 days',
      3,
      'YELLOW',
      'STAFF',
      'go_no_go_decision',
      new.id::text
    );
  elsif new.decision = 'NO_GO_NOW' then
    perform aidme_private.enqueue_workflow_task(
      new.organization_id,
      new.participant_id,
      null,
      'no_go_followup',
      'VÍA – trygg viderevei etter NO-GO nå',
      coalesce('Avklar og dokumenter trygg viderevei / annen egnet oppfølging. ' || staff_text,
               'Avklar og dokumenter trygg viderevei / annen egnet oppfølging. NO-GO nå er ikke en permanent dom.'),
      coalesce(assignee,new.decision_owner),
      now()+interval '3 days',
      2,
      'YELLOW',
      'STAFF',
      'go_no_go_decision',
      new.id::text
    );
  end if;

  -- Participant-facing materialisation uses only participant_summary, never
  -- internal rationale/conditions. The task itself is the safe next-action surface.
  if participant_user is not null then
    if new.decision in ('GO','GO_WITH_CONDITIONS') then
      perform aidme_private.enqueue_workflow_task(
        new.organization_id,
        new.participant_id,
        null,
        'participant_agreement_ack',
        case new.decision
          when 'GO' then 'Min VÍA – bekreft avtale og neste rammer'
          else 'Min VÍA – avtale og vilkår før neste gate'
        end,
        participant_text,
        participant_user,
        now()+interval '3 days',
        3,
        case new.decision when 'GO' then 'GREEN'::public.aidme_rag else 'YELLOW'::public.aidme_rag end,
        'PARTICIPANT',
        'go_no_go_decision',
        new.id::text
      );
    elsif new.decision = 'POSTPONE' then
      perform aidme_private.enqueue_workflow_task(
        new.organization_id,
        new.participant_id,
        null,
        'participant_go_postponed',
        'Min VÍA – dette skjer videre etter utsettelse',
        participant_text,
        participant_user,
        now()+interval '7 days',
        3,
        'YELLOW',
        'PARTICIPANT',
        'go_no_go_decision',
        new.id::text
      );
    else
      perform aidme_private.enqueue_workflow_task(
        new.organization_id,
        new.participant_id,
        null,
        'participant_no_go_path',
        'Min VÍA – trygg viderevei akkurat nå',
        participant_text,
        participant_user,
        now()+interval '7 days',
        3,
        'YELLOW',
        'PARTICIPANT',
        'go_no_go_decision',
        new.id::text
      );
    end if;
  end if;

  return new;
end
$$;
