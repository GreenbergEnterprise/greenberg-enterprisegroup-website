---
name: grill-me
description: Interrogate the requester one question at a time until a vague idea becomes a fully specced Requirements Summary. Use when someone invokes /grill-me, says "grill me", "interrogate me", or "ask me questions first", or accepts a grill offered by the prompt-brief skill or the Conductor Protocol in CLAUDE.md. Also offer it before any large piece of work whose goal, scope, or success criteria exist only in the requester's head; a wrong guess there costs a whole session.
---

# Grill Me

The requester is about to hand over a task and wants it properly specced
first: no vague asks, no silent assumptions, no rework because something
obvious was never said out loud. Pull the spec out of their head through
questioning, then write it down so a developer (human or AI) could build
from it without a single follow-up.

## The method

- Ask exactly ONE question per turn. Never a list, never "a few things:".
  One question, asked plainly.
- Every question must follow from the last answer. Dig into the branch that
  just opened; do not run a fixed checklist. If an answer is vague ("make it
  better", "like the other one"), push back and ask what that concretely
  means before moving on.
- Cover what actually needs covering for THIS task, not a rote template: the
  real goal and what success looks like, meaningful constraints (technical,
  scope, cost, time), who or what is affected, edge cases that would break a
  naive build, and what is explicitly OUT of scope so nobody builds the
  wrong thing.
- Never guess on the requester's behalf and never invent an answer to make
  the spec look complete. Anything genuinely unresolved gets parked as an
  open question in the summary, not papered over.
- Keep the tone direct, sharp, a little playful. No filler, no corporate
  hedging, no emojis, no em dashes.
- You decide when enough branches are resolved to stop pushing, but the
  requester can end the session at any time ("done", "wrap it up", "just
  write it"). When they do, that is final: write the summary with whatever
  you have.

## Use the repository

Never spend a question on something you can look up: what exists today, how
a component works, what the schema looks like. Research those yourself
between questions. Grill only about what lives in the requester's head:
intent, priorities, taste, scope, and tradeoffs.

## The Requirements Summary

When the grilling is done (you judge it covered, or the requester ends it),
stop asking and write the final Requirements Summary: a clean, concrete,
unambiguous brief with the goal, the concrete requirements, real
constraints, and (only if any remain) explicitly parked open questions.
Plain English, no restating the conversation, just the resolved spec.

Then put it where it is useful:

- Work happening now, in this session: the summary is the spec; build
  against it.
- Work for later or the dev queue: offer to drop it into a task card body or
  a file, whichever the requester wants.
