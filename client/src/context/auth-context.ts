import { createContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarDataUrl: string;
  role: "member" | "trainer" | "admin";
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, name: string, password: string) => Promise<void>;
  login: (
    identifier: string,
    password: string,
    accessPortal: "member" | "staff",
    rememberDevice: boolean,
  ) => Promise<{ mfaRequired: boolean; user?: AuthUser }>;
  loginWithPasskey: (
    identifier: string,
    accessPortal: "member" | "staff",
    rememberDevice: boolean,
  ) => Promise<AuthUser>;
  verifyMfa: (code: string) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
