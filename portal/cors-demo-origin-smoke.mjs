import fs from 'node:fs';

const targets=[
  '../supabase/functions/participant-profile-command/index.ts',
  '../supabase/functions/onboarding-command/index.ts',
  '../supabase/functions/account-setup-command/index.ts',
  '../supabase/functions/form-command/index.ts',
  '../supabase/functions/aggregate-analysis/index.ts'
];
for(const rel of targets){
  const src=fs.readFileSync(new URL(rel,import.meta.url),'utf8');
  if(!src.includes('https://my.aidme.no'))throw new Error(`${rel}: production origin missing`);
  if(!src.includes('https://demo.aidme.no'))throw new Error(`${rel}: canonical demo origin missing`);
  if(/Access-Control-Allow-Origin['"]?\s*:\s*['"]\*/.test(src))throw new Error(`${rel}: wildcard CORS is not allowed`);
  if(!src.includes("'Vary':'Origin'")&&!src.includes("'Vary': 'Origin'"))throw new Error(`${rel}: Vary Origin missing`);
}
console.log('Canonical production + demo CORS parity OK');
