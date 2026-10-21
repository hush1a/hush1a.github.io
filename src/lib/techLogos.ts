// Technology name → monochrome logo(s), resolved at build time. Shared by the
// homepage marquee and the project stacks, so a technology looks the same
// everywhere it appears.
//
// Logos come from Simple Icons, looked up by the icon's title ("FastAPI",
// "PostgreSQL"). Anything Simple Icons doesn't carry can be dropped into
// src/assets/tech-logos/<key>.svg; an upload also overrides a Simple Icons
// logo with the same key.
import * as simpleIcons from "simple-icons";

export type TechLogo = { kind: "path"; d: string } | { kind: "mask"; url: string };

// Names whose logo key isn't their Simple Icons title, or that show more
// than one logo. Keys are Simple Icons slugs or upload file names.
const ALIASES: Record<string, string[]> = {
  "JavaScript/TypeScript": ["javascript", "typescript"],
  "Node.js/Express": ["nodedotjs", "express"],
  "Git/GitHub": ["git", "github"],
  "VS Code": ["vscode"],
  "Excel": ["excel"],
  "SQL": ["sql"],
  // Simple Icons has no SwiftUI or React Native marks; use the parent's.
  "SwiftUI": ["swift"],
  "React Native": ["react"],
  "JWT": ["jsonwebtokens"],
  "Claude API": ["claude"],
};

// Uploaded SVGs, keyed by file name. Rendered as a mask filled with the text
// colour, so any upload comes out monochrome like the rest.
const UPLOADS = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("/src/assets/tech-logos/*.svg", { query: "?raw", import: "default", eager: true })
  ).map(([path, svg]) => [path.split("/").pop()!.replace(/\.svg$/, ""), svg])
);

type Icon = { title: string; slug: string; path: string };
const ICONS = Object.values(simpleIcons as Record<string, Icon>).filter(icon => icon?.path);
const BY_SLUG = new Map(ICONS.map(icon => [icon.slug, icon]));
const BY_TITLE = new Map(ICONS.map(icon => [icon.title.toLowerCase(), icon]));

const fromKey = (key: string): TechLogo | undefined => {
  if (UPLOADS[key]) {
    return { kind: "mask", url: `url("data:image/svg+xml;utf8,${encodeURIComponent(UPLOADS[key])}")` };
  }
  const icon = BY_SLUG.get(key);
  return icon ? { kind: "path", d: icon.path } : undefined;
};

// Every logo for a name; empty when nothing matches, and callers then show
// the name on its own.
export function logosFor(name: string): TechLogo[] {
  const keys = ALIASES[name] ?? [BY_TITLE.get(name.toLowerCase())?.slug ?? name.toLowerCase()];
  return keys.map(fromKey).filter((logo): logo is TechLogo => !!logo);
}
