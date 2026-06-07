import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/dictionary";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = normalizeLocale(body.locale);
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/"
  });

  return NextResponse.json({ ok: true, locale });
}
