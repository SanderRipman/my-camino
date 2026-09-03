do $$
declare
  v_def uuid;
  v_now timestamptz := now();
begin
  select id into v_def from public.form_definitions where key='ser_daily';
  if v_def is null then
    raise exception 'ser_daily form definition not found';
  end if;

  if not exists (
    select 1 from public.form_versions where form_definition_id=v_def and version=2
  ) then
    insert into public.form_versions(form_definition_id,version,schema_json,published_at)
    values (
      v_def,
      2,
      jsonb_build_object(
        'phase','SER',
        'audience','staff',
        'intro','Teamets korte operative SER-logg. Deltakerens egen innsjekk er et separat read-only signal og skal ikke dobbeltføres.',
        'sections',jsonb_build_array(
          jsonb_build_object(
            'title','Operativt dagsbilde',
            'fields',jsonb_build_array(
              jsonb_build_object('key','observed_facts','type','textarea','label','Kort operativt dagsbilde / observerbare fakta'),
              jsonb_build_object('key','route_rag','type','select','label','Dagens operative status','options',jsonb_build_array('GREEN','YELLOW','RED')),
              jsonb_build_object('key','front_anchor','type','text','label','Frontanker'),
              jsonb_build_object('key','rear_anchor','type','text','label','Bakanker / sweep'),
              jsonb_build_object('key','rover','type','text','label','Rover / relasjonsressurs'),
              jsonb_build_object('key','adaptations','type','textarea','label','Tiltak / tilpasninger'),
              jsonb_build_object('key','followup_needed','type','checkbox','label','Trenger oppfølging / 1:1')
            )
          )
        )
      ),
      v_now
    );
  end if;

  update public.form_versions
     set retired_at = coalesce(retired_at, v_now)
   where form_definition_id=v_def
     and version=1
     and retired_at is null;
end $$;
