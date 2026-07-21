import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../lib/api";

export interface TrainerClass {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  trainerName: string;
  maxCapacity: number;
  scheduledAt: number;
  bookedCount: number;
  availablePlaces: number;
  waitlistCount: number;
}

interface TrainerClassesState {
  classes: TrainerClass[];
  loading: boolean;
  error: string | null;
}

const API_BASE =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "";

export function useTrainerClasses(trainerId: string) {
  const [state, setState] = useState<TrainerClassesState>({
    classes: [],
    loading: true,
    error: null,
  });

  const fetchClasses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await authFetch(
        `${API_BASE}/api/classes/trainer/${trainerId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch trainer classes");
      }

      const classes = await res.json();
      setState({ classes, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch classes";
      setState({ classes: [], loading: false, error: message });
    }
  }, [trainerId]);

  useEffect(() => {
    if (trainerId) {
      fetchClasses();
    }
  }, [trainerId, fetchClasses]);

  return {
    classes: state.classes,
    loading: state.loading,
    error: state.error,
    refreshClasses: fetchClasses,
  };
}
