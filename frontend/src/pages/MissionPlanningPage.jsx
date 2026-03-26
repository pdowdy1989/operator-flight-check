import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";
import { plannedChecks, savedSpots } from "../utils/mockMissionPlanning";

const statusTone = {
  GREEN: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  YELLOW: "border border-amber-200 bg-amber-50 text-amber-800",
  RED: "border border-rose-200 bg-rose-50 text-rose-800",
};

export default function MissionPlanningPage() {
  const [selectedSpotId, setSelectedSpotId] = useState(savedSpots[0].id);
  const { showToast } = useToast();

  const selectedSpot = savedSpots.find((spot) => spot.id === selectedSpotId) ?? savedSpots[0];
  const checksForSpot = useMemo(
    () => plannedChecks.filter((check) => check.spotId === selectedSpotId),
    [selectedSpotId]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card
          eyebrow="Saved Spots"
          title="Mission planning workspace"
          description="Choose a saved location, review its recent checks, and keep flight records organized around the places you actually operate."
        >
          <div className="space-y-3">
            {savedSpots.map((spot) => {
              const selected = spot.id === selectedSpotId;

              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedSpotId(spot.id)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-cyan-300 bg-[linear-gradient(135deg,#10233B,#0F172A)] text-white shadow-[0_20px_40px_rgba(15,23,42,0.22)]"
                      : "border-white/80 bg-white/82 shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-base font-semibold ${selected ? "text-white" : "text-slate-900"}`}>
                        {spot.name}
                      </p>
                      <p className={`mt-1 text-sm ${selected ? "text-slate-300" : "text-slate-500"}`}>
                        {spot.address}
                      </p>
                    </div>
                    {spot.favorite ? (
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                          selected ? "bg-white/15 text-white" : "bg-sand text-amber-700"
                        }`}
                      >
                        Favorite
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${selected ? "text-slate-300" : "text-slate-600"}`}>
                    {spot.notes}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                showToast({
                  title: "Spot workflow ready",
                  description: "This is where create and edit spot flows can plug in next.",
                })
              }
            >
              Add new spot
            </Button>
            <Button variant="secondary">Edit selected spot</Button>
          </div>
        </Card>

        <Card
          eyebrow="Selected Spot"
          title={selectedSpot.name}
          description="Associate forecast checks with your saved spot so every mission has a place, profile, and decision history."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-100 bg-[linear-gradient(180deg,rgba(217,242,255,1),rgba(224,242,254,0.72))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-tide">
                Address
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{selectedSpot.address}</p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(180deg,rgba(221,248,234,1),rgba(220,252,231,0.72))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
                Checks logged
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{checksForSpot.length}</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-[linear-gradient(180deg,rgba(255,240,214,1),rgba(254,243,199,0.72))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                Planning mode
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Spot + profile + decision</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Why this page matters
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Mission planning is where saved spots become operational records. Instead of isolated
              forecasts, pilots can organize checks around real launch locations and keep that
              history together.
            </p>
          </div>
        </Card>
      </section>

      <section>
        <Card
          eyebrow="Associated Checks"
          title="Checks tied to this mission location"
          description="Each record links a saved spot to a chosen aircraft profile and a go or no-go decision."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {checksForSpot.map((check) => (
              <article key={check.id} className="rounded-[1.75rem] border border-white/80 bg-white/84 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    {check.date}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${statusTone[check.status]}`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-900">{check.profile}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{check.summary}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                showToast({
                  title: "Check logging flow ready",
                  description: `Future spot checks can be attached directly to ${selectedSpot.name}.`,
                })
              }
            >
              Log new check
            </Button>
            <Button variant="secondary">Export mission notes</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
