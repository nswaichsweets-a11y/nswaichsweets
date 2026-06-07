"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createPasswordResetLink, resetPasswordWithToken } from "./password-reset-service";

async function requestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return process.env.NEXT_PUBLIC_APP_URL ?? (host ? `${proto}://${host}` : "http://localhost:3000");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const result = await createPasswordResetLink(email, await requestOrigin());
  const params = new URLSearchParams({ sent: "1" });

  if ("resetLink" in result && result.resetLink) {
    params.set("link", result.resetLink);
  }

  if (!result.ok && "message" in result) {
    params.set("error", result.message);
  }

  redirect(`/forgot-password?${params.toString()}`);
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword || password.length < 8) {
    const params = new URLSearchParams({
      token,
      error: "Password must be at least 8 characters and both fields must match."
    });
    redirect(`/reset-password?${params.toString()}`);
  }

  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) {
    const params = new URLSearchParams({ token, error: result.message });
    redirect(`/reset-password?${params.toString()}`);
  }

  redirect("/login?reset=1");
}
