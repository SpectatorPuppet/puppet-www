# puppet-www

Puppet public website (Astro, static, zero JS).

- `npm i` then `npm run dev` (http://localhost:4321)
- `npm test` builds every page and checks SEO: one h1, title/description length and uniqueness, canonical + Open Graph, valid JSON-LD, internal links, sitemap, robots, per-currency prices
- Copy, prices (USD/EUR/INR), FAQs, comparisons, audiences and blog posts live in `src/data/site.ts`

Build env (domain not decided): `SITE_URL` (canonical, sitemap, robots), `APP_URL` (sign-in/sign-up), `TASKS_APP_URL` (live demo at /demo), `CONTACT_EMAIL` (Book a demo), `DEVELOPER_DOCS_URL` (developer quickstart link on /developers; defaults to puppet-kit on npm), `CF_ANALYTICS_TOKEN` (Cloudflare Web Analytics site token; no beacon without it), `PUPPET_API_URL` (the platform API: each app's `landing` content from `GET /v1/catalog` replaces the built-in copy on its product page, and apps without a hand-written page get `/apps/<key>`; rebuild after an app's release to pick up changes; `CATALOG_FILE` reads the catalog from a JSON file instead). The social card is `public/og.png` (1200×630). After launch, add the site to Google Search Console and submit `/sitemap-index.xml`.

Plan buttons link to `APP_URL/auth/sign-in?create=1&product=<key>&plan=<key>` (`signupLink` in `src/data/site.ts`); the portal keeps product and plan through sign-up and opens that plan's checkout. Legal pages live in `src/pages/legal/` (terms, privacy, refunds, developer terms) on the `Legal` frame: templates, noindex with a review banner until `reviewed` is set. `public/_redirects` sends the old `/terms` and `/privacy` there.

## Deploy on Cloudflare Pages (free)

Pages builds from GitHub itself, so deploys use no Actions minutes.

1. Cloudflare → Workers & Pages → Create → Pages → **Connect to Git** → this repository.
2. Production branch `main`; build command `npm run build`; output directory `dist`; preview builds for `dev`.
3. Settings → Variables (Production): `SITE_URL` (`https://<domain>`), `APP_URL` (`https://account.<domain>`), `TASKS_APP_URL` (`https://tasks.<domain>`), `CONTACT_EMAIL`, optionally `CF_ANALYTICS_TOKEN` and `DEVELOPER_DOCS_URL`. A production build stops with a clear error while any of the first four is missing or still `example.com` (`src/lib/deploy-env.mjs`).
4. Custom domains: add the apex `<domain>` and `www.<domain>` (redirect www to the apex with a Redirect Rule). Keep `api.`, `account.`, `id.` and app hosts pointing at the VM.

Security headers and long caching for hashed files are in `public/_headers`; old URLs in `public/_redirects`.

**Verify:** `curl -sI https://<domain>/ | grep -i strict-transport`; no `example.com` in the page source; the Release workflow tags what is live.
