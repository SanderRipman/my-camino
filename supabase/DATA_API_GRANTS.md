# Supabase public Data API: explicit grants (from 2026-10-24)

**Scope:** \`ibloovohuhrceivrvhvn\` (AidMe VIDA/Camino). Applies to all code paths that create tables in \`public\`, including SQL migrations, Supabase CLI, preview branches and database resets.

## Verified live baseline, 2026-10-24

- 36 public tables, all 36 RLS-enabled, unchanged by the migration.
- Pre/post Data API privilege counts for existing public tables: \`anon SELECT 34\`, \`authenticated SELECT 35\`, \`service_role SELECT 35\`.
- Remote migration \`20261024145031 explicit_public_data_api_opt_in_20261024\` revoked the automatic **future** table grants (SELECT/INSERT/UPDATE/DELETE) and sequence grants (USAGE/SELECT) created by the \`postgres\` role.
- This does not remove access from existing tables; it does not establish that existing broad grants are least-privilege. Existing grants/RLS require separate review.
- Postgres \`public\` function EXECUTE defaults and \`supabase_admin\` defaults were not changed by this targeted migration.

## Required for each newly created public table

In the **same migration** as \`CREATE TABLE\`:
1. \`ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;\`
2. Add narrow role-/owner-/scope-aware RLS policies (never a blanket authenticated/anon policy).
3. Grant only the exact SQL privileges needed by each Data API caller. **Never copy both role examples blindly**.
4. Where an identity/sequence is accessed via Data API, grant the required sequence privileges explicitly.
5. Run the positive **and** negative access checks using real JWT/AAL2 roles, plus API regression in relevant origin.
6. If the table is server-only, add **no anon or authenticated grants**. Mark explicitly in SQL: \`-- DATA_API_PRIVATE: public.<table>\` to satisfy the PR guard.
7. Keep \`service_role\` keys out of browsers and do not expose raw participant data.

### Examples (illustrative only; adapt to each table)

\`\`\`sql
-- Example: signed-in user with owner-scoped read access.
create table public.example_owner_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
);

alter table public.example_owner_notes enable row level security;

create policy "owner may read own notes"
  on public.example_owner_notes for select to authenticated
  using ((select auth.uid()) = owner_id);

grant select on table public.example_owner_notes to authenticated;

-- Optional server-only Data API grant, ONLY if the Edge/backend caller
-- actually accesses this table with a service_role key.
-- grant select, insert on table public.example_owner_notes to service_role;

-- For a private internal table, do not grant to anon/authenticated:
-- DATA_API_PRIVATE: public.example_private_table
\`\`\`

### What not to do

- Do **not** use \`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon\` or re-enable blanket default Data API grants as a quick fix.
- Do **not** add \`anon\` to intake/identity/safety/clinical tables. Camino public intake must remain mediated by its hardened Edge Function.
- Do **not** add \`GRANT\` to resolve an RLS error without investigating the denied role, JWT/AAL2 and scope.
- Do **not** deploy new public-table migrations with missing grants when the UI expects direct Data API access.
- Do **not** mistake \`service_role\`'s RLS bypass for immunity to missing SQL object privileges.

## Verification / recovery

Read-only SQL checks:
\`\`\`sql
-- Future object grants (should lack arwd for anon/authenticated/service_role):
select pg_get_userbyid(defaclrole) as creator, defaclobjtype as kind,
       defaclacl::text as grants
from pg_default_acl
where defaclnamespace = 'public'::regnamespace
  and defaclrole = 'postgres'::regrole;

-- Existing table RLS and Data API grants:
select c.relname, c.relrowsecurity,
       has_table_privilege('anon', c.oid, 'select') as anon_select,
       has_table_privilege('authenticated', c.oid, 'select') as auth_select
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind in ('r','p');
\`\`\`

The default-grant change is reversible, but restoring broad defaults is a security regression and must not be used as a routine workaround. If an application gets \`42501\` after a new table is introduced, add a **narrow explicit grant** in the migration; check RLS independently.

References: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically and https://supabase.com/docs/guides/api/securing-your-api.
