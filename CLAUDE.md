@AGENTS.md

# Claude Code guidelines for this repo

## Shipping workflow

When a piece of work is done (implemented, type-checked with
`npx tsc --noEmit`, building with `npm run build`, verified per AGENTS.md
when the tooling works, and, when an independent review was asked for,
holding its PASS), ship it without asking for confirmation:

1. Commit and push to the session's designated feature branch.
2. Open a pull request to `main`.
3. Merge it once it is mergeable; this repo runs no CI workflow, so there is
   nothing to wait for beyond the push itself. While anything is still
   running, carry on with useful independent work rather than waiting on
   it. A PR-only authorization stays PR-only.

Do not pause to ask whether to open the PR or merge it; Brian has a standing
instruction to always do both automatically. Only hold off if the work is
genuinely incomplete, the type check or the build fails, a review that was
asked for came back REJECT, or the change is destructive or outside what was
asked; in that case say why instead. A screenshot capture that failed for a
reason outside the change (the browser would not launch, the build would not
run here) is not one of those reasons: write what failed and which routes
stay unverified under the PR's "Verification" heading, say it in the chat,
and merge on the remaining gates (AGENTS.md, "Verify like a human before
calling it done"). Brian wants to hear about a missing screenshot, not to
have the ship held for it.

## Commit author identity

There is no authorship gate (Brian, 2026-09-11). Commit with whatever author
and trailers your harness sets: in Claude Code web sessions that is
`Claude <noreply@anthropic.com>` plus the `Co-Authored-By` and
`Claude-Session` trailers the harness supplies, model name and all; on a
laptop it is the person's own git identity. Do not rewrite, amend, or
re-author a commit over attribution, do not investigate the Unverified badge
on GitHub, and do not ask for an exception: nothing here checks the author.
The retired identity hook stays retired; never copy a human's email into an
assistant's commits. A preview or signing failure is a separate issue,
diagnosed from its own evidence. This replaces the "no model names" rule and
the per-connector attribution permission this file carried until
2026-09-11; AGENTS.md rule 6 is the cross-host version. This repository is
public, and the harness trailers are fine to publish.

## Independent review, on request

There is no orchestra (Brian, 2026-09-11). The Conductor Protocol, its
subagent seats in `.claude/agents/`, the `/orchestra` skill that activated
them, the route table, the Judge gate and the spend tables were retired the
day after being made opt-in: the ensemble cost more time than it saved.
Nothing here routes work to agents any more. What replaced it:

- Work directly by default, with the checks AGENTS.md's "Verification in
  direct mode" calls for. Do not hire subagents on your own initiative
  beyond a search or a scout.
- Review is asked for, not routed. When Brian asks for a review, or when a
  mistake in the change would be hard to reverse (the contact form and its
  CAPTCHA routes, the Resend email path, MongoDB writes, the redirects in
  `next.config.mjs`, production data), run `/code-review` on the final diff,
  `/security-review` when the change touches a security surface, and for a
  second opinion hire one general-purpose subagent on the strongest model
  available, handing it the final diff and the acceptance criteria and
  asking for PASS or REJECT with reasons. One reviewer, not an ensemble; fix
  what it finds, then merge.
- Symphony is Brian's own thing to launch when he wants it. Nothing in this
  repo imitates it or asks for it.

## Style

No em dashes, ever. No emojis unless the requester used one first. One-line
announcements, zero ceremony, no spend tables.
