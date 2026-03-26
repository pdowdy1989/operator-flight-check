import { createContext, useContext, useMemo, useState } from "react";
import { readJsonStorage, writeJsonStorage } from "../utils/authStorage";

const STORAGE_KEY = "operator-flight-check-location";

const DEFAULT_LOCATION = {
  label: "Laguna Cliffs",
  address: "Laguna Cliffs, Dana Point, CA",
  lat: 33.4614,
  lon: -117.6983,
};

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(() =>
    readJsonStorage(STORAGE_KEY, DEFAULT_LOCATION)
  );

  const selectLocation = (location) => {
    setSelectedLocation(location);
    writeJsonStorage(STORAGE_KEY, location);
  };

  const value = useMemo(
    () => ({
      selectedLocation,
      selectLocation,
    }),
    [selectedLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useSelectedLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useSelectedLocation must be used within a LocationProvider");
  }

  return context;
}
