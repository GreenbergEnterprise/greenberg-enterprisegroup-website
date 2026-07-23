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
  (like the MongoDB health check below) render dynamically per request. Hosts
  anywhere that runs Next.js (Vercel, Netlify, a Node server, etc.).
- **MongoDB** connection plumbing is wired up (`lib/mongodb.ts`), but the
  homepage still reads its content from the typed `lib/content.ts` module, not
  the database. See [MongoDB setup](#mongodb-setup) to configure the
  connection, and [Adding MongoDB later](#adding-mongodb-later) to actually
  move content into it.

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
  api/health/db/       GET route that pings MongoDB — use it to verify setup
lib/
  content.ts        ALL site copy/data in one typed object — edit here
  mongodb.ts        Cached MongoDB connection helper (getMongoClient / getDb)
public/
  geg-mark.png          Logo mark (dark, used in the header)
  geg-mark-light.png    Logo mark (light, used in the dark footer)
  hero-architecture.png Hero background image
.env.example        MongoDB env var names/format — copy to .env.local
```

## Editing content

Everything you'd want to change — headline, portfolio companies, principles,
track record, contact email, footer — is in **`lib/content.ts`**, a single
strongly-typed `SiteContent` object. Edit the values there and the page
updates. You do not need to touch `page.tsx` for copy changes.

For example, to add a portfolio company, append an entry to
`content.portfolio.companies`; to change the contact address, update the
`EMAIL` constant near the top of the file.

## MongoDB setup

Two environment variables control the connection, read in `lib/mongodb.ts`:

| Variable | Required | Example |
| --- | --- | --- |
| `MONGODB_URI` | Yes | `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB` | No (if the URI already ends in `/<dbname>`) | `greenberg` |

Get the URI from **MongoDB Atlas → your cluster → Connect → Drivers**, and
substitute your database user's username/password (create one under
**Database Access** if you haven't). Also confirm your current IP — or
`0.0.0.0/0` for "anywhere," which is what a serverless host like Vercel needs
since its outbound IPs aren't fixed — is allowed under **Network Access**.

### Local development

1. Copy the example file: `cp .env.example .env.local`
2. Paste your real connection string into `MONGODB_URI` in `.env.local`.
   This file is already listed in `.gitignore`, so it's never committed.
3. Run `npm run dev`, then visit `http://localhost:3000/api/health/db`.
   `{"ok":true,"database":"..."}` confirms the connection works.

### Vercel (production/preview deployments)

Vercel doesn't read `.env.local` (it's git-ignored, and Vercel only deploys
what's in the repo) — environment variables for a deployed site are set in
the Vercel dashboard instead:

1. On [vercel.com](https://vercel.com), open the project connected to this
   repo. (If you haven't connected one yet: **Add New → Project**, import
   this GitHub repo, and Vercel will auto-detect the Next.js settings — no
   custom build config needed.)
2. Go to **Settings → Environment Variables**.
3. Add a variable named `MONGODB_URI`, paste your connection string as the
   value, and check all three environments (**Production**, **Preview**,
   **Development**) unless you want different databases per environment.
4. Add `MONGODB_DB` the same way if you're using it.
5. Save, then **redeploy** (Vercel only picks up new env vars on the next
   build — go to **Deployments**, open the latest one, and use **Redeploy**).
6. Visit `https://<your-domain>/api/health/db` on the deployed site to
   confirm — same `{"ok":true,...}` response as local.

## Adding MongoDB later

Once the connection above is verified, the content itself can move from the
static file into the database:

1. `lib/content.ts` exports a typed `SiteContent` object. Add a data-access
   function (e.g. in `lib/content.ts` or a new module) that calls `getDb()`
   from `lib/mongodb.ts` and returns data in that same `SiteContent` shape.
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
