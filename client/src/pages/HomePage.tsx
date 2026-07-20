import { Link } from "react-router-dom";
import { Calendar, Bookmark, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function HomePage() {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2">
              <Calendar size={24} />
            </div>
            <h1 className="text-2xl font-bold">HubFit</h1>
          </div>
          {user && <p className="text-slate-300">Welcome, {user.name}!</p>}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-5xl font-bold leading-tight">
              Manage Your Gym Classes
            </h2>
            <p className="mt-6 text-xl text-slate-300">
              Book classes, manage your schedule, and join waitlists. Get
              promoted automatically when spots open up.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/classes">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
                  <Calendar size={20} />
                  Browse Classes
                </Button>
              </Link>
              <Link to="/my-bookings">
                <Button
                  variant="outline"
                  className="gap-2 border-slate-400 text-white hover:bg-slate-800"
                  size="lg"
                >
                  <Bookmark size={20} />
                  My Bookings
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-semibold">Class Calendar</h3>
              <p className="mt-2 text-slate-300">
                Browse and book classes organized by date and time
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-semibold">Smart Waitlists</h3>
              <p className="mt-2 text-slate-300">
                Join waitlists and get automatically promoted when spots open
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                <Bookmark size={24} />
              </div>
              <h3 className="text-lg font-semibold">Easy Management</h3>
              <p className="mt-2 text-slate-300">
                View and cancel your bookings anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 text-center text-slate-400">
        <p>© 2024 HubFit. All rights reserved.</p>
      </footer>
    </div>
  );
}
