# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal blog and portfolio for hush1a, deployed as a static site to GitHub Pages at https://hush1a.github.io. Based on the [Astro Nano](https://github.com/markhorn-dev/astro-nano) theme, with an added `writeups` collection for CTF challenge solutions.

Stack: Astro 5, Tailwind CSS 3, TypeScript (`astro/tsconfigs/strict`). No React/Vue/Svelte — `.astro` components only, zero client-side framework JS.

## Commands

Use **npm** — `package-lock.json` is the only lockfile, and CI (`.github/workflows/deploy.yml`) runs `npm ci` on Node 22. Don't introduce a pnpm or yarn lockfile.

- `npm run build` — runs `astro check` **then** `astro build`. Type errors fail the build, so this is the real verification command, not just `npm run dev`.
- `npm run lint` / `npm run lint:fix` — ESLint.
- `npm run dev` — dev server on `localhost:4321`.

## Code style

- ESLint enforces **double quotes** and **required semicolons** (`.eslintrc.cjs`). Template literals are allowed.
- Import alias: `@*` maps to `./src/*` — so `@components/Container.astro`, `@layouts/PageLayout.astro`, `@lib/utils`, `@consts`, `@types`. There is no `@/` prefix; don't write relative `../../` imports when an alias exists.
- Tailwind uses `darkMode: "class"`. Every color needs a `dark:` counterpart — the site ships both themes and a missing variant is a visible bug.
- Shared styles live in `src/styles/global.css` as bare-element `@apply` rules (`body`, `header`, `article`, …). Prefer extending those over repeating utility strings across components.
- `cn()` in `@lib/utils` (clsx + tailwind-merge) for conditional class names.

## Content collections

Schemas are in `src/content/config.ts` (zod). Collections: `blog`, `work`, `projects`, `writeups`.

- Entries live at `src/content/<collection>/<slug>/index.md` with images colocated in the same folder and referenced relatively (`./jenkins.png`). The `work` collection is the exception — flat `.md` files.
- `writeups` requires `ctf` and `category` on top of the usual fields; `difficulty` is a strict enum (`Easy` | `Medium` | `Hard` | `Insane`). The writeups index page groups by `ctf`, so that string must match exactly across entries in the same event.
- **Draft filtering is manual.** Every `getCollection()` call must chain `.filter(x => !x.data.draft)` — this includes `rss.xml.ts` and `getStaticPaths()`. Astro does not do it for you, and omitting it publishes drafts.
- This repo uses the **legacy content collections API** (`src/content/config.ts`, `entry.slug`, `entry.render()`), not Astro 5's content layer / `loader` API. Keep new code consistent with the existing pattern.

## Site configuration

`src/consts.ts` holds site metadata, social links, and the homepage item counts (`NUM_POSTS_ON_HOMEPAGE` etc.). Add a `Metadata` export there when adding a new section, and a matching type in `src/types.ts` if the shape is new.

## Deployment

Pushing to `main` triggers the GitHub Pages workflow — there is no separate deploy step and no staging environment.

- `site: "https://hush1a.github.io"` in `astro.config.mjs` must stay correct; it drives canonical URLs, the sitemap, and RSS.
- `public/.nojekyll` must exist, otherwise GitHub Pages strips Astro's `_astro/` asset directory and the site loads unstyled.

## Known leftovers

Some theme boilerplate is still in place: the `work` entries (Apple/Google/Facebook/McDonald's) and `projects` entries are demo content, several `blog` posts are Astro Nano's own docs, and `SOCIALS` in `src/consts.ts` still points at the theme author's Twitter. Treat these as placeholders, not as examples of real site content.
