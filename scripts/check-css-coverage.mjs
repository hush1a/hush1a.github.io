// Verifies every class used in built HTML has a matching rule in the built CSS.
// Guards Tailwind upgrades, where a utility can silently stop generating while
// the build still succeeds.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (name.endsWith(ext)) out.push(p);
  }
  return out;
}

const html = walk("dist", ".html");

// Astro inlines small component <style> blocks into the page rather than
// emitting a .css file, so scoped component styles must be collected from the
// HTML too — otherwise every scoped class reads as a false positive.
const externalCss = walk("dist", ".css").map(f => readFileSync(f, "utf8"));
const inlineCss = html.flatMap(f =>
  [...readFileSync(f, "utf8").matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]),
);
const css = [...externalCss, ...inlineCss].join("\n");

const used = new Set();
for (const file of html) {
  const content = readFileSync(file, "utf8");
  for (const m of content.matchAll(/class="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  }
}

// A class is covered if its escaped form appears as a selector in the CSS.
const escape = c => c.replace(/[.:/[\]()!#%,>+~*^$|@]/g, ch => "\\" + ch);
const missing = [...used].filter(c => !css.includes("." + escape(c)));

console.log(`html files:      ${html.length}`);
console.log(`classes used:    ${used.size}`);
console.log(`without a rule:  ${missing.length}`);
if (missing.length) {
  console.log("\nmissing:");
  for (const c of missing.sort()) console.log("  " + c);
}
