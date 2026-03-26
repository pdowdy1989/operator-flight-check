import Button from "./Button";

const typeTone = {
  Micro: "bg-sky text-tide",
  Prosumer: "bg-mint text-teal-700",
  Heavy: "bg-sand text-amber-700",
};

export default function DroneProfileSelector({
  profiles,
  selectedProfileId,
  onSelect,
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 block text-sm font-semibold text-slate-800">Drone profile</p>
        <p className="text-xs text-slate-500">
          Switch between aircraft classes so flyability thresholds match your setup.
        </p>
      </div>

      <div className="grid gap-3">
        {profiles.map((profile) => {
          const selected = profile.id === selectedProfileId;

          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile)}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                selected
                  ? "border-cyan-300 bg-[linear-gradient(135deg,#10233B,#0F172A)] text-white shadow-[0_20px_40px_rgba(15,23,42,0.22)]"
                  : "border-white/80 bg-white/82 shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-base font-semibold ${selected ? "text-white" : "text-slate-900"}`}>
                    {profile.name}
                  </p>
                  <p className={`mt-1 text-sm ${selected ? "text-slate-300" : "text-slate-500"}`}>
                    Wind {profile.windGreenMph}/{profile.windYellowMph} mph | Gusts{" "}
                    {profile.gustGreenMph}/{profile.gustYellowMph} mph
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                    selected ? "bg-white/15 text-white" : typeTone[profile.type]
                  }`}
                >
                  {profile.type}
                </span>
              </div>
              <p className={`mt-3 text-sm ${selected ? "text-slate-300" : "text-slate-600"}`}>
                Precip thresholds: green at {profile.precipGreenPct}% or below, yellow up to{" "}
                {profile.precipYellowPct}%.
              </p>
            </button>
          );
        })}
      </div>

      <Button variant="ghost" size="sm">
        Manage profiles
      </Button>
    </div>
  );
}
