import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SpotCard from "../components/features/SpotCard";
import SpotCheckCard from "../components/features/SpotCheckCard";
import PageWrapper from "../components/layout/PageWrapper";
import { useSelectedLocation } from "../context/LocationContext";
import { useSpots } from "../hooks/useSpots";

export default function LogPage() {
  const navigate = useNavigate();
  const { selectLocation } = useSelectedLocation();
  const {
    spots,
    checksForSpot,
    selectedSpotId,
    setSelectedSpotId,
    toggleFavorite,
    updateCheckNote,
  } = useSpots();
  const [filter, setFilter] = useState("ALL");

  const filteredChecks =
    filter === "ALL" ? checksForSpot : checksForSpot.filter((check) => check.status === filter);

  return (
    <PageWrapper title="Flight Log" subtitle="Saved spot checks and decisions">
      <div className="mb-5">
        <h2 className="text-base font-bold text-text-primary mb-3">Saved Spots</h2>
        <div className="flex flex-col gap-3">
          {spots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              isSelected={spot.id === selectedSpotId}
              onSelect={(selectedSpot) => setSelectedSpotId(selectedSpot.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-bold text-text-primary">
            Logged Checks
            {selectedSpotId ? (
              <span className="font-normal text-text-secondary">
                {" "}— {spots.find((spot) => spot.id === selectedSpotId)?.label}
              </span>
            ) : null}
          </h2>
          <div className="flex gap-1" role="group" aria-label="Filter by status">
            {["ALL", "GREEN", "YELLOW", "RED"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={[
                  "text-xs font-semibold px-2.5 py-1 rounded-lg min-h-[32px] transition-colors",
                  filter === value
                    ? "bg-brand-orange text-white"
                    : "bg-white border border-border text-text-secondary hover:border-brand-orange hover:text-brand-orange",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {filteredChecks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-6 text-center text-text-muted text-sm">
            No checks found{filter !== "ALL" ? ` with status ${filter}` : " for this spot"}.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredChecks.map((check) => (
              <SpotCheckCard
                key={check.id}
                check={check}
                onSaveNote={updateCheckNote}
                onRepeat={(entry) => {
                  const spot = spots.find((item) => item.id === entry.spotId);
                  if (spot) {
                    selectLocation({
                      label: spot.label,
                      address: spot.address,
                      lat: spot.lat,
                      lon: spot.lon,
                    });
                  }
                  navigate("/check");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
