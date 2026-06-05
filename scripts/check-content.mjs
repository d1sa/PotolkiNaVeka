import { readFile } from 'node:fs/promises';
import { landingContent } from '../src/data/landingContent.js';

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

function decodeHtml(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&amp;', '&');
}

const html = decodeHtml(await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
const contentEntries = flattenText(landingContent);
const missing = contentEntries.filter(({ value }) => !html.includes(value));

if (missing.length > 0) {
  console.error('Some content strings are missing from dist/index.html:');
  for (const item of missing) {
    console.error(`- ${item.path}`);
  }
  process.exit(1);
}

console.log(`Checked ${contentEntries.length} content string(s); all are present in dist/index.html.`);
