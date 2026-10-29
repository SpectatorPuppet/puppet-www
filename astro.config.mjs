import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// Brand domain not decided yet: set SITE_URL in the deploy environment.
// Draft legal pages are noindex, so they stay out of the sitemap too.
const drafts = ['/privacy/', '/terms/'];
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [sitemap({ filter: (page) => !drafts.some((d) => page.endsWith(d)) })],
  build: { inlineStylesheets: 'always' },
});
