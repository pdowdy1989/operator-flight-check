import { useMemo } from "react";
import { calculateFlyScore } from "../utils/scoring";

export function useScoreRecalculation(selectedDrone, currentWeather) {
  return useMemo(() => {
    if (!selectedDrone || !currentWeather) {
      return null;
    }

    return calculateFlyScore(currentWeather, selectedDrone);
  }, [currentWeather, selectedDrone]);
}
