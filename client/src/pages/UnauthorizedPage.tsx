import { AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 text-red-600" size={64} />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Your current role
          doesn't allow you to view this content.
        </p>
        <Button onClick={() => navigate("/")} className="gap-2">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
