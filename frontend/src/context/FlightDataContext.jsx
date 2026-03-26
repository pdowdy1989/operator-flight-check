import { createContext, useContext, useMemo, useState } from "react";
import { mockSpotChecks, mockSpots } from "../utils/mockMissionPlanning";
import { readJsonStorage, writeJsonStorage } from "../utils/authStorage";

const SPOTS_STORAGE_KEY = "operator-flight-check-spots";
const CHECKS_STORAGE_KEY = "operator-flight-check-checks";

const FlightDataContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function FlightDataProvider({ children }) {
  const [spots, setSpots] = useState(() => readJsonStorage(SPOTS_STORAGE_KEY, mockSpots));
  const [checks, setChecks] = useState(() => readJsonStorage(CHECKS_STORAGE_KEY, mockSpotChecks));

  const persistSpots = (nextSpots) => {
    setSpots(nextSpots);
    writeJsonStorage(SPOTS_STORAGE_KEY, nextSpots);
  };

  const persistChecks = (nextChecks) => {
    setChecks(nextChecks);
    writeJsonStorage(CHECKS_STORAGE_KEY, nextChecks);
  };

  const toggleFavorite = (spotId) => {
    persistSpots(
      spots.map((spot) => (spot.id === spotId ? { ...spot, isFavorite: !spot.isFavorite } : spot))
    );
  };

  const upsertSpotFromLocation = (location, status) => {
    const existingSpot = spots.find(
      (spot) => spot.label.toLowerCase() === location.label.toLowerCase()
    );

    if (existingSpot) {
      const updatedSpot = {
        ...existingSpot,
        lastStatus: status,
        lat: location.lat,
        lon: location.lon,
      };
      persistSpots(spots.map((spot) => (spot.id === existingSpot.id ? updatedSpot : spot)));
      return updatedSpot;
    }

    const nextSpot = {
      id: createId("spot"),
      label: location.label,
      address: location.address,
      notes: "Saved from a flight check.",
      isFavorite: false,
      lastStatus: status,
      lat: location.lat,
      lon: location.lon,
    };

    persistSpots([nextSpot, ...spots]);
    return nextSpot;
  };

  const saveCheck = ({
    location,
    profile,
    result,
    metrics,
    breakdown,
    bestTimeWindow,
    confidence,
    lastUpdated,
  }) => {
    const targetSpot = upsertSpotFromLocation(location, result.status);

    const nextCheck = {
      id: createId("check"),
      spotId: targetSpot.id,
      locationLabel: location.label,
      address: location.address,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      flyScore: result.flyScore,
      status: result.status,
      profile: profile.name,
      summary: result.summary,
      notes: "",
      metrics,
      breakdown,
      confidence,
      bestTimeWindow,
      lastUpdated,
    };

    const nextChecks = [nextCheck, ...checks];
    persistChecks(nextChecks);

    return nextCheck;
  };

  const updateCheckNote = (checkId, notes) => {
    persistChecks(checks.map((check) => (check.id === checkId ? { ...check, notes } : check)));
  };

  const value = useMemo(
    () => ({
      spots,
      checks,
      toggleFavorite,
      saveCheck,
      updateCheckNote,
    }),
    [checks, spots]
  );

  return <FlightDataContext.Provider value={value}>{children}</FlightDataContext.Provider>;
}

export function useFlightData() {
  const context = useContext(FlightDataContext);

  if (!context) {
    throw new Error("useFlightData must be used within a FlightDataProvider");
  }

  return context;
}
