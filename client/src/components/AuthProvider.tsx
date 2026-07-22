import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, AuthUser } from "../context/auth-context";
import { authFetch } from "../lib/api";
import { startAuthentication } from "@simplewebauthn/browser";

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const response = await authFetch(`${API_BASE}/api/auth/session`);
    if (!response.ok) {
      setUser(null);
      return;
    }
    const data = (await response.json()) as { user: AuthUser };
    setUser(data.user);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (
      identifier: string,
      password: string,
      accessPortal: "member" | "staff",
      rememberDevice: boolean,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            password,
            accessPortal,
            rememberDevice,
          }),
        });
        const data = (await response.json()) as {
          user?: AuthUser;
          error?: string;
          mfaRequired?: boolean;
        };
        if (!response.ok) throw new Error(data.error ?? "Login failed");
        if (data.mfaRequired) return { mfaRequired: true };
        if (!data.user) throw new Error(data.error ?? "Login failed");
        setUser(data.user);
        return { mfaRequired: false, user: data.user };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Login failed";
        setError(message);
        throw cause;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loginWithPasskey = useCallback(
    async (
      identifier: string,
      accessPortal: "member" | "staff",
      rememberDevice: boolean,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const optionsResponse = await authFetch(
          `${API_BASE}/api/auth/passkey/options`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, accessPortal, rememberDevice }),
          },
        );
        const options = await optionsResponse.json();
        if (!optionsResponse.ok) {
          throw new Error(options.error ?? "Passkey access is not available");
        }
        const response = await startAuthentication({ optionsJSON: options });
        const verificationResponse = await authFetch(
          `${API_BASE}/api/auth/passkey/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response }),
          },
        );
        const data = (await verificationResponse.json()) as {
          user?: AuthUser;
          error?: string;
        };
        if (!verificationResponse.ok || !data.user) {
          throw new Error(data.error ?? "Passkey verification failed");
        }
        setUser(data.user);
        return data.user;
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Passkey login failed";
        setError(message);
        throw cause;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const verifyMfa = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE}/api/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as {
        user?: AuthUser;
        error?: string;
      };
      if (!response.ok || !data.user)
        throw new Error(data.error ?? "Verification failed");
      setUser(data.user);
      return data.user;
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Verification failed";
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
    () => ({
      user,
      isLoading,
      error,
      signup,
      login,
      loginWithPasskey,
      verifyMfa,
      refreshUser,
      logout,
    }),
    [
      user,
      isLoading,
      error,
      signup,
      login,
      loginWithPasskey,
      verifyMfa,
      refreshUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
