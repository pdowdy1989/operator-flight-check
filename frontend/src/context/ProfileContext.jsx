import { createContext, useContext, useState, useCallback } from "react";
import { mockDroneProfiles } from "../utils/mockDroneProfiles";
import { readJsonStorage, writeJsonStorage } from "../utils/authStorage";

const ProfileContext = createContext(null);
const STORAGE_KEY = "operator-flight-check-profiles";

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => readJsonStorage(STORAGE_KEY, mockDroneProfiles));
  const [activeProfileId, setActiveProfileId] = useState(mockDroneProfiles[0]?.id ?? null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? null;

  const selectProfile = useCallback((profileOrId) => {
    const id = typeof profileOrId === "string" ? profileOrId : profileOrId?.id;
    setActiveProfileId(id);
  }, []);

  const updateProfile = useCallback((profileId, updates) => {
    setProfiles((current) => {
      const nextProfiles = current.map((profile) =>
        profile.id === profileId ? { ...profile, ...updates } : profile
      );
      writeJsonStorage(STORAGE_KEY, nextProfiles);
      return nextProfiles;
    });
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profiles, activeProfile, activeProfileId, selectProfile, updateProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
