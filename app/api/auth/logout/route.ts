import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/features/auth/session";

export async function POST(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
