import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { getAdminControlData } from "@/features/admin/admin-service";
import { resetBusinessDataFromAdminAction, updateUserAccessAction } from "@/features/admin/admin-actions";
import { roleLabel } from "@/lib/permissions/roles";

type PageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export const metadata = {
  title: "Admin Control"
};

export default async function AdminPage({ searchParams }: PageProps) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  if (user.roleKey !== "SUPER_ADMIN") redirect("/dashboard");
  const data = await getAdminControlData();

  const statCards = [
    ["Users", data.counts.users],
    ["Products", data.counts.products],
    ["Invoices", data.counts.invoices],
    ["Customers", data.counts.customers],
    ["Employees", data.counts.employees],
    ["Audit logs", data.counts.auditLogs]
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">System</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal">Super Admin Control</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Manage staff access, reset passwords, connect Gmail login by user email, and clear business records when the shop needs a clean start.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {query.saved ? <Badge tone="success">Saved</Badge> : null}
            {query.error ? <Badge tone="danger">{query.error}</Badge> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {statCards.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>User access</CardTitle>
            <CardDescription>Add users from the Users module, then use this panel to activate/deactivate, change role, or reset password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.users.length === 0 ? (
              <p className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">No users found. Run npm run setup:local to create local users.</p>
            ) : (
              data.users.map((staffUser) => (
                <form key={staffUser.id} action={updateUserAccessAction} className="grid gap-3 rounded-lg border border-border p-3 lg:grid-cols-[1.2fr_180px_140px_180px_auto] lg:items-end">
                  <input type="hidden" name="userId" value={staffUser.id} />
                  <div>
                    <p className="font-semibold">{staffUser.name}</p>
                    <p className="text-sm text-muted-foreground">{staffUser.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone={staffUser.active ? "success" : "muted"}>{staffUser.active ? "Active" : "Inactive"}</Badge>
                      <Badge tone={staffUser.googleLinked ? "success" : "warning"}>{staffUser.googleLinked ? "Gmail linked" : "Gmail ready"}</Badge>
                      {staffUser.lastLoginAt ? <Badge tone="muted">Last login {new Date(staffUser.lastLoginAt).toLocaleDateString()}</Badge> : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`role-${staffUser.id}`}>Role</Label>
                    <select id={`role-${staffUser.id}`} name="role" defaultValue={staffUser.roleKey} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm">
                      {data.roles.map((role) => (
                        <option key={role.id} value={role.key}>
                          {roleLabel(role.key)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`active-${staffUser.id}`}>Access</Label>
                    <select id={`active-${staffUser.id}`} name="active" defaultValue={String(staffUser.active)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm">
                      <option value="true">Active</option>
                      <option value="false">Blocked</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`password-${staffUser.id}`}>New password</Label>
                    <Input id={`password-${staffUser.id}`} name="password" type="text" placeholder="Optional" minLength={8} />
                  </div>
                  <Button type="submit">Update</Button>
                </form>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle>Delete business data</CardTitle>
            <CardDescription>Clears invoices, products, customers, ledgers, stock, employees, reports, and audit logs. Users, roles, permissions, logo, and app code stay.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={resetBusinessDataFromAdminAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm">Type DELETE DATA</Label>
                <Input id="confirm" name="confirm" autoComplete="off" placeholder="DELETE DATA" />
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                Clear business records
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
