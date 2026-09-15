-- AidMe VIDA: controlled SER -> VIDA preparation bridge.
-- Purpose: let participant/SER/VIDA owner capture a few concrete homeward intentions
-- near the end of SER without starting the formal VIDA stage early.
-- The formal VIDA plan remains stage-gated to participants already in VIDA.

insert into public.form_definitions(key,title_no,title_en,scope)
values ('vida_transition_prep','VIDA-forberedelse før hjemkomst','VIDA preparation before homecoming','participant_staff')
on conflict (key) do update
set title_no=excluded.title_no,
    title_en=excluded.title_en,
    scope=excluded.scope;

do $$
declare
  def_id uuid;
  next_version int;
begin
  select id into def_id from public.form_definitions where key='vida_transition_prep';
  if def_id is null then raise exception 'vida_transition_prep definition missing'; end if;

  if not exists (
    select 1 from public.form_versions
    where form_definition_id=def_id
      and retired_at is null
      and published_at is not null
  ) then
    select coalesce(max(version),0)+1 into next_version
    from public.form_versions where form_definition_id=def_id;

    insert into public.form_versions(form_definition_id,version,schema_json,published_at)
    values (
      def_id,
      next_version,
      jsonb_build_object(
        'phase','SER',
        'audience','participant_staff',
        'intro','Et lite bro-notat mot hjemkomsten. Dette starter ikke VIDA og er ikke en ferdig etterplan. Fang bare det deltakeren faktisk vil prøve når SER avsluttes.',
        'sections',jsonb_build_array(
          jsonb_build_object(
            'title','Ta med erfaringen hjem',
            'fields',jsonb_build_array(
              jsonb_build_object(
                'key','take_home',
                'type','textarea',
                'label','Hva vil du særlig ta med deg hjem fra denne erfaringen?',
                'help','Kort og konkret. Ingen krav om personlig deling eller forklaring av private forhold.'
              ),
              jsonb_build_object(
                'key','first_home_action',
                'type','action',
                'label','Første konkrete handling hjemme',
                'required',true,
                'help','Velg ett lite steg som kan prøves tidlig etter hjemkomst. Det kan justeres i den levende VIDA-planen.'
              ),
              jsonb_build_object(
                'key','make_it_easier',
                'type','textarea',
                'label','Hva kan gjøre første steg lettere?',
                'help','For eksempel støtte, avtale, rytme eller praktisk tilrettelegging.'
              ),
              jsonb_build_object(
                'key','share_with_vida_owner',
                'type','textarea',
                'label','Hva er viktig at VIDA-eier vet for å støtte første steg?',
                'help','Bare nødvendig handoff-informasjon. Ikke bruk feltet som helsejournal eller full SER-logg.'
              ),
              jsonb_build_object(
                'key','preferred_first_contact',
                'type','datetime',
                'label','Ønsket første kontakt etter hjemkomst'
              )
            )
          )
        )
      ),
      now()
    );
  end if;
end $$;

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
        or (fd.key='vida_transition_prep' and upper(p.stage::text)='SER')
        or (fd.key='vida_plan' and upper(p.stage::text)='VIDA')
      )
  );
$function$;

comment on function aidme_private.participant_form_allowed(uuid) is
'Participant form RLS gate. Late-SER VIDA preparation is allowed only through vida_transition_prep; the formal vida_plan remains VIDA-stage only.';

create or replace function aidme_private.staff_form_allowed_v2(p_org uuid, p_participant uuid, p_pilot uuid, p_form_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public', 'pg_temp'
as $function$
  select coalesce((
    select
      (p_participant is null or p_pilot is null or exists (
        select 1 from public.pilot_participants pp
        where pp.participant_id = p_participant
          and pp.pilot_id = p_pilot
          and pp.status = 'ACTIVE'
      ))
      and case fd.key
        when 'info_before_via' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
        when 'interest_referral' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via') or aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_tasks')
        when 'via_roadmap' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
        when 'individual_go_no_go' then aidme_private.has_capability(p_org,p_participant,p_pilot,'decide_go')
        when 'participant_agreement' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_via')
        when 'pilot_go' then aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_program') or aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_tasks') or aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_logistics')
        when 'ser_daily' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_ser')
        when 'incident' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_incidents')
        when 'vida_transition_prep' then
          p_participant is not null
          and exists (select 1 from public.participants p where p.id=p_participant and p.active=true and upper(p.stage::text)='SER')
          and (
            aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_ser')
            or aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_vida')
          )
        when 'vida_plan' then
          p_participant is not null
          and exists (select 1 from public.participants p where p.id=p_participant and p.active=true and upper(p.stage::text)='VIDA')
          and aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_vida')
        when 'pilot_evaluation' then aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_program')
        else false
      end
    from public.form_versions fv
    join public.form_definitions fd on fd.id=fv.form_definition_id
    where fv.id=p_form_version_id
      and fv.published_at is not null
      and (fv.retired_at is null or fv.retired_at>now())
  ),false);
$function$;

comment on function aidme_private.staff_form_allowed_v2(uuid,uuid,uuid,uuid) is
'Least-privilege form authorization. vida_transition_prep is a SER-only bridge editable by scoped SER/VIDA owners; formal vida_plan is writable only after the participant is in VIDA.';
