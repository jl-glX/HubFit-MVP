import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Bookmark, Home, LogOut, Settings, Shield, BarChart3 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const activeClass = "text-blue-600 border-b-2 border-blue-600";
  const inactiveClass = "text-gray-600 hover:text-gray-900";
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
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="rounded-lg bg-blue-600 p-2">
              <Calendar size={20} className="text-white" />
            </div>
            <span>HubFit</span>
          </Link>

          <div className="flex gap-8 items-center">
            <Link
              to="/"
              className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                isActive("/") ? activeClass : inactiveClass
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link
              to="/classes"
              className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                isActive("/classes") ? activeClass : inactiveClass
              }`}
            >
              <Calendar size={20} />
              <span>Classes</span>
            </Link>

            <Link
              to="/my-bookings"
              className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                isActive("/my-bookings") ? activeClass : inactiveClass
              }`}
            >
              <Bookmark size={20} />
              <span>My Bookings</span>
            </Link>

            {user?.role === "trainer" && (
              <Link
                to="/trainer-dashboard"
                className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                  isActive("/trainer-dashboard") ? activeClass : inactiveClass
                }`}
              >
                <Settings size={20} />
                <span>Dashboard</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                  isActive("/admin-dashboard") ? activeClass : inactiveClass
                }`}
              >
                <Shield size={20} />
                <span>Admin</span>
              </Link>
            )}

            <Link
              to={analyticsPath}
              className={`flex items-center gap-2 border-b-2 border-transparent py-2 transition-colors ${
                isActive(analyticsPath) ? activeClass : inactiveClass
              }`}
            >
              <BarChart3 size={20} />
              <span>Analytics</span>
            </Link>

            <div className="border-l border-gray-200 pl-8 flex items-center gap-4">
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-medium">{user?.name}</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeColor()}`}
                  >
                    {user?.role}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
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
