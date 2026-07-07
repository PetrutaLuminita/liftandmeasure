// IndexNow is a protocol supported by Bing (and Bing-powered surfaces like
// Copilot) that lets a site push new or changed URLs the moment they change,
// instead of waiting for the search engine's next scheduled crawl. This
// script reads every URL out of the built sitemap and submits them all in
// one batch request after each production build.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const distDir = join(projectRoot, 'dist');

const HOST = 'liftandmeasure.com';
const SITE_ORIGIN = `https://${HOST}`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

function findIndexNowKey() {
  const files = readdirSync(publicDir);
  const keyFile = files.find(
    (name) => /^[a-z0-9]{8,128}\.txt$/i.test(name) && name !== 'robots.txt' && name !== 'ads.txt'
  );
  if (!keyFile) {
    throw new Error(
      `No IndexNow key file found in ${publicDir}. Expected a file like <key>.txt (8-128 alphanumeric characters).`
    );
  }
  return keyFile.replace(/\.txt$/i, '');
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function collectSitemapUrls() {
  const indexPath = join(distDir, 'sitemap-index.xml');
  if (!existsSync(indexPath)) {
    throw new Error(`Sitemap index not found at ${indexPath}. Run the Astro build first.`);
  }
  const indexXml = readFileSync(indexPath, 'utf8');
  const entries = extractLocs(indexXml);

  const urls = new Set();
  for (const entry of entries) {
    if (entry.toLowerCase().endsWith('.xml')) {
      // Nested sitemap file (e.g. sitemap-0.xml) - read it from dist/ and
      // pull its own <loc> entries, which are the actual page URLs.
      const filename = entry.split('/').pop();
      const nestedPath = join(distDir, filename);
      if (!existsSync(nestedPath)) {
        console.warn(`[indexnow] Referenced sitemap ${filename} not found in dist/, skipping.`);
        continue;
      }
      const nestedXml = readFileSync(nestedPath, 'utf8');
      for (const url of extractLocs(nestedXml)) urls.add(url);
    } else {
      // sitemap-index.xml pointed directly at a page URL rather than a
      // nested sitemap file.
      urls.add(entry);
    }
  }
  return [...urls];
}

async function submitToIndexNow(key, urlList) {
  const body = {
    host: HOST,
    key,
    keyLocation: `${SITE_ORIGIN}/${key}.txt`,
    urlList,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  switch (response.status) {
    case 200:
      console.log('[indexnow] 200: URL list submitted successfully.');
      break;
    case 400:
      console.warn('[indexnow] 400: Bad request. The JSON body is malformed or does not match the expected schema.');
      break;
    case 403:
      console.warn(
        `[indexnow] 403: Forbidden. The key file was not found at ${body.keyLocation}, or its contents do not match the key.`
      );
      break;
    case 422:
      console.warn(
        '[indexnow] 422: Unprocessable entity. One or more URLs do not belong to the declared host, or the request does not match the protocol schema.'
      );
      break;
    case 429:
      console.warn('[indexnow] 429: Too many requests. This submission is being rate-limited or flagged as potential spam.');
      break;
    default: {
      const text = await response.text().catch(() => '(could not read response body)');
      console.warn(`[indexnow] ${response.status}: Unexpected response. Body: ${text}`);
    }
  }
}

async function main() {
  let key;
  let urlList;

  try {
    key = findIndexNowKey();
    urlList = collectSitemapUrls();
  } catch (err) {
    console.warn(`[indexnow] Skipping submission: ${err.message}`);
    return;
  }

  console.log(`[indexnow] Key: ${key}`);
  console.log(`[indexnow] Submitting ${urlList.length} URL(s):`);
  for (const url of urlList) console.log(`  - ${url}`);

  try {
    await submitToIndexNow(key, urlList);
  } catch (err) {
    // Network failure, DNS issue, API downtime, etc. This must never fail
    // the build or the deployment.
    console.warn(`[indexnow] Submission failed, continuing anyway: ${err.message}`);
  }
}

main();
