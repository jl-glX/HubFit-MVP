export type BillingStatus = "paid" | "unpaid" | "pending";
export type BillingCycle =
  "monthly" | "quarterly" | "semiannual" | "annual" | "trial_day" | "custom";
export type BillingDateFormat = "locale" | "day-first" | "month-first" | "iso";

export interface BillingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  concept: string;
  billingCycle: BillingCycle;
  customCycleLabel: string;
  amountCents: number;
  currency: string;
  status: BillingStatus;
  dueAt: number | null;
  paidAt: number | null;
  invoiceNumber: string | null;
  notes: string;
  archivedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export function formatBillingDate(
  timestamp: number | null,
  format: BillingDateFormat,
  language: string,
) {
  if (timestamp == null) return "—";
  const date = new Date(timestamp);
  if (format === "iso") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const locale =
    format === "day-first"
      ? "en-GB"
      : format === "month-first"
        ? "en-US"
        : language;
  return new Intl.DateTimeFormat(locale).format(date);
}
