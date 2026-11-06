import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const page = (slug) => readFileSync(`dist/legal/${slug}/index.html`, 'utf8');

test('legal pages exist, show a last-updated date and stay noindex while they are templates', () => {
  for (const slug of ['terms', 'privacy', 'refunds', 'developer-terms']) {
    const html = page(slug);
    assert.match(html, /Last updated <time datetime="\d{4}-\d{2}-\d{2}"/, slug);
    assert.match(html, /Template under review/, slug);
    assert.match(html, /<meta name="robots" content="noindex">/, slug);
  }
  assert.ok(!readFileSync('dist/sitemap-0.xml', 'utf8').includes('/legal/'));
});

test('developer terms cover review, scopes, deletion, suspension, security contact, brand', () => {
  const html = page('developer-terms');
  for (const words of ['Review before going live', 'Least-privilege scopes', 'within 30 days', 'Suspension and revocation', 'Security contact', 'made or endorsed by']) {
    assert.ok(html.includes(words), words);
  }
});

test('footer links every policy and old paths redirect', () => {
  const home = readFileSync('dist/index.html', 'utf8');
  for (const slug of ['terms', 'privacy', 'refunds', 'developer-terms']) assert.ok(home.includes(`href="/legal/${slug}"`), slug);
  assert.ok(!existsSync('dist/terms/index.html'));
  const redirects = readFileSync('dist/_redirects', 'utf8');
  assert.match(redirects, /^\/terms \/legal\/terms 301$/m);
  assert.match(redirects, /^\/privacy \/legal\/privacy 301$/m);
});
