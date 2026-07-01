function toIntlLocale(locale: string): string {
  return locale === "fa" ? "fa-IR" : "en-US";
}

export function formatEventDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
