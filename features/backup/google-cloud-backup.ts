import { copyFile, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { createGoogleCloudStorageUploader } from "../../lib/cloud/google-cloud-storage";
import { getCloudBackupStatus } from "./cloud-backup-status";

export type CloudBackupResult = {
  ok: boolean;
  message: string;
  uploadedCount: number;
  bucketName?: string;
  backupRoot?: string;
  objects: string[];
};

function timestampPath(date = new Date()) {
  const iso = date.toISOString();
  const day = iso.slice(0, 10);
  const stamp = iso.replace(/[:.]/g, "-");
  return `${day}/${stamp}`;
}

function contentType(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".db")) return "application/x-sqlite3";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

async function listUploadFiles(dir: string, root = dir): Promise<{ absolutePath: string; relativePath: string }[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) return listUploadFiles(absolutePath, root);
      if (!entry.isFile() || entry.name === ".gitkeep") return [];
      return [
        {
          absolutePath,
          relativePath: relative(root, absolutePath).replace(/\\/g, "/")
        }
      ];
    })
  );

  return files.flat();
}

async function existingDatabaseFiles(dbPath: string) {
  const candidates = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`, `${dbPath}-journal`];
  const files: string[] = [];

  for (const candidate of candidates) {
    if (existsSync(candidate)) files.push(candidate);
  }

  return files;
}

export async function runGoogleCloudBackup({ triggeredBy = "system" }: { triggeredBy?: string } = {}): Promise<CloudBackupResult> {
  const status = getCloudBackupStatus();
  if (!status.configured) {
    return {
      ok: false,
      message: `Google Cloud backup is not configured. Missing: ${status.missing.join(", ")}`,
      uploadedCount: 0,
      objects: []
    };
  }

  const databaseFiles = await existingDatabaseFiles(status.databasePath);
  if (databaseFiles.length === 0) {
    return {
      ok: false,
      message: `Local database file was not found at ${status.databasePath}`,
      uploadedCount: 0,
      objects: []
    };
  }

  const uploader = await createGoogleCloudStorageUploader();
  const backupRoot = `${uploader.config.backupPrefix}/${timestampPath()}`;
  const tempDir = join(/*turbopackIgnore: true*/ process.cwd(), "data", "cloud-backup-tmp");
  const uploadedObjects: string[] = [];

  await mkdir(tempDir, { recursive: true });

  try {
    for (const filePath of databaseFiles) {
      const tempPath = join(tempDir, `${Date.now()}-${basename(filePath)}`);
      await copyFile(filePath, tempPath);
      const body = await readFile(tempPath);
      const objectName = `${backupRoot}/database/${basename(filePath)}`;
      const uploaded = await uploader.uploadObject({
        objectName,
        body,
        contentType: contentType(filePath)
      });
      uploadedObjects.push(uploaded.name);
      await rm(tempPath, { force: true });
    }

    const uploadFiles = await listUploadFiles(status.uploadsPath);
    for (const file of uploadFiles) {
      const body = await readFile(file.absolutePath);
      const objectName = `${backupRoot}/uploads/${file.relativePath}`;
      const uploaded = await uploader.uploadObject({
        objectName,
        body,
        contentType: contentType(file.absolutePath)
      });
      uploadedObjects.push(uploaded.name);
    }

    const dbStats = await stat(status.databasePath);
    const manifest = {
      app: "Namdhari Swaich Sweets Business Suite",
      ownerEmail: uploader.config.ownerEmail,
      triggeredBy,
      createdAt: new Date().toISOString(),
      databasePath: status.databasePath,
      databaseBytes: dbStats.size,
      uploadsPath: status.uploadsPath,
      uploadedObjects
    };
    const uploadedManifest = await uploader.uploadObject({
      objectName: `${backupRoot}/manifest.json`,
      body: JSON.stringify(manifest, null, 2),
      contentType: "application/json"
    });
    uploadedObjects.push(uploadedManifest.name);

    return {
      ok: true,
      message: `Cloud backup completed in bucket ${uploader.config.bucketName}.`,
      uploadedCount: uploadedObjects.length,
      bucketName: uploader.config.bucketName,
      backupRoot,
      objects: uploadedObjects
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Cloud backup failed.",
      uploadedCount: uploadedObjects.length,
      bucketName: uploader.config.bucketName,
      backupRoot,
      objects: uploadedObjects
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
