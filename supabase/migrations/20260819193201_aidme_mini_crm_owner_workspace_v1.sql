create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 160),
  organization_name text check (organization_name is null or char_length(organization_name) <= 200),
  role_title text check (role_title is null or char_length(role_title) <= 160),
  email text check (email is null or char_length(email) <= 320),
  phone text check (phone is null or char_length(phone) <= 80),
  relationship_type text not null default 'NETWORK' check (relationship_type in ('PARTNER','FINANCIER','PROFESSIONAL','PUBLIC_SECTOR','NETWORK','MEDIA','SUPPLIER','OTHER')),
  status text not null default 'NEW' check (status in ('NEW','ACTIVE','WAITING','PAUSED','CLOSED')),
  priority integer not null default 3 check (priority between 1 and 5),
  next_follow_up_at timestamptz,
  last_contact_at timestamptz,
  note text check (note is null or char_length(note) <= 4000),
  source_type text not null default 'MANUAL' check (source_type in ('MANUAL','OUTLOOK_CANDIDATE','INTAKE','OTHER')),
  source_ref text check (source_ref is null or char_length(source_ref) <= 700),
  data_class text not null default 'BUSINESS_CONTACT' check (data_class = 'BUSINESS_CONTACT'),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.crm_contacts is 'AidMe Mini CRM: minimal professional relationship follow-up. Must not be used for participant health/safety/clinical data.';
comment on column public.crm_contacts.note is 'Short business follow-up note only; no participant health or safety content.';
comment on column public.crm_contacts.source_ref is 'Traceability pointer only; do not copy full email bodies into CRM.';

create index crm_contacts_owner_active_followup_idx on public.crm_contacts(owner_user_id, archived_at, next_follow_up_at);
create index crm_contacts_owner_status_idx on public.crm_contacts(owner_user_id, status, priority);
create index crm_contacts_email_lower_idx on public.crm_contacts(owner_user_id, lower(email)) where email is not null;

alter table public.crm_contacts enable row level security;

create policy crm_contacts_owner_select
on public.crm_contacts for select
to authenticated
using (
  owner_user_id = (select auth.uid())
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
  owner_user_id = (select auth.uid())
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
  owner_user_id = (select auth.uid())
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
  owner_user_id = (select auth.uid())
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

revoke all on public.crm_contacts from anon;
revoke delete on public.crm_contacts from authenticated;
grant select, insert, update on public.crm_contacts to authenticated;
grant all on public.crm_contacts to service_role;

create trigger crm_contacts_updated_at
before update on public.crm_contacts
for each row execute function public.set_updated_at();

create trigger crm_contacts_audit
after insert or update or delete on public.crm_contacts
for each row execute function aidme_private.audit_row_change();
