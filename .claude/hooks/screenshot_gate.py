#!/usr/bin/env python3
"""Screenshot gate: a Stop hook enforcing the AGENTS.md evidence bar.

Blocks the first attempt to end a session when UI files changed but no
screenshot evidence newer than the change exists. The second stop always
passes (the harness sets stop_hook_active), so this forces one
reconsideration, never a loop. Deployed from the Quoteplicity starter kit.
"""
import json
import os
import subprocess
import sys
import time

UI_PREFIXES = ["app/", "components/", "lib/"]
SHOT_DIRS = [".screenshots"]
RECIPE = "build and serve the app, drive it with Playwright Chromium at desktop and phone widths, and save the PNGs under .screenshots/ in the repo root so this gate can see them."
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp")
WINDOW_S = 6 * 3600


def sh(*args):
    try:
        return subprocess.run(
            args, capture_output=True, text=True, timeout=20
        ).stdout
    except Exception:
        return ""


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
    shot_excl = [d.rstrip("/") + "/" for d in SHOT_DIRS]

    def is_ui(path):
        p = path.strip().replace("\\", "/")
        if any(p.startswith(x) for x in shot_excl):
            return False
        return any(p.startswith(pre) for pre in UI_PREFIXES)

    change_ts = 0.0
    for line in sh("git", "status", "--porcelain").splitlines():
        p = line[3:].split(" -> ")[-1].strip().strip('"')
        if is_ui(p):
            try:
                change_ts = max(change_ts, os.path.getmtime(p))
            except OSError:
                change_ts = max(change_ts, time.time())

    # Commits made in THIS working copy show up as "commit:" reflog
    # entries; commits that arrived via fetch or checkout do not, so other
    # sessions' work never triggers the gate.
    cutoff = time.time() - WINDOW_S
    for line in sh(
        "git", "reflog", "--format=%gs::%H::%ct", "-n", "50"
    ).splitlines():
        parts = line.split("::")
        if len(parts) != 3 or not parts[0].startswith("commit"):
            continue
        try:
            ts = float(parts[2])
        except ValueError:
            continue
        if ts < cutoff:
            continue
        files = sh(
            "git", "diff-tree", "--no-commit-id", "--name-only", "-r",
            parts[1]
        )
        if any(is_ui(f) for f in files.splitlines()):
            change_ts = max(change_ts, ts)

    if not change_ts:
        return

    evidence_ts = 0.0

    def scan(d):
        nonlocal evidence_ts
        for base, dirs, files in os.walk(d):
            dirs[:] = [
                x for x in dirs if x not in ("node_modules", ".git", ".next")
            ]
            for f in files:
                if f.lower().endswith(IMG_EXT):
                    try:
                        evidence_ts = max(
                            evidence_ts,
                            os.path.getmtime(os.path.join(base, f)),
                        )
                    except OSError:
                        pass

    for d in SHOT_DIRS:
        if os.path.isdir(d):
            scan(d)
    for p in sh("git", "ls-files", "-o", "--exclude-standard").splitlines():
        if p.lower().endswith(IMG_EXT):
            try:
                evidence_ts = max(evidence_ts, os.path.getmtime(p))
            except OSError:
                pass

    if evidence_ts >= change_ts:
        return

    print(json.dumps({
        "decision": "block",
        "reason": (
            "Screenshot gate: files under " + ", ".join(UI_PREFIXES)
            + " changed this session, but no screenshot evidence newer than "
            "the change was found. AGENTS.md requires screenshots for "
            "anything user-visible. Do this now: " + RECIPE
            + " Then actually look at the images and describe what you saw. "
            "If this change is genuinely non-visual despite touching those "
            "paths, say so explicitly in your reply; your next stop will not "
            "be blocked."
        ),
    }))


main()
