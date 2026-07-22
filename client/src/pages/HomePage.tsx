import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Bookmark, CalendarDays, Sparkles, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function HomePage() {
  const user = useCurrentUser();

  return (
    <main className="min-h-[calc(100vh-4.5rem)] overflow-hidden bg-slate-950 text-white">
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="absolute -right-44 top-0 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            {user && <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm text-blue-100"><Sparkles size={15} /> Welcome back, {user.name}</div>}
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Your training week, <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">under control.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Book classes, manage your schedule, and join waitlists. Get
              promoted automatically when spots open up.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/classes">
                <Button className="h-12 w-full gap-2 rounded-xl bg-blue-600 px-6 shadow-lg shadow-blue-600/25 hover:bg-blue-500 sm:w-auto" size="lg">
                  <CalendarDays size={20} />
                  Browse Classes
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/my-bookings">
                <Button
                  variant="outline"
                  className="h-12 w-full gap-2 rounded-xl border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                  size="lg"
                >
                  <Bookmark size={20} />
                  My Bookings
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[{ icon: CalendarDays, title: "Class calendar", text: "Find every session by date and time." }, { icon: Users, title: "Smart waitlists", text: "Move up automatically when a place opens." }, { icon: Bookmark, title: "Simple bookings", text: "Review and manage your schedule anytime." }, { icon: BarChart3, title: "Progress insights", text: "Understand your activity at a glance." }].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm transition-transform hover:-translate-y-1 ${index % 2 === 1 ? "sm:translate-y-6" : ""}`}>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20"><Icon size={22} /></div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-7 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} HubFit. All rights reserved.</p>
      </footer>
    </main>
  );
}
