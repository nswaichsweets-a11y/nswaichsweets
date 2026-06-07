import crypto from "node:crypto";
import { prisma, withDatabase } from "@/lib/db/client";
import { hashPassword } from "@/lib/security/password";

const resetTokenTtlMinutes = 30;

type PasswordResetLinkResult = { ok: true; resetLink: string | null } | { ok: false; message: string };
type PasswordResetResult = { ok: true } | { ok: false; message: string };

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetLink(email: string, origin: string): Promise<PasswordResetLinkResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !prisma) {
    return { ok: false as const, message: "Local database is not ready for password reset." };
  }

  return withDatabase<PasswordResetLinkResult>(
    async (client) => {
      const user = await client.user.findFirst({
        where: { email: normalizedEmail, active: true }
      });

      if (!user) {
        return { ok: true as const, resetLink: null };
      }

      await client.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }
      });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + resetTokenTtlMinutes * 60 * 1000);

      await client.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt
        }
      });

      return {
        ok: true as const,
        resetLink: `${origin}/reset-password?token=${rawToken}`
      };
    },
    { ok: false as const, message: "Local database is not reachable. Run npm run setup:local and restart the app." }
  );
}

export async function resetPasswordWithToken(token: string, password: string): Promise<PasswordResetResult> {
  if (!token || password.length < 8 || !prisma) {
    return { ok: false as const, message: "Password reset link is invalid or expired." };
  }

  return withDatabase<PasswordResetResult>(
    async (client) => {
      const resetToken = await client.passwordResetToken.findFirst({
        where: {
          tokenHash: hashToken(token),
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!resetToken || !resetToken.user.active) {
        return { ok: false as const, message: "Password reset link is invalid or expired." };
      }

      await client.$transaction([
        client.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash: await hashPassword(password) }
        }),
        client.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() }
        })
      ]);

      return { ok: true as const };
    },
    { ok: false as const, message: "Local database is not reachable. Run npm run setup:local and restart the app." }
  );
}
