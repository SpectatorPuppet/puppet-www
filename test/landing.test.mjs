import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatedApps, loadCatalog, mergeLanding, productListing } from '../src/lib/landing.mjs';

const base = { title: 'T', description: 'D', h1: 'H', intro: 'I', category: 'C', features: [{ title: 'a', text: 'b' }] };
const landing = {
  url: 'https://notes.example/',
  headline: 'Notes',
  summary: 'Shared notes.',
  features: [{ title: 'Live', text: 'Type together.' }],
  faqs: [{ q: 'Trial?', a: 'Yes.' }],
  seo: { title: 'Notes for teams', description: 'Shared notes', keywords: [], image: 'https://notes.example/og.png' },
};

test('the app landing content wins, built-in copy fills gaps', () => {
  assert.deepEqual(mergeLanding(base, landing), {
    title: 'Notes for teams', description: 'Shared notes', h1: 'Notes', intro: 'Shared notes.', category: 'C',
    features: landing.features, faqs: landing.faqs, canonical: 'https://notes.example/', image: 'https://notes.example/og.png',
  });
  assert.deepEqual(mergeLanding(base, { ...landing, features: [], url: undefined }).features, base.features);
  assert.deepEqual(mergeLanding(base, null), { ...base, faqs: [], canonical: undefined, image: undefined });
});

test('loads the catalog from the API, a file, or falls back to nothing', async () => {
  const products = [{ key: 'notes', landing }];
  const seen = [];
  const fetchOk = async (url) => { seen.push(url); return { ok: true, json: async () => ({ products }) }; };
  assert.deepEqual(await loadCatalog({ PUPPET_API_URL: 'https://api.example/' }, fetchOk), products);
  assert.deepEqual(seen, ['https://api.example/v1/catalog?currency=usd']);
  assert.deepEqual(await loadCatalog({}, fetchOk), []);
  assert.deepEqual(await loadCatalog({ PUPPET_API_URL: 'https://api.example' }, async () => ({ ok: false, status: 503 })), []);
  assert.deepEqual(await loadCatalog({ CATALOG_FILE: 'x.json' }, fetchOk, async () => JSON.stringify({ products })), products);
});

test('apps without a hand-written page get a generated one', () => {
  const list = [{ key: 'tasks', landing }, { key: 'notes', landing }, { key: 'bare', landing: null }];
  assert.deepEqual(generatedApps(list, ['tasks']).map((p) => p.key), ['notes']);
});

test('the Products listing keeps hand-written products first, then catalog apps with landing content', () => {
  const builtIn = [{ key: 'tasks', name: 'Tasks', category: 'Project management', summary: 'Built-in copy.', href: '/tasks' }];
  const products = [
    { key: 'tasks', name: 'Tasks', landing: { summary: 'From the release.', category: '' } },
    { key: 'notes', name: 'Notes', landing: { summary: 'Shared notes.', category: 'Notes' } },
    { key: 'bare', name: 'Bare', landing: null },
  ];
  assert.deepEqual(productListing(builtIn, products), [
    { key: 'tasks', name: 'Tasks', category: 'Project management', summary: 'From the release.', href: '/tasks' },
    { key: 'notes', name: 'Notes', category: 'Notes', summary: 'Shared notes.', href: '/apps/notes' },
  ]);
  assert.deepEqual(productListing(builtIn, []), builtIn);
});
