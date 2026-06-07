import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/login-schema";
import { loginWithPassword } from "@/features/auth/auth-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid login details."
      },
      { status: 400 }
    );
  }

  const result = await loginWithPassword(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
