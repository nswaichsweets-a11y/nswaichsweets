import { getGoogleCloudStorageStatus, type GoogleCloudStorageStatus } from "../../lib/cloud/google-cloud-storage";
import { localUploadsPath, sqliteDatabasePath } from "../../lib/db/sqlite-path";

export type CloudBackupStatus = GoogleCloudStorageStatus & {
  databasePath: string;
  uploadsPath: string;
};

export function getCloudBackupStatus(): CloudBackupStatus {
  return {
    ...getGoogleCloudStorageStatus(),
    databasePath: sqliteDatabasePath(),
    uploadsPath: localUploadsPath()
  };
}
