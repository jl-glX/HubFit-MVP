import { useContext } from "react";
import { AuthContext, AuthContextValue } from "../context/auth-context";

export type { AuthUser } from "../context/auth-context";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
