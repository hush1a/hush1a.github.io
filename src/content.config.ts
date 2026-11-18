import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional()
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
    // Which group on /projects the entry is listed under.
    type: z.enum(["technical", "consulting"]).default("technical"),
    // Byline: the author's role, the event the work was made for, and an
    // optional parenthetical detail (track, round) shown on the project page.
    role: z.string().optional(),
    event: z.string().optional(),
    eventDetail: z.string().optional(),
    // Screenshot colocated in the entry folder (`image: "./cover.png"`).
    // Optional: the project list falls back to a generated cover without one.
    image: image().optional(),
    // Alt text for the cover on the project page (the title if unset).
    imageAlt: z.string().optional(),
    // Extra images shown after the body on the project page
    // (slides, mockups, diagrams), each with its own alt text.
    gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
    // Technologies, grouped by part of the system. `mine` marks the part I
    // built, which the stack display highlights. Names resolve to logos via
    // @lib/techLogos.
    stack: z.array(z.object({
      area: z.string(),
      mine: z.boolean().default(false),
      items: z.array(z.string()),
    })).default([]),
  }),
});

const writeups = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writeups" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    ctf: z.string(),
    category: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard", "Insane"]).optional(),
    points: z.number().optional(),
    solves: z.number().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Data-file collections. The object form of the YAML (keyed by slug) is
// deliberate: with an array, any entry missing an `id` is silently skipped
// while the build still succeeds.
const certifications = defineCollection({
  loader: file("src/data/certifications.yaml"),
  schema: ({ image }) => z.object({
    name: z.string(),
    issuer: z.string(),
    issued: z.coerce.date(),
    expires: z.coerce.date().optional(),
    // Optional so an entry can be listed before its scan is added; the page
    // falls back to a dotted placeholder.
    scan: image().optional(),
    credentialID: z.string().optional(),
    credentialURL: z.url().optional(),
  }),
});

const achievements = defineCollection({
  loader: file("src/data/achievements.yaml"),
  schema: ({ image }) => z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    rank: z.string().optional(),
    team: z.string().optional(),
    image: image().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, work, projects, writeups, certifications, achievements };
