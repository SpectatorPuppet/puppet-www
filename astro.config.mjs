import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { assertDeployEnv } from './src/lib/deploy-env.mjs';
// Brand domain not decided yet: set SITE_URL in the deploy environment.
// Draft legal pages are noindex, so they stay out of the sitemap too.
const drafts = ['/legal/'];
// A production Pages build stops here when a setting is missing, instead of shipping example.com.
assertDeployEnv();
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [sitemap({ filter: (page) => !drafts.some((d) => page.includes(d)) })],
  build: { inlineStylesheets: 'always' },
  // Scripts stay files under /_astro/ (never inline): the CSP allows script-src 'self' only.
  vite: { build: { assetsInlineLimit: 0 } },
});
