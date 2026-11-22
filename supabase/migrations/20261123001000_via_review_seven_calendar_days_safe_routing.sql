-- UAT3X / Issue #239. Review before deploying to shared Supabase.
-- One function change only: future VÍA submissions get seven days from submitted_at
-- and route only to active, scoped edit_via staff (or remain UNASSIGNED).
-- Other form types and existing tasks, including Mina-UAT-01, are unchanged.
-- No backfill, no GO/NO-GO, no role changes, no MFA changes.
DO $baseline$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO definition
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='aidme_private' AND p.proname='form_submission_workflow';
  IF definition IS NULL
     OR position('array[''via_owner'',''program_lead'']' IN definition)=0
     OR position('now() + interval ''1 day''' IN definition)=0
  THEN RAISE EXCEPTION 'UAT3X baseline changed; review manually, do not overwrite';
  END IF;
END $baseline$;

CREATE OR REPLACE FUNCTION aidme_private.form_submission_workflow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    -- Future submitted VÍA roadmaps must be routed only to an active,
    -- scoped staff member with edit_via. An unfilled queue is safer than
    -- silently assigning sensitive review to a program_lead.
    if k = 'via_roadmap' then
      select rg.user_id into assignee
      from public.role_grants rg
      join public.staff_profiles sp on sp.user_id = rg.user_id and sp.active = true
      join public.role_permissions rp on rp.role_code = rg.role_code and rp.capability = 'edit_via'
      where rg.organization_id = new.organization_id
        and rg.role_code in ('via_owner','clinical_professional')
        and rg.revoked_at is null
        and (rg.valid_from is null or rg.valid_from <= now())
        and (rg.valid_until is null or rg.valid_until > now())
        and (rg.participant_id is null or rg.participant_id = new.participant_id)
        and (rg.pilot_id is null or rg.pilot_id = new.pilot_id)
      order by array_position(array['via_owner','clinical_professional'],rg.role_code),rg.created_at desc
      limit 1;
    else
      assignee := aidme_private.pick_role_user(
        new.organization_id, new.participant_id, new.pilot_id,
        array['via_owner','program_lead']
      );
    end if;

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
      case when k = 'via_roadmap'
        then coalesce(new.submitted_at, now()) + interval '7 days'
        else now() + interval '1 day'
      end,
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

    if not exists (
      select 1 from public.tasks t
      where t.organization_id = new.organization_id
        and t.participant_id = new.participant_id
        and t.pilot_id is not distinct from new.pilot_id
        and t.workflow_key = 'vida_72h'
    ) then
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_72h','VIDA – 72 timers bro','Bekreft første konkrete handling hjemme og neste kontakt.',vida_owner,now()+interval '72 hours',2,'YELLOW','STAFF','form_submission',new.id::text);
    end if;

    if not exists (
      select 1 from public.tasks t
      where t.organization_id = new.organization_id
        and t.participant_id = new.participant_id
        and t.pilot_id is not distinct from new.pilot_id
        and t.workflow_key = 'vida_14d'
    ) then
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_14d','VIDA – 14 dagers oppfølging','Følg opp handling, hverdagsstruktur og nødvendig støtte uten å gjøre planen til journal.',vida_owner,now()+interval '14 days',3,'GREEN','STAFF','form_submission',new.id::text);
    end if;

    if not exists (
      select 1 from public.tasks t
      where t.organization_id = new.organization_id
        and t.participant_id = new.participant_id
        and t.pilot_id is not distinct from new.pilot_id
        and t.workflow_key = 'vida_30d'
    ) then
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_30d','VIDA – 30 dagers oppfølging','Vurder fremdrift og om planen trenger justering.',vida_owner,now()+interval '30 days',3,'GREEN','STAFF','form_submission',new.id::text);
    end if;

    if not exists (
      select 1 from public.tasks t
      where t.organization_id = new.organization_id
        and t.participant_id = new.participant_id
        and t.pilot_id is not distinct from new.pilot_id
        and t.workflow_key = 'vida_90d'
    ) then
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'vida_90d','VIDA – 90 dagers oppfølging / ny VÍA','Oppsummer hva som virker og om neste naturlige retning er en ny VÍA.',vida_owner,now()+interval '90 days',3,'GREEN','STAFF','form_submission',new.id::text);
    end if;
  end if;

  return new;
end
$function$
;
