-- AidMe VIDA: a final Pilot-GO must materialise the next staff action.
-- START_SER remains server-gated; this task is a handoff, not permission.

create or replace function aidme_private.pilot_go_ready_workflow()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  participant_row record;
  assignee uuid;
begin
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

drop trigger if exists trg_pilot_go_ready_workflow on public.pilot_gate_decisions;
create trigger trg_pilot_go_ready_workflow
after insert on public.pilot_gate_decisions
for each row execute function aidme_private.pilot_go_ready_workflow();
