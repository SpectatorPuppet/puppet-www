import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyCatalogPrices, generatedApps, loadCatalog, loadCatalogs, mergeLanding, productListing } from '../src/lib/landing.mjs';

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
    { key: 'tasks', name: 'Tasks', category: 'Project management', summary: 'From the release.', href: '/tasks', external: false },
    { key: 'notes', name: 'Notes', category: 'Notes', summary: 'Shared notes.', href: '/products/notes', external: false },
  ]);
  assert.deepEqual(productListing(builtIn, []), builtIn.map((b) => ({ ...b, external: false })));
});

test('a product with its own landing address opens there (new tab), the app release first', () => {
  const builtIn = [
    { key: 'tasks', name: 'Tasks', category: '', summary: 'x', href: '/products/tasks', landingUrl: 'https://tasks.example' },
    { key: 'booking', name: 'Booking', category: '', summary: 'y', href: '/products/booking' },
  ];
  const products = [
    { key: 'booking', name: 'Booking', landing: { summary: 'y', url: 'https://booking.example/' } },
    { key: 'notes', name: 'Notes', landing: { summary: 'z', url: 'https://notes.example/' } },
  ];
  const out = productListing(builtIn, products);
  assert.deepEqual(out.map((p) => [p.href, p.external]), [['https://tasks.example', true], ['https://booking.example/', true], ['https://notes.example/', true]]);
});

test('staff prices from the catalog replace the built-in ones, per currency', () => {
  const builtIn = [{ product: 'Tasks', unit: 'per user / month', plans: [
    { name: 'Basic', prices: { USD: 5, EUR: 5, INR: 199 } },
    { name: 'BYO key', prices: { USD: 7, EUR: 7, INR: 299 } },
  ] }];
  const plans = (cur, basic) => [{ key: 'tasks', plans: [
    { key: 'basic', prices: [{ interval: 'month', currency: cur, unitAmount: basic * 2 }, { interval: 'year', currency: cur, unitAmount: basic * 12 }] },
  ] }];
  const out = applyCatalogPrices(builtIn, { USD: plans('usd', 600), INR: plans('inr', 24900) });
  assert.deepEqual(out[0].plans[0].prices, { USD: 6, EUR: 5, INR: 249 });
  assert.deepEqual(out[0].plans[1].prices, { USD: 7, EUR: 7, INR: 299 });
  assert.deepEqual(applyCatalogPrices(builtIn, {}), builtIn);
});

test('loads the catalog in each currency, skipping ones that fail', async () => {
  const seen = [];
  const fetchImpl = async (url) => {
    seen.push(url);
    return url.endsWith('eur') ? { ok: false } : { ok: true, json: async () => ({ products: [{ key: 'tasks' }] }) };
  };
  const out = await loadCatalogs({ PUPPET_API_URL: 'https://api.test/' }, fetchImpl);
  assert.deepEqual(Object.keys(out), ['USD', 'INR']);
  assert.equal(seen[0], 'https://api.test/v1/catalog?currency=usd');
});
