import type { AttendanceStatus } from "@/lib/domain-types";
import { prisma, withDatabase } from "@/lib/db/client";

export type AttendanceEmployee = {
  id: string;
  name: string;
  phone: string;
  designation: string;
};

export type AttendanceRecord = {
  id: string;
  employeeName: string;
  designation: string;
  date: string;
  status: AttendanceStatus;
  hoursWorked: number | null;
  notes: string | null;
};

export type AttendanceOverview = {
  todayInput: string;
  employees: AttendanceEmployee[];
  records: AttendanceRecord[];
  stats: {
    activeEmployees: number;
    todayPresent: number;
    todayAbsent: number;
    monthAbsents: number;
  };
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) {
    return Number(value.toString());
  }
  return Number(value ?? 0);
}

export function dateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function attendanceDateFromInput(value: unknown) {
  const text = String(value ?? "").trim() || dateInputValue();
  return new Date(`${text}T00:00:00.000Z`);
}

function monthStartDate(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

export async function getAttendanceOverview(): Promise<AttendanceOverview> {
  const todayInput = dateInputValue();
  const fallback: AttendanceOverview = {
    todayInput,
    employees: [],
    records: [],
    stats: {
      activeEmployees: 0,
      todayPresent: 0,
      todayAbsent: 0,
      monthAbsents: 0
    }
  };

  if (!prisma) return fallback;

  return withDatabase(async (client) => {
    const today = attendanceDateFromInput(todayInput);
    const monthStart = monthStartDate();
    const [employees, records, todayPresent, todayAbsent, monthAbsents] = await Promise.all([
      client.employee.findMany({
        where: { active: true },
        orderBy: { name: "asc" }
      }),
      client.attendance.findMany({
        include: { employee: true },
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
        take: 30
      }),
      client.attendance.count({ where: { date: today, status: "PRESENT" } }),
      client.attendance.count({ where: { date: today, status: "ABSENT" } }),
      client.attendance.count({ where: { date: { gte: monthStart }, status: "ABSENT" } })
    ]);

    return {
      todayInput,
      employees: employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        designation: employee.designation
      })),
      records: records.map((record) => ({
        id: record.id,
        employeeName: record.employee.name,
        designation: record.employee.designation,
        date: record.date.toISOString(),
        status: record.status as AttendanceStatus,
        hoursWorked: record.hoursWorked === null ? null : decimal(record.hoursWorked),
        notes: record.notes
      })),
      stats: {
        activeEmployees: employees.length,
        todayPresent,
        todayAbsent,
        monthAbsents
      }
    };
  }, fallback);
}
