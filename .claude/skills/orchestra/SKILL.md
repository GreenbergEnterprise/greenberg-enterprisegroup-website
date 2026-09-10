---
name: orchestra
description: Run the repository's Conductor Protocol when the user explicitly requests Orchestra for a task. Ordinary edits and requests to continue do not activate it.
disable-model-invocation: true
---

# Orchestra

Use only on the requester's explicit invocation. Read AGENTS.md's work-mode
rules and the Conductor Protocol in CLAUDE.md, then apply the route appropriate
to the requested task. Read docs/WORKING_WITH_CLAUDE.md if present for the host's
model and role mapping. Preserve the requester's chosen scope and model limits.

If `.claude/hooks/conductor-seats-check.py` is installed, run it once now to
check the available named seats. Do not run seat setup for direct-mode work.
Use the protocol's supported fallback if a seat is unavailable.

Activation continues through follow-ups on this task and ends when the task is
complete or the requester says "orchestra off" or "work directly". Do not
activate Symphony, unrelated workflows, or another task automatically. Record
the activation scope in a handoff; an old activation is not a new user's request.
