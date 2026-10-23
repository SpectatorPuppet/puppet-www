import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// Brand domain not decided yet: set SITE_URL in the deploy environment.
export default defineConfig({ site: process.env.SITE_URL ?? 'https://example.com', integrations: [sitemap()], build: { inlineStylesheets: 'always' } });
