"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, type AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireUser } from "@/features/auth/session";
import { can } from "@/lib/permissions/roles";
import { attendanceDateFromInput } from "./attendance-service";

const attendanceStatuses = new Set<AttendanceStatus>(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]);

function statusFromValue(value: unknown): AttendanceStatus {
  const status = String(value ?? "PRESENT") as AttendanceStatus;
  return attendanceStatuses.has(status) ? status : "PRESENT";
}

function hoursFromValue(value: unknown, status: AttendanceStatus) {
  if (status === "ABSENT" || status === "LEAVE") return null;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const hours = Math.max(0, Number(text));
  return Number.isFinite(hours) ? hours.toFixed(2) : null;
}

export async function recordAttendanceAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user.roleKey, "employees", "update") && !can(user.roleKey, "employees", "create")) {
    redirect("/employees");
  }

  const employeeId = String(formData.get("employeeId") ?? "").trim();
  const status = statusFromValue(formData.get("status"));
  const date = attendanceDateFromInput(formData.get("date"));
  const hoursWorked = hoursFromValue(formData.get("hoursWorked"), status);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!employeeId) redirect("/employees/attendance?error=employee");

  if (prisma) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) redirect("/employees/attendance?error=employee");

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date
        }
      },
      update: {
        status,
        hoursWorked,
        notes
      },
      create: {
        employeeId,
        date,
        status,
        hoursWorked,
        notes
      }
    });

    await prisma.auditLog.create({
      data: {
        module: "employees",
        action: "attendance-upsert",
        recordId: attendance.id,
        recordTitle: `${employee.name} - ${status}`,
        userId: user.id,
        newValues: {
          employeeId,
          date: date.toISOString(),
          status,
          hoursWorked,
          notes
        } as Prisma.InputJsonObject
      }
    });
  }

  revalidatePath("/employees");
  revalidatePath("/employees/attendance");
  revalidatePath("/dashboard");
  redirect("/employees/attendance?saved=1");
}
