# puppet-www

Puppet public website (Astro, static, zero JS).

- `npm i` then `npm run dev` (http://localhost:4321)
- `npm test` builds every page and checks SEO: one h1, title/description length and uniqueness, canonical + Open Graph, valid JSON-LD, internal links, sitemap, robots, per-currency prices
- Copy, prices (USD/EUR/INR), FAQs, comparisons, audiences and blog posts live in `src/data/site.ts`

Build env (domain not decided): `SITE_URL` (canonical, sitemap, robots), `APP_URL` (sign-in/sign-up), `TASKS_APP_URL` (live demo at /demo), `CONTACT_EMAIL` (Book a demo), `CF_ANALYTICS_TOKEN` (Cloudflare Web Analytics site token; no beacon without it). The social card is `public/og.png` (1200×630). After launch, add the site to Google Search Console and submit `/sitemap-index.xml`.

Plan buttons link to `APP_URL/auth/sign-in?create=1&product=<key>&plan=<key>` (`signupLink` in `src/data/site.ts`); the portal keeps product and plan through sign-up and opens that plan's checkout. Legal pages live in `src/pages/legal/` (terms, privacy, refunds, developer terms) on the `Legal` frame: templates, noindex with a review banner until `reviewed` is set. `public/_redirects` sends the old `/terms` and `/privacy` there.
