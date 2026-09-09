-- Security hardening: this RPC is only for authenticated staff workflows.
-- The function already performs capability checks internally; anon EXECUTE is unnecessary.

revoke execute on function public.eligible_ser_operational_staff(uuid) from anon;
grant execute on function public.eligible_ser_operational_staff(uuid) to authenticated;
