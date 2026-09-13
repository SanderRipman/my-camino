insert into public.role_permissions (role_code, capability)
values ('program_lead', 'manage_participant_lifecycle')
on conflict (role_code, capability) do nothing;
