import i18n from "../i18n/config";

const localeByLanguage: Record<string, string> = {
  en: "en-GB",
  es: "es-ES",
};

function getLocale(language = i18n.resolvedLanguage): string {
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

export function groupClassesByDate<T extends { scheduledAt: number }>(
  classes: T[],
) {
  const grouped: Record<string, T[]> = {};

  classes.forEach((cls) => {
    const date = new Date(cls.scheduledAt);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(cls);
  });

  return grouped;
}

export function isFutureClass(timestamp: number): boolean {
  return timestamp > Date.now();
}
