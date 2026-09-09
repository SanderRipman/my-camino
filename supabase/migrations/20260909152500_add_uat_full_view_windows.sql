create table if not exists public.uat_full_view_windows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 240),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index if not exists uat_full_view_windows_user_active_idx
  on public.uat_full_view_windows(user_id, expires_at desc)
  where closed_at is null;

alter table public.uat_full_view_windows enable row level security;
comment on table public.uat_full_view_windows is
  'Early-UAT only: time-limited synthetic full-view windows. No direct client policies; edge function/service role only.';
