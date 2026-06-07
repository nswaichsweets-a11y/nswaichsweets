import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { getCurrentUser } from "@/features/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login"
};

export default async function LoginPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  if (user) redirect("/dashboard");

  const highlights =
    locale === "pa"
      ? ["ਇਨਵੌਇਸ ਅਤੇ ਗਾਹਕ ਬਕਾਇਆ", "ਦੁੱਧ ਕਲੇਕਸ਼ਨ ਅਤੇ ਕਿਸਾਨ ਲੈਜ਼ਰ", "ਸਟਾਕ, ਵੈਸਟੇਜ ਅਤੇ ਵੈਲੂਏਸ਼ਨ", "ਤਨਖਾਹ, ਖਰਚਾ ਅਤੇ ਮੁਨਾਫਾ ਰਿਪੋਰਟ"]
      : ["Invoices and customer dues", "Milk collection and farmer ledger", "Stock, wastage and valuation", "Salary, expense and profit reports"];

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-soft lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-primary p-8 text-primary-foreground sm:p-10">
          <BrandLogo className="h-24 w-24 rounded-xl ring-white/20" priority />
          <div className="mt-10 max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">{t(locale, "loginEyebrow")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">Namdhari Swaich Sweets</h1>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/78">{t(locale, "loginIntro")}</p>
          </div>
          <div className="mt-10 grid gap-3 text-sm sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-lg border border-white/18 bg-white/10 px-3 py-3">
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="p-6 sm:p-10">
          <div className="mb-5 flex justify-end">
            <LanguageSwitcher locale={locale} />
          </div>
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">{t(locale, "signIn")}</CardTitle>
              <CardDescription>{t(locale, "seededAccountHelp")}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <LoginForm locale={locale} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
