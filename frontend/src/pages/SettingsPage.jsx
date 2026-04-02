import { useEffect, useMemo, useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { droneProfilesService } from "../services/droneProfilesService";
import { formatDate } from "../utils/formatters";

const DARK_MODE_KEY = "operator-flight-check-dark-mode";
const NOTIFICATIONS_KEY = "operator-flight-check-notifications";

const EMPTY_PROFILE = {
  name: "",
  type: "MICRO",
  maxWindMph: 15,
  maxGustMph: 22,
  maxPrecipPct: 50,
};

function readBoolean(key, fallback) {
  const value = window.localStorage.getItem(key);
  return value == null ? fallback : value === "true";
}

function SectionHeader({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] t-text-faint">
      {children}
    </p>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? "bg-ped-orange" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b t-border px-4 py-3 last:border-b-0">
      <span className="text-sm t-text-dim">{label}</span>
      <span className="text-sm font-medium dark:text-white text-[#1d1d1f]">
        {value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [error, setError] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(() => readBoolean(DARK_MODE_KEY, true));
  const [notifications, setNotifications] = useState(() =>
    readBoolean(NOTIFICATIONS_KEY, true)
  );

  const joined = useMemo(() => {
    if (!user?.createdAt) {
      return "Not available";
    }
    return formatDate(user.createdAt);
  }, [user?.createdAt]);

  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const rows = await droneProfilesService.getAll();
      setProfiles(rows);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to load drone profiles."
      );
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const openCreateProfile = () => {
    setEditingProfile(null);
    setProfileForm(EMPTY_PROFILE);
    setProfileModalOpen(true);
  };

  const openEditProfile = (profile) => {
    setEditingProfile(profile);
    setProfileForm({
      name: profile.name || "",
      type: profile.type || "MICRO",
      maxWindMph: profile.maxWindMph ?? 15,
      maxGustMph: profile.maxGustMph ?? 22,
      maxPrecipPct: profile.maxPrecipPct ?? 50,
    });
    setProfileModalOpen(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        type: profileForm.type,
        maxWindMph: Number(profileForm.maxWindMph),
        maxGustMph: Number(profileForm.maxGustMph),
        maxPrecipPct: Number(profileForm.maxPrecipPct),
      };

      if (editingProfile) {
        await droneProfilesService.update(editingProfile.id, payload);
      } else {
        await droneProfilesService.create(payload);
      }

      setProfileModalOpen(false);
      await loadProfiles();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to save drone profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteProfile = async (profile) => {
    if (!window.confirm(`Delete ${profile.name}?`)) {
      return;
    }

    try {
      await droneProfilesService.delete(profile.id);
      await loadProfiles();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to delete drone profile."
      );
    }
  };

  const toggleDarkMode = () => {
    const nextValue = !darkMode;
    setDarkMode(nextValue);
    localStorage.setItem(DARK_MODE_KEY, String(nextValue));
    document.documentElement.classList.toggle("dark", nextValue);
  };

  const toggleNotifications = () => {
    const nextValue = !notifications;
    setNotifications(nextValue);
    localStorage.setItem(NOTIFICATIONS_KEY, String(nextValue));
  };

  return (
    <PageWrapper
      title="Settings"
      subtitle="Account preferences and the drone limits used in mission planning."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="px-4 py-4">
              <SectionHeader>Account</SectionHeader>
            </div>
            <DetailRow label="Name" value={user?.name || "Not set"} />
            <DetailRow label="Email" value={user?.email || "Not available"} />
            <DetailRow label="Role" value={user?.role || "USER"} />
            <DetailRow label="Plan" value={user?.plan || "FREE"} />
            <DetailRow label="Member since" value={joined} />
          </Card>

          <Card className="p-4">
            <SectionHeader>Preferences</SectionHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border t-surface px-4 py-3">
                <div>
                  <p className="font-medium dark:text-white text-[#1d1d1f]">
                    Dark mode
                  </p>
                  <p className="mt-0.5 text-sm t-text-dim">
                    Use the dark operator theme across the app.
                  </p>
                </div>
                <Toggle checked={darkMode} onChange={toggleDarkMode} />
              </div>

              <div className="flex items-center justify-between rounded-2xl border t-surface px-4 py-3">
                <div>
                  <p className="font-medium dark:text-white text-[#1d1d1f]">
                    Notifications
                  </p>
                  <p className="mt-0.5 text-sm t-text-dim">
                    Local preference for reminders and payment activity.
                  </p>
                </div>
                <Toggle checked={notifications} onChange={toggleNotifications} />
              </div>
            </div>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 p-4">
            <SectionHeader>Session</SectionHeader>
            <p className="text-sm text-red-200">
              Sign out of the operator workspace on this device.
            </p>
            <div className="mt-4">
              <Button variant="danger" size="sm" onClick={logout}>
                Log out
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card
            className="p-5"
            title="Drone Profiles"
            headerRight={
              <Button size="sm" onClick={openCreateProfile}>
                Add profile
              </Button>
            }
          >
            <p className="mb-4 text-sm t-text-dim">
              These limits feed mission planning and invoice-linked job records.
            </p>

            {loadingProfiles ? (
              <div className="rounded-2xl border t-surface p-4 text-sm t-text-dim">
                Loading drone profiles...
              </div>
            ) : null}

            {!loadingProfiles && !profiles.length ? (
              <div className="rounded-2xl border t-surface p-5 text-sm t-text-dim">
                No drone profiles yet. Add one to start tying missions to aircraft.
              </div>
            ) : null}

            {!loadingProfiles ? (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-semibold text-white">
                            {profile.name}
                          </p>
                          <span className="rounded-full bg-ped-orange/10 px-3 py-1 text-xs font-semibold text-orange-300">
                            {profile.type}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm t-text-dim">
                          <span>Wind {profile.maxWindMph} mph</span>
                          <span>Gust {profile.maxGustMph} mph</span>
                          <span>Precip {profile.maxPrecipPct}%</span>
                        </div>
                        <p className="mt-2 text-xs t-text-faint">
                          Created {formatDate(profile.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditProfile(profile)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteProfile(profile)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={editingProfile ? "Edit drone profile" : "Add drone profile"}
        primaryAction={saveProfile}
        primaryLabel={savingProfile ? "Saving..." : "Save profile"}
        primaryDisabled={savingProfile || !profileForm.name.trim()}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Profile name"
            value={profileForm.name}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Drone type
            </label>
            <select
              className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:border-ped-orange focus:outline-none"
              value={profileForm.type}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              <option value="MICRO">Micro</option>
              <option value="PROSUMER">Prosumer</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Max wind"
              type="number"
              value={profileForm.maxWindMph}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  maxWindMph: event.target.value,
                }))
              }
            />
            <Input
              label="Max gust"
              type="number"
              value={profileForm.maxGustMph}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  maxGustMph: event.target.value,
                }))
              }
            />
            <Input
              label="Max precip %"
              type="number"
              value={profileForm.maxPrecipPct}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  maxPrecipPct: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
