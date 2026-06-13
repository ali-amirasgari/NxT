export type ProfileData = {
  name: string;
  username: string;
  bio: string;
};

export type ProfileSettings = {
  privateProfile: boolean;
  notifications: boolean;
};

export const DEFAULT_PROFILE: ProfileData = {
  name: "Alex Carter",
  username: "@alex_levels_up",
  bio: "Fitness · Coding · Books. Accountability over motivation.",
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  privateProfile: true,
  notifications: false,
};

const PROFILE_STORAGE_KEY = "nxt-profile";
const SETTINGS_STORAGE_KEY = "nxt-profile-settings";
const PROFILE_EVENT = "nxt-profile-change";
const SETTINGS_EVENT = "nxt-profile-settings-change";

function readStorage(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function getProfileSnapshot() {
  return readStorage(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
}

export function getProfileServerSnapshot() {
  return JSON.stringify(DEFAULT_PROFILE);
}

export function getSettingsSnapshot() {
  return readStorage(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(DEFAULT_PROFILE_SETTINGS),
  );
}

export function getSettingsServerSnapshot() {
  return JSON.stringify(DEFAULT_PROFILE_SETTINGS);
}

export function parseProfile(snapshot: string): ProfileData {
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(snapshot) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function parseProfileSettings(snapshot: string): ProfileSettings {
  try {
    return { ...DEFAULT_PROFILE_SETTINGS, ...JSON.parse(snapshot) };
  } catch {
    return DEFAULT_PROFILE_SETTINGS;
  }
}

export function saveProfile(profile: ProfileData) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export function saveProfileSettings(settings: ProfileSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

function subscribeToStorage(
  storageKey: string,
  eventName: string,
  onStoreChange: () => void,
) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(eventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(eventName, onStoreChange);
  };
}

export function subscribeToProfile(onStoreChange: () => void) {
  return subscribeToStorage(PROFILE_STORAGE_KEY, PROFILE_EVENT, onStoreChange);
}

export function subscribeToProfileSettings(onStoreChange: () => void) {
  return subscribeToStorage(
    SETTINGS_STORAGE_KEY,
    SETTINGS_EVENT,
    onStoreChange,
  );
}
