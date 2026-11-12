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

/** Apps with landing content that have no hand-written page yet; each gets /apps/<key>. */
export const generatedApps = (products, handWritten) =>
  products.filter((p) => p.landing && !handWritten.includes(p.key));
