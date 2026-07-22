import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { HomePage } from "./pages/HomePage";
import { ClassesPage } from "./pages/ClassesPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { TrainerDashboardPage } from "./pages/TrainerDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ActivityDashboardPage } from "./pages/ActivityDashboardPage";
import { TrainerAnalyticsDashboardPage } from "./pages/TrainerAnalyticsDashboardPage";
import { AdminAnalyticsDashboardPage } from "./pages/AdminAnalyticsDashboardPage";
import { Navigation } from "./components/Navigation";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { useTranslation } from "react-i18next";
import {
  ConditionsOfUsePage,
  LegalNoticePage,
  TermsAndConditionsPage,
} from "./pages/LegalPage";
import { AccountSecurityPage } from "./pages/AccountSecurityPage";
import { FeedbackPage } from "./pages/FeedbackPage";

type UserRole = "member" | "trainer" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <UnauthorizedPage />;
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();
  const isLegalPage = [
    "/legal-notice",
    "/terms-and-conditions",
    "/conditions-of-use",
  ].includes(pathname);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <>
      {user && !isLegalPage && <Navigation />}
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/security"
          element={
            <ProtectedRoute>
              <AccountSecurityPage />
            </ProtectedRoute>
          }
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-dashboard"
          element={
            <ProtectedRoute requiredRole="member">
              <ActivityDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer-analytics"
          element={
            <ProtectedRoute requiredRole="trainer">
              <TrainerAnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/legal-notice" element={<LegalNoticePage />} />
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route path="/conditions-of-use" element={<ConditionsOfUsePage />} />
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
