import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, AuthUser } from "../context/auth-context";
import { authFetch } from "../lib/api";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch(`${API_BASE}/api/auth/session`)
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { user: AuthUser };
      })
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        user?: AuthUser;
        error?: string;
      };
      if (!response.ok || !data.user)
        throw new Error(data.error ?? "Login failed");
      setUser(data.user);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Login failed";
      setError(message);
      throw cause;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });
        const data = (await response.json()) as {
          user?: AuthUser;
          error?: string;
        };
        if (!response.ok || !data.user)
          throw new Error(data.error ?? "Signup failed");
        setUser(data.user);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Signup failed";
        setError(message);
        throw cause;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authFetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, signup, login, logout }),
    [user, isLoading, error, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
