import { loadCatalog } from './landing.mjs';

export type Landing = {
  url?: string;
  headline: string;
  summary: string;
  category?: string;
  features: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  seo: { title: string; description: string; keywords: string[]; image?: string };
};
export type CatalogProduct = {
  key: string;
  name: string;
  description: string | null;
  url: string;
  landing?: Landing | null;
  plans: { id: string; key: string; name: string; description: string | null; trialDays: number; minSeats: number; prices: { interval: 'month' | 'year'; currency: string; unitAmount: number }[] }[];
};

/** Read once per build. */
export const catalog: CatalogProduct[] = await loadCatalog();
export const landingFor = (key: string) => catalog.find((p) => p.key === key)?.landing ?? null;
/** Products with their own hand-written page; the rest get /apps/<key>. */
export const handWritten = ['tasks', 'booking'];
