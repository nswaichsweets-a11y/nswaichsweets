import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data");
const envPath = join(root, ".env");
const prismaCli = join(root, "node_modules", "prisma", "build", "index.js");

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

function databasePath() {
  const url = process.env.DATABASE_URL || "file:../data/nss-local.db";
  if (!url.startsWith("file:")) {
    throw new Error("Local setup requires a SQLite DATABASE_URL such as file:../data/nss-local.db.");
  }

  const filePath = url.slice("file:".length);
  if (isAbsolute(filePath)) return filePath;
  return resolve(root, "prisma", filePath);
}

function runPrisma(args, stdio = "inherit") {
  return spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio
  });
}

function tableNames(db) {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((row) => String(row.name));
}

function generatedSql() {
  const result = runPrisma(["migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"], "pipe");
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Unable to generate SQLite schema SQL.").trim());
  }

  return String(result.stdout)
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("Loaded Prisma config from ") && !line.startsWith("Prisma config detected"))
    .join("\n")
    .trim();
}

function markLocalSchema(db) {
  db.exec(`
CREATE TABLE IF NOT EXISTS "_LocalSchema" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO "_LocalSchema" ("id", "provider") VALUES ('${randomUUID()}', 'node-sqlite');
`);
}

loadEnv();
process.env.DATABASE_URL ||= "file:../data/nss-local.db";
process.env.AUTH_SECRET ||= "development-only-change-me";

const normalPush = runPrisma(["db", "push"], "pipe");
if (normalPush.status === 0) {
  process.stdout.write(normalPush.stdout || "");
  process.stderr.write(normalPush.stderr || "");
  process.exit(0);
}

const dbPath = databasePath();
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
try {
  const existingTables = tableNames(db);
  if (existingTables.length > 0) {
    console.log("Local SQLite database already has tables. Leaving existing data untouched.");
    console.log(`Database: ${dbPath}`);
    process.exit(0);
  }

  console.warn("Prisma db push failed in this environment. Using Node SQLite fallback for an empty local database.");

  const sql = generatedSql();
  if (!sql) throw new Error("Prisma produced an empty SQLite schema.");

  db.exec("PRAGMA foreign_keys = OFF;");
  db.exec(sql);
  db.exec("PRAGMA foreign_keys = ON;");
  markLocalSchema(db);

  console.log("Local SQLite database initialized with Node SQLite fallback.");
  console.log(`Database: ${dbPath}`);
} finally {
  db.close();
}
