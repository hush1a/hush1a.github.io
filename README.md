# hush1a.github.io

Personal site — projects, notes, and CTF writeups on cybersecurity and software engineering.

Live at [hush1a.github.io](https://hush1a.github.io).

Built with [Astro](https://astro.build), Tailwind CSS, and TypeScript. No UI framework, no client-side JS beyond the theme toggle. Based on the [Astro Nano](https://github.com/markhorn-dev/astro-nano) theme by markhorn-dev.

## Development

```bash
npm install
npm run dev      # dev server at localhost:4321
npm run build    # astro check + astro build
npm run lint     # eslint
```

## Adding content

Content lives in `src/content/<collection>/`, one folder per entry with an `index.md` and any images alongside it. Frontmatter is validated by zod schemas in `src/content.config.ts` — the build fails if a required field is missing.

- **`blog`** — `title`, `description`, `date`, optional `draft`
- **`projects`** — the above plus optional `demoURL`, `repoURL`
- **`writeups`** — the above plus required `ctf` and `category`, optional `difficulty` (`Easy`/`Medium`/`Hard`/`Insane`), `points`, `solves`, `tags`
- **`work`** — `company`, `role`, `dateStart`, `dateEnd` (flat `.md` files, no folder)

Set `draft: true` to keep an entry out of the build.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## License

MIT — see [LICENSE](LICENSE).
