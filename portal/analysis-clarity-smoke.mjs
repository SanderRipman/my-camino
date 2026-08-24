import fs from 'node:fs';

const src=fs.readFileSync(new URL('./app-analysis-ux.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('./build-app.mjs',import.meta.url),'utf8');
const must=(needle,label)=>{if(!src.includes(needle))throw new Error(`${label}: missing ${needle}`)};

must('Ingen registrerte målinger i valgt periode.','explicit all-empty state');
must('De valgte deltakerne har ingen målinger','explicit selected-empty state');
must('analysisLegend','external readable legend');
must('analysis-chip-count','per-participant data availability');
must('Grafen lager ikke kunstige eller interpolerte verdier.','no fabricated data message');
must('ResizeObserver','responsive chart redraw');
must('orientationchange','mobile orientation redraw');
must('ANALYSIS_DASHES','series identity beyond color');
must("Math.min(2.5,Math.max(1,window.devicePixelRatio||1))",'bounded high-DPI rendering');
if(src.includes('client.'))throw new Error('analysis clarity layer must not access Supabase/client APIs; it is presentation-only');
if(src.includes('participant_note'))throw new Error('analysis clarity must not expose participant free-text');
if(!build.includes("app-analysis-ux.js")||!build.includes("'+analysisUx+'"))throw new Error('analysis clarity layer must be included in deterministic portal build');
console.log('Portal analysis clarity/readability invariants passed.');
