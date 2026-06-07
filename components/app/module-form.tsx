import { createModuleRecordAction } from "@/features/modules/actions";
import type { ModuleDefinition, FormField } from "@/features/modules/module-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { localizeValue, t, type Locale } from "@/lib/i18n/dictionary";

function FieldControl({ field, locale }: { field: FormField; locale: Locale }) {
  if (field.type === "textarea") {
    return <Textarea name={field.name} required={field.required} placeholder={field.placeholder} />;
  }

  if (field.type === "select") {
    return (
      <select
        name={field.name}
        required={field.required}
        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
        defaultValue={field.options?.[0] ?? ""}
      >
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {localizeValue(locale, option)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      name={field.name}
      type={field.type}
      required={field.required}
      placeholder={field.placeholder}
      step={field.type === "number" ? "0.01" : undefined}
    />
  );
}

export function ModuleForm({ definition, locale }: { definition: ModuleDefinition; locale: Locale }) {
  return (
    <form action={createModuleRecordAction} className="grid gap-5 rounded-lg border border-border bg-white p-5 shadow-soft">
      <input type="hidden" name="moduleKey" value={definition.key} />
      <div className="grid gap-4 md:grid-cols-2">
        {definition.fields.map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : undefined}>
            <Label htmlFor={field.name}>
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </Label>
            <div className="mt-2">
              <FieldControl field={field} locale={locale} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="reset" variant="outline">
          {t(locale, "reset")}
        </Button>
        <Button type="submit">{definition.createLabel ?? t(locale, "save")}</Button>
      </div>
    </form>
  );
}
