/**
 * Safely extracts and trims a route param value.
 * Returns undefined if the param is missing or empty.
 */
export function getParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  if (typeof str !== "string") return undefined;
  const trimmed = str.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
