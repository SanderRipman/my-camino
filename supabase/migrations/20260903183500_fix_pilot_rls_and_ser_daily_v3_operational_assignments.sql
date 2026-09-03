create or replace function aidme_private.current_user_owns_pilot(p_pilot uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pilot_participants pp
    join public.participants pa on pa.id = pp.participant_id
    where pp.pilot_id = p_pilot
      and pp.status = 'ACTIVE'
      and pa.user_id = auth.uid()
      and pa.active = true
  );
$$;

create or replace function aidme_private.can_read_pilot_participant(p_pilot uuid, p_participant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pilots p
    where p.id = p_pilot
      and aidme_private.has_capability(p.organization_id, p_participant, p_pilot, 'view_participant_core')
  );
$$;

drop policy if exists pilots_read_scoped on public.pilots;
create policy pilots_read_scoped
on public.pilots
for select
to authenticated
using (
  aidme_private.has_capability(organization_id, null::uuid, id, 'view_participant_core')
  or aidme_private.current_user_owns_pilot(id)
);

drop policy if exists pilot_participants_read on public.pilot_participants;
create policy pilot_participants_read
on public.pilot_participants
for select
to authenticated
using (
  aidme_private.is_own_participant(participant_id)
  or aidme_private.can_read_pilot_participant(pilot_id, participant_id)
);

create or replace function aidme_private.is_eligible_ser_operational_staff(
  p_org uuid,
  p_pilot uuid,
  p_user uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    join public.role_grants rg on rg.user_id = sp.user_id
    where sp.user_id = p_user
      and sp.organization_id = p_org
      and sp.active = true
      and rg.organization_id = p_org
      and rg.participant_id is null
      and (rg.pilot_id is null or rg.pilot_id = p_pilot)
      and rg.revoked_at is null
      and (rg.valid_from is null or rg.valid_from <= now())
      and (rg.valid_until is null or rg.valid_until > now())
      and exists (
        select 1 from public.role_permissions rp
        where rp.role_code = rg.role_code and rp.capability = 'respond_sos'
      )
      and exists (
        select 1 from public.role_permissions rp
        where rp.role_code = rg.role_code and rp.capability in ('view_operational_min','view_ser','edit_ser','edit_logistics')
      )
  );
$$;

create or replace function public.eligible_ser_operational_staff(p_pilot_id uuid)
returns table(user_id uuid, full_name text, job_title text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct sp.user_id, sp.full_name, sp.job_title
  from public.pilots p
  join public.staff_profiles sp on sp.organization_id = p.organization_id and sp.active = true
  where p.id = p_pilot_id
    and (
      aidme_private.has_capability(p.organization_id, null::uuid, p_pilot_id, 'view_ser')
      or aidme_private.has_capability(p.organization_id, null::uuid, p_pilot_id, 'view_operational_min')
      or aidme_private.has_capability(p.organization_id, null::uuid, p_pilot_id, 'edit_ser')
    )
    and aidme_private.is_eligible_ser_operational_staff(p.organization_id, p_pilot_id, sp.user_id)
  order by sp.full_name nulls last, sp.user_id;
$$;

revoke all on function public.eligible_ser_operational_staff(uuid) from public;
grant execute on function public.eligible_ser_operational_staff(uuid) to authenticated;

create or replace function aidme_private.staff_form_allowed_v2(p_org uuid, p_participant uuid, p_pilot uuid, p_form_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public', 'pg_temp'
as $$
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
        when 'vida_plan' then aidme_private.has_capability(p_org,p_participant,p_pilot,'edit_vida')
        when 'pilot_evaluation' then aidme_private.has_capability(p_org,p_participant,p_pilot,'manage_program')
        else false
      end
    from public.form_versions fv
    join public.form_definitions fd on fd.id=fv.form_definition_id
    where fv.id=p_form_version_id
      and fv.published_at is not null
      and (fv.retired_at is null or fv.retired_at>now())
  ),false);
$$;

create or replace function aidme_private.validate_ser_daily_operational_staff()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  form_key text;
  staff_key text;
  staff_value text;
  staff_uuid uuid;
begin
  select fd.key into form_key
  from public.form_versions fv
  join public.form_definitions fd on fd.id = fv.form_definition_id
  where fv.id = new.form_version_id;

  if form_key <> 'ser_daily' then return new; end if;
  if new.pilot_id is null then raise exception 'SER_PILOT_REQUIRED'; end if;

  foreach staff_key in array array['front_anchor_user_id','rear_anchor_user_id','rover_user_id'] loop
    staff_value := nullif(btrim(coalesce(new.payload->>staff_key,'')), '');
    if staff_value is null then
      if new.status = 'SUBMITTED' then raise exception 'SER_OPERATIONAL_STAFF_REQUIRED:%', staff_key; end if;
      continue;
    end if;
    begin
      staff_uuid := staff_value::uuid;
    exception when invalid_text_representation then
      raise exception 'SER_OPERATIONAL_STAFF_INVALID:%', staff_key;
    end;
    if not aidme_private.is_eligible_ser_operational_staff(new.organization_id, new.pilot_id, staff_uuid) then
      raise exception 'SER_OPERATIONAL_STAFF_NOT_ELIGIBLE:%', staff_key;
    end if;
  end loop;

  if new.payload ? 'followup_needed' and coalesce(new.payload->>'followup_needed','') not in ('YES','NO') then
    raise exception 'SER_FOLLOWUP_SELECTION_INVALID';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_ser_daily_operational_staff on public.form_submissions;
create trigger validate_ser_daily_operational_staff
before insert or update on public.form_submissions
for each row execute function aidme_private.validate_ser_daily_operational_staff();

do $$
declare
  def_id uuid;
  current_v int;
begin
  select id into def_id from public.form_definitions where key='ser_daily';
  if def_id is null then raise exception 'ser_daily definition missing'; end if;
  update public.form_versions set retired_at = now() where form_definition_id = def_id and retired_at is null;
  select coalesce(max(version),0)+1 into current_v from public.form_versions where form_definition_id=def_id;
  insert into public.form_versions(form_definition_id,version,schema_json,published_at)
  values (
    def_id,
    current_v,
    jsonb_build_object(
      'phase','SER','audience','staff',
      'intro','Teamets korte operative SER-logg. Deltakerens egen innsjekk er et separat read-only signal og skal ikke dobbeltføres. Operative roller velges kun blant godkjent pilotpersonell.',
      'sections',jsonb_build_array(jsonb_build_object(
        'title','Operativt dagsbilde',
        'fields',jsonb_build_array(
          jsonb_build_object('key','observed_facts','type','textarea','label','Kort operativt dagsbilde / observerbare fakta','required',true),
          jsonb_build_object('key','route_rag','type','select','label','Dagens operative status','required',true,'options',jsonb_build_array('GREEN','YELLOW','RED')),
          jsonb_build_object('key','front_anchor_user_id','type','staff_select','label','Frontanker','required',true,'help','Velg blant godkjent operativt personell for denne piloten.'),
          jsonb_build_object('key','rear_anchor_user_id','type','staff_select','label','Bakanker / sweep','required',true,'help','Velg blant godkjent operativt personell for denne piloten.'),
          jsonb_build_object('key','rover_user_id','type','staff_select','label','Rover / relasjonsressurs','required',true,'help','Velg blant godkjent operativt personell for denne piloten.'),
          jsonb_build_object('key','adaptations','type','textarea','label','Tiltak / tilpasninger'),
          jsonb_build_object('key','followup_needed','type','yes_no','label','Trenger oppfølging / 1:1','required',true)
        )
      ))
    ),
    now()
  );
end $$;