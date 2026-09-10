# Working with Claude here

How Claude Code is set up in this repo and what to do when a session says
something is missing.

## What works with zero setup

Everything below is committed, so it reaches every session automatically, in
the cloud and on a laptop CLI alike:

- **AGENTS.md**: the verification bar (screenshots at desktop and phone
  widths, interaction tests when behavior moves), the checks that actually
  run here, and the codebase truths. Other repo-aware tools read it too.
- **CLAUDE.md**: the shipping workflow and the Conductor Protocol. Its first
  line imports AGENTS.md.
- **.claude/settings.json**: the permissions allowlist (git, npm, build,
  browser tooling) and the protocol pointer hook.
- **.claude/skills/grill-me and prompt-brief**: the spec skills. Repo skills,
  so nobody installs anything.

## If a session says a skill is missing

It mentions it once, points here, drafts the brief itself, and keeps going.
Work is never blocked on setup.

- **grill-me or prompt-brief missing**: should not happen, they are
  committed. If it does, pull latest.
- **symphony missing**: expected for everyone except Brian. It is his
  personal orchestration skill and is deliberately not distributed. When work
  looks symphony-sized (critical, risky, or multi-workstream), the session
  says so and escalates to Brian instead of imitating it.

## Models

The repo never sets anyone's session model. Pick your own tier. The
protocol's floor (Opus minimum) applies only to build subagents a session
hires.

### Other agent hosts

The Conductor routes and independent review requirements apply to ChatGPT,
Codex, and other hosts too. Fill required seats with the strongest model the
current host supports, preserving the role's required reasoning effort. Model
names and Claude agent-registration syntax are host-specific; keep the Claude
seat definitions intact. A required reviewer is a separate agent with its own
context, given the criteria, final revision, and evidence. The author or
conductor reviewing its own work never fills that independent seat. Disclose a
model substitution; if no independent reviewer is available, publish the branch
and PR with the missing review stated and keep the merge gate closed. Do not
change providers, credentials, billing, or access controls to fill a seat.

Use the assistant attribution rule in AGENTS.md. The connected GitHub tool's
default author is already authorized when the path cannot set an author; every
such commit must explicitly credit the assistant in its body and trailer. A
native git path must use the assistant's own identity. Claude-only examples do
not override this rule for another host.
