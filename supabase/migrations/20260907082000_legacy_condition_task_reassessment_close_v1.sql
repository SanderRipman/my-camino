-- AidMe VIDA: legacy/demo GO_CONDITION tasks are superseded by a new formal GO/NO-GO decision.
-- Canonical current conditions continue through workflow_key='go_conditions'.

create or replace function aidme_private.close_legacy_go_condition_on_new_decision()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  update public.tasks
  set status = 'DONE', updated_at = now()
  where participant_id = new.participant_id
    and task_type = 'GO_CONDITION'
    and status in ('OPEN','IN_PROGRESS','WAITING');
  return new;
end
$$;

drop trigger if exists trg_close_legacy_go_condition_on_new_decision on public.go_no_go_decisions;
create trigger trg_close_legacy_go_condition_on_new_decision
after insert on public.go_no_go_decisions
for each row execute function aidme_private.close_legacy_go_condition_on_new_decision();