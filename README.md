# puppet-www

Puppet public website (Astro, static, zero JS).

- `npm i` then `npm run dev` (http://localhost:4321)
- `npm test` builds every page and checks SEO: one h1, title/description length and uniqueness, canonical + Open Graph, valid JSON-LD, internal links, sitemap, robots, per-currency prices
- Copy, prices (USD/EUR/INR), FAQs, comparisons, audiences and blog posts live in `src/data/site.ts`

Build env (domain not decided): `SITE_URL` (canonical, sitemap, robots), `APP_URL` (sign-in/sign-up), `TASKS_APP_URL` (live demo at /demo), `CONTACT_EMAIL` (Book a demo).
