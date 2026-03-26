import { useMemo, useState } from "react";
import DroneProfileSelector from "../components/features/DroneProfileSelector";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InfoToggle from "../components/ui/InfoToggle";
import Modal from "../components/ui/Modal";
import { useProfile } from "../context/ProfileContext";

export default function AircraftPage() {
  const { profiles, activeProfile, activeProfileId, selectProfile, updateProfile } = useProfile();
  const [showThresholdsInfo, setShowThresholdsInfo] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const editingProfile = useMemo(
    () => profiles.find((profile) => profile.id === editingProfileId) ?? null,
    [editingProfileId, profiles]
  );
  const [draft, setDraft] = useState(null);

  const startEditing = (profile) => {
    setEditingProfileId(profile.id);
    setDraft({
      addOnsText: (profile.addOns ?? []).join(", "),
      windGreenMph: profile.windGreenMph,
      windYellowMph: profile.windYellowMph,
      gustGreenMph: profile.gustGreenMph,
      gustYellowMph: profile.gustYellowMph,
      precipGreenPct: profile.precipGreenPct,
      precipYellowPct: profile.precipYellowPct,
    });
  };

  const handleSaveProfile = () => {
    updateProfile(
      editingProfileId,
      {
        addOns: (draft.addOnsText ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        windGreenMph: Number(draft.windGreenMph),
        windYellowMph: Number(draft.windYellowMph),
        gustGreenMph: Number(draft.gustGreenMph),
        gustYellowMph: Number(draft.gustYellowMph),
        precipGreenPct: Number(draft.precipGreenPct),
        precipYellowPct: Number(draft.precipYellowPct),
      }
    );
    setEditingProfileId(null);
    setDraft(null);
  };

  return (
    <PageWrapper
      title="Aircraft Profiles"
      subtitle="Select your drone to set flyability thresholds"
      action={
        activeProfile ? (
          <span className="rounded-full bg-brand-orange-bg px-3 py-1 text-xs font-semibold text-brand-orange">
            Active: {activeProfile.name}
          </span>
        ) : null
      }
    >
      {activeProfile ? (
        <div className="bg-white rounded-2xl border border-brand-orange shadow-card p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Active aircraft</p>
              <h2 className="text-xl font-bold text-text-primary">{activeProfile.name}</h2>
            </div>
            <span className="bg-brand-orange-bg text-brand-orange text-xs font-bold px-3 py-1 rounded-full">
              {activeProfile.type}
            </span>
          </div>
          {activeProfile.addOns?.length ? (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
                Current Add-Ons
              </p>
              <div className="flex flex-wrap gap-2">
                {activeProfile.addOns.map((item) => (
                  <span
                    key={`active-addon-${item}`}
                    className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-3">
            <ThresholdDetail
              label="Wind"
              green={`≤${activeProfile.windGreenMph} mph`}
              yellow={`${activeProfile.windGreenMph + 1}–${activeProfile.windYellowMph} mph`}
              red={`>${activeProfile.windYellowMph} mph`}
            />
            <ThresholdDetail
              label="Gust"
              green={`≤${activeProfile.gustGreenMph} mph`}
              yellow={`${activeProfile.gustGreenMph + 1}–${activeProfile.gustYellowMph} mph`}
              red={`>${activeProfile.gustYellowMph} mph`}
            />
            <ThresholdDetail
              label="Rain"
              green={`≤${activeProfile.precipGreenPct}%`}
              yellow={`${activeProfile.precipGreenPct + 1}–${activeProfile.precipYellowPct}%`}
              red={`>${activeProfile.precipYellowPct}%`}
            />
          </div>
          <div className="mt-4">
            <Button size="sm" onClick={() => startEditing(activeProfile)}>
              Edit Active Profile
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-base font-bold text-text-primary">Choose profile</h2>
        <InfoToggle description="Each profile sets the wind, gust, and precipitation limits used to score the forecast. Pick the one that matches your aircraft's actual operating specs." />
      </div>
      <DroneProfileSelector
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelect={selectProfile}
        onCustomize={startEditing}
      />

      <div className="mt-6 bg-white rounded-2xl border border-border shadow-card p-4 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">How thresholds work</p>
          <button
            type="button"
            onClick={() => setShowThresholdsInfo((current) => !current)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-text-muted hover:bg-surface-secondary hover:text-brand-orange"
            aria-expanded={showThresholdsInfo}
          >
            i
          </button>
        </div>
        {showThresholdsInfo ? (
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <LegendRow color="bg-status-green" label="GREEN — Go" desc="All metrics inside safe limits" />
            <LegendRow color="bg-status-yellow" label="YELLOW — Caution" desc="One or more metrics in the caution band" />
            <LegendRow color="bg-status-red" label="RED — No-Go" desc="One or more metrics exceed safe limits" />
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(editingProfile)}
        onClose={() => setEditingProfileId(null)}
        title={editingProfile ? `Customize ${editingProfile.name}` : "Customize profile"}
        primaryAction={handleSaveProfile}
        primaryLabel="Save thresholds"
      >
        {draft ? (
          <div className="grid gap-3">
            <Input
              label="Add-ons / payloads"
              value={draft.addOnsText}
              onChange={(event) =>
                setDraft((current) => ({ ...current, addOnsText: event.target.value }))
              }
              hint="Use commas to separate items like ND filter, beacon, spotlight."
            />
            <Input label="Wind green limit (mph)" type="number" value={draft.windGreenMph} onChange={(event) => setDraft((current) => ({ ...current, windGreenMph: event.target.value }))} />
            <Input label="Wind caution limit (mph)" type="number" value={draft.windYellowMph} onChange={(event) => setDraft((current) => ({ ...current, windYellowMph: event.target.value }))} />
            <Input label="Gust green limit (mph)" type="number" value={draft.gustGreenMph} onChange={(event) => setDraft((current) => ({ ...current, gustGreenMph: event.target.value }))} />
            <Input label="Gust caution limit (mph)" type="number" value={draft.gustYellowMph} onChange={(event) => setDraft((current) => ({ ...current, gustYellowMph: event.target.value }))} />
            <Input label="Rain green limit (%)" type="number" value={draft.precipGreenPct} onChange={(event) => setDraft((current) => ({ ...current, precipGreenPct: event.target.value }))} />
            <Input label="Rain caution limit (%)" type="number" value={draft.precipYellowPct} onChange={(event) => setDraft((current) => ({ ...current, precipYellowPct: event.target.value }))} />
          </div>
        ) : null}
      </Modal>
    </PageWrapper>
  );
}

function ThresholdDetail({ label, green, yellow, red }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-status-green-text bg-status-green-bg rounded px-1 py-0.5">{green}</span>
        <span className="text-xs font-medium text-status-yellow-text bg-status-yellow-bg rounded px-1 py-0.5">{yellow}</span>
        <span className="text-xs font-medium text-status-red-text bg-status-red-bg rounded px-1 py-0.5">{red}</span>
      </div>
    </div>
  );
}

function LegendRow({ color, label, desc }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} aria-hidden="true" />
      <span className="font-semibold text-text-primary">{label}</span>
      <span className="text-text-secondary">— {desc}</span>
    </div>
  );
}
