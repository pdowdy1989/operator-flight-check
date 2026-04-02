import { createContext, useContext, useMemo } from "react";
import { useFleet } from "./FleetContext";

const DroneContext = createContext(null);

export function DroneProvider({ children }) {
  const { profiles, activeProfile, selectProfile } = useFleet();

  const value = useMemo(
    () => ({
      selectedDrone: activeProfile,
      availableDrones: profiles,
      setSelectedDrone: selectProfile,
    }),
    [activeProfile, profiles, selectProfile]
  );

  return <DroneContext.Provider value={value}>{children}</DroneContext.Provider>;
}

export function useDrone() {
  const context = useContext(DroneContext);

  if (!context) {
    throw new Error("useDrone must be used within a DroneProvider");
  }

  return context;
}
