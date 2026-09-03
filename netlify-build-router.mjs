import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, '_netlify_publish');
const PUBLIC_DEV_SITE_ID = '33549af8-6845-4c5b-b807-258ba5be1e99';
const PUBLIC_PROD_SITE_ID = '1b763521-f8c0-462a-a0cc-915c1ae56d08';
const PORTAL_SITE_ID = 'a90c686c-e9fc-4373-9956-629c9d31e622';
const DENSITY_LINK = '<link rel="stylesheet" href="./density.css?v=20260903a">';

const siteId = (process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '').trim();
const siteName = (process.env.SITE_NAME || '').trim().toLowerCase();
let host = '';
for (const key of ['URL', 'DEPLOY_PRIME_URL', 'DEPLOY_URL']) {
  try {
    const value = process.env[key];
    if (value) { host = new URL(value).hostname.toLowerCase(); break; }
  } catch {}
}

const isPublicDev = siteId === PUBLIC_DEV_SITE_ID || siteName === 'dev-aidme-no' || host === 'dev.aidme.no';
const isPublicProd = siteId === PUBLIC_PROD_SITE_ID || siteName === 'aidme-public-candidate-20260817' || host === 'www.aidme.no' || host === 'aidme.no';
const isPortal = siteId === PORTAL_SITE_ID || siteName === 'mycamino' || host === 'my.aidme.no' || host.endsWith('--mycamino.netlify.app') || host === 'mycamino.netlify.app';
const matchCount = [isPublicDev, isPublicProd, isPortal].filter(Boolean).length;

if (matchCount > 1) throw new Error(`Ambiguous Netlify target: siteId=${siteId} siteName=${siteName} host=${host}`);
if (matchCount === 0) throw new Error(`Unknown Netlify target; refusing to publish the wrong product. siteId=${siteId || '(empty)'} siteName=${siteName || '(empty)'} host=${host || '(empty)'}`);

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit ${result.status}`);
}

async function injectPortalDensity(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await injectPortalDensity(file);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    if (html.includes('density.css') || !html.includes('</head>')) continue;
    await writeFile(file, html.replace('</head>', `${DENSITY_LINK}\n</head>`), 'utf8');
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

if (isPublicDev || isPublicProd) {
  const mode = isPublicProd ? 'PUBLIC PROD' : 'PUBLIC DEV';
  console.log(`Netlify build router: ${mode} (${siteId || siteName || host})`);
  const buildEnv = isPublicProd
    ? { ...process.env, URL: 'https://aidme.no', CONTEXT: 'production' }
    : process.env;
  run(process.execPath, ['public-site/current/seo-build.mjs'], buildEnv);
  await cp(resolve(root, 'public-site/current/_site'), out, { recursive: true });
  console.log(`Netlify build router: ${mode} published public-site/current/_site -> _netlify_publish`);
} else {
  console.log(`Netlify build router: PORTAL (${siteId || siteName || host})`);
  run(process.execPath, ['portal/build-app.mjs']);
  const excluded = new Set(['.git', '.netlify', 'node_modules', '_netlify_publish']);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    await cp(resolve(root, entry.name), resolve(out, entry.name), { recursive: true });
  }
  await injectPortalDensity(resolve(out, 'portal'));
  console.log('Netlify build router: mirrored existing root publish output -> _netlify_publish');
  console.log('Netlify build router: injected desktop density stylesheet into portal HTML output');
}
