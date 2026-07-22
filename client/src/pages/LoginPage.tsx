import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AuthShell } from "../components/AuthShell";
import { ArrowRight, Info } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError("Email and password are required");
      return;
    }

    try {
      await login(email, password);
      navigate("/classes");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to HubFit" description="Continue managing your classes, bookings and training activity.">
        {(error || validationError) && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <p className="text-sm text-red-600">{error || validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email address</Label>
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
            <Label htmlFor="password" className="text-slate-700">Password</Label>
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
            {isLoading ? "Logging in..." : <><span>Sign in</span><ArrowRight /></>}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <Info className="mt-0.5 shrink-0 text-blue-600" size={17} />
          <div>
            <p className="mb-1 text-xs font-semibold text-blue-900">Demo access</p>
            <p className="text-xs leading-relaxed text-blue-800">juan@example.com · password123</p>
          </div>
        </div>
    </AuthShell>
  );
}
