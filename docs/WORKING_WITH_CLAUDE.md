# Working with Claude here

How Claude Code is set up in this repo, what works with zero action, and
what to do when something is reported missing. There is no orchestra: the
Conductor Protocol, its seats and the `/orchestra` skill were retired on
2026-09-11, a day after being made opt-in, and CLAUDE.md, "Independent
review, on request", is what replaced them.

## What works with zero setup

Everything below is committed, so it reaches every session automatically, in
the cloud and on a laptop CLI alike:

- **AGENTS.md**: direct-mode work, the floor of actions that still need the
  owner's word, the evidence expectations (screenshots at desktop and phone
  widths when they can be captured, interaction tests when behavior moves),
  the checks that actually run here, and the codebase truths. Other
  repo-aware tools such as Codex read it too.
- **CLAUDE.md**: the shipping workflow, the commit-identity note and the
  review-on-request note. Its first line imports AGENTS.md.
- **.claude/settings.json**: the permissions allowlist. Every shell command,
  every subagent, web fetch and search, and the GitHub, Claude Code Remote,
  Vercel and MongoDB Atlas MCP servers run without permission prompts, and
  file edits inside the project are accepted by default (Brian, 2026-09-11:
  as hands-off as possible while building). No hooks and no
  `.claude/agents/` directory: the screenshot gate, the seat-drift check and
  the seat files are all gone, and so is `.agents/`, the Codex twin of the
  orchestra skill. It sets no model.
- **.claude/skills/grill-me and prompt-brief**: the spec skills. Repo skills,
  so nobody installs anything.

## If a session says a skill is missing

Say so once, point here, and continue; work is never blocked on setup.
grill-me and prompt-brief are committed to this repo, so a session that
cannot see them is on a stale checkout: pull latest. Symphony is Brian's
personal orchestration skill and is deliberately not distributed; nothing
here asks for it or imitates it.

## Models

The repo never sets anyone's session model. Pick your own tier. When an
independent review is asked for, the reviewer is one separate subagent on
the strongest model available to you (CLAUDE.md, "Independent review, on
request").

### Other agent hosts

AGENTS.md binds ChatGPT, Codex and every other host too. An independent
reviewer, when asked for, is a separate agent with its own context, handed
the criteria, the final diff and the evidence; the author re-reading its own
work is never that reviewer. Never change providers, credentials, billing or
access controls to fill a role.

Commits made through ChatGPT's connected GitHub tool land under the connected
GitHub account. That is fine: attribution is not a gate here (AGENTS.md rule
6, Brian, 2026-09-11). A line in the message crediting the assistant is
enough, and nobody asks for an authorship exception or holds a commit over
it. Native git and Codex CLI can set `ChatGPT <noreply@openai.com>` as the
author.
