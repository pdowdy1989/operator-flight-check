import { useEffect, useMemo, useState } from "react";
import { useFlightData } from "../context/FlightDataContext";
import { useSelectedLocation } from "../context/LocationContext";

export function useSpots() {
  const { spots, checks, toggleFavorite, updateCheckNote } = useFlightData();
  const { selectedLocation } = useSelectedLocation();
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    const matchingSpot =
      spots.find((spot) => spot.label.toLowerCase() === selectedLocation.label.toLowerCase()) ??
      spots[0] ??
      null;

    if (matchingSpot && matchingSpot.id !== selectedSpotId) {
      setSelectedSpotId(matchingSpot.id);
    }
  }, [selectedLocation, selectedSpotId, spots]);

  const checksForSpot = useMemo(
    () => checks.filter((check) => check.spotId === selectedSpotId),
    [checks, selectedSpotId]
  );

  return {
    spots,
    checks,
    checksForSpot,
    loading: false,
    error: null,
    selectedSpotId,
    setSelectedSpotId,
    toggleFavorite,
    updateCheckNote,
  };
}
