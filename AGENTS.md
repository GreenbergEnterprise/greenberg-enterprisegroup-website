<!-- agent-work-mode:start -->
# Work mode: direct

Work directly. The owner retired the orchestra (the Conductor Protocol, its
subagent seats, routes, Judges and spend tables) on 2026-09-11, a day after
making it opt-in: it cost more time than it saved. This applies to every
assistant and every authorized team member.

Use the current session agent for ordinary work. Do not hire an implementer,
architect, verifier or judge on your own, switch models, prepare staffing or
cost tables, or offer a brief for an already clear request. A request for one
reviewer or one subagent authorizes that bounded role and nothing more.
Independent review is asked for, not routed: CLAUDE.md, "Independent review,
on request", says when and how. Existing CI, Vercel, or scheduled workflows
keep their own explicitly configured behavior.

## Verification in direct mode

Choose checks from the actual diff and its consequences:

- Documentation, comments, handoffs, and agent instructions: review the diff,
  references and syntax. Check changed metadata and hook wiring; run changed
  scripts and existing relevant tests. These changes alone do not require
  dependency installation, a full build, browser screenshots, or unrelated
  test suites.
- Executable behavior: `npx tsc --noEmit` and `npm run build` ("Checks that
  actually run here" below; `npm run lint` is broken and is not a check).
  Run focused checks of the affected behavior on top of them.
- Visible product changes: inspect the rendered result at desktop and phone
  widths; test the real interaction when behavior changes. The UI evidence
  rules below still apply.
- The contact form and its CAPTCHA routes, the Resend email path, MongoDB
  writes, redirects, and production data: verify the specific risk and
  retain every applicable approval. Complexity or risk is the cue to ask for
  an independent review (CLAUDE.md, "Independent review, on request"), never
  to skip these checks.

This check scope replaces blanket local commands required for every task or
every PR elsewhere in the agent instructions. Explicit task-specific
verification, production approvals, data/secret safeguards, and unresolved
findings relevant to the change remain binding. Disclose unrelated baseline
failures; do not call them passing or weaken a protected check. An unrelated
baseline failure does not create a new local gate for a docs-only edit.
<!-- agent-work-mode:end -->

# Rules for any AI agent (read first)

These apply to every AI assistant working in this repo, Claude Code,
Codex/ChatGPT, or any other, and are not optional. "The user" is whoever is
directing the agent: the repo owner or an authorized team member.
Tool-specific workflow (the shipping/merge flow, the review-on-request note)
lives in CLAUDE.md and binds Claude Code; the rules here bind every tool.
These rules are a floor, not a ceiling: where CLAUDE.md or another
repo-specific rule is stricter, the stricter one wins. Host-specific parts
(model names, spawning syntax) live in CLAUDE.md and
`docs/WORKING_WITH_CLAUDE.md`; never let a host's limits lower the floor
below.

1. Autonomy above a hard floor. Routine, reversible, in-scope changes that pass
   their gates (any review that was asked for passed, and the change staying
   inside a scope the user already approved) may deploy, merge, migrate, and
   self-run without asking. For anything on the floor the agent stops for the
   user's explicit, per-action word; it also stops for anything CLAUDE.md or
   another repo rule adds to the floor, and it never lowers the floor on its
   own. The floor, never crossed autonomously:
   - Landing or triggering a send to an external or customer-facing service:
     email, SMS, third-party posts, an outbound webhook. This covers the deploy
     or merge that starts the send, not only the agent calling the service by
     hand, and it covers the flag, settings toggle, or variable whose flip
     starts one. It does not cover this repo's own git host or deploy
     pipeline, which the agent uses to do its work.
   - Destructive or bulk data mutations, and anything that moves money or
     crosses a tenant boundary.
   - A schema change that is irreversible or wide in blast radius: a drop, a
     rename, a backfill, or a migration whose mis-ordering could take
     production down. A forward-only additive migration is not on the floor and
     ships on its own.
   Not on the floor, by Brian's standing authorization of 2026-09-11:
   environment and service variables (the Vercel dashboard, `.env.local`,
   config values), feature flags and settings that start no send, and the
   secrets and credentials the work needs, in any environment including
   production. Set, change, and rotate them without asking, say what changed
   in the PR or the chat, and keep the values themselves out of anything
   written down (rule 5). Brian does not want to be asked.
   A standing authorization the user has written down is their word given in
   advance: it grants autonomy for exactly the action and scope it names, no
   wider, and does not loosen the floor for anything else.
2. Schema before code, in the safe order for the change. For an additive
   migration, apply and confirm it first, then land the code that reads it. For
   a removal (a drop or rename), deploy the code that stops using the column or
   table first, then run the migration that removes it. Never sequence a schema
   change and its code so that production reads a shape that is not there yet.
3. Verify, don't guess. Check primary sources; never fabricate data, prices,
   IDs, results, or file contents. If unsure or blocked, say so plainly.
4. Prove it. Anything user-visible gets screenshots you actually looked at, at
   both widths, whenever the capture tooling works; anything executable gets
   run with its real output pasted. A claim with no evidence behind it is not
   done, and evidence is never invented. When the environment cannot produce
   a piece of it (the browser will not launch, the build will not run here),
   say exactly what is missing and why, in the chat and in the PR, and carry
   on: a missing screenshot is reported, never faked, and never on its own a
   reason to hold a merge ("Verify like a human before calling it done"
   below).
5. Keep secrets and data in. No credentials, tokens, or keys in commits, PR
   text, code comments, or anything sent to an external service, and no
   customer or personal data (names, contact details, policy or lead records)
   in any of those either. This repository is public, so the rule covers
   every file in it, not only PR text. Keep internal hostnames out of
   everything committed and sent outward; a placeholder host in the
   checked-in `.env.example` is not a secret and is fine to keep.
6. Attribution is not a gate (Brian, 2026-09-11). Commit with the author
   identity and trailers your host sets by default: Claude Code sets
   `Claude <noreply@anthropic.com>` and its own `Co-Authored-By` and
   `Claude-Session` trailers; ChatGPT's connected GitHub tool commits as the
   connected account; Codex CLI can set `ChatGPT <noreply@openai.com>`. Where
   the host does not name the assistant in the author field, one line in the
   message crediting the assistant is enough. Never pause, ask for an
   exception, amend, or re-author a commit over attribution, and never strip
   a model name or session link from a trailer the host wrote. This replaces
   the "explicit assistant attribution" rule and its connector permission;
   nothing in this repo checks the author.
7. Smallest reversible change. Don't widen scope on your own; for anything hard
   to reverse or outward-facing, confirm first.
8. When no human is watching, carry the work through. In a headless,
   scheduled, or board-dispatched run with no attended requester, take the
   confirmed task through every safe, reversible step the run's existing
   authorization already covers. Do not invent missing requirements: record a
   material unresolved question on the PR or the card and keep going on the
   work that does not depend on it, stopping only the branch of work that
   question actually blocks, and stopping the task only when nothing useful
   remains. Never take a floor action (rule 1) in such a run, and a board build
   authorized only to prepare a pull request stays a PR-only build.

# Spec before build

Before large or materially ambiguous work, assemble a short brief covering the
goal, the scope, and the success criteria, after reading the relevant code, the
task's requirements, and the decisions already recorded. An existing request, an
accepted brief, or a task card that resolves those points is sufficient on its
own and is never re-confirmed; a brief that only restates already authorized
work is a progress update, so share it and proceed. Ask only about unresolved
choices that materially affect the outcome, the scope, permissions, data, or
behavior that is hard to reverse; state the reasonable reversible implementation
assumptions you are making and continue. Large work alone is not a reason to
seek another approval. Grilling stays optional, used when the requester asks for
it or accepts the offer. Routine fixes, questions, and clearly specified asks
need no brief.

# Continue past blockers

**Work around a blocked dependency.** When something the task needs is
unavailable, continue the authorized work: name exactly which steps depend on
the blocked thing, and do the rest. Reuse an existing tool or environment that
suits the job where you are already authorized to use it. Never weaken an
access control, change the requested outcome, expand the scope, or treat
missing evidence as a pass.

**Do not let a temporary capability problem consume the task.** Diagnose the
failure and try one reasonable supported recovery. When the same failure
recurs with no new evidence, change approach or defer the step that depends on
it; retry only when a changed condition or a concrete diagnosis makes another
attempt worth something. If authenticated testing is unavailable, state exactly
what stays unverified, continue the other authorized work, and keep any release
gate that depends on that evidence closed.

**Post progress updates.** In an attended session, report at meaningful
milestones and whenever a blocker changes the plan: what is complete, what is
blocked, what comes next. An update is not a request for permission. An
unattended run uses the job progress mechanism it already has.

**Never end a turn with only a promise to continue.** If authorized work
remains and a next step is available, perform it. If nothing can proceed, say
plainly that the work is paused, why, and the smallest action that resumes it.
Never imply work is continuing when nothing is running.

**Finish the authorized work that can be finished.** Pause the whole task only
when every useful remaining step depends on missing access, a decision only the
user can make, or authorization not yet given, and leave a precise record of
the remaining step and what would unblock it.

# Verify like a human before calling it done

There is no screenshot gate (Brian, 2026-09-11): nothing here blocks a turn
or a merge on screenshots, and no hook checks for them. What there is: the
owner wants to see what changed, and this is a website, so almost
everything here is user-visible: pages, components, CSS, copy, imagery,
anything a person sees or clicks. Gather the evidence and review it
yourself before the pull request opens, when the tooling works, and say so
when it does not.

## 1. Screenshots, the default evidence, for visible changes

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
the usual one; cloud sessions have it at `/opt/pw-browsers/chromium`, and on
a laptop `npx playwright install chromium` gets one. Capture every route you
changed at two widths: 1440 wide for desktop and 390 wide for phone, and
save the PNGs under `.screenshots/` (gitignored). The site ships a single
fixed theme, so there is no dark variant to capture.

Actually open the images and look at them, then attach them to the pull
request. Described-but-unseen screenshots do not count.

## 2. Interaction test when behavior moves

Required when a change adds or alters BEHAVIOR: state, async, forms,
navigation, the contact form, the CAPTCHA, the animated canvas components.
Drive the real flow with real gestures (click, type, submit) and assert on
real outcomes, not on the DOM merely containing things.

When the capture fails for a reason outside the change (Chromium will not
launch, the build cannot run here), it does not hold the merge and it does
not park the work in a draft. Try the one obvious recovery (a clean
`npm run build`, the pre-installed Chromium path, a single re-run), then
move on: say in the chat exactly what failed and which routes stay
unverified, write the same under the PR's "Verification" heading as
"Screenshots: not captured, <reason>", and ship on the remaining gates. The
Vercel preview deploy, when it builds, is the backstop in that case, and a
later session with a working browser can capture them after the fact. This
covers only evidence the environment could not produce. A capture that
worked and showed a problem gets fixed; a capture skipped because it was
inconvenient gets taken; and evidence described as reviewed when it was
never seen is fabrication, never.

Summarize what you did in the PR body under a "Verification" heading: which
screenshots you looked at, or that the capture failed and why, and what any
interaction test proved. Non-visual work (API route internals, docs, config,
pure logic) is exempt from both.

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
(gitignored). Nothing checks the directory any more: the completion gate
that used to block a session on it went on 2026-09-11 with the rest of the
hooks.

# Show the requester the screenshots

House rule, for anybody working on this site: any change a person can see
gets screenshots they can see, in two places, neither optional (and when the
capture failed, the same two places carry the one-line reason instead):

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
