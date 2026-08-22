-- AidMe VIDA: close the participant's initial VÍA-start task when the canonical
-- VÍA roadmap is submitted, while preserving the existing staff review handoff.
-- The formal individual GO/NO-GO remains a separate later gate.

create or replace function aidme_private.form_submission_workflow()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  k text;
  assignee uuid;
  vida_owner uuid;
begin
  if new.status <> 'SUBMITTED' or (tg_op = 'UPDATE' and old.status = 'SUBMITTED') then
    return new;
  end if;

  select fd.key into k
  from public.form_versions fv
  join public.form_definitions fd on fd.id = fv.form_definition_id
  where fv.id = new.form_version_id;

  insert into public.workflow_events(
    organization_id, participant_id, pilot_id, actor_user_id,
    event_type, source_type, source_id, metadata
  ) values (
    new.organization_id, new.participant_id, new.pilot_id, new.submitted_by,
    'FORM_SUBMITTED', 'form_submission', new.id::text,
    jsonb_build_object('form_key', k, 'form_version_id', new.form_version_id)
  );

  if new.participant_id is not null and k = 'via_roadmap' then
    -- The participant has completed the first VÍA action. Do not leave the
    -- account-start task open after the actual roadmap is delivered.
    update public.tasks
    set status = 'DONE', updated_at = now()
    where participant_id = new.participant_id
      and workflow_key = 'participant_via_start'
      and audience = 'PARTICIPANT'
      and status in ('OPEN','IN_PROGRESS','WAITING');

    insert into public.workflow_events(
      organization_id, participant_id, pilot_id, actor_user_id,
      event_type, source_type, source_id, metadata
    ) values (
      new.organization_id, new.participant_id, new.pilot_id, new.submitted_by,
      'PARTICIPANT_VIA_ROADMAP_COMPLETED', 'form_submission', new.id::text,
      jsonb_build_object('next_gate', 'VIA_REVIEW', 'formal_go_no_go', false)
    );
  end if;

  if new.participant_id is not null and k in ('interest_referral','via_roadmap','participant_agreement') then
    assignee := aidme_private.pick_role_user(
      new.organization_id, new.participant_id, new.pilot_id,
      array['via_owner','program_lead']
    );

    perform aidme_private.enqueue_workflow_task(
      new.organization_id,
      new.participant_id,
      new.pilot_id,
      case k
        when 'interest_referral' then 'via_interest_review'
        when 'via_roadmap' then 'via_go_review'
        else 'via_agreement_review'
      end,
      case k
        when 'interest_referral' then 'VÍA – vurder interesse og neste steg'
        when 'via_roadmap' then 'VÍA – vurder veikart før GO/NO-GO'
        else 'VÍA – kontroller avtale og beredskap'
      end,
      case k
        when 'interest_referral' then 'Avklar om riktig neste steg er VÍA-samtale, mer praktisk informasjon, annen tjeneste eller avslutning.'
        when 'via_roadmap' then 'Kontroller retning, ressurser, støtte, beredskap og navngitt VIDA-eier før formell beslutning.'
        else 'Kontroller at praktiske rammer, kontaktvalg og nødvendig informasjon er avklart.'
      end,
      assignee,
      now() + interval '1 day',
      2,
      'YELLOW',
      'STAFF',
      'form_submission',
      new.id::text
    );

  elsif new.participant_id is not null and k = 'vida_plan' then
    select va.vida_owner_user_id into vida_owner
    from public.via_assessments va
    where va.participant_id = new.participant_id
    order by va.updated_at desc
    limit 1;

    if vida_owner is null then
      vida_owner := aidme_private.pick_role_user(
        new.organization_id, new.participant_id, new.pilot_id,
        array['vida_owner','program_lead']
      );
    end if;

    perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_72h','VIDA – 72 timers bro','Bekreft første konkrete handling hjemme og neste kontakt.',vida_owner,now()+interval '72 hours',2,'YELLOW','STAFF','form_submission',new.id::text);
    perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_14d','VIDA – 14 dagers oppfølging','Følg opp handling, hverdagsstruktur og nødvendig støtte uten å gjøre planen til journal.',vida_owner,now()+interval '14 days',3,'GREEN','STAFF','form_submission',new.id::text);
    perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_30d','VIDA – 30 dagers oppfølging','Vurder fremdrift og om planen trenger justering.',vida_owner,now()+interval '30 days',3,'GREEN','STAFF','form_submission',new.id::text);
    perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_90d','VIDA – 90 dagers oppfølging / ny VÍA','Oppsummer hva som virker og om neste naturlige retning er en ny VÍA.',vida_owner,now()+interval '90 days',3,'GREEN','STAFF','form_submission',new.id::text);
  end if;

  return new;
end
$function$;
