import { runGoogleCloudBackup } from "../features/backup/google-cloud-backup";

async function main() {
  const result = await runGoogleCloudBackup({ triggeredBy: "cli" });

  console.log(result.message);
  if (result.backupRoot) console.log(`Backup path: ${result.backupRoot}`);
  console.log(`Uploaded objects: ${result.uploadedCount}`);

  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
