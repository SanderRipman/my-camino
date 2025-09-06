## Handover – ops-workflow (20250905-1329)

### Dagens hovedresultater
- AutoSplit migrert og flyttet batcher fra **aidme-core** → **dev-platform** (13 filer bekreftet i mål).
- Nye ChatKeys & mapper etablert: dev-platform, ops-workflow, product-roadmap, pilot-studier, forskning-studier, partner-tilskudd, turplan-camino, ideer-lab.
- Snapshot + index oppdatert for alle ChatKeys (med robust parameter-håndtering).
- **Ops “reply”-flyt** satt opp:
  - Utkast lages i captures\ops-workflow\outbox\*.md
  - Godkjenning/sending: Approve-AidReply -DraftPath <fil> -TargetChatKey <ck> -Title <tittel>
  - Verifisert mot **dev-platform** (sendt test og en kapasitet-forespørsel).
- Integrasjoner: gh og Netlify CLI bekreftet innlogget; repo oppdaget (SanderRipman/my-camino); OPENAI-nøkler avklart for videre oppsett (ikke lagret i logg her).

### Umiddelbare next steps
1) **dev-platform**: bekreft kapasitet og at siste autosplit-lesning er OK (minst 10–15 filer synlige).
2) **product-roadmap**: merk 1–2 små items fra *ideer-lab* som “Ready for Dev” (etter dev-kap. bekreftelse).
3) **turplan-camino ↔ partner-tilskudd**: avklar om planendringer påvirker frister/innsendinger.
4) Forbered **forbedringsrunde i morgen** (rydding, navnestandard, integrasjoner, tavle).

### Hurtig-kommandoramme (ops-workflow)
- Godkjenn & send utkast:
  Approve-AidReply -DraftPath "C:\Dev\my-camino\handover\captures\ops-workflow\outbox\draft-*.md" -TargetChatKey '<ck>' -Title '<tittel>'

### Notat
Etter dette handover-notatet kan vi styre med fritekst i ops-workflow (spørre om status, be om svarutkast, osv.), og bare bruke godkjenning når noe skal postes ut.