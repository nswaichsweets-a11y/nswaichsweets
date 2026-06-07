import { z } from "zod";

export const moduleRecordSchema = z.object({
  moduleKey: z.string().min(1),
  values: z.record(z.string())
});

export function formDataToRecord(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "moduleKey") continue;
    values[key] = String(value);
  }
  return moduleRecordSchema.parse({
    moduleKey: String(formData.get("moduleKey") ?? ""),
    values
  });
}

export function optionalNumber(value: unknown, fallback = "0") {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

export function optionalDate(value: unknown) {
  const text = String(value ?? "").trim();
  return text ? new Date(text) : new Date();
}

export function activeFromValue(value: unknown) {
  return String(value ?? "Active").toLowerCase() !== "inactive";
}
