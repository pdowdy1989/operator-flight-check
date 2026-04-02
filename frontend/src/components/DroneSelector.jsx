import { useMemo, useState } from "react";
import { useDrone } from "../context/DroneContext";

export default function DroneSelector() {
  const [open, setOpen] = useState(false);
  const { selectedDrone, availableDrones, setSelectedDrone } = useDrone();

  const selectedLabel = useMemo(
    () => selectedDrone?.name ?? "Select drone",
    [selectedDrone]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left backdrop-blur-md transition hover:bg-white/15 dark:bg-black/50"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Selected Drone</p>
          <p className="mt-1 font-semibold text-white">{selectedLabel}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-300">
          <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-gray-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Choose aircraft</h2>
                <p className="text-sm text-slate-400">Changing drones recalculates the fly score everywhere.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {availableDrones.map((drone) => {
                const active = selectedDrone?.id === drone.id;
                return (
                  <button
                    key={drone.id}
                    type="button"
                    onClick={() => {
                      setSelectedDrone(drone);
                      setOpen(false);
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-ped-orange bg-ped-orange/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{drone.name}</p>
                        <p className="text-sm text-slate-400">{drone.type}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Wind {drone.windYellowMph} mph</p>
                        <p>Gust {drone.gustYellowMph} mph</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
