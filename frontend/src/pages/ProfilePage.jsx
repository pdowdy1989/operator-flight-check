import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

const DARK_MODE_STORAGE_KEY = "operator-flight-check-dark-mode";
const NOTIFICATIONS_STORAGE_KEY = "operator-flight-check-notifications";

function readStoredBoolean(key, fallback) {
  const raw = window.localStorage.getItem(key);
  if (raw == null) return fallback;
  return raw === "true";
}

function ProfileStatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border t-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] t-text-faint">{label}</p>
      <p className="mt-2 text-3xl font-black dark:text-white text-[#1d1d1f]">{value}</p>
      {hint ? <p className="mt-2 text-sm t-text-dim">{hint}</p> : null}
    </div>
  );
}

function SettingsToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border t-surface px-4 py-3">
      <div>
        <p className="font-semibold dark:text-white text-[#1d1d1f]">{label}</p>
        <p className="mt-1 text-sm t-text-dim">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-8 w-14 rounded-full transition ${checked ? "bg-ped-orange" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-7" : "left-1"}`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => readStoredBoolean(DARK_MODE_STORAGE_KEY, true));
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readStoredBoolean(NOTIFICATIONS_STORAGE_KEY, true)
  );

  const joinedLabel = useMemo(() => {
    if (!user?.createdAt) {
      return "Not available";
    }
    return new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [user?.createdAt]);

  const lastFlightLabel = useMemo(() => {
    if (!user?.lastFlightDate) {
      return "No flights yet";
    }
    return new Date(user.lastFlightDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [user?.lastFlightDate]);

  const avatarInitials = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((value) => value[0]?.toUpperCase())
        .join("");
    }

    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "PA";
  }, [user?.email, user?.name]);

  const toggleDarkMode = () => {
    const nextValue = !darkMode;
    setDarkMode(nextValue);
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(nextValue));
    document.documentElement.classList.toggle("dark", nextValue);
    document.body.classList.toggle("bg-gray-900", nextValue);
  };

  const toggleNotifications = () => {
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(nextValue));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: draftName.trim() || null });
      setIsEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Profile"
      subtitle="Your pilot identity, current level, and personal settings"
      action={
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border t-surface text-lg font-black dark:text-white text-[#1d1d1f]">
          {avatarInitials}
        </div>
      }
    >
      <div className="grid gap-6">
        <section className="rounded-[1.75rem] border t-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] t-text-faint">User Info</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] t-text-faint">Name</p>
                <p className="mt-1 text-xl font-bold dark:text-white text-[#1d1d1f]">{user?.name || "No name added yet"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] t-text-faint">Email</p>
                <p className="mt-1 text-base dark:text-slate-200 text-[#3a3a3c]">{user?.email || "Not available"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] t-text-faint">Join Date</p>
                <p className="mt-1 text-base dark:text-slate-200 text-[#3a3a3c]">{joinedLabel}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-ped-orange/20 bg-ped-orange/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Pilot Level</p>
              <p className="mt-3 text-2xl font-black text-white">{user?.pilotLevel || "Level 1 - Beginner"}</p>
              <p className="mt-2 text-sm text-slate-300">
                Based on your number of flights and drones currently saved in the app.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ProfileStatCard label="Total Flights" value={user?.flightCount ?? 0} hint="Saved flight sessions in your account" />
          <ProfileStatCard label="Total Drones Owned" value={user?.droneCount ?? 0} hint="Fleet drones currently stored" />
          <ProfileStatCard label="Last Flight Date" value={lastFlightLabel} hint="Latest scheduled or created flight session" />
        </section>

        <section className="rounded-[1.75rem] border t-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] t-text-faint">Settings</p>
          <div className="mt-4 grid gap-3">
            <SettingsToggle
              label="Dark Mode"
              description="Keep the interface in the dark operational theme used across the app."
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <SettingsToggle
              label="Notifications"
              description="Placeholder toggle for future weather and mission alerts."
              checked={notificationsEnabled}
              onChange={toggleNotifications}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => {
              setDraftName(user?.name ?? "");
              setIsEditOpen(true);
            }}>
              Edit Profile
            </Button>
            <Link to="/fleet">
              <Button variant="secondary">Manage Fleet</Button>
            </Link>
            <Button variant="danger" onClick={logout}>Log Out</Button>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile"
        primaryAction={handleSaveProfile}
        primaryLabel={saving ? "Saving..." : "Save"}
        primaryDisabled={saving}
      >
        <div className="space-y-3">
          <Input
            label="Display name"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Add your name"
          />
          <p className="text-sm text-slate-400">
            This name is used on your profile and can be expanded for team views later.
          </p>
        </div>
      </Modal>
    </PageWrapper>
  );
}
