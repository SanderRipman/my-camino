import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '_site');
const canonicalOrigin = 'https://www.aidme.no';
const indexablePages = [
  'index.html',
  'via.html',
  'ser.html',
  'vida.html',
  'deltakere.html',
  'partnere.html',
  'ruter.html',
  'om.html',
  'kontakt.html',
];

const excluded = new Set(['_site', 'netlify.toml', 'seo-build.mjs']);
const escapeAttr = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of await readdir(here, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  await cp(join(here, entry.name), join(out, entry.name), { recursive: true });
}

for (const page of indexablePages) {
  const path = join(out, page);
  let html = await readFile(path, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim();
  const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)">/i);
  const description = descriptionMatch?.[1]?.trim();
  if (!title || !descriptionMatch || !description) {
    throw new Error(`Missing title or description in ${page}`);
  }
  if (/rel="canonical"/i.test(html)) {
    throw new Error(`Canonical already exists in ${page}; update seo-build.mjs instead of stacking tags.`);
  }

  const canonicalPath = page === 'index.html' ? '/' : `/${page}`;
  const canonical = `${canonicalOrigin}${canonicalPath}`;
  const seo = [
    `<link rel="canonical" href="${escapeAttr(canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="AidMe VIDA">',
    '<meta property="og:locale" content="nb_NO">',
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:url" content="${escapeAttr(canonical)}">`,
    `<meta property="og:image" content="${canonicalOrigin}/assets/hero-group.webp">`,
    '<meta property="og:image:alt" content="AidMe VIDA · Camino, fellesskap og veien videre">',
    '<meta name="twitter:card" content="summary_large_image">',
  ].join('\n');

  html = html.replace(descriptionMatch[0], `${descriptionMatch[0]}\n${seo}`);
  await writeFile(path, html, 'utf8');
}

const thankYouHtml = await readFile(join(out, 'takk.html'), 'utf8');
if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(thankYouHtml)) {
  throw new Error('takk.html must remain noindex.');
}

const sitemapUrls = indexablePages.map((page) =>
  `${canonicalOrigin}${page === 'index.html' ? '/' : `/${page}`}`
);
await writeFile(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,
  'utf8',
);
await writeFile(
  join(out, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${canonicalOrigin}/sitemap.xml\n`,
  'utf8',
);

let deployHost = '';
try { deployHost = new URL(process.env.URL || '').hostname.toLowerCase(); } catch {}
const context = (process.env.CONTEXT || '').toLowerCase();
const isPublicHost = deployHost === 'www.aidme.no' || deployHost === 'aidme.no';
const shouldNoIndex = !isPublicHost || context === 'deploy-preview' || context === 'branch-deploy';
if (shouldNoIndex) {
  const headersPath = join(out, '_headers');
  let headers = '';
  try { headers = await readFile(headersPath, 'utf8'); } catch {}
  if (!/X-Robots-Tag:/i.test(headers)) {
    headers = `${headers.trimEnd()}\n\n/*\n  X-Robots-Tag: noindex, nofollow\n`;
  }
  await writeFile(headersPath, headers, 'utf8');
}

console.log(`AidMe public build: ${indexablePages.length} indexable pages; canonical=${canonicalOrigin}; noindex=${shouldNoIndex}`);
