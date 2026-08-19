drop policy if exists crm_contacts_owner_select on public.crm_contacts;
drop policy if exists crm_contacts_owner_insert on public.crm_contacts;
drop policy if exists crm_contacts_owner_update on public.crm_contacts;

create policy crm_contacts_owner_select
on public.crm_contacts for select
to authenticated
using (
  coalesce(((select auth.jwt())->>'aal') = 'aal2', false)
  and owner_user_id = (select auth.uid())
  and exists (
    select 1 from public.role_grants rg
    where rg.user_id = (select auth.uid())
      and rg.organization_id = crm_contacts.organization_id
      and rg.role_code = 'project_owner'
      and rg.revoked_at is null
      and rg.valid_from <= now()
      and (rg.valid_until is null or rg.valid_until > now())
  )
);

create policy crm_contacts_owner_insert
on public.crm_contacts for insert
to authenticated
with check (
  coalesce(((select auth.jwt())->>'aal') = 'aal2', false)
  and owner_user_id = (select auth.uid())
  and exists (
    select 1 from public.role_grants rg
    where rg.user_id = (select auth.uid())
      and rg.organization_id = crm_contacts.organization_id
      and rg.role_code = 'project_owner'
      and rg.revoked_at is null
      and rg.valid_from <= now()
      and (rg.valid_until is null or rg.valid_until > now())
  )
);

create policy crm_contacts_owner_update
on public.crm_contacts for update
to authenticated
using (
  coalesce(((select auth.jwt())->>'aal') = 'aal2', false)
  and owner_user_id = (select auth.uid())
  and exists (
    select 1 from public.role_grants rg
    where rg.user_id = (select auth.uid())
      and rg.organization_id = crm_contacts.organization_id
      and rg.role_code = 'project_owner'
      and rg.revoked_at is null
      and rg.valid_from <= now()
      and (rg.valid_until is null or rg.valid_until > now())
  )
)
with check (
  coalesce(((select auth.jwt())->>'aal') = 'aal2', false)
  and owner_user_id = (select auth.uid())
  and exists (
    select 1 from public.role_grants rg
    where rg.user_id = (select auth.uid())
      and rg.organization_id = crm_contacts.organization_id
      and rg.role_code = 'project_owner'
      and rg.revoked_at is null
      and rg.valid_from <= now()
      and (rg.valid_until is null or rg.valid_until > now())
  )
);
