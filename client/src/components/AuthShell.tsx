import type { ReactNode } from "react";
import { Activity, CalendarDays, ShieldCheck, Users } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const highlights = [
  { icon: CalendarDays, text: "Book your week in seconds" },
  { icon: Users, text: "Smart waitlists with live availability" },
  { icon: ShieldCheck, text: "Secure access for every role" },
];

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 p-2.5 shadow-lg shadow-blue-500/20">
            <Activity size={23} />
          </span>
          HubFit
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Train. Connect. Progress.</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
            Your gym life,<br />all in one place.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
            Plan sessions, manage bookings and stay connected to your training community.
          </p>
          <div className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-blue-300 ring-1 ring-white/10">
                  <Icon size={18} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} HubFit</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 p-2.5 text-white shadow-lg shadow-blue-600/20">
              <Activity size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-950">HubFit</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
