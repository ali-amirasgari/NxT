"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useMeQuery, useUpdateMeMutation } from "@/apis/queries/users/queries";
import type { User } from "@/apis/types/user";
import { ProfilePageHeader } from "@/components/page/profile/profile-page-header";
import { ProfileSettingRow } from "@/components/page/profile/profile-setting-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { setAppTheme } from "@/components/providers/theme-provider";

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
  const { data: user, isLoading } = useMeQuery();

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[390px] flex-col px-1 md:max-w-3xl">
      <ProfilePageHeader title={t("title")} backLabel={t("back")} />
      {isLoading || !user ? (
        <div className="grid gap-4 pt-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : (
        // Mount the form only once the profile resolves so toggles can seed
        // from `useState` initializers (no setState-in-effect).
        <SettingsForm user={user} />
      )}
    </section>
  );
}

function SettingsForm({ user }: { user: User }) {
  const t = useTranslations("app.profileSettings");
  const updateSettings = useUpdateMeMutation();
  const isDark = useSyncExternalStore(
    subscribeToResolvedTheme,
    getResolvedThemeSnapshot,
    getResolvedThemeServerSnapshot,
  );

  const [privateProfile, setPrivateProfile] = useState(user.is_private);
  const [notifications, setNotifications] = useState(user.notifications_enabled);

  async function handleSave() {
    try {
      await updateSettings.mutateAsync({
        is_private: privateProfile,
        notifications_enabled: notifications,
      });
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    }
  }

  return (
    <>
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
          onCheckedChange={(checked) => setAppTheme(checked ? "dark" : "light")}
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
        disabled={updateSettings.isPending}
        className="mt-auto h-12 w-full rounded-xl text-sm font-semibold"
      >
        {t("save")}
      </Button>
    </>
  );
}
