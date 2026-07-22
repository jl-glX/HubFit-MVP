import { useContext } from "react";
import { FacilityProfileContext } from "../context/facility-profile-context";

export function useFacilityProfile() {
  const context = useContext(FacilityProfileContext);
  if (!context) {
    throw new Error(
      "useFacilityProfile must be used within FacilityProfileProvider",
    );
  }
  return context;
}
