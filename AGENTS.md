# Spec before build

Before starting large or ambiguous work, produce a short brief covering the
goal, the scope, and the success criteria, and confirm it with the requester
before building. A task card that already carries a Requirements Summary or a
brief counts as confirmed. One-line fixes, questions, and clearly specified
asks do not need this.

# Verify like a human before calling it done

This is a website. Almost everything here is user-visible, so the bar applies
to most changes: pages, components, CSS, copy, imagery, anything a person sees
or clicks. Gather the evidence and review it yourself before the pull request
opens.

## 1. Screenshots, always, for visible changes

There is no screenshot script in this repo. Capture the evidence by running
the real app and driving a browser:

```sh
npm install
npm run build
CAPTCHA_SECRET=$(openssl rand -hex 32) npm start   # http://localhost:3000
```

`npm run dev` is fine for a quick look (it has a CAPTCHA fallback), but the
production build is what ships, so prefer `npm run build` plus `npm start`
for the shots that go on the PR.

Use whatever browser tooling the session has. Playwright driving Chromium is
the usual one; run `npx playwright install chromium` first if no browser is
already present. Capture every route you changed at two widths: 1440 wide for
desktop and 390 wide for phone. The site ships a single fixed theme, so there
is no dark variant to capture.

Actually open the images and look at them, then attach them to the pull
request. Described-but-unseen screenshots do not count.

## 2. Interaction test when behavior moves

Required when a change adds or alters BEHAVIOR: state, async, forms,
navigation, the contact form, the CAPTCHA, the animated canvas components.
Drive the real flow with real gestures (click, type, submit) and assert on
real outcomes, not on the DOM merely containing things.

Summarize what you did in the PR body under a "Verification" heading: which
screenshots you looked at, and what any interaction test proved. Non-visual
work (API route internals, docs, config, pure logic) is exempt from both.

# Checks that actually run here

- `npx tsc --noEmit` for types.
- `npm run build` for the production build. It also type-checks.
- `npm run lint` is broken and is not a check. It still calls `next lint`,
  which Next.js 16 removed, so it fails with "Invalid project directory
  provided, no such directory: .../lint". There is no ESLint config or
  dependency in the repo. Do not report it as passing; fix or drop the
  script if you touch that area.

# Codebase truths

- **This repo is public.** Nothing sensitive goes in a commit: no
  connection strings, no API keys, no customer data. Real values live in
  `.env.local`, which is git-ignored; `.env.example` documents only the
  variable names.
- **All copy and data live in `lib/content.ts`**, a typed `SiteContent`
  object. Edit copy there, not in `page.tsx`. Components depend on the type,
  not on where the data comes from, so a later move to MongoDB needs no UI
  change.
- **Route groups map to URLs like this:** `app/(v2)` serves `/` and
  `/concepts`, `app/(v1)` serves `/v1`, `app/(v3)` serves `/v3`. Each group
  has its own layout and its own CSS file, so a style change in one group
  does not reach the others. `/v2` redirects to `/` via `next.config.mjs`;
  keep that redirect working.
- **Integrations degrade, they do not crash.** Without `MONGODB_URI` the
  pages still render; without `RESEND_API_KEY` the contact form still saves
  and just skips email. `CAPTCHA_SECRET` has a dev-only fallback, so a
  production build without it returns a clear error from the contact routes.
  Keep that graceful-degradation pattern when adding integrations.
- **Hosting is Vercel**, with environment variables set in the dashboard.
  A new env var needs a redeploy before it takes effect.

# Screenshot evidence location

Save screenshot evidence as PNGs under `.screenshots/` in the repo root
(gitignored). The completion gate (`.claude/hooks/screenshot_gate.py`,
a Stop hook) checks that directory: a session that changed UI files
cannot finish until evidence newer than the change exists there.

# Show the requester the screenshots

House rule, for anybody working on this site: any change a person can see
gets screenshots they can see, in two places, neither optional:

1. In the chat, the moment you have reviewed them: send the image files into
   the conversation (the SendUserFile tool in cloud sessions, or whatever
   file-send mechanism the session has). Do not wait to be asked, and do
   not only describe them - the requester gets to look at the same pixels
   you did, in the conversation where the work happened.
2. Attached to the PR that announces the ship - not just taken
   and described. When no image host is at hand, the proven pattern is an
   evidence commit on the PR branch: commit the images, embed them in the
   PR body via `raw.githubusercontent.com` URLs pinned to that commit's
   SHA, then remove them in a follow-up commit so nothing lands in the
   default branch - the pinned URLs keep rendering.
