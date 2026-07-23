import { Link } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  KeyRound,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Timer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { ProfilePhotoSettings } from "../components/ProfilePhotoSettings";
import { DelegationManager } from "../components/DelegationManager";

export function AccountControlPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const links = [
    {
      to: "/account/security",
      icon: ShieldCheck,
      title: t("accountControl.security"),
      description: t("accountControl.securityDescription"),
    },
    {
      to: "/my-bookings",
      icon: CalendarDays,
      title: t("accountControl.bookings"),
      description: t("accountControl.bookingsDescription"),
    },
    ...(user?.role === "member"
      ? [
          {
            to: "/my-payments",
            icon: ShoppingBag,
            title: t("accountControl.payments"),
            description: t("accountControl.paymentsDescription"),
          },
          {
            to: "/workout-timer",
            icon: Timer,
            title: t("accountControl.timer"),
            description: t("accountControl.timerDescription"),
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {user?.avatarDataUrl ? (
              <img
                src={user.avatarDataUrl}
                alt={user.name}
                className="h-24 w-24 rounded-full border-4 border-white/15 object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                <UserRound size={40} />
              </span>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                {t("accountControl.eyebrow")}
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {user?.name}
              </h1>
              <p className="mt-2 text-slate-300">
                {user?.email} · {user?.role && t(`roles.${user.role}`)}
              </p>
            </div>
          </div>
        </header>

        <section className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ to, icon: Icon, title, description }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                <Icon />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </Link>
          ))}
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6">
            <span className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Bell />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              {t("accountControl.notifications")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("accountControl.notificationsDescription")}
            </p>
          </div>
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6">
            <span className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Settings2 />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              {t("accountControl.preferences")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("accountControl.preferencesDescription")}
            </p>
          </div>
        </section>

        <ProfilePhotoSettings />
        <DelegationManager />

        <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 shrink-0" size={19} />
            <p>{t("accountControl.delegationSecurity")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
