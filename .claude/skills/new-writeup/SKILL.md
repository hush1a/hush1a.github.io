---
name: new-writeup
description: Scaffold a new CTF writeup in the `writeups` content collection. Use when the user wants to add, start, or draft a writeup / solution for a CTF challenge.
---

# New CTF writeup

Create a writeup entry at `src/content/writeups/<CTF-folder>/<challenge-slug>/index.md`.

## Steps

1. **Collect details** from the user (ask only for what's missing): challenge title, CTF event, category, difficulty, points, short description (usually the challenge prompt), tags, and any screenshots.
2. **Reuse the exact `ctf` string** if the event already exists — the writeups index groups by it, so a mismatch splits the event into two groups:
   ```bash
   grep -rh '^ctf:' src/content/writeups | sort -u
   ```
   Also reuse the existing folder for that event when there is one.
3. **Pick the path carefully.** The entry id becomes a live URL (`ARKAVIDIA-9.0/reverse-engineering` → `/writeups/arkavidia-90/reverse-engineering/`). Use a short, descriptive slug.
4. **Write `index.md`** with this frontmatter (schema: `src/content.config.ts`):
   ```markdown
   ---
   title: "<Challenge name>"
   description: "<Challenge prompt / one-liner>"
   date: YYYY-MM-DD
   ctf: "<Exact CTF name>"
   category: "<Category>"
   difficulty: "Easy"   # Easy | Medium | Hard | Insane (strict enum, optional)
   points: 100          # optional
   solves: 0            # optional
   tags: ["tag1", "tag2"]
   draft: true          # remove when ready to publish
   ---

   ## Challenge Description

   ## Analysis

   ## Solution

   ## Flag

   ```
   Start with `draft: true` unless the user says it's ready.
5. **Images** go in the same folder and are referenced relatively: `![desc](./screenshot.png)`.
6. **Verify** with `npm run build` (runs `astro check`, so schema errors fail it).
