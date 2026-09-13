create or replace function public.apply_participant_lifecycle(
  p_actor_user_id uuid,
  p_participant_id uuid,
  p_action text,
  p_reason text,
  p_contact_status text,
  p_next_via_assessment text
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_participant public.participants%rowtype;
  v_pilot_id uuid;
  v_target_active boolean;
  v_event_type text;
  v_now timestamptz := now();
  v_metadata jsonb;
begin
  if p_action not in ('ARCHIVE','RESTORE') then raise exception 'INVALID_ACTION'; end if;
  if length(trim(coalesce(p_reason,''))) < 8 or length(trim(p_reason)) > 500 then raise exception 'INVALID_REASON'; end if;
  if p_contact_status not in ('CONTACTED','NOT_CONTACTED','UNREACHABLE','NOT_APPLICABLE') then raise exception 'INVALID_CONTACT_STATUS'; end if;
  if p_next_via_assessment not in ('NOT_NOW','CONSIDER_LATER','READY_FOR_NEW_VIA','NOT_APPLICABLE') then raise exception 'INVALID_NEXT_VIA'; end if;

  select * into v_participant from public.participants where id=p_participant_id for update;
  if not found then raise exception 'PARTICIPANT_NOT_FOUND'; end if;

  select pp.pilot_id into v_pilot_id
  from public.pilot_participants pp
  where pp.participant_id=p_participant_id and pp.status='ACTIVE'
  order by pp.joined_at desc limit 1;

  if not exists (
    select 1
    from public.role_grants rg
    join public.role_permissions rp on rp.role_code=rg.role_code and rp.capability='manage_participant_lifecycle'
    where rg.user_id=p_actor_user_id
      and rg.organization_id=v_participant.organization_id
      and rg.revoked_at is null
      and (rg.valid_from is null or rg.valid_from<=v_now)
      and (rg.valid_until is null or rg.valid_until>v_now)
      and (rg.participant_id is null or rg.participant_id=p_participant_id)
      and (rg.pilot_id is null or rg.pilot_id=v_pilot_id)
  ) then raise exception 'FORBIDDEN'; end if;

  v_target_active := p_action='RESTORE';
  if v_participant.active=v_target_active then
    if v_target_active then raise exception 'ALREADY_ACTIVE'; else raise exception 'ALREADY_ARCHIVED'; end if;
  end if;

  if p_action='ARCHIVE' then
    if exists(select 1 from public.tasks where participant_id=p_participant_id and status in ('OPEN','IN_PROGRESS','WAITING')) then raise exception 'ACTIVE_TASKS'; end if;
    if exists(select 1 from public.incidents where participant_id=p_participant_id and closed_at is null) then raise exception 'OPEN_INCIDENT'; end if;
    if exists(select 1 from public.sos_events where participant_id=p_participant_id and status<>'RESOLVED') then raise exception 'OPEN_SOS'; end if;
  end if;

  update public.participants set active=v_target_active, updated_at=v_now where id=p_participant_id;
  v_event_type := case when p_action='ARCHIVE' then 'PARTICIPANT_ARCHIVED' else 'PARTICIPANT_RESTORED' end;
  v_metadata := jsonb_build_object('reason',trim(p_reason),'contact_status',p_contact_status,'next_via_assessment',p_next_via_assessment,'pilot_id',v_pilot_id,'previous_active',not v_target_active,'new_active',v_target_active);

  insert into public.workflow_events(organization_id,participant_id,pilot_id,actor_user_id,event_type,from_stage,to_stage,source_type,source_id,metadata)
  values(v_participant.organization_id,p_participant_id,v_pilot_id,p_actor_user_id,v_event_type,v_participant.stage,v_participant.stage,'participant_lifecycle',p_participant_id::text,v_metadata);

  insert into public.audit_events(organization_id,actor_user_id,action,resource_type,resource_id,participant_id,purpose,metadata)
  values(v_participant.organization_id,p_actor_user_id,v_event_type,'participant',p_participant_id::text,p_participant_id,'participant_lifecycle',v_metadata);

  return jsonb_build_object('id',p_participant_id,'code_name',v_participant.code_name,'stage',v_participant.stage,'active',v_target_active,'updated_at',v_now);
end;
$$;

revoke all on function public.apply_participant_lifecycle(uuid,uuid,text,text,text,text) from public;
revoke execute on function public.apply_participant_lifecycle(uuid,uuid,text,text,text,text) from anon, authenticated;
grant execute on function public.apply_participant_lifecycle(uuid,uuid,text,text,text,text) to service_role;
