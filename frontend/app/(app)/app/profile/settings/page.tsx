"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ProfilePageHeader } from "@/components/page/profile/profile-page-header";
import { ProfileSettingRow } from "@/components/page/profile/profile-setting-row";
import { Button } from "@/components/ui/button";
import { setAppTheme } from "@/components/providers/theme-provider";
import {
  getSettingsServerSnapshot,
  getSettingsSnapshot,
  parseProfileSettings,
  saveProfileSettings,
  subscribeToProfileSettings,
} from "@/lib/profile-storage";

function subscribeToResolvedTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function getResolvedThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getResolvedThemeServerSnapshot() {
  return false;
}

export default function ProfileSettingsPage() {
  const t = useTranslations("app.profileSettings");
  const isDark = useSyncExternalStore(
    subscribeToResolvedTheme,
    getResolvedThemeSnapshot,
    getResolvedThemeServerSnapshot,
  );
  const settingsSnapshot = useSyncExternalStore(
    subscribeToProfileSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
  const savedSettings = useMemo(
    () => parseProfileSettings(settingsSnapshot),
    [settingsSnapshot],
  );
  const [privateProfile, setPrivateProfile] = useState(
    savedSettings.privateProfile,
  );
  const [notifications, setNotifications] = useState(
    savedSettings.notifications,
  );
  function handleSave() {
    saveProfileSettings({ privateProfile, notifications });
    toast.success(t("saved"));
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <ProfilePageHeader title={t("title")} backLabel={t("back")} />

      <div className="grid gap-4 pt-4">
        <ProfileSettingRow
          icon="solar:lock-keyhole-linear"
          title={t("privateTitle")}
          description={t("privateDescription")}
          checked={privateProfile}
          onCheckedChange={setPrivateProfile}
        />
        <ProfileSettingRow
          icon="solar:moon-linear"
          title={t("appearanceTitle")}
          description={t("appearanceDescription")}
          checked={isDark}
          onCheckedChange={(checked) =>
            setAppTheme(checked ? "dark" : "light")
          }
        />
        <ProfileSettingRow
          icon="solar:bell-linear"
          title={t("notificationsTitle")}
          description={t("notificationsDescription")}
          checked={notifications}
          onCheckedChange={setNotifications}
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        size="lg"
        className="mt-auto h-12 w-full rounded-xl text-sm font-semibold"
      >
        {t("save")}
      </Button>
    </section>
  );
}
