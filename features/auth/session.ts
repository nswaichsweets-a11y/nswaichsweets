import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRoleKey } from "@/lib/domain-types";
import { prisma, withDatabase } from "@/lib/db/client";
import { createSessionToken, verifySessionToken, type SessionPayload } from "@/lib/security/session-token";

export const SESSION_COOKIE = "nss_session";
const sessionMaxAge = 60 * 60 * 24 * 7;

function authSecret() {
  return process.env.AUTH_SECRET ?? "development-only-change-me";
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roleKey: UserRoleKey | string;
};

export async function setSessionCookie(user: CurrentUser) {
  const cookieStore = await cookies();
  const token = createSessionToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      roleKey: user.roleKey,
      exp: Math.floor(Date.now() / 1000) + sessionMaxAge
    },
    authSecret()
  );

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAge,
    path: "/"
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token, authSecret());
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;

  if (!prisma) {
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      roleKey: payload.roleKey
    };
  }

  return withDatabase(
    async (client) => {
      const user = await client.user.findFirst({
        where: {
          id: payload.userId,
          active: true
        },
        include: {
          role: true
        }
      });

      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roleKey: user.role.key
      };
    },
    {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      roleKey: payload.roleKey
    }
  );
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
