#!/usr/bin/env python3
"""Screenshot send reminder: a Stop hook for the AGENTS.md chat-delivery rule.

When a turn ends and a screenshot dir holds images newer than the last batch
this hook has seen, it blocks the stop once with a reminder to send those
images into the conversation (SendUserFile). State lives under .git/ so it is
per-clone and never committed; a batch reminds at most once, and
stop_hook_active guarantees the very next stop always passes. Deployed from
the Quoteplicity starter kit.
"""
import json
import os
import sys
import time

SHOT_DIRS = ['.screenshots']
STATE_REL = os.path.join(".git", "screenshot-send-reminder.json")
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp")
WINDOW_S = 6 * 3600  # a dir left over from an old session owes no reminder


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        payload = {}
    if payload.get("stop_hook_active"):
        return
    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    try:
        os.chdir(root)
    except OSError:
        return

    newest = 0.0
    count = 0
    for d in SHOT_DIRS:
        if not os.path.isdir(d):
            continue
        for base, dirs, files in os.walk(d):
            for f in files:
                if f.lower().endswith(IMG_EXT):
                    try:
                        newest = max(
                            newest, os.path.getmtime(os.path.join(base, f))
                        )
                        count += 1
                    except OSError:
                        pass
    if not count or newest < time.time() - WINDOW_S:
        return

    seen = 0.0
    try:
        with open(STATE_REL) as fh:
            seen = float(json.load(fh).get("reminded_ts", 0))
    except Exception:
        pass
    if newest <= seen:
        return

    try:
        with open(STATE_REL, "w") as fh:
            json.dump({"reminded_ts": newest}, fh)
    except OSError:
        pass  # no .git (or read-only): still remind, at worst repeatedly

    print(json.dumps({
        "decision": "block",
        "reason": (
            "Screenshot delivery: " + str(count) + " fresh image(s) sit in "
            + " / ".join(SHOT_DIRS) + ". AGENTS.md requires sending reviewed "
            "screenshots into the chat (SendUserFile or the session's "
            "file-send tool), not just describing them or attaching them to "
            "the PR. If you have not sent this batch to the requester yet, "
            "do it now. If you already sent these exact images this session, "
            "say so in your reply; this batch will not block again."
        ),
    }))


main()
