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
- Static site — the whole page prerenders to static HTML (`output: static`),
  so it can be hosted anywhere (Vercel, Netlify, S3/CloudFront, GitHub Pages,
  a plain static host, etc.).
- **MongoDB** is intentionally **not** wired up yet. Content currently lives in
  a typed data module and can be swapped for a database later without touching
  the UI — see [Adding MongoDB later](#adding-mongodb-later).

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
  layout.tsx        Root layout + <head> metadata (title, description, OG tags)
  page.tsx          The full single-page site, assembled from lib/content.ts
  globals.css       The site's stylesheet (ported verbatim from the original)
  icon.png          Favicon (GEG mark), auto-detected by Next.js
lib/
  content.ts        ALL site copy/data in one typed object — edit here
public/
  geg-mark.png          Logo mark (dark, used in the header)
  geg-mark-light.png    Logo mark (light, used in the dark footer)
  hero-architecture.png Hero background image
.env.example        Placeholder env vars for when a database is added
```

## Editing content

Everything you'd want to change — headline, portfolio companies, principles,
track record, contact email, footer — is in **`lib/content.ts`**, a single
strongly-typed `SiteContent` object. Edit the values there and the page
updates. You do not need to touch `page.tsx` for copy changes.

For example, to add a portfolio company, append an entry to
`content.portfolio.companies`; to change the contact address, update the
`EMAIL` constant near the top of the file.

## Adding MongoDB later

The site is structured so a database can be added with minimal disruption:

1. `lib/content.ts` exports a typed `SiteContent` object. When you're ready,
   add a data-access module (e.g. `lib/db.ts`) that connects to MongoDB and
   returns the same `SiteContent` shape.
2. Make `app/page.tsx` `async` and fetch the content in the component (it is
   already a Server Component, so it can query the database directly and stay
   fully server-rendered).
3. Copy `.env.example` to `.env.local` and set `MONGODB_URI` / `MONGODB_DB`.

Because the components only depend on the `SiteContent` type, swapping the
source from a static file to a database does not require UI changes.

## Assets & fonts

- Logo, hero image, and favicon are the original PNGs, served from `public/`.
- Fonts (DM Serif Display for headings, Manrope for body) are pulled from
  Google Fonts via an `@import` at the top of `globals.css`, matching the
  original site.
