import i18n from "../i18n/config";

const localeByLanguage: Record<string, string> = {
  en: "en-GB",
  es: "es-ES",
};

export function getLocale(language = i18n.resolvedLanguage): string {
  const normalizedLanguage = language?.split("-")[0] ?? "es";
  return localeByLanguage[normalizedLanguage] ?? "es-ES";
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(getLocale(), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(getLocale(), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getLocale(), options).format(value);
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return formatNumber(value, { style: "currency", currency });
}

export function groupClassesByDate<T extends { scheduledAt: number }>(classes: T[]) {
  const grouped: Record<string, T[]> = {};

  classes.forEach((cls) => {
    const date = formatDate(cls.scheduledAt);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(cls);
  });

  return grouped;
}

export function isFutureClass(timestamp: number): boolean {
  return timestamp > Date.now();
}
