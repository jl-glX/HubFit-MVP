import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AuthShell } from "../components/AuthShell";
import { ArrowRight, Info, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, verifyMfa, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const { t } = useTranslation();
  const demoAccounts = [
    {
      role: t("roles.member"),
      description: t("auth.demoMemberDescription"),
      email: "juan@example.com",
      password: "HubFitMember123",
      icon: UserRound,
    },
    {
      role: t("roles.admin"),
      description: t("auth.demoAdminDescription"),
      email: "admin@hubfit.com",
      password: "HubFitAdmin123",
      icon: ShieldCheck,
    },
  ];

  const selectDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError(t("auth.emailRequired"));
      return;
    }

    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      navigate("/classes");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyMfa(mfaCode);
      navigate("/classes");
    } catch (err) {
      console.error("MFA verification error:", err);
    }
  };

  return (
    <AuthShell
      eyebrow={t("auth.welcomeBack")}
      title={t("auth.signInTitle")}
      description={t("auth.signInDescription")}
    >
      {(error || validationError) && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5">
          <p className="text-sm text-red-600">{error || validationError}</p>
        </div>
      )}

      {mfaRequired ? (
        <form onSubmit={handleMfaSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">{t("auth.verificationCode")}</Label>
            <Input
              id="mfa-code"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              autoFocus
            />
            <p className="text-xs text-slate-500">
              {t("auth.verificationHelp")}
            </p>
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-blue-600"
            disabled={isLoading}
          >
            {t("auth.verifyIdentity")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMfaRequired(false);
              setMfaCode("");
            }}
          >
            {t("auth.useDifferentAccount")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">
              {t("auth.emailAddress")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">
              {t("common.password")}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-blue-600 shadow-md shadow-blue-600/15 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              t("auth.signingIn")
            ) : (
              <>
                <span>{t("auth.signIn")}</span>
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            {t("auth.signUp")}
          </Link>
        </p>
      </div>

      {!mfaRequired && import.meta.env.DEV && (
        <section
          aria-labelledby="demo-accounts-title"
          className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4"
        >
          <div className="flex gap-3">
            <Info className="mt-0.5 shrink-0 text-blue-600" size={17} />
            <div>
              <p
                id="demo-accounts-title"
                className="text-xs font-semibold text-blue-900"
              >
                {t("auth.demoAccess")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                {t("auth.demoInstructions")}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon;

              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() =>
                    selectDemoAccount(account.email, account.password)
                  }
                  className="rounded-xl border border-blue-200 bg-white p-3 text-left transition hover:border-blue-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon size={16} className="text-blue-600" />
                    {account.role}
                  </span>
                  <span className="mt-1 block text-xs text-slate-600">
                    {account.description}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium text-blue-700">
                    {t("auth.useDemoAccount")}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </AuthShell>
  );
}
