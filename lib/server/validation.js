export function parsePositiveInt(value, defaultValue, min = 0) {
  if (value == null || value === "") return defaultValue;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return defaultValue;

  return Math.max(parsed, min);
}

export function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hasRequiredFields(body, fields) {
  return fields.every((field) => {
    const value = body[field];
    return !(value == null || (typeof value === "string" && value.trim() === ""));
  });
}
