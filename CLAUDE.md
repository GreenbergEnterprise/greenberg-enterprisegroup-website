@AGENTS.md

# Claude Code guidelines for this repo

## Shipping workflow

When a piece of work is done (implemented, type-checked with
`npx tsc --noEmit`, building with `npm run build`, and verified per
AGENTS.md), and holding a PASS from the Judge wherever the Conductor Protocol
seats one, ship it without asking for confirmation:

1. Commit and push to the session's designated feature branch.
2. Open a pull request to `main`.
3. Merge the pull request immediately.

Do not pause to ask whether to open the PR or merge it; Brian has a standing
instruction to always do both automatically. Only hold off if the work is
genuinely incomplete, checks fail, a required Judge verdict is REJECT or
missing, or the change is destructive or outside what was asked; in that case
say why instead.

## Commit author identity

Author every commit as `Claude <greenbergb@gmail.com>`. Vercel authorizes a
preview deploy by resolving the commit author's email to a GitHub account and
checking it against the Greenberg OS team: `greenbergb@gmail.com` resolves to
a team member so the preview builds, while `brian@quoteplicity.com` resolves
to an account that is not a member and its previews come back Blocked. The
`.claude/hooks/git-author-identity.sh` SessionStart hook sets this
automatically in Claude Code on the web sessions and no-ops on a laptop, where
a human's own git identity should stand. Keep the name `Claude` and the
`Co-Authored-By` trailer as the marker of a session-authored commit.

## Conductor Protocol (rev 10)

Applies to new task requests in attended sessions. Questions, follow-ups, and
trivial replies are exempt. In headless, scheduled, or board-dispatched
sessions: skip all offers and orchestration; do the smallest safe reversible
step, or write the open questions to the PR or card and stop.

**Critical** is defined once, here, and means the same thing everywhere the
protocol uses the word: work whose blast radius on a mistake is severe or hard
to reverse, judged by consequence and reversibility, never by diff size. The
Critical surfaces are authentication and permissions, tenancy isolation,
payments and billing, database migrations, destructive or bulk-mutating
operations, public APIs and external contracts, security, compliance,
infrastructure, and production data. The consequence test governs, on those
surfaces and off them: could a mistake here expose or corrupt data, move money
wrongly, cross a tenant boundary, break an external consumer, or be hard to
roll back? If yes, the work is Critical, however small the diff; if a change
on a listed surface clearly cannot (a typo in an error string), it is not.

1. **Spec.** If goal, scope, or success criteria are unstated, offer a brief
   (prompt-brief) or a grill (grill-me) before building. "Just build it"
   always overrides. A card carrying a Requirements Summary counts as
   specced. If a named skill is unavailable: say so once per session, point
   to `docs/WORKING_WITH_CLAUDE.md`, then draft the brief yourself and
   continue. Never block work on setup. Symphony's absence is never an
   install prompt; it escalates to Brian.
2. **Route.** Announce in one line, then go. That line carries the step 1
   spec call as well as the route, including when you skip it: "solo, no
   spec pass, the ask reads concrete"; "duet, offering a brief first".
   Never decide the spec step silently. solo: handle it yourself. duet:
   one opus implementer; you review the full diff, and the Fable Judge
   passes it independently (step 4). chamber: implementer plus adversarial
   verifier on the exact commit plus browser evidence per AGENTS.md; for
   named-risk UI, which means exactly two things: UI on a Critical surface
   (sign-in, checkout) and multi-step state flows. A multi-step state flow
   takes chamber and chamber's seats; it is not Critical by that fact alone.
   symphony: recommend it by name for Critical or multi-workstream work;
   Brian launches it. If he declines or just says go, the work stays
   in-session under this protocol: Critical at its base route plus the
   Critical seats, multi-workstream per step 3's integrated-diff rule.
   Critical work (defined above) is never routed solo regardless of apparent
   size; it takes duet or above, chamber when the risk is in the UI, and
   adds the Critical row's seats on top of the base route's (step 3).
3. **Models.** The session model conducts; it does not have to judge.
   Judgment and the other high-leverage seats are hired as bounded subagents
   by explicit model, so Fable is used at the points that move quality even
   when the session runs on Opus. Each Fable seat is a single bounded call
   per round, reading a focused input (the brief, or the final diff plus
   evidence), never the whole session context; a repair loop re-hires the
   Judge on the new final diff rather than stretching one call across the
   task. Hired build players: opus minimum. Fable seats by route:

   | Route | Fable seats (effort) | Opus seats |
   | --- | --- | --- |
   | solo, trivial (question, copy tweak, rename, mechanical one-liner) | none | session handles it |
   | solo, changed code; substantive non-code changes (docs, governance, workflows) | Judge (high) on the diff | session implements |
   | duet | Architect (high) at start, Judge (high) at end | implementer |
   | chamber | Architect (high), Visual Reviewer (high), Judge (high) | implementer, verifier, browser tester |
   | Critical (added on top of the base route's seats) | Red Team (max); Judge raised to (max); hardest implementer unit (max) | verifier and functional validator where the base route lacks them; browser tester only when the base route is chamber |

   Row precedence: a task takes the highest matching row, Critical above
   chamber above duet above solo; within solo, changed code beats trivial.
   Trivial is only what no higher row claims: a one-line logic fix is
   changed code, and nothing config-shaped is auto-trivial. Substantive
   non-code changes that are not trivial take the changed-code row's Judge.
   The Critical row never replaces a base route; it adds to one. Critical
   work takes its base route's full seats plus the Critical seats, so
   Critical UI keeps chamber's Visual Reviewer, raised to (max) for Critical
   work, and a pure-backend Critical change hires no browser tester because
   its base route seats none. The Architect's brief names the hardest
   implementer unit; that unit is the Fable Implementer seat (max).
   Multi-workstream work is not Critical by itself: run each workstream at
   its own route. Before the last workstream's PR merges, the conductor
   hires one integrated-diff Judge on the combined diff of all workstream
   branches against main: Judge (high), or Judge (max) when any workstream
   is Critical. Its REJECT blocks that merge like any Judge's (step 4).
   Keep Fable off the seats where tier does not move quality: scouting and
   mapping, the verifier's test runs, functional validation, browser
   driving, completeness. Fable adjudicates only contested evidence. If a
   Fable seat cannot be hired (quota, harness failure, refusal), never
   silently drop it: disclose the substitution; the conductor fills a
   non-Judge seat itself at the same effort, and the Judge seat follows
   step 4's fallback. If Brian declares "full fable", hire every player on
   fable until he says otherwise. Automated review systems choose their own
   models. The repo never sets anyone's session model.
4. **Verdict.** No merge without evidence, and no merge without a passing
   Judge. The Judge returns PASS or REJECT on the final diff; a REJECT
   blocks the merge until repaired, and after any repair the Judge re-runs
   on the new final diff, a fresh bounded call per step 3. The same gate
   binds the integrated-diff Judge: its REJECT blocks the last
   workstream's merge. The conductor reads the verifier's report and
   spot-opens the key screenshots, and on duet reviews the full diff
   itself; the Judge's pass is independent of that review, and the full
   re-read on flagged or Critical work is the Fable Judge's pass (step 3),
   not the conductor's. If Fable cannot be hired for the Judge: disclose
   it, then either reclaim the judging duty yourself with a full
   adversarial re-read of the final diff, or push the branch and open the
   PR without merging, stating what is unjudged. The absence of Fable
   never silently drops the gate. Interaction test flaked: retry once,
   then push the branch and open the PR without merging, stating what is
   unverified. Chamber repair budget: two attempts, then report.
5. **Style.** No em dashes, ever. No emojis unless the requester used one
   first. One-line announcements; zero ceremony on solo turns. End each
   verdict with a spend table: one row per ensemble or phase, columns for
   model, players, measured tokens (the harness reports each hired player's
   count), and estimated list-price cost. Label costs as estimates. The
   Conductor row is never blank, "not metered", or "marginal" in a number
   cell: conductor totals are not separately metered, so calculate them.
   Prefer the harness budget-counter delta from task start to verdict;
   with no counter visible, estimate from transcript size and say which
   method you used. Price each row's tokens at that row's model's list
   rates; the session model's rates apply to the Conductor row. Print real
   numbers in both cells, marked "(calc.)" for tokens and
   "(est.)" for cost, e.g. "~72,000 (calc.)" / "~$1.10 (est.)". The
   calculation understates long sessions; note that when it matters, but
   an estimated number always beats an empty cell. The table is not
   optional: solo turns with no hired players still end with it, and a
   solo table is simply the Conductor row alone. Prose summaries do not
   replace it.
