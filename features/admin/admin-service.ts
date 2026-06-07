import type { UserRoleKey } from "@/lib/domain-types";
import { prisma, withDatabase } from "@/lib/db/client";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleKey: UserRoleKey;
  active: boolean;
  googleLinked: boolean;
  lastLoginAt: string | null;
};

export type AdminControlData = {
  users: AdminUserRow[];
  roles: { id: string; key: UserRoleKey; name: string }[];
  counts: {
    users: number;
    products: number;
    invoices: number;
    customers: number;
    employees: number;
    auditLogs: number;
  };
};

export async function getAdminControlData(): Promise<AdminControlData> {
  const fallback: AdminControlData = {
    users: [],
    roles: [],
    counts: {
      users: 0,
      products: 0,
      invoices: 0,
      customers: 0,
      employees: 0,
      auditLogs: 0
    }
  };

  if (!prisma) return fallback;

  return withDatabase(
    async (client) => {
      const [users, roles, products, invoices, customers, employees, auditLogs] = await Promise.all([
        client.user.findMany({ include: { role: true }, orderBy: [{ active: "desc" }, { createdAt: "asc" }] }),
        client.role.findMany({ orderBy: { name: "asc" } }),
        client.product.count(),
        client.invoice.count(),
        client.customer.count(),
        client.employee.count(),
        client.auditLog.count()
      ]);

      return {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roleKey: user.role.key as UserRoleKey,
          active: user.active,
          googleLinked: Boolean(user.googleSubject),
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null
        })),
        roles: roles.map((role) => ({ id: role.id, key: role.key as UserRoleKey, name: role.name })),
        counts: {
          users: users.length,
          products,
          invoices,
          customers,
          employees,
          auditLogs
        }
      };
    },
    fallback
  );
}
