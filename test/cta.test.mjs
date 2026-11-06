import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Runs on the built site (npm test builds first) with the default APP_URL.
const read = (f) => readFileSync(join('dist', f), 'utf8');
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));

test('plan CTAs open sign-up with product and plan', () => {
  const links = hrefs(read('pricing/index.html')).filter((h) => h.includes('product='));
  for (const want of ['product=tasks&plan=basic', 'product=tasks&plan=byo-key', 'product=tasks&plan=pro', 'product=booking&plan=basic']) {
    assert.ok(links.some((h) => h.endsWith(want)), want);
  }
  for (const h of links) {
    const url = new URL(h);
    assert.equal(url.pathname, '/auth/sign-in');
    assert.equal(url.searchParams.get('create'), '1');
    assert.match(url.searchParams.get('plan') ?? '', /^[a-z0-9-]+$/);
  }
});

test('no link points at the old /signup path', () => {
  const pages = readdirSync('dist', { recursive: true }).filter((f) => String(f).endsWith('.html'));
  for (const f of pages) assert.ok(!hrefs(read(String(f))).some((h) => h.endsWith('/signup')), String(f));
});
