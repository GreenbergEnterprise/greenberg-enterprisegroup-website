---
name: prompt-brief
description: Turn a rough or vague request into a structured task brief before starting work. Use when someone invokes /prompt-brief, asks to "spec this out", "brief this", or wants a prompt refined, or when the Conductor Protocol's spec step picks the lighter option; a request large or ambiguous enough that a wrong guess about goal, scope, or success criteria would waste a session, but not so open-ended that it needs a full grill. One-line fixes, questions, and clearly specified asks do not need it.
---

# Prompt Brief

Rough one-or-two-sentence asks are fine for small work, but for bigger asks
the expensive failures are always the same: the goal was assumed, the
success criteria were never stated, or something obvious was out of scope
and nobody said so. This skill closes those gaps before the work starts.

## The template

```markdown
## Goal
What we are actually trying to achieve, in one or two sentences: the
outcome, not the implementation.

## Context
What is relevant: which part of the app, what exists today, what prompted
this.

## Success criteria
How we will know it worked. Concrete and checkable ("cards drop into the
correct column every time", "page loads under 2s"), not vibes ("feels
better").

## Constraints & out of scope
Hard limits (do not touch X, keep the API stable, no new dependencies) and
what we are explicitly NOT doing, so nobody builds the wrong thing.

## Verification
How the result gets proven: which tests run or get written, what
screenshots get taken, what the requester will click. For anything visual
in this repo, that means the screenshot script and an interaction test per
AGENTS.md.

## Open questions
Anything genuinely unresolved. Parked honestly, never papered over with a
guess.
```

## How to run it

1. **Fill it yourself first.** Draft the brief from what the requester said
   plus what you can learn from the repo. Most of the Context section is
   discoverable; go read the code instead of asking. Never ask the
   requester something you could answer with a search.
2. **Mark the real gaps.** After filling, only the blanks that would change
   what you build matter, usually one to three items in Success criteria,
   Constraints, or Open questions. Ask just those, in one short batch. If
   the ask is big or fuzzy enough that batched questions will not cut it,
   offer a grill instead (the grill-me skill): one question at a time until
   the branches are resolved.
3. **Show the finished brief and get a nod** before starting the work. The
   brief becomes the spec; keep it honest. An unresolved item stays in Open
   questions rather than becoming a silent assumption.

## Where the brief ends up

- Session work: it lives in the conversation; build against it.
- Dev-queue work: put the finished brief in the card body, the way the
  Grill me feature writes its Requirements Summary.
- If the requester says "save that": write it to a file, or to PromptDrive
  (Prompeteer) when that connection is available.
