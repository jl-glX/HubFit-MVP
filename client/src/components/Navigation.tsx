import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  CalendarDays,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Building2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { useFacilityProfile } from "../hooks/useFacilityProfile";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { profile } = useFacilityProfile();

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
      <div className="mx-auto w-full max-w-7xl overflow-hidden px-2 sm:px-6">
        <div className="flex min-h-18 min-w-0 items-center gap-2 sm:gap-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 font-bold text-xl tracking-tight text-slate-950"
          >
            <BrandLogo className="h-10 w-10 rounded-xl shadow-lg shadow-blue-600/20" />
            <span className="hidden sm:inline">HubFit</span>
          </Link>

          <div className="hidden shrink-0 items-center gap-2 border-l border-slate-200 pl-4 xl:flex">
            {profile.logoDataUrl ? (
              <img
                src={profile.logoDataUrl}
                alt={profile.name}
                className="h-8 w-8 rounded-lg object-contain"
              />
            ) : (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: profile.accentColor }}
              >
                <Building2 size={16} />
              </span>
            )}
            <span className="max-w-36 truncate text-sm font-semibold text-slate-700">
              {profile.name}
            </span>
          </div>

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

            {user?.role === "admin" ? (
              <Link
                to="/billing"
                className={`${navLinkClass} ${
                  isActive("/billing") ? activeClass : inactiveClass
                }`}
              >
                <CreditCard size={20} />
                <span>{t("nav.billing")}</span>
              </Link>
            ) : (
              <Link
                to="/my-bookings"
                className={`${navLinkClass} ${
                  isActive("/my-bookings") ? activeClass : inactiveClass
                }`}
              >
                <Bookmark size={20} />
                <span>{t("nav.bookings")}</span>
              </Link>
            )}

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

            <Link
              to="/account/security"
              className={`${navLinkClass} ${
                isActive("/account/security") ? activeClass : inactiveClass
              }`}
            >
              <ShieldCheck size={20} />
              <span>{t("nav.security")}</span>
            </Link>

            <div className="ml-auto flex shrink-0 items-center gap-3 border-l border-slate-200 pl-4">
              <LanguageSwitcher compact />
              {user?.avatarDataUrl ? (
                <img
                  src={user.avatarDataUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow ring-1 ring-slate-200"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                  <UserRound size={20} />
                </span>
              )}
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
