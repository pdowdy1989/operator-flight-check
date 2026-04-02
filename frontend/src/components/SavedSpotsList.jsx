import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightData } from "../context/FlightDataContext";

function scoreColor(score) {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-ped-orange";
  return "text-red-400";
}

export default function SavedSpotsList({ currentLocation, currentStatus = "YELLOW", onSelectSpot }) {
  const navigate = useNavigate();
  const { spots, checks, saveCurrentSpot } = useFlightData();

  const savedSpots = useMemo(
    () =>
      spots.map((spot) => {
        const latestCheck = checks.find((check) => check.spotId === spot.id) ?? null;
        return {
          ...spot,
          lastScore: latestCheck?.flyScore ?? null,
          lastDate: latestCheck?.date ?? "No flights yet",
        };
      }),
    [checks, spots]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md dark:bg-black/50">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Saved Spots</h2>
          <p className="text-sm text-slate-400">Quick access to your repeat launch locations.</p>
        </div>
        <button
          type="button"
          onClick={() => saveCurrentSpot(currentLocation, currentStatus)}
          className="rounded-xl bg-ped-orange px-3 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark"
        >
          Save Current Spot
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {savedSpots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => {
              onSelectSpot?.(spot);
              navigate("/dashboard");
            }}
            className="min-w-[220px] rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-black/30"
          >
            <p className="font-semibold text-white">{spot.label}</p>
            <p className="mt-1 text-xs text-slate-400">{spot.address}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Last Score</p>
                <p className={`text-2xl font-black ${scoreColor(spot.lastScore ?? 0)}`}>
                  {spot.lastScore ?? "--"}
                </p>
              </div>
              <p className="text-xs text-slate-400">{spot.lastDate}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
