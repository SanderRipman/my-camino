# CAMINO – Kontroll over åpne pull requests, 02.11.2026

**Kilde:** GitHub REST `GET /repos/SanderRipman/my-camino/pulls?state=open&per_page=100`, kontrollert i denne økten. 19 åpne PR-er før dagens PR. **Ingen PR er slettet eller lukket i denne revisjonen.** Status er et risikokart – ikke ordre om merge.

| PR | Base | Historisk/operativ klassifisering | Anbefalt sikker handling |
|--|--|--|--|
| #190 Task context/nav (2026-10-15) | demo-uat | Mulig aktiv UAT-kandidat, kan overlappe rolleoppgavene | Separat diff/CI/visuell kontroll før eventuell rebase. Ikke blindt merge |
| #186 Public polish (2026-10-06) | main | Design draft, eldre enn #198 photo/nav-fiks | Evaluer mot gjeldende main, kun selektive korrigeringer |
| #171 Mobile swipe (2026-09-17) | demo-uat | Eldre åpent spor; etterfølgende #173 og mobil PR-er | Reconcile restfeil mot gjeldende, ikke utfør gamle endringer mekanisk |
| #156 SER staff directory Edge (2026-09-13) | main | Sikkerhetsrelatert draft | Egen auth/RLS/rolle-gate, ikke del av syntetisk UAT-PR |
| #122 Pilot-GO DB QA (2026-09-03) | qa/myfb-008-staff | DB testspor draft, base er ikke production | Hold isolert, vurder kun mot siste styringsfiler |
| #41 Portal next action/mobile (2026-08-18) | main | Historisk draft, sannsynlig overlapp med nyere UX | Referanse, selektiv cherry-pick hvis et unikt behov faktisk fortsatt gjenstår |
| #17,#16,#15,#13,#12,#11,#10,#9,#8,#7 | dev | Eldre 2025 CI/migrasjon/overføringsspor; #9 har `main` som head | Arkivkandidater først etter sammenligning; behold historikk |
| #6,#5,#4 | main | Eldre 2025/2026 CI/favicon-/testspor | Arkivkandidater etter innholdskontroll, ikke automatisk merge |

**Bevisst arbeidsmodell:** Feature branch → PR → GitHub CI + Netlify Preview → faktisk UAT → kontrollert merge til `demo-uat` eller `main`. **Bruk `demo.aidme.no`** for fysisk, syntetisk UAT. `dev.aidme.no` ble i checkpoint 02.11 verifisert som Netlify site bygget fra `main`, og skal ikke forveksles med isolert testmiljø.

**Opprydding senere:** én idempotent, lesebasert gjennomgang av open PR, teststatus, branch-avvik og overlapp; PR kan lukkes som erstattet først etter dokumentert beslutning. Lukkede og mergede PR-er blir bevart i GitHub-historikken; ingen branch slettes uten ny gate. Dette er ikke en oppfordring til å masseendre gamle PR-er.
