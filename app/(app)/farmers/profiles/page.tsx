import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppIcon } from "@/components/app/icon";
import { requireUser } from "@/features/auth/session";
import { createFarmerProfileAction } from "@/features/farmers/farmer-actions";
import { getFarmerProfiles } from "@/features/farmers/farmer-service";
import { can } from "@/lib/permissions/roles";
import { formatCurrency } from "@/lib/utils/format";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export const metadata = {
  title: "Farmer Profiles"
};

export default async function FarmerProfilesPage({ searchParams }: PageProps) {
  const [user, query, farmers] = await Promise.all([requireUser(), searchParams, getFarmerProfiles()]);
  if (!can(user.roleKey, "farmers", "view")) redirect("/dashboard");
  const canCreateProfile = user.roleKey === "SUPER_ADMIN";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Milk setup</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal">Farmer Profiles</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Super admin creates farmer placeholders once. Daily milk collection can then select the farmer and enter only litres, session, fat/SNF, rate, and payment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {query.saved ? <Badge tone="success">Saved</Badge> : null}
            <Button asChild variant="outline">
              <Link href="/farmers">
                <AppIcon name="milk" />
                Daily Milk
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add farmer profile</CardTitle>
            <CardDescription>{canCreateProfile ? "Only super admin can create these base farmer records." : "Only super admin can add farmer profiles."}</CardDescription>
          </CardHeader>
          <CardContent>
            {canCreateProfile ? (
              <form action={createFarmerProfileAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Farmer name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="villageAddress">Village/address</Label>
                  <Textarea id="villageAddress" name="villageAddress" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDetails">Payment details</Label>
                  <Textarea id="paymentDetails" name="paymentDetails" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingBalance">Opening balance</Label>
                  <Input id="openingBalance" name="openingBalance" type="number" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <input type="hidden" name="active" value="Active" />
                <Button type="submit" className="w-full">Create Farmer Profile</Button>
              </form>
            ) : (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Ask super admin to create farmer profiles before daily milk entries.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved farmer database</CardTitle>
            <CardDescription>These records act as your farmer placeholders for daily milk collection.</CardDescription>
          </CardHeader>
          <CardContent>
            {farmers.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No farmer profiles yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {farmers.map((farmer) => (
                  <Link
                    key={farmer.id}
                    href={farmer.active ? `/farmers/new?farmerId=${encodeURIComponent(farmer.id)}` : "/farmers/profiles"}
                    aria-disabled={!farmer.active}
                    className="rounded-lg border border-border p-4 transition hover:border-primary hover:bg-muted/35 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">{farmer.phone}</p>
                      </div>
                      <Badge tone={farmer.active ? "success" : "muted"}>{farmer.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    {farmer.villageAddress ? <p className="mt-3 text-sm">{farmer.villageAddress}</p> : null}
                    <p className="mt-3 text-sm font-semibold">Opening: {formatCurrency(farmer.openingBalance)}</p>
                    {farmer.paymentDetails ? <p className="mt-2 text-xs text-muted-foreground">{farmer.paymentDetails}</p> : null}
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{farmer.active ? "Click to add milk" : "Inactive profile"}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
