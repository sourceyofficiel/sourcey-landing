import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Fichiers qui ont leur propre override / qu'on garde animés
const SKIP = ["LoadingScreen.tsx"];

/** Walk recursive : récupère tous les .tsx sous src/ */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      out.push(...walk(p));
    } else if (entry.endsWith(".tsx")) {
      out.push(p.replace(/\\/g, "/"));
    }
  }
  return out;
}

const allFiles = walk("src");

// Garde ceux qui contiennent au moins une des props ciblées
const TARGETS = [
  "initial",
  "whileInView",
  "viewport",
  "animate",
  "transition",
  "exit",
  "variants",
  "whileHover",
  "whileTap",
];
const files = allFiles.filter((f) => {
  if (SKIP.some((s) => f.endsWith(s))) return false;
  const c = readFileSync(f, "utf8");
  return TARGETS.some(
    (t) => c.includes(`${t}={{`) || c.includes(`${t}="`)
  );
});

console.log(`Processing ${files.length} files...`);

function buildRegex(propName) {
  // Match les 3 formes:
  //   propName={{ ... }}  (object literal avec 1 niveau de nesting)
  //   propName="..."      (string value)
  //   propName={...}      (variable ref)
  const patterns = [
    // {{ ... }} avec nesting
    "\\s+" + propName + "=\\{\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}\\}",
    // "..."
    "\\s+" + propName + '="[^"]*"',
    // {variable}
    "\\s+" + propName + "=\\{[a-zA-Z_$][a-zA-Z0-9_$.]*\\}",
  ];
  return new RegExp(patterns.join("|"), "g");
}

let updated = 0;
for (const f of files) {
  const original = readFileSync(f, "utf8");
  let c = original;
  for (const prop of TARGETS) {
    c = c.replace(buildRegex(prop), "");
  }
  if (c !== original) {
    writeFileSync(f, c);
    updated++;
    console.log(`  ✓ ${f}`);
  }
}
console.log(`\nUpdated ${updated} files.`);
