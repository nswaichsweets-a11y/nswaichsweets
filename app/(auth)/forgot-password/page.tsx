import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { getLocale } from "@/lib/i18n/server";
import { requestPasswordResetAction } from "@/features/auth/password-reset-actions";

export const metadata = {
  title: "Forgot Password"
};

type PageProps = {
  searchParams: Promise<{ sent?: string; link?: string; error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const [locale, query] = await Promise.all([getLocale(), searchParams]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <BrandLogo className="h-14 w-14 rounded-lg" />
            <span className="text-sm font-bold">Namdhari Swaich Sweets</span>
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>Enter the account email. The system will create a secure reset link for that user.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {query.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{query.error}</p> : null}
            {query.sent ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                If this account exists, a reset request has been created.
              </p>
            ) : null}
            {query.link ? (
              <div className="rounded-md border border-border bg-muted p-3 text-sm">
                <p className="font-semibold">One-time reset link</p>
                <p className="mt-1 break-all text-muted-foreground">{query.link}</p>
                <Button asChild className="mt-3 w-full" variant="outline">
                  <Link href={query.link}>Open reset link</Link>
                </Button>
              </div>
            ) : null}
            <form action={requestPasswordResetAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <Button className="w-full" type="submit">
                Create reset link
              </Button>
            </form>
            <Button asChild className="w-full" variant="ghost">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
