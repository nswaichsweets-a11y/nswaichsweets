import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data");
const envPath = join(root, ".env");

mkdirSync(dataDir, { recursive: true });

function loadEnv() {
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/run-local.mjs <command> [...args]");
  process.exit(1);
}

loadEnv();
process.env.DATABASE_URL ||= "file:../data/nss-local.db";
process.env.AUTH_SECRET ||= "development-only-change-me";

const result = spawnSync(command, args, {
  cwd: root,
  env: process.env,
  shell: true,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
