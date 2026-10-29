import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const files = walk('dist').filter((f) => f.endsWith('.html'));
const pages = files.map((f) => ({ f, html: readFileSync(f, 'utf8') }));
const pick = (html, re) => html.match(re)?.[1];
const route = (f) => '/' + f.slice(5).replace(/index\.html$/, '').replace(/\/$/, '');

test('builds the expected pages', () => {
  const routes = files.map(route);
  for (const r of ['/', '/tasks', '/booking', '/pricing', '/pricing/eur', '/pricing/inr', '/for/consultants', '/for/events', '/faq', '/compare', '/compare/clickup', '/compare/jira', '/blog', '/for/agencies']) assert.ok(routes.includes(r), r);
});

for (const { f, html } of pages) {
  test(`${f}: seo basics`, () => {
    assert.equal(html.match(/<h1/g)?.length, 1, 'one h1');
    const title = pick(html, /<title>(.*?)<\/title>/s);
    assert.ok(title && title.length <= 65, `title length ${title?.length}`);
    const desc = pick(html, /name="description" content="(.*?)"/s);
    assert.ok(desc && desc.length >= 70 && desc.length <= 160, `description length ${desc?.length}`);
    for (const t of ['rel="canonical"', 'og:title', 'og:description', 'lang="en"']) assert.ok(html.includes(t), t);
  });
  test(`${f}: json-ld valid`, () => {
    const ld = JSON.parse(pick(html, /application\/ld\+json">(.*?)<\/script>/s));
    assert.equal(ld['@context'], 'https://schema.org');
    for (const n of ld['@graph']) assert.ok(n['@type'], 'node has @type');
  });
  test(`${f}: no client js, labelled images`, () => {
    assert.ok(!/<script(?![^>]*ld\+json)/.test(html));
    assert.ok(!/<svg(?![^>]*(aria-label|aria-hidden))[^>]*role="img"/.test(html));
  });
}

test('titles and descriptions are unique', () => {
  for (const re of [/<title>(.*?)<\/title>/s, /name="description" content="(.*?)"/s]) {
    const all = pages.map((p) => pick(p.html, re));
    assert.equal(new Set(all).size, all.length);
  }
});

test('internal links resolve to built pages', () => {
  const routes = new Set(files.map(route));
  for (const { f, html } of pages)
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      if (/\.(xml|svg|txt)$/.test(href)) continue;
      assert.ok(routes.has(href.replace(/\/$/, '') || '/'), `${f} links to missing ${href}`);
    }
});

test('sitemap and robots', () => {
  assert.ok(existsSync('dist/sitemap-index.xml'));
  const map = readFileSync('dist/sitemap-0.xml', 'utf8');
  assert.ok(map.includes('/compare/clickup/') && !map.includes('/privacy/'));
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https?:\/\/.+\/sitemap-index\.xml/);
});

test('pricing pages carry real prices per currency', () => {
  for (const [f, code] of [['dist/pricing/index.html', 'USD'], ['dist/pricing/eur/index.html', 'EUR'], ['dist/pricing/inr/index.html', 'INR']]) {
    const ld = JSON.parse(pick(readFileSync(f, 'utf8'), /application\/ld\+json">(.*?)<\/script>/s));
    const offers = ld['@graph'].filter((n) => n['@type'] === 'Product').flatMap((n) => n.offers);
    assert.equal(offers.length, 6, f);
    for (const o of offers) assert.ok(o.priceCurrency === code && Number(o.price) > 0, f);
  }
});

test('no free plan promised', () => {
  for (const { f, html } of pages) assert.ok(!/free plan|free forever|start free</i.test(html), f);
});
