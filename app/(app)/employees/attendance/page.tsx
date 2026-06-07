import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppIcon } from "@/components/app/icon";
import { recordAttendanceAction } from "@/features/employees/attendance-actions";
import { getAttendanceOverview } from "@/features/employees/attendance-service";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { localizeValue, t, type Locale } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";
import { formatDate, formatNumber } from "@/lib/utils/format";

type PageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const copy = {
  en: {
    title: "Employee Attendance",
    eyebrow: "People",
    description: "Mark present, absent, half-day, or leave entries and keep salary records ready for monthly review.",
    back: "Back to Employees",
    saved: "Attendance saved",
    error: "Select a valid employee and try again.",
    activeEmployees: "Active Employees",
    todayPresent: "Today Present",
    todayAbsent: "Today Absent",
    monthAbsents: "Absents This Month",
    markAttendance: "Mark attendance",
    employee: "Employee",
    date: "Date",
    status: "Status",
    hours: "Hours worked",
    notes: "Notes",
    notesPlaceholder: "Optional reason, late note, or manager comment",
    save: "Save Attendance",
    noEmployees: "Add an employee first, then attendance and absents can be tracked here.",
    recentEntries: "Recent attendance entries",
    noEntries: "No attendance has been recorded yet.",
    designation: "Designation"
  },
  pa: {
    title: "ਕਰਮਚਾਰੀ ਹਾਜ਼ਰੀ",
    eyebrow: "ਸਟਾਫ",
    description: "ਮਹੀਨਾਵਾਰ ਤਨਖਾਹ ਸਮੀਖਿਆ ਲਈ ਹਾਜ਼ਰ, ਗੈਰਹਾਜ਼ਰ, ਅੱਧਾ ਦਿਨ ਜਾਂ ਛੁੱਟੀ ਦਰਜ ਕਰੋ।",
    back: "ਕਰਮਚਾਰੀਆਂ ਵੱਲ ਵਾਪਸ",
    saved: "ਹਾਜ਼ਰੀ ਸੇਵ ਹੋ ਗਈ",
    error: "ਸਹੀ ਕਰਮਚਾਰੀ ਚੁਣੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    activeEmployees: "ਐਕਟਿਵ ਕਰਮਚਾਰੀ",
    todayPresent: "ਅੱਜ ਹਾਜ਼ਰ",
    todayAbsent: "ਅੱਜ ਗੈਰਹਾਜ਼ਰ",
    monthAbsents: "ਇਸ ਮਹੀਨੇ ਗੈਰਹਾਜ਼ਰੀ",
    markAttendance: "ਹਾਜ਼ਰੀ ਲਗਾਓ",
    employee: "ਕਰਮਚਾਰੀ",
    date: "ਮਿਤੀ",
    status: "ਸਟੇਟਸ",
    hours: "ਕੰਮ ਦੇ ਘੰਟੇ",
    notes: "ਨੋਟਸ",
    notesPlaceholder: "ਵਿਕਲਪਿਕ ਕਾਰਨ, ਦੇਰੀ ਨੋਟ ਜਾਂ ਮੈਨੇਜਰ ਟਿੱਪਣੀ",
    save: "ਹਾਜ਼ਰੀ ਸੇਵ ਕਰੋ",
    noEmployees: "ਪਹਿਲਾਂ ਕਰਮਚਾਰੀ ਜੋੜੋ, ਫਿਰ ਇੱਥੇ ਹਾਜ਼ਰੀ ਅਤੇ ਗੈਰਹਾਜ਼ਰੀ ਟ੍ਰੈਕ ਕਰੋ।",
    recentEntries: "ਤਾਜ਼ਾ ਹਾਜ਼ਰੀ ਐਂਟਰੀਆਂ",
    noEntries: "ਹਾਲੇ ਕੋਈ ਹਾਜ਼ਰੀ ਦਰਜ ਨਹੀਂ ਕੀਤੀ ਗਈ।",
    designation: "ਅਹੁਦਾ"
  }
} as const satisfies Record<Locale, Record<string, string>>;

function attendanceTone(status: string) {
  if (status === "PRESENT") return "success";
  if (status === "ABSENT") return "danger";
  if (status === "HALF_DAY" || status === "LEAVE") return "warning";
  return "muted";
}

export const metadata = {
  title: "Employee Attendance"
};

export default async function EmployeeAttendancePage({ searchParams }: PageProps) {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  if (!can(user.roleKey, "employees", "update") && !can(user.roleKey, "employees", "create")) redirect("/employees");

  const [query, overview] = await Promise.all([searchParams, getAttendanceOverview()]);
  const c = copy[locale];
  const stats = [
    { label: c.activeEmployees, value: overview.stats.activeEmployees },
    { label: c.todayPresent, value: overview.stats.todayPresent },
    { label: c.todayAbsent, value: overview.stats.todayAbsent },
    { label: c.monthAbsents, value: overview.stats.monthAbsents }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/employees">
            <AppIcon name="chevron" className="rotate-180" />
            {c.back}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.eyebrow}</p>
              {query.saved ? <Badge tone="success">{c.saved}</Badge> : null}
              {query.error ? <Badge tone="danger">{c.error}</Badge> : null}
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">{c.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{c.description}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-white p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{formatNumber(stat.value)}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form action={recordAttendanceAction} className="grid gap-4 rounded-lg border border-border bg-white p-5 shadow-soft">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{c.markAttendance}</p>
          </div>
          {overview.employees.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">{c.noEmployees}</p>
          ) : (
            <>
              <div>
                <Label htmlFor="employeeId">{c.employee}</Label>
                <select
                  id="employeeId"
                  name="employeeId"
                  required
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                >
                  {overview.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.designation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">{c.date}</Label>
                  <Input id="date" name="date" type="date" defaultValue={overview.todayInput} className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="status">{c.status}</Label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="mt-2 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
                    defaultValue="ABSENT"
                  >
                    {["ABSENT", "PRESENT", "HALF_DAY", "LEAVE"].map((status) => (
                      <option key={status} value={status}>
                        {localizeValue(locale, status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="hoursWorked">{c.hours}</Label>
                <Input id="hoursWorked" name="hoursWorked" type="number" min="0" step="0.25" placeholder="0" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="notes">{c.notes}</Label>
                <Textarea id="notes" name="notes" placeholder={c.notesPlaceholder} className="mt-2" />
              </div>
              <Button type="submit">
                <AppIcon name="calendar-check" />
                {c.save}
              </Button>
            </>
          )}
        </form>

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
          <div className="border-b border-border bg-muted/60 px-4 py-3">
            <p className="text-sm font-semibold">{c.recentEntries}</p>
          </div>
          {overview.records.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">{c.noEntries}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{c.employee}</th>
                    <th className="px-4 py-3">{c.designation}</th>
                    <th className="px-4 py-3">{c.date}</th>
                    <th className="px-4 py-3">{c.status}</th>
                    <th className="px-4 py-3">{c.hours}</th>
                    <th className="px-4 py-3">{c.notes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {overview.records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 font-medium">{record.employeeName}</td>
                      <td className="px-4 py-3">{record.designation}</td>
                      <td className="px-4 py-3">{formatDate(record.date)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={attendanceTone(record.status)}>{localizeValue(locale, record.status)}</Badge>
                      </td>
                      <td className="px-4 py-3">{record.hoursWorked === null ? "-" : formatNumber(record.hoursWorked)}</td>
                      <td className="px-4 py-3">{record.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
