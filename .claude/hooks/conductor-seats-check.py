#!/usr/bin/env python3
"""SessionStart guard for the Conductor Protocol's seats.

The protocol names its seats in CLAUDE.md and hires them by name. The names
only resolve because a matching file exists in .claude/agents/ pinning that
seat's model and effort. Nothing in the harness couples those two places, and
the failure when they drift apart is silent: an unknown seat name falls back
to a generic agent at the session's default model and effort, returns a
plausible-looking review, and the protocol appears to have run. That is
exactly the state this repo was in from rev 10 until PR #923, through ten
revisions of the protocol, unnoticed.

So check the coupling at session start and say so loudly when it breaks.
Warn only; never block a session over configuration drift.
"""

import json
import os
import re
import sys

VALID_MODELS = {"fable", "opus", "sonnet", "haiku", "inherit"}
VALID_EFFORTS = {"low", "medium", "high", "xhigh", "max"}

# What marks a file in .claude/agents/ as one of this protocol's seats rather
# than an agent the repo keeps for its own reasons.
SEAT_MARKER = "Conductor Protocol"


def frontmatter(text):
    """Return the top-level key/value pairs of a leading YAML frontmatter block."""
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 3)
    if end == -1:
        return {}
    out = {}
    for line in text[4:end].split("\n"):
        if line and not line[0].isspace() and ":" in line:
            key, value = line.split(":", 1)
            out[key.strip()] = value.strip()
    return out


def seats_named_in_protocol(claude_md):
    """The seat names CLAUDE.md's seat-mapping paragraph lists in backticks."""
    match = re.search(
        r"Seat names are real.*?functional-validator`", claude_md, re.S
    )
    if not match:
        return set()
    return set(re.findall(r"`([a-z][a-z-]*)`", match.group(0)))


def main():
    root = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    agents_dir = os.path.join(root, ".claude", "agents")
    claude_md_path = os.path.join(root, "CLAUDE.md")

    problems = []

    try:
        with open(claude_md_path) as handle:
            claude_md = handle.read()
    except OSError:
        # No CLAUDE.md means no protocol to guard.
        sys.exit(0)

    expected = seats_named_in_protocol(claude_md)
    if not expected:
        # The paragraph was removed or reworded past recognition. Say so rather
        # than silently passing, because a guard that cannot find its subject
        # is not a guard.
        problems.append(
            "CLAUDE.md no longer contains a recognizable seat-mapping "
            "paragraph, so the seat list could not be checked against disk."
        )
        expected = set()

    found = {}
    if os.path.isdir(agents_dir):
        for filename in sorted(os.listdir(agents_dir)):
            if not filename.endswith(".md"):
                continue
            stem = filename[:-3]
            try:
                with open(os.path.join(agents_dir, filename)) as handle:
                    meta = frontmatter(handle.read())
            except (OSError, UnicodeDecodeError) as error:
                # A broken symlink, a directory named *.md, or a binary file.
                # Record it as drift rather than crashing: a guard that dies on
                # a malformed input stops guarding the other ten seats too.
                problems.append(
                    f"{filename}: could not be read as a seat definition "
                    f"({type(error).__name__}), so the seat is unhireable."
                )
                found[stem] = {}
                continue
            # A repo may keep agents of its own that have nothing to do with
            # this protocol. Only police the ones that claim to be seats, or
            # the guard cries wolf on every session in a repo that has its own
            # agents, and a guard that cries wolf gets ignored. A seat that
            # loses this marker is still reported, by the branch just below
            # when CLAUDE.md names it: it is recorded in `found`, so the
            # missing-seat check does not see it, and this is the only path
            # that surfaces it.
            if SEAT_MARKER not in meta.get("description", ""):
                if stem in expected:
                    problems.append(
                        f"{filename}: is named in CLAUDE.md as a seat but its "
                        f"description does not identify it as one, so it may "
                        f"not be the seat the protocol means."
                    )
                    found[stem] = meta
                continue

            found[stem] = meta

            if meta.get("name") != stem:
                problems.append(
                    f"{filename}: frontmatter name {meta.get('name')!r} does "
                    f"not match the filename stem {stem!r}, so the seat is "
                    f"unhireable under one of the two names."
                )
            if meta.get("model") not in VALID_MODELS:
                problems.append(
                    f"{filename}: model {meta.get('model')!r} is not one of "
                    f"{sorted(VALID_MODELS)}."
                )
            if meta.get("effort") not in VALID_EFFORTS:
                problems.append(
                    f"{filename}: effort {meta.get('effort')!r} is not one of "
                    f"{sorted(VALID_EFFORTS)}. Effort cannot be set at hire "
                    f"time, so an invalid value here means the seat runs at "
                    f"the session default."
                )
    elif expected:
        problems.append(
            ".claude/agents/ does not exist, so every named seat in the "
            "Conductor Protocol falls back to a generic agent at the "
            "session's default model and effort."
        )

    missing = sorted(expected - set(found))
    if missing:
        problems.append(
            "Named in CLAUDE.md but absent from .claude/agents/: "
            + ", ".join(missing)
            + ". Hiring these silently degrades to a generic agent."
        )

    orphaned = sorted(set(found) - expected) if expected else []
    if orphaned:
        problems.append(
            "Present in .claude/agents/ but not named in CLAUDE.md's seat "
            "list: " + ", ".join(orphaned) + ". Either add them to the "
            "paragraph or remove the files, so the two stay coupled."
        )

    if not problems:
        print(json.dumps({"suppressOutput": True}))
        sys.exit(0)

    context = (
        "CONDUCTOR PROTOCOL SEAT CHECK FAILED. The protocol's seats and their "
        "definitions have drifted apart, so hiring a seat by name will not do "
        "what the protocol says. Tell Brian before doing routed work, and "
        "disclose any seat you could not hire rather than filling it with a "
        "generic agent.\n\n"
        + "\n".join(f"- {problem}" for problem in problems)
    )
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": context,
                }
            }
        )
    )


if __name__ == "__main__":
    main()
