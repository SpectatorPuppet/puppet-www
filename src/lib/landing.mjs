// Each app's landing content comes from its own release: the platform keeps the manifest's
// `landing` section and serves it in GET /v1/catalog. The build reads it once; without
// PUPPET_API_URL (or if the API is down) pages keep the copy in src/data/site.ts.

/** The catalog's products, from the API or a JSON file (CATALOG_FILE, for offline builds). */
export async function loadCatalog(env = process.env, fetchImpl = globalThis.fetch, readFile) {
  try {
    if (env.CATALOG_FILE) {
      const read = readFile ?? (await import('node:fs/promises')).readFile;
      return JSON.parse(await read(env.CATALOG_FILE, 'utf8')).products ?? [];
    }
    if (!env.PUPPET_API_URL) return [];
    const res = await fetchImpl(`${env.PUPPET_API_URL.replace(/\/$/, '')}/v1/catalog?currency=usd`);
    if (!res.ok) throw new Error(`catalog answered ${res.status}`);
    return (await res.json()).products ?? [];
  } catch (error) {
    console.warn(`[landing] using built-in copy: ${error.message}`);
    return [];
  }
}

/**
 * A product page's copy with the app's own landing content laid over it. Fields the app
 * didn't set keep the built-in copy; FAQs and the canonical address only come from the app.
 */
export function mergeLanding(base, landing) {
  if (!landing) return { ...base, faqs: [], canonical: undefined, image: undefined };
  return {
    ...base,
    title: landing.seo?.title || base.title,
    description: landing.seo?.description || base.description,
    h1: landing.headline || base.h1,
    intro: landing.summary || base.intro,
    category: landing.category || base.category,
    features: landing.features?.length ? landing.features : base.features,
    faqs: landing.faqs ?? [],
    canonical: landing.url,
    image: landing.seo?.image,
  };
}

/** Apps with landing content that have no hand-written page yet; each gets /products/<key>. */
export const generatedApps = (products, handWritten) =>
  products.filter((p) => p.landing && !handWritten.includes(p.key));

/**
 * Every product for the Products listing: the hand-written ones (their copy can be replaced by
 * the app's landing content) and then each catalog app with landing content, in catalog order.
 */
export function productListing(builtIn, products) {
  const handWritten = builtIn.map((b) => b.key);
  const landingOf = (key) => products.find((p) => p.key === key)?.landing;
  return [
    ...builtIn.map((b) => {
      const l = landingOf(b.key);
      // The app's own landing address (manifest `landing.url`) wins, then the site setting.
      const own = l?.url || b.landingUrl;
      return { ...b, summary: l?.summary || b.summary, category: l?.category || b.category, href: own || b.href, external: Boolean(own) };
    }),
    ...generatedApps(products, handWritten).map((p) => ({
      key: p.key,
      name: p.name,
      category: p.landing.category ?? '',
      summary: p.landing.summary,
      href: p.landing.url || `/products/${p.key}`,
      external: Boolean(p.landing.url),
    })),
  ];
}

const CURRENCIES = ['usd', 'eur', 'inr'];

/**
 * The catalog in every currency the website shows ({ USD: products, EUR: ..., INR: ... }), so
 * prices staff set under Staff → Plans reach the pricing pages. CATALOG_FILE gives only its own
 * currency. Missing or failing answers leave that currency out.
 */
export async function loadCatalogs(env = process.env, fetchImpl = globalThis.fetch, readFile) {
  const out = {};
  try {
    if (env.CATALOG_FILE) {
      const read = readFile ?? (await import('node:fs/promises')).readFile;
      const file = JSON.parse(await read(env.CATALOG_FILE, 'utf8'));
      if (file.currency) out[file.currency.toUpperCase()] = file.products ?? [];
      return out;
    }
    if (!env.PUPPET_API_URL) return out;
    const base = env.PUPPET_API_URL.replace(/\/$/, '');
    for (const cur of CURRENCIES) {
      const res = await fetchImpl(`${base}/v1/catalog?currency=${cur}`);
      if (res.ok) out[cur.toUpperCase()] = (await res.json()).products ?? [];
    }
  } catch (error) {
    console.warn(`[prices] using built-in prices: ${error.message}`);
  }
  return out;
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * The website's price table with staff prices from the catalog laid over it: a plan the catalog
 * prices in a currency shows that price (per month, from the yearly price when there is one, as
 * the site says "billed annually"); anything the catalog lacks keeps the built-in number.
 */
export function applyCatalogPrices(pricing, byCurrency) {
  return pricing.map((product) => ({
    ...product,
    plans: product.plans.map((plan) => {
      const prices = { ...plan.prices };
      for (const [code, products] of Object.entries(byCurrency)) {
        const live = products
          .find((p) => p.key === slug(product.product))
          ?.plans?.find((p) => p.key === slug(plan.name));
        const of = (interval) =>
          live?.prices?.find((x) => x.interval === interval && x.currency.toUpperCase() === code);
        const year = of('year');
        const month = of('month');
        const minor = year ? year.unitAmount / 12 : month?.unitAmount;
        if (minor !== undefined) prices[code] = Math.round(minor) / 100;
      }
      return { ...plan, prices };
    }),
  }));
}
