// Prices on the website come from the platform catalog (Staff → Plans) at build time; the numbers
// in src/data/site.ts are only the fallback when PUPPET_API_URL is not set or the API is down.
import { currencies, pricing as builtIn, type Currency, type Plan } from '../data/site';
import { applyCatalogPrices, loadCatalogs } from './landing.mjs';

export const pricing: typeof builtIn = applyCatalogPrices(builtIn, await loadCatalogs());
const amount = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
export const price = (p: Plan, c: Currency) => `${c.symbol}${amount(p.prices[c.code])}`;
export const fromPrice = (product: 'Tasks' | 'Booking', c: Currency = currencies[0]) =>
  price(pricing.find((x) => x.product === product)!.plans[0], c);
