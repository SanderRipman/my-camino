create or replace function aidme_private.guard_go_conditions_task_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest_decision public.aidme_go_decision;
begin
  if old.workflow_key = 'go_conditions'
     and new.status = 'DONE'
     and old.status is distinct from 'DONE' then
    if old.participant_id is null then
      raise exception 'GO_CONDITION_REQUIRES_REASSESSMENT';
    end if;

    select g.decision
      into latest_decision
      from public.go_no_go_decisions g
     where g.participant_id = old.participant_id
     order by g.decision_version desc, g.decided_at desc
     limit 1;

    if latest_decision is distinct from 'GO'::public.aidme_go_decision then
      raise exception 'GO_CONDITION_REQUIRES_REASSESSMENT';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists trg_guard_go_conditions_task_completion on public.tasks;
create trigger trg_guard_go_conditions_task_completion
before update of status on public.tasks
for each row
execute function aidme_private.guard_go_conditions_task_completion();
