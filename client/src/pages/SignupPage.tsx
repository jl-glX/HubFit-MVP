import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AuthShell } from "../components/AuthShell";
import { ArrowRight } from "lucide-react";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.email || !formData.name || !formData.password) {
      setValidationError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (
      formData.password.length < 12 ||
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setValidationError(
        "Password must contain at least 12 characters, uppercase, lowercase and a number"
      );
      return;
    }

    try {
      await signup(formData.email, formData.name, formData.password);
      navigate("/classes");
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <AuthShell eyebrow="Join HubFit" title="Create your account" description="Set up your profile and start planning your next training sessions.">
        {(error || validationError) && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5">
            <p className="text-sm text-red-600">{error || validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">Full name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3 focus-visible:bg-white"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-blue-600 shadow-md shadow-blue-600/15 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : <><span>Create account</span><ArrowRight /></>}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}
