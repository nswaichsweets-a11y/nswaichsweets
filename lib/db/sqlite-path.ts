import { isAbsolute, resolve } from "node:path";

export function sqliteDatabasePath(root = /*turbopackIgnore: true*/ process.cwd()) {
  const url = process.env.DATABASE_URL || "file:../data/nss-local.db";
  if (!url.startsWith("file:")) {
    throw new Error("Local cloud backup requires a SQLite DATABASE_URL such as file:../data/nss-local.db.");
  }

  const filePath = url.slice("file:".length);
  if (isAbsolute(filePath)) return filePath;
  return resolve(root, "prisma", filePath);
}

export function localUploadsPath(root = /*turbopackIgnore: true*/ process.cwd()) {
  return resolve(root, "public", "uploads");
}
