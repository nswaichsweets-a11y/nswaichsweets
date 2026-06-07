import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppIcon } from "@/components/app/icon";
import { requireUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { getCloudBackupStatus } from "@/features/backup/cloud-backup-status";

type BackupPageProps = {
  searchParams: Promise<{ cloud?: string; files?: string; message?: string }>;
};

export const metadata = {
  title: "Backup and Cloud Storage"
};

export default async function BackupPage({ searchParams }: BackupPageProps) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  if (!can(user.roleKey, "backup", "view")) redirect("/dashboard");

  const status = getCloudBackupStatus();
  const canRunBackup = can(user.roleKey, "backup", "export");
  const cloudState = query.cloud;
  const cloudMessage = query.message;
  const uploadedFiles = query.files;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">System</p>
              <Badge tone={status.configured ? "success" : "warning"}>{status.configured ? "Cloud Ready" : "Setup Required"}</Badge>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">Backup and Cloud Storage</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Back up the local SQLite database and uploaded files to Google Cloud Storage owned by {status.ownerEmail}.
            </p>
          </div>
          <form action="/api/backups/google-cloud" method="post">
            <Button disabled={!status.configured || !canRunBackup}>
              <AppIcon name="cloud-upload" />
              Run Cloud Backup
            </Button>
          </form>
        </div>
      </section>

      {cloudState ? (
        <section
          className={`rounded-lg border p-4 text-sm ${
            cloudState === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold">{cloudState === "success" ? "Cloud backup completed." : "Cloud backup needs attention."}</p>
          <p className="mt-1">{cloudMessage || "Check Google Cloud configuration."}</p>
          {uploadedFiles ? <p className="mt-1">Uploaded objects: {uploadedFiles}</p> : null}
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Local Database</CardTitle>
            <CardDescription>Primary live business data file.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="break-words rounded-md bg-muted p-3 text-sm text-muted-foreground">{status.databasePath}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Uploads</CardTitle>
            <CardDescription>Product images and local uploaded documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="break-words rounded-md bg-muted p-3 text-sm text-muted-foreground">{status.uploadsPath}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Cloud Bucket</CardTitle>
            <CardDescription>Backup target for the shop computer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="break-words rounded-md bg-muted p-3 text-sm text-muted-foreground">{status.bucketName || "Not configured"}</p>
            <p className="text-xs text-muted-foreground">Prefix: {status.backupPrefix || "nss-backups"}</p>
          </CardContent>
        </Card>
      </div>

      {!status.configured ? (
        <Card>
          <CardHeader>
            <CardTitle>Google Cloud Setup Needed</CardTitle>
            <CardDescription>Add these values to `.env` on the deployed computer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {status.missing.map((item) => (
                <span key={item} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Restore Rule</CardTitle>
          <CardDescription>Cloud backups protect the data, but restore should be deliberate.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Stop the app, download the required `nss-local.db` backup from Google Cloud Storage, replace the local database file, then restart the app and check dashboard, invoices, products, and reports.
        </CardContent>
      </Card>
    </div>
  );
}
