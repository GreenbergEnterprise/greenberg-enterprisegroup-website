# Greenberg Enterprise Group — Website

The corporate website for **Greenberg Enterprise Group, LLC**, rebuilt as a
[Next.js](https://nextjs.org/) application (App Router + TypeScript).

This is a faithful migration of the original single-page site. All copy,
portfolio companies, links, imagery, and the exact stylesheet were carried over
1:1.

## Tech stack

- **Next.js 16** (App Router, React Server Components)
- **React 19**
- **TypeScript**
- The homepage prerenders to static HTML, so it's cheap to serve; API routes
  (like the database health check below) render dynamically per request. Hosts
  anywhere that runs Next.js (Vercel, Netlify, a Node server, etc.).
- **Postgres (Supabase)** connection plumbing is wired up (`lib/db.ts`) and
  backs the contact form. The homepage still reads its content from the typed
  `lib/content.ts` module, not the database. See [Database setup](#database-setup)
  to configure the connection, and [Moving content into the database
  later](#moving-content-into-the-database-later) if you ever want the copy in
  Postgres too.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm start        # serve the production build
npm run lint     # lint
```

## Project structure

```
app/
  layout.tsx           Root layout + <head> metadata (title, description, OG tags)
  page.tsx             The full single-page site, assembled from lib/content.ts
  globals.css          The site's stylesheet (ported verbatim from the original)
  icon.png             Favicon (GEG mark), auto-detected by Next.js
  api/health/db/       GET route that pings Postgres — use it to verify setup
lib/
  content.ts        ALL site copy/data in one typed object — edit here
  db.ts             Cached Postgres (Supabase) connection helper (getSql)
supabase/
  migrations/       SQL migrations (the contact_submissions table)
public/
  geg-mark.png          Logo mark (dark, used in the header)
  geg-mark-light.png    Logo mark (light, used in the dark footer)
  hero-architecture.png Hero background image
.env.example        Env var names/format (DATABASE_URL, …) — copy to .env.local
```

## Editing content

Everything you'd want to change — headline, portfolio companies, principles,
track record, contact email, footer — is in **`lib/content.ts`**, a single
strongly-typed `SiteContent` object. Edit the values there and the page
updates. You do not need to touch `page.tsx` for copy changes.

For example, to add a portfolio company, append an entry to
`content.portfolio.companies`; to change the contact address, update the
`EMAIL` constant near the top of the file.

## Database setup

The contact form stores submissions in Postgres, hosted on
[Supabase](https://supabase.com). One environment variable controls the
connection, read in `lib/db.ts`:

| Variable | Required | Example |
| --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres` |

Use the **connection pooler** string (Supabase dashboard → your project →
**Connect** → **Transaction pooler**, port `6543`). The pooler is what works
from serverless hosts like Vercel; the direct `db.<ref>.supabase.co` host is
IPv6-only and isn't reachable from Vercel's functions.

The `contact_submissions` table is created by the migration in
`supabase/migrations/`. Row Level Security is enabled with no policies, so the
table is reachable only over this server-side connection, never the public
anon/publishable key.

### Local development

1. Copy the example file: `cp .env.example .env.local`
2. Paste your pooler connection string into `DATABASE_URL` in `.env.local`.
   This file is already listed in `.gitignore`, so it's never committed.
3. Run `npm run dev`, then visit `http://localhost:3000/api/health/db`.
   `{"ok":true,"database":"postgres"}` confirms the connection works.

### Vercel (production/preview deployments)

Vercel doesn't read `.env.local` (it's git-ignored, and Vercel only deploys
what's in the repo) — environment variables for a deployed site are set in
the Vercel dashboard instead:

1. On [vercel.com](https://vercel.com), open the project connected to this
   repo. (If you haven't connected one yet: **Add New → Project**, import
   this GitHub repo, and Vercel will auto-detect the Next.js settings — no
   custom build config needed.)
2. Go to **Settings → Environment Variables**.
3. Add a variable named `DATABASE_URL`, paste the pooler connection string as
   the value, and check the environments you want (**Production**,
   **Preview**, **Development**).
4. Save, then **redeploy** (Vercel only picks up new env vars on the next
   build — go to **Deployments**, open the latest one, and use **Redeploy**).
5. Visit `https://<your-domain>/api/health/db` on the deployed site to
   confirm — same `{"ok":true,...}` response as local.

## Contact form setup

The homepage contact form (`components/v2fx/ContactForm.tsx`) saves every
submission to the `contact_submissions` table in Postgres (the same connection
as above) and, if configured, sends a confirmation email to the visitor and a
notification email to your team via [Resend](https://resend.com). Spam is
filtered by a self-hosted CAPTCHA (no third-party account or API key needed)
plus a honeypot field.

### CAPTCHA (`CAPTCHA_SECRET`)

The CAPTCHA (`lib/captcha.ts`, served from `/api/captcha`) is generated and
verified entirely in this codebase — a noisy-text image challenge, with an
accessible arithmetic-question alternative. Its answer is encrypted
(AES-256-GCM) into a short-lived token the browser holds and the server
decrypts back on submit — nothing is stored server-side between issuing a
challenge and verifying it.

All this needs is a secret key for the encryption, in `CAPTCHA_SECRET`. It
isn't tied to any account — generate one yourself:

```bash
openssl rand -hex 32
```

Add the result to `.env.local` for local development, and to Vercel's
**Settings → Environment Variables** (all three environments) for the
deployed site — same as `DATABASE_URL` above. Without it, the contact form's
API routes return a clear "CAPTCHA_SECRET is not set" error instead of
crashing (there is a fallback for `npm run dev`, but not for a production
build).

### Email (`RESEND_API_KEY`)

1. Create a free account at [resend.com](https://resend.com) and copy an API
   key from **Settings → API Keys**.
2. Add `RESEND_API_KEY` to `.env.local` / Vercel's environment variables.
3. For testing, emails can send from Resend's shared sandbox address
   (`onboarding@resend.dev` — this is the default if `CONTACT_FROM_EMAIL`
   isn't set), but it **only delivers to the email address on your own
   Resend account** — visitors won't actually receive anything from it.
4. To email real visitors, verify a sending domain in Resend (**Domains →
   Add Domain**, then add the DNS records it gives you), then set
   `CONTACT_FROM_EMAIL` to an address on that domain, e.g.
   `"Greenberg Enterprise Group <hello@greenbergenterprisegroup.com>"`.
5. Optional: set `CONTACT_TO_EMAIL` if the "new submission" notification
   should go somewhere other than the contact email in `lib/content.ts`.

If `RESEND_API_KEY` isn't set, the form still works end-to-end (submissions
still save to Postgres) — it just skips sending emails and logs a warning
server-side, the same graceful-degradation pattern as the database connection
above.

## Moving content into the database later

The contact form already uses Postgres; the homepage copy still comes from the
static `lib/content.ts`. If you ever want the copy in the database too:

1. `lib/content.ts` exports a typed `SiteContent` object. Add a data-access
   function (e.g. in `lib/content.ts` or a new module) that uses `getSql()`
   from `lib/db.ts` and returns data in that same `SiteContent` shape.
2. Make `app/page.tsx` `async` and fetch the content in the component (it is
   already a Server Component, so it can query the database directly and stay
   fully server-rendered).

Because the components only depend on the `SiteContent` type, swapping the
source from a static file to a database does not require UI changes.

## Assets & fonts

- Logo, hero image, and favicon are the original PNGs, served from `public/`.
- Fonts (DM Serif Display for headings, Manrope for body) are pulled from
  Google Fonts via an `@import` at the top of `globals.css`, matching the
  original site.
