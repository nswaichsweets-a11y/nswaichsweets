import bcrypt from "bcryptjs";
import { PrismaClient, type UserRoleKey } from "@prisma/client";

const prisma = new PrismaClient();

const password = "Namdhari@123";

const moduleKeys = [
  "dashboard",
  "menu",
  "pos",
  "business-settings",
  "users",
  "products",
  "invoices",
  "bulk-orders",
  "customers",
  "ledgers",
  "holidays",
  "inventory",
  "farmers",
  "suppliers",
  "employees",
  "expenses",
  "payments",
  "reports",
  "audit-logs",
  "backup",
  "admin"
] as const;

const actions = ["view", "create", "update", "delete", "export"] as const;

const roleLabels: Record<UserRoleKey, string> = {
  SUPER_ADMIN: "Super Admin / Agency",
  OWNER: "Owner",
  MANAGER: "Manager",
  CASHIER: "Cashier",
  INVENTORY_STAFF: "Inventory Staff",
  ACCOUNTANT: "Accountant",
  READ_ONLY_STAFF: "Read-only Staff"
};

function permissionCodesFor(role: UserRoleKey) {
  if (role === "SUPER_ADMIN") {
    return moduleKeys.flatMap((module) => actions.map((action) => `${module}:${action}`));
  }

  if (role === "OWNER") {
    return moduleKeys
      .filter((module) => module !== "admin")
      .flatMap((module) => (module === "business-settings" ? ["business-settings:view"] : actions.map((action) => `${module}:${action}`)));
  }

  if (role === "MANAGER") {
    return [
      "dashboard:view",
      "menu:view",
      "pos:view",
      "pos:create",
      "products:view",
      "products:create",
      "products:update",
      "invoices:view",
      "invoices:create",
      "invoices:update",
      "bulk-orders:view",
      "bulk-orders:create",
      "bulk-orders:update",
      "customers:view",
      "customers:create",
      "customers:update",
      "holidays:view",
      "holidays:create",
      "holidays:update",
      "inventory:view",
      "inventory:create",
      "inventory:update",
      "farmers:view",
      "farmers:create",
      "farmers:update",
      "suppliers:view",
      "suppliers:create",
      "suppliers:update",
      "employees:view",
      "employees:create",
      "employees:update",
      "reports:view",
      "reports:export"
    ];
  }

  if (role === "CASHIER") {
    return [
      "dashboard:view",
      "menu:view",
      "pos:view",
      "pos:create",
      "invoices:view",
      "invoices:create",
      "bulk-orders:view",
      "bulk-orders:create",
      "customers:view",
      "customers:create",
      "holidays:view",
      "payments:view",
      "payments:create",
      "reports:view"
    ];
  }

  if (role === "INVENTORY_STAFF") {
    return [
      "dashboard:view",
      "menu:view",
      "products:view",
      "bulk-orders:view",
      "holidays:view",
      "inventory:view",
      "inventory:create",
      "inventory:update",
      "suppliers:view",
      "reports:view",
      "reports:export"
    ];
  }

  if (role === "ACCOUNTANT") {
    return [
      "dashboard:view",
      "menu:view",
      "pos:view",
      "bulk-orders:view",
      "customers:view",
      "ledgers:view",
      "ledgers:create",
      "ledgers:update",
      "farmers:view",
      "suppliers:view",
      "employees:view",
      "holidays:view",
      "expenses:view",
      "expenses:create",
      "expenses:update",
      "payments:view",
      "payments:create",
      "payments:update",
      "reports:view",
      "reports:export"
    ];
  }

  return moduleKeys.filter((module) => module !== "admin").map((module) => `${module}:view`);
}

async function seedRolesAndUsers() {
  const permissions = [];

  for (const module of moduleKeys) {
    for (const action of actions) {
      permissions.push(
        await prisma.permission.upsert({
          where: { code: `${module}:${action}` },
          update: {},
          create: {
            code: `${module}:${action}`,
            label: `${action[0]?.toUpperCase()}${action.slice(1)} ${module.replaceAll("-", " ")}`,
            module
          }
        })
      );
    }
  }

  for (const roleKey of Object.keys(roleLabels) as UserRoleKey[]) {
    const codes = permissionCodesFor(roleKey);
    await prisma.role.upsert({
      where: { key: roleKey },
      update: {
        permissions: {
          set: permissions.filter((permission) => codes.includes(permission.code)).map((permission) => ({ id: permission.id }))
        }
      },
      create: {
        key: roleKey,
        name: roleLabels[roleKey],
        description: `${roleLabels[roleKey]} access profile`,
        permissions: {
          connect: permissions.filter((permission) => codes.includes(permission.code)).map((permission) => ({ id: permission.id }))
        }
      }
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const roles = await prisma.role.findMany();
  const roleId = (key: UserRoleKey) => roles.find((role) => role.key === key)?.id;

  const users = [
    ["agency@nss.local", "Agency Admin", "SUPER_ADMIN"],
    ["owner@nss.local", "Namdhari Owner", "OWNER"],
    ["manager@nss.local", "Shop Manager", "MANAGER"],
    ["cashier@nss.local", "Billing Counter", "CASHIER"],
    ["inventory@nss.local", "Store Keeper", "INVENTORY_STAFF"],
    ["accountant@nss.local", "Accounts Desk", "ACCOUNTANT"],
    ["viewer@nss.local", "Read Only Staff", "READ_ONLY_STAFF"]
  ] as const;

  for (const [email, name, roleKey] of users) {
    const id = roleId(roleKey);
    if (!id) continue;

    await prisma.user.upsert({
      where: { email },
      update: { name, roleId: id, active: true, phone: null },
      create: {
        email,
        name,
        passwordHash,
        roleId: id,
        phone: null
      }
    });
  }
}

async function seedBusinessSettings() {
  const existing = await prisma.businessSettings.findFirst();
  if (existing) return;

  await prisma.businessSettings.create({
    data: {
      businessName: "Namdhari Swaich Sweets",
      address: "",
      phone: "",
      whatsappNumber: null,
      email: null,
      gstin: null,
      fssaiLicense: null,
      registeredNumber: null,
      invoicePrefix: "NSS",
      invoiceFooterTerms: "",
      invoiceAssignees: null,
      upiPaymentDetails: null,
      currency: "INR",
      defaultTaxRate: "0",
      themeColor: "#141b18",
      branchName: null,
      branchCode: null
    }
  });
}

async function seedMasterData() {
  // Production seed intentionally leaves products, menu items, customers,
  // inventory, farmers, suppliers, employees, invoices, ledgers, and reports
  // empty so the owner starts from clean zero business data.
}

async function seedOperationalData() {
  // No operational seed records. Use the app to add real products, customers,
  // invoices, farmers, suppliers, employees, inventory, and expenses.
}

async function main() {
  await seedRolesAndUsers();
  await seedBusinessSettings();
  await seedMasterData();
  await seedOperationalData();

  console.log("Seed complete.");
  console.log("Initial password for all seeded users:", password);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
