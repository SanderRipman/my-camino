-- AidMe VIDA: participant agreement/readiness v2 aligned with active NO template package.
-- Source: SharePoint active Operativ_malpakke_VIA_SER_VIDA_v0_3_A4.
-- Principles: no new health journal; confirm rights, safety frame, contact/sharing choices,
-- separate optional evaluation consent, and preserve explicit participant-owned acknowledgement.

do $$
declare
  def_id uuid;
  ts timestamptz := now();
begin
  select id into def_id from public.form_definitions where key='participant_agreement' limit 1;
  if def_id is null then
    raise exception 'PARTICIPANT_AGREEMENT_FORM_DEFINITION_REQUIRED';
  end if;

  if not exists (
    select 1 from public.form_versions where form_definition_id=def_id and version=2
  ) then
    update public.form_versions
      set retired_at=coalesce(retired_at,ts)
      where form_definition_id=def_id and retired_at is null;

    insert into public.form_versions(
      id,form_definition_id,version,schema_json,published_at,retired_at,created_at
    ) values (
      gen_random_uuid(),def_id,2,
      jsonb_build_object(
        'phase','VIA_SER',
        'audience','participant_staff',
        'intro','Dette er ikke en ny helse- eller risikokartlegging. Bekreft rammene, valgfriheten og kontakt-/delingsvalgene som skal være tydelige før SER. Ikke skriv helsehistorie eller traumatiske detaljer her.',
        'sections',jsonb_build_array(
          jsonb_build_object(
            'title','Frivillighet, verdighet og sikkerhetsramme',
            'fields',jsonb_build_array(
              jsonb_build_object('key','understands_info','type','checkbox','label','Jeg har fått informasjon i et språk og format jeg forstår','required',true),
              jsonb_build_object('key','voluntary_participation','type','checkbox','label','Jeg vet at deltakelse er frivillig, og at jeg kan be om pause, tilpasning eller avbrudd','required',true),
              jsonb_build_object('key','not_treatment','type','checkbox','label','Jeg vet at programmet ikke er behandling eller akuttjeneste med mindre dette er særskilt organisert','required',true),
              jsonb_build_object('key','adaptation_right','type','checkbox','label','Jeg kan be om pause, transport, kortere etappe eller avbrudd uten at det regnes som nederlag','required',true),
              jsonb_build_object('key','privacy_choice','type','checkbox','label','Jeg kan velge stillhet og hva jeg deler; det er ingen krav om personlig deling','required',true),
              jsonb_build_object('key','route_contact','type','checkbox','label','Jeg sier fra dersom jeg forlater avtalt rute/møtepunkt eller får problemer som påvirker sikkerheten','required',true),
              jsonb_build_object('key','peer_privacy','type','checkbox','label','Jeg respekterer andre deltakeres privatliv og har ikke sikkerhets- eller behandlingsansvar for dem','required',true),
              jsonb_build_object('key','leader_safety_authority','type','checkbox','label','Jeg forstår at operativ leder kan endre rute, tempo, overnatting eller min deltakelse når sikkerheten krever det','required',true)
            )
          ),
          jsonb_build_object(
            'title','Kontakt, VIDA-bro og delingsvalg',
            'fields',jsonb_build_array(
              jsonb_build_object('key','emergency_contact_ready','type','checkbox','label','Nødkontakt og kontaktvei er avklart før SER','required',true,'help','Navn og private detaljer skal ikke dobbelføres her dersom de allerede er registrert i sikker kontekst.'),
              jsonb_build_object('key','vida_owner_known','type','checkbox','label','Jeg vet hvem som er navngitt VIDA-eier / oppfølgingskontakt etter hjemkomst','required',true),
              jsonb_build_object('key','routine_sharing_boundary','type','text','label','Hva kan rutinemessig deles med avtalt kontakt eller partner?','required',true,'help','Skriv kort, for eksempel «kun nødvendig drift», «avtalt kort status» eller «ingenting utover nødvendig drift». Ikke skriv helsehistorie.'),
              jsonb_build_object('key','yellow_sharing_boundary','type','text','label','Ved gul status: hvem kan kontaktes og hva kan deles?','required',true,'help','Kort kontakt-/delingsregel. Ikke skriv medisinske eller traumatiske detaljer.'),
              jsonb_build_object('key','red_emergency_understood','type','checkbox','label','Jeg forstår at nødvendige opplysninger kan deles for å beskytte liv og helse der regelverket tillater eller krever det','required',true)
            )
          ),
          jsonb_build_object(
            'title','Separate valg som ikke avgjør deltakelse',
            'fields',jsonb_build_array(
              jsonb_build_object('key','media_consent_separate','type','checkbox','label','Jeg forstår at samtykke til bilder eller historier er separat fra programdeltakelse','required',true),
              jsonb_build_object('key','pilot_evaluation_opt_in','type','checkbox','label','Jeg ønsker å delta i frivillig pilotevaluering utover det som er nødvendig for drift','required',false,'help','Valgfritt. Nei påvirker ikke deltakelse eller oppfølging.')
            )
          )
        )
      ),
      ts,null,ts
    );
  end if;

  if not exists (select 1 from public.consent_versions where key='participant_program_agreement' and version=2) then
    update public.consent_versions
      set retired_at=coalesce(retired_at,ts)
      where key='participant_program_agreement' and retired_at is null;
    insert into public.consent_versions(
      id,key,version,purpose,content_no,content_en,effective_from,retired_at
    ) values (
      gen_random_uuid(),'participant_program_agreement',2,
      'Dokumentere deltakerens egen bekreftelse av programinformasjon, frivillighet, sikkerhetsramme og kontakt-/delingsvalg før SER',
      'AidMe VIDA er et frivillig VÍA–SER–VIDA-program og skal ikke forstås som behandling, kur eller garanti. Deltakeren kan be om hjelp, pause, transport, tilpasning eller avbrudd, og det er ingen plikt til personlig deling. Deltakeren skal kjenne sikkerhetsrammen, kontaktveien, navngitt VIDA-eier og egne avtalte delingsvalg. Operativ leder kan tilpasse eller avbryte gjennomføring når sikkerheten krever det. Samtykke til foto/media og frivillig pilotevaluering er separate valg og er ikke en forutsetning for deltakelse.',
      'AidMe VIDA is a voluntary VÍA–SER–VIDA programme and is not treatment, a cure or a guaranteed outcome. The participant may ask for help, rest, transport, adaptation or interruption, with no requirement for personal disclosure. The participant should know the safety frame, contact route, named VIDA owner and agreed information-sharing boundaries. The operational lead may adapt or stop participation when safety requires it. Photo/media consent and optional pilot evaluation are separate choices and are not conditions of participation.',
      ts,null
    );
  end if;

  if not exists (select 1 from public.consent_versions where key='pilot_evaluation_optional' and version=1) then
    insert into public.consent_versions(
      id,key,version,purpose,content_no,content_en,effective_from,retired_at
    ) values (
      gen_random_uuid(),'pilot_evaluation_optional',1,
      'Frivillig pilotevaluering utover nødvendig drift og sikkerhets-/kvalitetsoppfølging',
      'Dette valget gjelder frivillig bruk av deltakerens tilbakemeldinger i pilotevaluering utover det som er nødvendig for drift, sikkerhet og lovpålagt dokumentasjon. Valget er frivillig og påvirker ikke deltakelse eller oppfølging.',
      'This choice covers optional use of the participant’s feedback in pilot evaluation beyond what is necessary for operations, safety and required documentation. The choice is voluntary and does not affect participation or follow-up.',
      ts,null
    );
  end if;
end
$$;

create or replace function aidme_private.participant_agreement_consent_workflow()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  form_key text;
  p_user uuid;
  consent_id uuid;
  eval_consent_id uuid;
  eval_choice boolean;
  staff_owner uuid;
begin
  if new.status<>'SUBMITTED' or (tg_op='UPDATE' and old.status='SUBMITTED') then return new; end if;
  select fd.key into form_key from public.form_versions fv join public.form_definitions fd on fd.id=fv.form_definition_id where fv.id=new.form_version_id;
  if form_key<>'participant_agreement' or new.participant_id is null then return new; end if;
  select p.user_id into p_user from public.participants p where p.id=new.participant_id;
  select cv.id into consent_id from public.consent_versions cv where cv.key='participant_program_agreement' and cv.effective_from<=coalesce(new.submitted_at,now()) and (cv.retired_at is null or cv.retired_at>coalesce(new.submitted_at,now())) order by cv.version desc limit 1;
  if consent_id is null then raise exception 'ACTIVE_PARTICIPANT_AGREEMENT_VERSION_REQUIRED'; end if;

  if p_user is not null and new.submitted_by=p_user then
    if not exists (select 1 from public.consent_events ce where ce.participant_id=new.participant_id and ce.consent_version_id=consent_id and ce.decision='GRANTED') then
      insert into public.consent_events(organization_id,participant_id,consent_version_id,decision,actor_user_id,occurred_at,evidence)
      values(new.organization_id,new.participant_id,consent_id,'GRANTED',p_user,coalesce(new.submitted_at,now()),jsonb_build_object('form_submission_id',new.id,'source','participant_agreement'));
    end if;

    select cv.id into eval_consent_id from public.consent_versions cv where cv.key='pilot_evaluation_optional' and cv.effective_from<=coalesce(new.submitted_at,now()) and (cv.retired_at is null or cv.retired_at>coalesce(new.submitted_at,now())) order by cv.version desc limit 1;
    eval_choice:=coalesce((new.payload->>'pilot_evaluation_opt_in')::boolean,false);
    if eval_consent_id is not null then
      insert into public.consent_events(organization_id,participant_id,consent_version_id,decision,actor_user_id,occurred_at,evidence)
      values(new.organization_id,new.participant_id,eval_consent_id,case when eval_choice then 'GRANTED' else 'DECLINED' end,p_user,coalesce(new.submitted_at,now()),jsonb_build_object('form_submission_id',new.id,'source','participant_agreement','optional',true));
    end if;

    update public.tasks set status='DONE',updated_at=now()
      where participant_id=new.participant_id and workflow_key='participant_agreement_ack' and status in ('OPEN','IN_PROGRESS','WAITING');
  else
    if p_user is not null then
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'participant_agreement_ack','Min VÍA – bekreft deltakeravtalen','Les programinformasjonen og bekreft selv når du er klar. Foto/media og frivillig pilotevaluering håndteres som separate valg.',p_user,now()+interval '3 days',3,'GREEN','PARTICIPANT','form_submission',new.id::text);
    else
      staff_owner:=aidme_private.pick_role_user(new.organization_id,new.participant_id,new.pilot_id,array['via_owner','program_lead']);
      perform aidme_private.enqueue_workflow_task(new.organization_id,new.participant_id,new.pilot_id,'participant_agreement_identity','VÍA – deltakerbekreftelse mangler','Deltakeravtalen er registrert av medarbeider. Dokumenter deltakerens egen bekreftelse i egnet sikker kanal før videre gate. Valg til frivillig pilotevaluering skal ikke antas på deltakerens vegne.',staff_owner,now()+interval '3 days',2,'YELLOW','STAFF','form_submission',new.id::text);
    end if;
  end if;
  return new;
end
$$;
