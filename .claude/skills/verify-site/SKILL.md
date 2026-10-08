---
name: verify-site
description: Run the full verification pass for this Astro site (lint, type-check + build, CSS coverage). Use before committing or pushing, after Tailwind/style changes, or when the user asks to check, verify, or test the site.
---

# Verify the site

Pushing to `main` deploys straight to production, so run this before any commit you intend to push.

## Steps

Run in order and stop at the first failure:

1. `npm run lint` — ESLint (double quotes, required semicolons).
2. `npm run build` — `astro check` then `astro build`. Type/schema errors fail here.
3. `node scripts/check-css-coverage.mjs` — checks that every class in the built HTML has a CSS rule. **Baseline is 3 uncovered classes** (`astro-code`, `github-dark`, `font-base`). Anything above 3 is a regression; report the new class names.
4. Sanity checks on `dist/`:
   - `test -f dist/.nojekyll` — without it GitHub Pages drops `_astro/` and the site ships unstyled.
   - No drafts leaked: for each content file with `draft: true`, confirm its route is absent from `dist/`.

## Report

Summarize pass/fail per step with the relevant error output. Don't claim success for a step that was skipped.

Things these checks **can't** catch: missing `dark:` color variants. If the diff touches colors, review it for those manually.
