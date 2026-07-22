import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultFacilityProfile,
  FacilityProfileContext,
  type FacilityProfile,
} from "../context/facility-profile-context";
import { useAuth } from "../hooks/useAuth";
import { authFetch } from "../lib/api";

export function FacilityProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(defaultFacilityProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(defaultFacilityProfile);
      setError(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    authFetch("/api/facility-profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Profile load failed");
        return body as FacilityProfile;
      })
      .then((body) => {
        if (active) {
          setProfile(body);
          setError(null);
        }
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--facility-accent",
      profile.accentColor,
    );
  }, [profile.accentColor]);

  const updateProfile = useCallback(
    async (
      values: Partial<
        Pick<FacilityProfile, "name" | "logoDataUrl" | "accentColor">
      >,
    ) => {
      const response = await authFetch("/api/facility-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Profile update failed");
      setProfile(body as FacilityProfile);
      setError(null);
      return body as FacilityProfile;
    },
    [],
  );

  const value = useMemo(
    () => ({ profile, isLoading, error, updateProfile }),
    [error, isLoading, profile, updateProfile],
  );

  return (
    <FacilityProfileContext.Provider value={value}>
      {children}
    </FacilityProfileContext.Provider>
  );
}
