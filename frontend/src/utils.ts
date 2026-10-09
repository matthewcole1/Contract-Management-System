export function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const utcValue = value.includes("T")
    ? value
    : value.replace(" ", "T") + "Z";

  return new Date(utcValue).toLocaleString();
}