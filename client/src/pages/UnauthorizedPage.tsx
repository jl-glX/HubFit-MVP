import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 text-red-600" size={64} />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {t("unauthorized.title")}
        </h1>
        <p className="text-gray-600 mb-6">{t("unauthorized.description")}</p>
        <Button onClick={() => navigate("/")} className="gap-2">
          {t("common.backHome")}
        </Button>
      </div>
    </div>
  );
}
