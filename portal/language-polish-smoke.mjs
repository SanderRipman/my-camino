import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const fail=message=>{throw new Error(`language-polish-smoke: ${message}`)};
const must=(condition,message)=>{if(!condition)fail(message)};
const has=(text,needle,message)=>must(text.includes(needle),message||`missing: ${needle}`);
const lacks=(text,needle,message)=>must(!text.includes(needle),message||`unexpected: ${needle}`);

const index=read('index.html');
const admin=read('admin.html');
const welcome=read('welcome.html');
const owners=read('owners.html');
const pilot=read('pilot-ops.html');
const qa=read('qa-role-pack.html');

// Main portal: plain language first, while core safety meaning stays explicit.
has(index,'Vi tester fortsatt portalens flyt og roller med fiktive opplysninger.');
lacks(index,'Flyt, roller og UI testes');
lacks(index,'produksjonsgatene');
has(index,'Opplysninger skal registreres ett sted og bare vises til riktig rolle.');
has(index,'Arbeidsroller og sensitive moduler krever bekreftet tofaktor (AAL2).');
has(index,'Ingen enkelt skår avgjør sikkerhet eller GO/NO-GO.');
has(index,'VÍA → SER → VIDA → ny VÍA');

// Admin: human explanation precedes technical proof; authorization identifiers remain visible where useful.
has(admin,'Administrasjon krever bekreftet tofaktor (AAL2) og aktiv systemadministratorrolle.');
has(admin,'Rettigheter kontrolleres på serveren');
has(admin,'systemadministratorrolle (<code>system_admin</code>)');
lacks(admin,'Ingen skjult adminmakt i nettleseren');

// Onboarding: next action is explained from the user's perspective.
has(welcome,'Etterpå viser vi neste steg ut fra om du er deltaker eller har en arbeidsrolle.');
has(welcome,'Etter at profilen er lagret, viser vi neste steg');

// Ownership: do not hide the non-negotiable named VIDA-owner requirement behind internal gate/scope jargon.
has(owners,'SER skal ikke startes uten navngitt VIDA-eier.');
has(owners,'Rolle og tilgang kontrolleres på serveren før ansvar kan tildeles.');
has(owners,'VIDA-eier må være navngitt');
lacks(owners,'Rolle og scope');
lacks(owners,'Hvorfor dette er en gate');
lacks(owners,'oppgavemotoren');

// SER operations: formal Pilot-GO remains intact, but the surrounding instruction is direct.
has(pilot,'Samlet Pilot-GO må være godkjent før SER starter.');
has(pilot,'tilgang til denne SER-gruppen');
has(pilot,'Pause, kortere etappe, transport og avbrudd er legitime sikkerhetstiltak.');
lacks(pilot,'Gate / styring');

// QA lab: human wording first, technical security evidence retained secondarily.
has(qa,'Rolle- og tilgangstest (QA)');
has(qa,'tilgangsreglene som i portalen (RLS) og tofaktor (AAL2)');
has(qa,'Midlertidig nødtilgang (Break-glass)');
has(qa,'direkte URL');
lacks(qa,'Rolle- og scope-QA');
lacks(qa,'staff-grants');
lacks(qa,'rolle-grants');
has(qa,'interesse → mottak → VÍA');
has(qa,'riktig skjema/kontrollpunkt');

console.log('language-polish-smoke: PASS');
