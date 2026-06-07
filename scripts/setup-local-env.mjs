import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data");
const uploadsDir = join(root, "public", "uploads");
const envPath = join(root, ".env");

mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadsDir, { recursive: true });

const defaults = {
  DATABASE_URL: '"file:../data/nss-local.db"',
  AUTH_SECRET: `"${randomBytes(32).toString("hex")}"`,
  NEXT_PUBLIC_APP_URL: '"http://localhost:3000"',
  GOOGLE_CLIENT_ID: '""',
  GOOGLE_CLIENT_SECRET: '""',
  GOOGLE_REDIRECT_URI: '""',
  UPLOAD_PROVIDER: '"local"',
  GOOGLE_CLOUD_OWNER_EMAIL: '"nswaichsweets@gmail.com"',
  GOOGLE_CLOUD_PROJECT_ID: '""',
  GOOGLE_CLOUD_STORAGE_BUCKET: '""',
  GOOGLE_CLOUD_CLIENT_EMAIL: '""',
  GOOGLE_CLOUD_PRIVATE_KEY: '""',
  GOOGLE_CLOUD_BACKUP_PREFIX: '"nss-backups"'
};

function hasKey(contents, key) {
  return new RegExp(`^\\s*${key}\\s*=`, "m").test(contents);
}

let contents = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

for (const [key, value] of Object.entries(defaults)) {
  if (!hasKey(contents, key)) {
    contents += `${contents.endsWith("\n") || contents.length === 0 ? "" : "\n"}${key}=${value}\n`;
  }
}

writeFileSync(envPath, contents);

console.log("Local NSS environment is ready.");
console.log(`Database file: ${join(dataDir, "nss-local.db")}`);
