import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const origin = new URL(request.url).origin;

  if (!user) {
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  }

  if (!can(user.roleKey, "backup", "export")) {
    return NextResponse.redirect(`${origin}/backup?cloud=error&message=${encodeURIComponent("You do not have permission to run cloud backups.")}`, { status: 303 });
  }

  const { runGoogleCloudBackup } = await import("@/features/backup/google-cloud-backup");
  const result = await runGoogleCloudBackup({ triggeredBy: user.email });
  const params = new URLSearchParams({
    cloud: result.ok ? "success" : "error",
    files: String(result.uploadedCount),
    message: result.message.slice(0, 220)
  });

  return NextResponse.redirect(`${origin}/backup?${params.toString()}`, { status: 303 });
}
