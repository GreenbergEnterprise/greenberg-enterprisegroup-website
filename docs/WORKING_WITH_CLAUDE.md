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
