import { useCurrentUser } from "../hooks/useCurrentUser";
import { UserBookings } from "../components/UserBookings";
import { useTranslation } from "react-i18next";

export function MyBookingsPage() {
  const user = useCurrentUser();
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            {t("bookings.title")}
          </h1>
          <p className="mt-2 text-gray-600">{t("bookings.description")}</p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <UserBookings userId={user.id} />
      </div>
    </div>
  );
}
