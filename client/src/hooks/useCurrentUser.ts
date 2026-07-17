import { useAuth, type AuthUser } from "./useAuth";

export function useCurrentUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}
