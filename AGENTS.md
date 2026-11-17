# AGENTS.md

Guidance for agents working in this repository.

## Project

Personal portfolio, blog, and CTF writeup site for hush1a. Static Astro 7
site deployed to GitHub Pages at https://hush1a.github.io.

Stack: Astro 7 (content layer), Tailwind CSS 4, TypeScript
(`astro/tsconfigs/strict`), npm.

Components are `.astro` by default. React (`@astrojs/react`) plus `motion` is
used for exactly one island: `ProjectShowcase.tsx` on `/projects`
(`client:load`), which renders the project list and its hover preview. Project
details are static Astro pages (`src/pages/projects/[...slug].astro`) and are
the single full rendering of a project. Do not spread React into static UI.

## Commands

Use **npm**: `package-lock.json` is the only lockfile and CI runs `npm ci` on
Node 22. Do not add pnpm or yarn lockfiles.

- `npm run dev` — dev server at localhost:4321
- `npm run build` — `astro check` then `astro build`; the real verification
  command
- `npm run lint` / `npm run lint:fix` — ESLint
- `node scripts/check-css-coverage.mjs` — run after a build; the expected
  baseline is 3 uncovered classes (`astro-code`, `github-dark`, `font-base`)

Run lint, build, and the CSS check before committing or pushing. Pushing to
`main` deploys straight to production.

## Code style

- ESLint flat config enforces **double quotes** and **required semicolons**;
  template literals are allowed.
- Import alias `@*` maps to `./src/*` (`@components/...`, `@layouts/...`,
  `@lib/utils`, `@consts`, `@types`). Prefer it over relative imports.
- Tailwind 4 is configured in CSS, not JS. Theme tokens live in the `@theme`
  block of `src/styles/global.css`; dark mode is `@custom-variant dark`;
  typography is `@plugin`. It runs as a Vite plugin in `astro.config.mjs`.
- Every color needs a `dark:` counterpart. `astro check` cannot catch a missing
  variant.
- Shared element styles live in `src/styles/global.css` as `@apply` rules;
  extend those instead of repeating utility strings.
- Use `cn()` from `@lib/utils` (clsx + tailwind-merge) for conditional classes.

## Content collections

Schemas: `src/content.config.ts` (zod). Collections: `blog`, `work`,
`projects`, `writeups`, `certifications`, `achievements`.

- Content layer API: loaders are `glob()` / `file()`; entries expose `entry.id`
  (not `.slug`); render with `await render(entry)` from `astro:content` (not
  `entry.render()`); `entry.body` is `string | undefined`.
- Entries live at `src/content/<collection>/<slug>/index.md`, with images
  colocated and referenced relatively. `work` uses flat `.md` files.
- `projects`: `type` is `technical` or `consulting`; optional `image` /
  `imageAlt` cover; `gallery[]`; grouped `stack[]` where `mine: true` marks the
  author's part. The `/projects` list only pre-renders a cover thumbnail for
  its island; the project page renders cover, gallery, stack, and body once.
- `writeups`: `ctf` and `category` are required; `difficulty` is a strict enum
  (`Easy` | `Medium` | `Hard` | `Insane`); the index groups by the exact `ctf`
  string, so reuse it.
- `certifications` / `achievements`: YAML data files keyed by slug.
- **Draft filtering is manual.** Every `getCollection()` must chain
  `.filter(x => !x.data.draft)` — including `rss.xml.ts` and
  `getStaticPaths()`.
- Entry ids are slugified from file paths and are live URLs. Renaming a
  content folder changes the URL.

## Assets and images

- Images are optimized at build time with `astro:assets`. Colocate content
  images next to the entry and reference them relatively (`./cover.jpg`).
- Technology logos resolve through `src/lib/techLogos.ts`: Simple Icons by
  name, with optional SVG overrides in `src/assets/tech-logos/`.
- `public/` holds only files that must keep a fixed path (favicons, fonts,
  `.nojekyll`).

## Site configuration

- `src/consts.ts` holds site metadata, homepage counts, `ABOUT`,
  `HIGHLIGHTS`, `SOCIALS`, `SKILLS`, and page metadata.
- `src/types.ts` holds the shapes used by `consts.ts`.
- Add a `Metadata` export in `consts.ts` for a new section, plus a type in
  `types.ts` if the shape is new.

## Deployment

- `.github/workflows/deploy.yml` builds and deploys on push to `main`; there
  is no staging environment.
- `site` in `astro.config.mjs` must stay `https://hush1a.github.io`; it drives
  canonical URLs, the sitemap, and RSS.
- `public/.nojekyll` must exist, or GitHub Pages strips `_astro/`.

## Current content

- `blog` is empty; the header hides its link until a post exists.
- 6 projects, 5 work entries, 2 writeups, plus certifications and
  achievements.
- `cv.md` at the repo root is a resume draft, not wired into the site.

## Docs

- `AGENTS.md` (this file) is authoritative for agent guidance.
- `README.md` covers setup and adding content.
- `CLAUDE.md` is a pointer to this file. Update `AGENTS.md`, not `CLAUDE.md`.
