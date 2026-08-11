export function parseDate(date: Date) {
  return date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
