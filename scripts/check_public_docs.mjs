#!/usr/bin/env node
// Scans every file under public/developers/ for patterns that must never appear in public developer docs
// (internal hosts, infrastructure names, table/column prefixes, file paths, internal channels, secrets).
// Dependency-free. Usage: node scripts/check_public_docs.mjs [dir]
// Exits 1 and prints file:line for each hit; exits 0 when clean.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(repoRoot, process.argv[2] ?? "public/developers");

const rules = [
  ["Azure Container Apps host", /azurecontainerapps/i],
  ["internal environment name", /orangeocean/i],
  ["Azure host", /\.azure\./i],
  ["Key Vault", /keyvault/i],
  ["ledger host", /ledger\./i],
  ["tryino.com subdomain", /\b(?!www\.)[a-z0-9-]+\.tryino\.com/i],
  ["table/column prefix", /try_[a-z]/i],
  ["Dataverse", /dataverse/i],
  ["PostgreSQL", /postgres/i],
  ["local file path", /\/Users\//i],
  ["config path", /\.config\//i],
  ["internal test channel", /SMOKE/i],
  ["internal channel", /TRY_RETAIL/i],
  ["GitHub org link", /github\.com\/TryinoTeam/i],
  ["webhook secret", /whsec_[A-Za-z0-9+/]{20,}/i],
  ["live secret key", /sk_live/i],
  ["password assignment", /password\s*[:=]/i],
];

const binaryExt = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|eot|mp4|webm|pdf|zip|gz)$/i;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) yield* walk(path);
    else if (st.isFile() && !binaryExt.test(name)) yield path;
  }
}

let exists = false;
try { exists = statSync(target).isDirectory(); } catch { /* missing */ }
if (!exists) {
  console.error(`check_public_docs: directory not found: ${relative(repoRoot, target) || target}`);
  process.exit(2);
}

const hits = [];
let files = 0;
for (const file of walk(target)) {
  files++;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [label, re] of rules) {
      const m = line.match(re);
      if (m) hits.push(`${relative(repoRoot, file)}:${i + 1}: ${label} (${JSON.stringify(m[0])})`);
    }
  });
}

if (hits.length > 0) {
  console.error(`check_public_docs: ${hits.length} forbidden pattern hit(s) in ${files} file(s):`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log(`check_public_docs: OK — ${files} file(s) under ${relative(repoRoot, target)} are clean.`);
