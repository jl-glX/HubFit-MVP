export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
