import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma, withDatabase } from "@/lib/db/client";
import { setSessionCookie, type CurrentUser } from "@/features/auth/session";

const googleStateCookie = "nss_google_state";

type GoogleTokenResponse = {
  id_token?: string;
  error?: string;
};

type GoogleTokenInfo = {
  sub?: string;
  email?: string;
  email_verified?: "true" | "false" | boolean;
  name?: string;
};

function callbackUrl(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;
}

function loginRedirect(request: Request, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(googleStateCookie)?.value;
  cookieStore.delete(googleStateCookie);

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect(request, "google-login-failed");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !prisma) {
    return loginRedirect(request, "google-not-configured");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl(request),
        grant_type: "authorization_code"
      })
    });

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenJson.id_token) {
      return loginRedirect(request, "google-login-failed");
    }

    const infoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenJson.id_token)}`);
    const info = (await infoResponse.json()) as GoogleTokenInfo;
    const email = info.email?.trim().toLowerCase();
    const verified = info.email_verified === true || info.email_verified === "true";

    if (!infoResponse.ok || !email || !info.sub || !verified) {
      return loginRedirect(request, "google-login-failed");
    }

    const result = await withDatabase(
      async (client) => {
        const user = await client.user.findFirst({
          where: {
            active: true,
            OR: [{ email }, { googleSubject: info.sub }]
          },
          include: { role: true }
        });

        if (!user) return null;

        const updatedUser = await client.user.update({
          where: { id: user.id },
          data: {
            googleSubject: user.googleSubject ?? info.sub,
            lastLoginAt: new Date()
          },
          include: { role: true }
        });

        return {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          roleKey: updatedUser.role.key
        } satisfies CurrentUser;
      },
      null
    );

    if (!result) return loginRedirect(request, "google-user-not-found");

    await setSessionCookie(result);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Google login failed", error);
    return loginRedirect(request, "google-login-failed");
  }
}
