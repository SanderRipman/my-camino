-- Keep Git source aligned with the verified Supabase runtime state used by physical QA on 2026-09-03.
-- Scope: synthetic DEMO Pilot-GO may exercise the gate itself without production journey prerequisites
-- or operational SER handoff, while production pilots keep the existing prerequisites.
-- Also fixes the PL/pgSQL record/table alias collision that previously produced:
--   record "p" is not assigned yet

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

  select pil.status::text into pilot_status
  from public.pilots pil
  where pil.id = new.pilot_id;

  if pilot_status is null then
    raise exception 'PILOT_GO_REQUIRES_PILOT';
  end if;

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

create or replace function aidme_private.form_submission_formal_gate()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  k text;
  d text;
  v integer;
  unresolved integer;
  participant_row record;
  cond text;
  pilot_status text;
begin
  if new.status<>'SUBMITTED' or (tg_op='UPDATE' and old.status='SUBMITTED') then return new; end if;
  select fd.key into k from public.form_versions fv join public.form_definitions fd on fd.id=fv.form_definition_id where fv.id=new.form_version_id;

  if k='individual_go_no_go' then
    if new.participant_id is null then raise exception 'INDIVIDUAL_GO_REQUIRES_PARTICIPANT'; end if;
    d:=coalesce(new.payload->>'decision','');
    if d not in ('GO','GO_WITH_CONDITIONS','POSTPONE','NO_GO_NOW') then raise exception 'INVALID_INDIVIDUAL_GO_DECISION'; end if;
    cond:=nullif(btrim(coalesce(new.payload->>'conditions','')),'');
    if d='GO' and exists (
      select 1 from (values
        (new.payload->>'voluntary'),(new.payload->>'target_fit'),(new.payload->>'physical_ready'),
        (new.payload->>'operational_health'),(new.payload->>'travel_plan'),(new.payload->>'vida_owner_ready'),(new.payload->>'staffing_route')
      ) x(val) where val is distinct from 'YES'
    ) then raise exception 'GO_REQUIRES_ALL_GATES_YES'; end if;
    if d='GO_WITH_CONDITIONS' and ((new.payload->>'voluntary') is distinct from 'YES' or (new.payload->>'target_fit') is distinct from 'YES' or cond is null) then
      raise exception 'CONDITIONAL_GO_REQUIRES_CORE_FIT_AND_CONDITIONS';
    end if;
    select coalesce(max(g.decision_version),0)+1 into v from public.go_no_go_decisions g where g.participant_id=new.participant_id;
    insert into public.go_no_go_decisions(organization_id,participant_id,decision,decision_owner,internal_rationale,conditions,participant_summary,decision_version,decided_at)
    values(new.organization_id,new.participant_id,d::public.aidme_go_decision,new.submitted_by,null,cond,nullif(btrim(coalesce(new.payload->>'participant_summary','')),''),v,coalesce(new.submitted_at,now()));

  elsif k='pilot_go' then
    if new.pilot_id is null then raise exception 'PILOT_GO_REQUIRES_PILOT'; end if;
    select pil.status::text into pilot_status from public.pilots pil where pil.id=new.pilot_id;
    if pilot_status is null then raise exception 'PILOT_GO_REQUIRES_PILOT'; end if;

    d:=coalesce(new.payload->>'pilot_decision','');
    if d not in ('GO','GO_WITH_CONDITIONS','POSTPONE','NO_GO_NOW') then raise exception 'INVALID_PILOT_GO_DECISION'; end if;
    cond:=nullif(btrim(coalesce(new.payload->>'conditions','')),'');
    if d='GO' and exists (
      select 1 from (values
        (new.payload->>'participants_go'),(new.payload->>'staffing'),(new.payload->>'route_backup'),
        (new.payload->>'insurance_home'),(new.payload->>'vida_owners'),(new.payload->>'system_ready')
      ) x(val) where val is distinct from 'YES'
    ) then raise exception 'PILOT_GO_REQUIRES_ALL_GATES_YES'; end if;
    if d='GO_WITH_CONDITIONS' and cond is null then raise exception 'PILOT_CONDITIONAL_GO_REQUIRES_CONDITIONS'; end if;

    if d='GO' and pilot_status <> 'DEMO' then
      select count(*) into unresolved
      from public.pilot_participants pp
      join public.participants pa on pa.id=pp.participant_id
      where pp.pilot_id=new.pilot_id and pp.status='ACTIVE' and pa.active
        and (
          pa.stage not in ('GO','GO_WITH_CONDITIONS')
          or (pa.stage='GO_WITH_CONDITIONS' and exists (
            select 1 from public.tasks t where t.participant_id=pa.id and t.workflow_key='go_conditions' and t.status in ('OPEN','IN_PROGRESS','WAITING')
          ))
        );
      if unresolved>0 then raise exception 'PILOT_GO_REQUIRES_ALL_INDIVIDUAL_GATES_CLOSED'; end if;

      for participant_row in
        select pa.id
        from public.pilot_participants pp join public.participants pa on pa.id=pp.participant_id
        where pp.pilot_id=new.pilot_id and pp.status='ACTIVE' and pa.active
      loop
        if not exists (
          select 1 from public.via_assessments va where va.participant_id=participant_row.id and va.vida_owner_user_id is not null
        ) then raise exception 'PILOT_GO_REQUIRES_NAMED_VIDA_OWNER_FOR_ALL'; end if;
      end loop;
    end if;

    select coalesce(max(pg.decision_version),0)+1 into v from public.pilot_gate_decisions pg where pg.pilot_id=new.pilot_id;
    insert into public.pilot_gate_decisions(organization_id,pilot_id,decision,decision_owner,conditions,form_submission_id,decision_version,decided_at)
    values(new.organization_id,new.pilot_id,d::public.aidme_go_decision,new.submitted_by,cond,new.id,v,coalesce(new.submitted_at,now()));

    insert into public.workflow_events(organization_id,pilot_id,actor_user_id,event_type,source_type,source_id,metadata)
    values(new.organization_id,new.pilot_id,new.submitted_by,'PILOT_GO_DECISION','form_submission',new.id::text,jsonb_build_object('decision',d,'version',v,'demo',pilot_status='DEMO'));

    if d='GO_WITH_CONDITIONS' then
      perform aidme_private.enqueue_workflow_task(new.organization_id,null::uuid,new.pilot_id,'pilot_go_conditions','Pilot-GO med vilkår – lukk tiltak','Lukk navngitte tiltak før samlet GO og oppstart av SER.',new.submitted_by,now()+interval '3 days',1,'YELLOW','STAFF','form_submission',new.id::text);
    elsif d='GO' then
      update public.tasks set status='DONE',updated_at=now()
      where pilot_id=new.pilot_id and workflow_key='pilot_go_conditions' and status in ('OPEN','IN_PROGRESS','WAITING');
    end if;
  end if;
  return new;
end
$$;

create or replace function aidme_private.pilot_go_ready_workflow()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  participant_row record;
  assignee uuid;
  pilot_status text;
begin
  select pil.status::text into pilot_status from public.pilots pil where pil.id=new.pilot_id;
  if pilot_status='DEMO' then
    return new;
  end if;

  update public.tasks
  set status = 'DONE', updated_at = now()
  where pilot_id = new.pilot_id
    and workflow_key = 'ser_start_ready'
    and status in ('OPEN','IN_PROGRESS','WAITING');

  if new.decision <> 'GO' then
    return new;
  end if;

  for participant_row in
    select pa.id
    from public.pilot_participants pp
    join public.participants pa on pa.id = pp.participant_id
    where pp.pilot_id = new.pilot_id
      and pp.status = 'ACTIVE'
      and pa.active
      and pa.stage in ('GO','GO_WITH_CONDITIONS')
  loop
    assignee := aidme_private.pick_role_user(
      new.organization_id,
      participant_row.id,
      new.pilot_id,
      array['program_lead','via_owner']
    );

    perform aidme_private.enqueue_workflow_task(
      new.organization_id,
      participant_row.id,
      new.pilot_id,
      'ser_start_ready',
      'SER – klar for siste oppstartskontroll',
      'Samlet Pilot-GO er registrert. Kontroller at deltakeravtale, navngitt VIDA-eier og eventuelle vilkår fortsatt er lukket, og start deretter SER via deltakerens neste gate.',
      assignee,
      now()+interval '1 day',
      3,
      'GREEN',
      'STAFF',
      'pilot_gate_decision',
      new.id::text
    );
  end loop;

  return new;
end
$$;
