"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/features/auth/login-schema";
import { t, type Locale } from "@/lib/i18n/dictionary";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const pageMessage =
    searchParams.get("reset") === "1"
      ? "Password updated. Sign in with your new password."
      : searchParams.get("error") === "google-not-configured"
        ? "Gmail login is not configured yet. Add Google OAuth variables in Vercel."
        : searchParams.get("error") === "google-user-not-found"
          ? "This Gmail account is not active in the system. Ask the super admin to add it first."
          : searchParams.get("error") === "google-login-failed"
            ? "Gmail login failed. Please try again or use email and password."
            : null;

  async function onSubmit(values: LoginInput) {
    setMessage(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? t(locale, "invalidLogin"));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <a
        href="/api/auth/google"
        className="flex h-10 w-full items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
      >
        Continue with Gmail
      </a>
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t(locale, "email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t(locale, "password")}</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      {pageMessage ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{pageMessage}</p> : null}
      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{message}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? t(locale, "signingIn") : t(locale, "signIn")}
      </Button>
      </form>
    </div>
  );
}
