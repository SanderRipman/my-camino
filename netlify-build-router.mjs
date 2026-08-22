import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, '_netlify_publish');
const PUBLIC_SITE_ID = '33549af8-6845-4c5b-b807-258ba5be1e99';
const PORTAL_SITE_ID = 'a90c686c-e9fc-4373-9956-629c9d31e622';

const siteId = (process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '').trim();
const siteName = (process.env.SITE_NAME || '').trim().toLowerCase();
let host = '';
for (const key of ['URL', 'DEPLOY_PRIME_URL', 'DEPLOY_URL']) {
  try {
    const value = process.env[key];
    if (value) { host = new URL(value).hostname.toLowerCase(); break; }
  } catch {}
}

const isPublic = siteId === PUBLIC_SITE_ID || siteName === 'dev-aidme-no' || host === 'dev.aidme.no';
const isPortal = siteId === PORTAL_SITE_ID || siteName === 'mycamino' || host === 'my.aidme.no' || host.endsWith('--mycamino.netlify.app') || host === 'mycamino.netlify.app';

if (isPublic && isPortal) throw new Error(`Ambiguous Netlify target: siteId=${siteId} siteName=${siteName} host=${host}`);
if (!isPublic && !isPortal) throw new Error(`Unknown Netlify target; refusing to publish the wrong product. siteId=${siteId || '(empty)'} siteName=${siteName || '(empty)'} host=${host || '(empty)'}`);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

if (isPublic) {
  console.log(`Netlify build router: PUBLIC DEV (${siteId || siteName || host})`);
  run(process.execPath, ['public-site/current/seo-build.mjs']);
  await cp(resolve(root, 'public-site/current/_site'), out, { recursive: true });
  console.log('Netlify build router: published public-site/current/_site -> _netlify_publish');
} else {
  console.log(`Netlify build router: PORTAL (${siteId || siteName || host})`);
  run(process.execPath, ['portal/build-app.mjs']);
  const excluded = new Set(['.git', '.netlify', 'node_modules', '_netlify_publish']);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    await cp(resolve(root, entry.name), resolve(out, entry.name), { recursive: true });
  }
  console.log('Netlify build router: mirrored existing root publish output -> _netlify_publish');
}
