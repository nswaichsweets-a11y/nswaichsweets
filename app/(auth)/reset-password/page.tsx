import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { getLocale } from "@/lib/i18n/server";
import { resetPasswordAction } from "@/features/auth/password-reset-actions";

export const metadata = {
  title: "Reset Password"
};

type PageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
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
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>Set a new password for this account. Reset links expire after 30 minutes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {query.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{query.error}</p> : null}
            {!query.token ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">Reset token is missing.</p>
            ) : (
              <form action={resetPasswordAction} className="space-y-4">
                <input type="hidden" name="token" value={query.token} />
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required />
                </div>
                <Button className="w-full" type="submit">
                  Update password
                </Button>
              </form>
            )}
            <Button asChild className="w-full" variant="ghost">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
