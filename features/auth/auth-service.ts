import { prisma, withDatabase } from "@/lib/db/client";
import { verifyPassword } from "@/lib/security/password";
import { setSessionCookie, type CurrentUser } from "./session";

type LoginResult = { ok: true; user: CurrentUser } | { ok: false; message: string };

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!prisma) {
    return { ok: false, message: "Database is not configured. Add DATABASE_URL and seed users before login." };
  }

  return withDatabase(
    async (client) => {
      const user = await client.user.findFirst({
        where: {
          email: normalizedEmail,
          active: true
        },
        include: {
          role: true
        }
      });

      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return { ok: false as const, message: "Invalid email or password." };
      }

      await client.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const currentUser: CurrentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        roleKey: user.role.key
      };

      await setSessionCookie(currentUser);
      return { ok: true as const, user: currentUser };
    },
    { ok: false as const, message: "Database is not reachable. Verify DATABASE_URL and PostgreSQL access." }
  );
}
