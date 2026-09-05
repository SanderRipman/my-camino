-- Canonicalize the VIDA-plan owner from the already assigned responsibility.
-- The plan remains editable as revisions, but the responsible VIDA owner is not free text.
-- This runs before generic payload validation so clients cannot persist an arbitrary owner label.

create or replace function aidme_private.canonicalize_vida_plan_owner()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  form_key text;
  owner_id uuid;
  owner_name text;
  active_pilot uuid;
begin
  if new.participant_id is null then
    return new;
  end if;

  select fd.key into form_key
  from public.form_versions fv
  join public.form_definitions fd on fd.id = fv.form_definition_id
  where fv.id = new.form_version_id;

  if form_key <> 'vida_plan' then
    return new;
  end if;

  select va.vida_owner_user_id into owner_id
  from public.via_assessments va
  where va.participant_id = new.participant_id
    and va.vida_owner_user_id is not null
  order by va.updated_at desc
  limit 1;

  if owner_id is null then
    raise exception 'NAMED_VIDA_OWNER_REQUIRED';
  end if;

  active_pilot := coalesce(new.pilot_id, aidme_private.participant_active_pilot(new.participant_id));

  select sp.full_name into owner_name
  from public.staff_profiles sp
  where sp.user_id = owner_id
    and sp.active = true
    and exists (
      select 1
      from public.role_grants rg
      where rg.user_id = owner_id
        and rg.organization_id = new.organization_id
        and rg.role_code = 'vida_owner'
        and rg.revoked_at is null
        and (rg.valid_from is null or rg.valid_from <= now())
        and (rg.valid_until is null or rg.valid_until > now())
        and (rg.participant_id is null or rg.participant_id = new.participant_id)
        and (rg.pilot_id is null or rg.pilot_id = active_pilot)
    )
  limit 1;

  if owner_name is null or btrim(owner_name) = '' then
    raise exception 'NAMED_VIDA_OWNER_REQUIRED';
  end if;

  new.payload := jsonb_set(
    coalesce(new.payload, '{}'::jsonb),
    '{vida_owner}',
    to_jsonb(owner_name),
    true
  );

  return new;
end
$function$;

drop trigger if exists trg_form_submission_04_canonical_vida_owner on public.form_submissions;
create trigger trg_form_submission_04_canonical_vida_owner
before insert or update of payload, status, form_version_id
on public.form_submissions
for each row
execute function aidme_private.canonicalize_vida_plan_owner();
