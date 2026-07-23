import { useState } from "react";
import { Users, Calendar, Palette } from "lucide-react";
import { UserManagement } from "../components/UserManagement";
import { ClassManagement } from "../components/ClassManagement";
import { useTranslation } from "react-i18next";
import { FacilityBrandingSettings } from "../components/FacilityBrandingSettings";
import { useFacilityProfile } from "../hooks/useFacilityProfile";

type AdminTab = "users" | "classes" | "branding";

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const { t } = useTranslation();
  const { profile } = useFacilityProfile();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 2xl:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            {t("admin.title")}
          </h1>
          <p className="mt-2 text-gray-600">{t("admin.description")}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {profile.name}
          </p>
        </div>

        <div
          className="rounded-lg border border-gray-200 bg-white shadow-xs"
          style={{ borderTopColor: profile.accentColor, borderTopWidth: 4 }}
        >
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "users"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <Users size={18} className="inline mr-2" />
                {t("admin.usersTab")}
              </button>
              <button
                onClick={() => setActiveTab("branding")}
                className={`border-b-2 px-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === "branding"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Palette size={18} className="mr-2 inline" />
                {t("admin.brandingTab")}
              </button>
              <button
                onClick={() => setActiveTab("classes")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "classes"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <Calendar size={18} className="inline mr-2" />
                {t("admin.classesTab")}
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "users" && <UserManagement />}
            {activeTab === "classes" && <ClassManagement />}
            {activeTab === "branding" && <FacilityBrandingSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
