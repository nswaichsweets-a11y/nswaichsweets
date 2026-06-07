export function toDatabaseJson(value: unknown) {
  if (value === undefined || value === null) return undefined;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
