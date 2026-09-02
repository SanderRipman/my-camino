-- AidMe VIDA: participant-friendly VÍA roadmap v2.
-- Preserve v1 and all historical/draft submissions; only the active published version changes.
-- VIDA owner remains a staff-owned pre-SER requirement in individual GO / Pilot-GO,
-- and the participant later confirms awareness in participant_agreement.

do $$
declare
  def_id uuid;
  desired_schema jsonb := $json$
  {
    "intro": "Dette er en første bli-kjent- og avklaringsrunde, ikke en test. Det finnes ingen riktige eller gale svar, og du trenger ikke skrive mye. Skriv det første som virker relevant. Del bare det som er nødvendig for planlegging og trygg gjennomføring – ikke full helsehistorie.",
    "phase": "VIA",
    "audience": "participant_staff",
    "sections": [
      {
        "title": "Retning og ressurser",
        "fields": [
          {
            "key": "more_of",
            "type": "textarea",
            "label": "Hva ønsker du at livet skal inneholde mer av?",
            "required": true,
            "help": "Noen få ord er nok. Tenk på det som betyr noe for deg nå – for eksempel rytme, fellesskap, mestring, arbeid, ro, aktivitet eller retning."
          },
          {
            "key": "move_from",
            "type": "textarea",
            "label": "Hva ønsker du å bevege deg bort fra?",
            "required": false,
            "help": "Valgfritt. Du trenger ikke forklare historien bak; et kort bilde av det du ønsker mindre av er nok."
          },
          {
            "key": "camino_relevance",
            "type": "textarea",
            "label": "Hva gjør Camino aktuelt – og hva ville være et lite, viktig resultat?",
            "required": true,
            "help": "Tenk lite og konkret. Det kan være å få mer rytme, oppleve mestring, prøve noe nytt, være del av et fellesskap eller få tydeligere retning."
          },
          {
            "key": "strengths",
            "type": "textarea",
            "label": "Hva fungerer i deg og rundt deg allerede?",
            "required": true,
            "help": "Ta med ressurser du allerede har: mennesker, vaner, interesser, ferdigheter, erfaringer eller noe du vet hjelper på gode dager."
          }
        ]
      },
      {
        "title": "Praktisk beredskap",
        "fields": [
          {
            "key": "sleep",
            "type": "textarea",
            "label": "Søvn – nå, hva hjelper, behov",
            "help": "Hvordan er søvn og døgnrytme vanligvis nå, og hva pleier å hjelpe? Nevn bare det som kan være praktisk relevant for rytme og overnatting."
          },
          {
            "key": "walking_capacity",
            "type": "textarea",
            "label": "Gange / fysisk kapasitet",
            "help": "Tenk hverdagslig, ikke prestasjonstest: går eller trener du regelmessig eller sjeldnere? Omtrent hvor mange km ville du kalle en lang tur? Trives du best i rolig «skilpadde»-tempo eller raskere «hare»-tempo? Ingen fasit."
          },
          {
            "key": "food_water",
            "type": "textarea",
            "label": "Mat / væske",
            "help": "Hva fungerer vanligvis for mat og drikke gjennom en lang dag? Nevn praktiske behov eller preferanser; ikke mer helsehistorie enn nødvendig."
          },
          {
            "key": "pain_injury",
            "type": "textarea",
            "label": "Smerte / skade",
            "help": "Er det noe som kan påvirke gange, bæring, pauser eller hvile? Beskriv helst funksjon og hva som hjelper. Kort er nok."
          },
          {
            "key": "stress_social",
            "type": "textarea",
            "label": "Stress / uro / sosial belastning",
            "help": "Hva kan gjøre reise, grupper eller mange inntrykk krevende for deg, og hva pleier å gjøre det lettere? Du bestemmer selv hvor mye du vil skrive."
          },
          {
            "key": "work_activity",
            "type": "textarea",
            "label": "Arbeid / aktivitet / struktur",
            "help": "Hvordan ser en vanlig uke omtrent ut når det gjelder arbeid, aktivitet, søvn og struktur? Et grovt bilde er nok."
          },
          {
            "key": "risk_overview",
            "type": "textarea",
            "label": "Andre relevante forhold – kun nødvendig nivå",
            "help": "Bare andre konkrete forhold som kan påvirke trygg gjennomføring. Ikke skriv full helsehistorie eller detaljer som ikke er nødvendige for planleggingen."
          },
          {
            "key": "early_signs",
            "type": "textarea",
            "label": "Mine tidlige signaler – og hva hjelper først",
            "required": true,
            "help": "Hvordan merker du tidlig at du trenger pause, ro, mat, kontakt eller annen tilpasning? Hva er det første som vanligvis hjelper?"
          },
          {
            "key": "stop_plan",
            "type": "textarea",
            "label": "Min plan hvis dagen ikke går som tenkt",
            "required": true,
            "help": "Hva er en trygg første plan hvis du trenger å justere – for eksempel pause, kortere etappe, transport, kontakt eller avbrudd? Tilpasning er et sikkerhetstiltak, ikke et nederlag."
          },
          {
            "key": "via_sentence",
            "type": "textarea",
            "label": "Min VÍA-setning",
            "required": true,
            "help": "Én enkel setning er nok, for eksempel: «I denne VÍA-en vil jeg avklare …» eller «Jeg vil finne ut om …»."
          },
          {
            "key": "ser_practice",
            "type": "textarea",
            "label": "Hva kunne jeg tenke meg å øve på under SER?",
            "required": true,
            "help": "For eksempel rytme, be om hjelp, bidra, ta pause, stå i litt usikkerhet eller holde en liten avtale med deg selv. Dette er ikke et prestasjonskrav."
          }
        ]
      }
    ]
  }
  $json$::jsonb;
begin
  select id into def_id
  from public.form_definitions
  where key = 'via_roadmap';

  if def_id is null then
    raise exception 'via_roadmap form definition not found';
  end if;

  insert into public.form_versions(form_definition_id,version,schema_json,published_at,retired_at)
  values(def_id,2,desired_schema,now(),null)
  on conflict (form_definition_id,version)
  do update set
    schema_json = excluded.schema_json,
    published_at = coalesce(public.form_versions.published_at, excluded.published_at),
    retired_at = null;

  update public.form_versions
  set retired_at = coalesce(retired_at,now())
  where form_definition_id = def_id
    and version <> 2
    and published_at is not null
    and retired_at is null;
end
$$;
