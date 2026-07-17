import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "member" | "trainer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const TOKEN_KEY = "hubfit_auth_token";
const API_BASE =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from storage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      verifySessionToken(token);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifySessionToken = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setState({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      const data = await res.json();
      setState({
        user: data.user,
        token,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("[Auth] Verification error:", err);
      localStorage.removeItem(TOKEN_KEY);
      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  };

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Signup failed");
        }

        const data = await res.json();
        localStorage.setItem(TOKEN_KEY, data.token);

        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Signup failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw err;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem(TOKEN_KEY, data.token);

        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          error: null,
        });

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    const token = state.token;

    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch (err) {
        console.error("[Auth] Logout error:", err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, [state.token]);

  return {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    signup,
    login,
    logout,
  };
}
