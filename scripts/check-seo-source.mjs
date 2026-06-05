import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { landingContent } from '../src/data/landingContent.js';

const defaultSource = new URL('../briefs/SEO.md', import.meta.url);
const sourceUrl = process.env.SEO_SOURCE ? new URL(process.env.SEO_SOURCE, `file://${process.cwd()}/`) : defaultSource;
const requireSource = process.env.REQUIRE_SEO_SOURCE === '1';

function flattenText(value, path = 'landingContent') {
  if (typeof value === 'string') {
    return value.length > 0 ? [{ path, value }] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenText(item, `${path}[${index}]`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => flattenText(item, `${path}.${key}`));
  }

  return [];
}

function sourcePath() {
  return decodeURIComponent(sourceUrl.pathname);
}

try {
  await access(sourceUrl, constants.R_OK);
} catch {
  const message = `SEO source file is not available: ${sourcePath()}`;
  if (requireSource) {
    console.error(message);
    process.exit(1);
  }

  console.warn(`${message}. Skipping source audit because REQUIRE_SEO_SOURCE is not set to 1.`);
  process.exit(0);
}

const source = await readFile(sourceUrl, 'utf8');
const entries = flattenText(landingContent);
const missing = entries.filter(({ value }) => !source.includes(value));

if (missing.length > 0) {
  console.error(`Some landingContent strings are not present verbatim in ${sourcePath()}:`);
  for (const item of missing) {
    console.error(`- ${item.path}`);
  }
  process.exit(1);
}

console.log(`Checked ${entries.length} landingContent string(s); all are present verbatim in ${sourcePath()}.`);
