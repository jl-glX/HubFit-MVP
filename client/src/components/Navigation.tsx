import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bookmark,
  CalendarDays,
  Home,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const activeClass = "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100";
  const inactiveClass =
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
  const navLinkClass =
    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all";
  const analyticsPath =
    user?.role === "admin"
      ? "/admin-analytics"
      : user?.role === "trainer"
        ? "/trainer-analytics"
        : "/activity-dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "trainer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-18 items-center gap-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 font-bold text-xl tracking-tight text-slate-950"
          >
            <div className="rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 p-2 shadow-lg shadow-blue-600/20">
              <Activity size={21} className="text-white" />
            </div>
            <span>HubFit</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/"
              className={`${navLinkClass} ${
                isActive("/") ? activeClass : inactiveClass
              }`}
            >
              <Home size={20} />
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              to="/classes"
              className={`${navLinkClass} ${
                isActive("/classes") ? activeClass : inactiveClass
              }`}
            >
              <CalendarDays size={20} />
              <span>{t("nav.classes")}</span>
            </Link>

            <Link
              to="/my-bookings"
              className={`${navLinkClass} ${
                isActive("/my-bookings") ? activeClass : inactiveClass
              }`}
            >
              <Bookmark size={20} />
              <span>{t("nav.bookings")}</span>
            </Link>

            {user?.role === "trainer" && (
              <Link
                to="/trainer-dashboard"
                className={`${navLinkClass} ${
                  isActive("/trainer-dashboard") ? activeClass : inactiveClass
                }`}
              >
                <Settings size={20} />
                <span>{t("nav.dashboard")}</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                className={`${navLinkClass} ${
                  isActive("/admin-dashboard") ? activeClass : inactiveClass
                }`}
              >
                <Shield size={20} />
                <span>{t("nav.admin")}</span>
              </Link>
            )}

            <Link
              to={analyticsPath}
              className={`${navLinkClass} ${
                isActive(analyticsPath) ? activeClass : inactiveClass
              }`}
            >
              <BarChart3 size={20} />
              <span>{t("nav.analytics")}</span>
            </Link>

            <div className="ml-auto flex shrink-0 items-center gap-3 border-l border-slate-200 pl-4">
              <LanguageSwitcher compact />
              <div className="hidden text-sm lg:block">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeColor()}`}
                  >
                    {user?.role ? t(`roles.${user.role}`) : ""}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label={t("nav.logout")}
                title={t("nav.logout")}
                className="rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
