import { useMemo, useState } from "react";
import Modal from "./ui/Modal";
import { useFlightData } from "../context/FlightDataContext";
import { useToast } from "../context/ToastContext";

const CHECK_ITEMS = [
  { id: "props", label: "Props inspected" },
  { id: "battery", label: "Battery secured and above mission minimum" },
  { id: "sd-card", label: "SD card inserted and recording ready" },
  { id: "gimbal", label: "Gimbal clear and calibrated" },
  { id: "observer", label: "Visual observer briefed" },
  { id: "conditions", label: "Current conditions match the app forecast" },
];

export default function PreFlightModal({
  isOpen,
  onClose,
  currentWeather,
  selectedDrone,
  selectedLocation,
}) {
  const { saveCheck } = useFlightData();
  const { showToast } = useToast();
  const [completed, setCompleted] = useState({});

  const allComplete = useMemo(
    () => CHECK_ITEMS.every((item) => completed[item.id]),
    [completed]
  );

  const toggleItem = (id) => {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleConfirm = () => {
    if (!currentWeather || !selectedDrone) {
      return;
    }

    saveCheck({
      location: selectedLocation,
      profile: selectedDrone,
      result: currentWeather,
      metrics: {
        windMph: currentWeather.windMph,
        gustMph: currentWeather.gustMph,
        precipPct: currentWeather.precipPct,
        kpIndex: currentWeather.kpIndex,
      },
      breakdown: (currentWeather.deductions ?? []).map((item) => ({
        label: item.label,
        actual:
          item.label === "Wind"
            ? currentWeather.windMph
            : item.label === "Gusts"
              ? currentWeather.gustMph
              : item.label === "Precip"
                ? currentWeather.precipPct
                : currentWeather.kpIndex,
        threshold: "Derived from selected drone thresholds",
        impact: -item.value,
        evaluation: item.value > 0 ? "watch closely" : "within limit",
      })),
      bestTimeWindow: `${currentWeather.day} ${currentWeather.date}`,
      confidence: "High",
      lastUpdated: new Date().toISOString(),
    });

    showToast({
      title: "Flight logged",
      description: `Saved ${selectedLocation.label} at score ${currentWeather.flyScore}.`,
      variant: "success",
    });
    setCompleted({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCompleted({});
        onClose();
      }}
      title="Pre-flight checklist"
      primaryAction={handleConfirm}
      primaryLabel="Confirm & Log Flight"
      primaryDisabled={!allComplete}
      secondaryLabel="Close"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">{selectedLocation?.label}</p>
          <p className="mt-1 text-slate-400">
            {selectedDrone?.name} · Score {currentWeather?.flyScore ?? "--"} · {currentWeather?.status ?? "--"}
          </p>
        </div>
        <div className="space-y-2">
          {CHECK_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface-secondary px-3 py-3"
            >
              <input
                type="checkbox"
                checked={Boolean(completed[item.id])}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 accent-ped-orange"
              />
              <span className="text-sm text-text-primary">{item.label}</span>
            </label>
          ))}
        </div>
        {!allComplete ? (
          <p className="text-xs text-text-muted">Check all items to enable flight logging.</p>
        ) : null}
      </div>
    </Modal>
  );
}
