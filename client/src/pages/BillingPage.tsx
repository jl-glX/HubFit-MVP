import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

type BillingStatus = "paid" | "unpaid" | "pending";
type BillingCycle =
  "monthly" | "quarterly" | "semiannual" | "annual" | "trial_day" | "custom";

interface BillingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  concept: string;
  billingCycle: BillingCycle;
  amountCents: number;
  currency: string;
  status: BillingStatus;
  dueAt: number | null;
  paidAt: number | null;
  invoiceNumber: string | null;
  notes: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function BillingPage() {
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    concept: "",
    billingCycle: "monthly" as BillingCycle,
    amount: "",
    status: "pending" as BillingStatus,
    dueDate: "",
    invoiceNumber: "",
    notes: "",
  });

  const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await authFetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const body = response.status === 204 ? null : await response.json();
    if (!response.ok)
      throw new Error(body?.error ?? t("billing.requestFailed"));
    return body as T;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await request<BillingRecord[]>("/api/billing"));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
    // request only depends on the current language error text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () => ({
      paid: records.filter((record) => record.status === "paid").length,
      unpaid: records.filter((record) => record.status === "unpaid").length,
      pending: records.filter((record) => record.status === "pending").length,
      trial: records.filter((record) => record.billingCycle === "trial_day")
        .length,
    }),
    [records],
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await request<BillingRecord>("/api/billing", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          concept: form.concept,
          billingCycle: form.billingCycle,
          amountCents: Math.round(Number(form.amount) * 100),
          currency: "EUR",
          status: form.status,
          dueAt: form.dueDate ? new Date(form.dueDate).getTime() : null,
          paidAt: null,
          invoiceNumber: form.invoiceNumber || null,
          notes: form.notes,
        }),
      });
      setRecords((current) => [created, ...current]);
      setForm({
        customerName: "",
        customerEmail: "",
        concept: "",
        billingCycle: "monthly",
        amount: "",
        status: "pending",
        dueDate: "",
        invoiceNumber: "",
        notes: "",
      });
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const updateStatus = async (id: string, status: BillingStatus) => {
    const updated = await request<BillingRecord>(`/api/billing/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setRecords((current) =>
      current.map((record) => (record.id === id ? updated : record)),
    );
  };

  const remove = async (id: string) => {
    await request<void>(`/api/billing/${id}`, { method: "DELETE" });
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  const money = (record: BillingRecord) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: record.currency,
    }).format(record.amountCents / 100);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              {t("billing.eyebrow")}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              {t("billing.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              {t("billing.description")}
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            {t("common.refresh")}
          </Button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["paid", "unpaid", "pending", "trial"] as const).map((key) => (
            <Card
              key={key}
              className="rounded-2xl border-slate-200 p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">
                {t(`billing.summary.${key}`)}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {summary[key]}
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-6 rounded-3xl border-slate-200 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Plus className="text-blue-600" /> {t("billing.newRecord")}
          </h2>
          <form
            onSubmit={submit}
            className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Field label={t("billing.customer")}>
              <Input
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </Field>
            <Field label={t("common.email")}>
              <Input
                type="email"
                value={form.customerEmail}
                onChange={(e) =>
                  setForm({ ...form, customerEmail: e.target.value })
                }
              />
            </Field>
            <Field label={t("billing.concept")}>
              <Input
                required
                value={form.concept}
                onChange={(e) => setForm({ ...form, concept: e.target.value })}
              />
            </Field>
            <Field label={t("billing.amount")}>
              <Input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
            <Field label={t("billing.cycleLabel")}>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={form.billingCycle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    billingCycle: e.target.value as BillingCycle,
                  })
                }
              >
                {(
                  [
                    "monthly",
                    "quarterly",
                    "semiannual",
                    "annual",
                    "trial_day",
                    "custom",
                  ] as const
                ).map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {t(`billing.cycles.${cycle}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("billing.statusLabel")}>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as BillingStatus })
                }
              >
                {(["paid", "unpaid", "pending"] as const).map((status) => (
                  <option key={status} value={status}>
                    {t(`billing.status.${status}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("billing.dueDate")}>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
            <Field label={t("billing.invoiceNumber")}>
              <Input
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm({ ...form, invoiceNumber: e.target.value })
                }
              />
            </Field>
            <div className="md:col-span-2 lg:col-span-3">
              <Field label={t("billing.notes")}>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </div>
            <Button type="submit" className="self-end">
              <CreditCard /> {t("billing.add")}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 overflow-hidden rounded-3xl border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  {(
                    [
                      "customer",
                      "concept",
                      "cycleLabel",
                      "amount",
                      "statusLabel",
                      "dueDate",
                      "invoiceNumber",
                      "actions",
                    ] as const
                  ).map((key) => (
                    <th key={key} className="px-4 py-3">
                      {t(`billing.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <strong className="block">{record.customerName}</strong>
                      <span className="text-xs text-slate-500">
                        {record.customerEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3">{record.concept}</td>
                    <td className="px-4 py-3">
                      {t(`billing.cycles.${record.billingCycle}`)}
                    </td>
                    <td className="px-4 py-3 font-semibold">{money(record)}</td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={t("billing.statusLabel")}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1"
                        value={record.status}
                        onChange={(e) =>
                          void updateStatus(
                            record.id,
                            e.target.value as BillingStatus,
                          )
                        }
                      >
                        {(["paid", "unpaid", "pending"] as const).map(
                          (status) => (
                            <option key={status} value={status}>
                              {t(`billing.status.${status}`)}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {record.dueAt
                        ? new Intl.DateTimeFormat(i18n.language).format(
                            record.dueAt,
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{record.invoiceNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t("billing.delete")}
                        onClick={() => void remove(record.id)}
                      >
                        <Trash2 className="text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && records.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {t("billing.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
