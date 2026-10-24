#!/usr/bin/env node
// Static, fail-closed check for public tables introduced by modified migrations.
// Does not replace real JWT/AAL2 positive and negative RLS tests.
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2).filter(f => /^supabase\/migrations\/[^/]+\.sql$/.test(f));
const errors = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const sql = raw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ');
  const createRe = /\bcreate\s+(?:(?:unlogged|temporary|temp)\s+)?table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?([a-z_][a-z0-9_]*)"?\s*\.\s*)?)"?([a-z_][a-z0-9_]*)"?/gi;
  for (const m of sql.matchAll(createRe)) {
    const schema = (m[1] || 'public').toLowerCase();
    const name = m[2].toLowerCase();
    if (schema !== 'public') continue;
    const table = 'public.' + name;
    const prefix = '(?:public\\s*\\.\\s*)?' + name;
    const rls = new RegExp('\\balter\\s+table\\s+(?:if\\s+exists\\s+)?' + prefix + '\\s+enable\\s+row\\s+level\\s+security\\b', 'i');
    const grant = new RegExp('\\bgrant\\b[^;]*\\bon\\s+(?:table\\s+)?' + prefix + '\\s+to\\s+(?:anon|authenticated|service_role)\\b', 'i');
    const anon = new RegExp('\\bgrant\\b[^;]*\\bon\\s+(?:table\\s+)?' + prefix + '\\s+to\\s+[^;]*\\banon\\b', 'i');
    const privateMarker = new RegExp('(?:^|\\n)\\s*--\\s*DATA_API_PRIVATE:\\s*public\\.' + name + '\\b', 'im');
    const anonMarker = new RegExp('(?:^|\\n)\\s*--\\s*DATA_API_ANON_APPROVED:\\s*public\\.' + name + '\\b', 'im');
    if (!rls.test(sql)) errors.push(file + ': ' + table + ' lacks ENABLE ROW LEVEL SECURITY');
    if (!grant.test(sql) && !privateMarker.test(raw))
      errors.push(file + ': ' + table + ' needs a minimum GRANT or DATA_API_PRIVATE marker in the same migration');
    if (anon.test(sql) && !anonMarker.test(raw))
      errors.push(file + ': ' + table + ' grants anon without DATA_API_ANON_APPROVED marker');
  }
}
if (errors.length) {
  console.error('Public Data API migration guard FAILED:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Public Data API migration guard PASS (' + files.length + ' modified SQL migration(s))');
