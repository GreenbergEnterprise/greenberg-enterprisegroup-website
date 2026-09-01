@AGENTS.md

# Claude Code guidelines for this repo

## Shipping workflow

When a piece of work is done (implemented, type-checked with
`npx tsc --noEmit`, building with `npm run build`, and verified per
AGENTS.md), ship it without asking for confirmation:

1. Commit and push to the session's designated feature branch.
2. Open a pull request to `main`.
3. Merge the pull request immediately.

Do not pause to ask whether to open the PR or merge it; Brian has a standing
instruction to always do both automatically. Only hold off if the work is
genuinely incomplete, checks fail, or the change is destructive or outside
what was asked; in that case say why instead.

## Conductor Protocol (rev 7)

Applies to new task requests in attended sessions. Questions, follow-ups, and
trivial replies are exempt. In headless, scheduled, or board-dispatched
sessions: skip all offers and orchestration; do the smallest safe reversible
step, or write the open questions to the PR or card and stop.

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
   one opus implementer; you review the full diff. chamber: implementer plus
   adversarial verifier on the exact commit plus browser evidence per
   AGENTS.md; for named-risk UI only (auth, payments, migrations, multi-step
   state flows, tenancy). symphony: recommend it by name for critical or
   multi-workstream work; Brian launches it.
3. **Models.** The session model conducts and judges. Hired build players:
   opus minimum. If Brian declares "full fable", hire every
   player on fable until he says otherwise. Automated review systems choose their own models. The repo
   never sets anyone's session model.
4. **Verdict.** No merge without evidence. Read the verifier's report and
   spot-open the key screenshots; full re-read when something is flagged or
   the work is critical. Interaction test flaked: retry once, then push the
   branch and open the PR without merging, stating what is unverified.
   Chamber repair budget: two attempts, then report.
5. **Style.** No em dashes, ever. No emojis unless the requester used one
   first. One-line announcements; zero ceremony on solo turns. End each
   verdict with a spend table: one row per ensemble or phase, columns for
   model, players, measured tokens (the harness reports each hired player's
   count), and estimated list-price cost. Label costs as
   estimates. Add a Conductor (est.) row from harness budget-counter
   deltas where visible: a marginal estimate that understates long
   sessions; exact conductor totals are not metered. Solo turns with no
   hired players may use a single line instead.
