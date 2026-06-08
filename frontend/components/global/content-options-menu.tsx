"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import type { GoalRecord } from "@/components/global/app-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteGoal, deletePost, saveGoal } from "@/lib/content-storage";
import { cn } from "@/lib/utils";

type ContentOptionsMenuProps = {
  type: "goal" | "post";
  id: string;
  owner?: boolean;
  goal?: GoalRecord;
  onShare?: () => void;
  triggerClassName?: string;
};

export function ContentOptionsMenu({
  type,
  id,
  owner = true,
  goal,
  onShare,
  triggerClassName,
}: ContentOptionsMenuProps) {
  const t = useTranslations("app.contentActions");
  const router = useRouter();
  const [following, setFollowing] = useState(false);

  function share() {
    if (onShare) {
      onShare();
      return;
    }

    navigator.clipboard?.writeText(`${window.location.origin}/app/${type}s/${id}`);
    toast.success(t("copied"));
  }

  function remove() {
    if (type === "goal") {
      deleteGoal(id);
    } else {
      deletePost(id);
    }

    toast.success(t("deleted"));
    router.push("/app/profile");
  }

  function copyGoal() {
    if (!goal) return;

    const saved = saveGoal({
      ...goal,
      id: undefined,
      author: "Alex Carter",
      authorInitial: "A",
      meta: "Added goal · active",
      progress: 0,
      likes: "0 likes",
      comments: "View all 0 comments",
    });
    toast.success(t("goalAdded"));
    router.push(`/app/goals/${saved.id}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          tone="neutral"
          size="icon"
          className={cn("size-9 rounded-full", triggerClassName)}
          aria-label={t("title")}
        >
          <Icon
            icon="solar:menu-dots-bold"
            className="size-5"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
        {owner ? (
          <>
            <DropdownMenuItem onSelect={() => router.push(`/app/${type}s/${id}/edit`)}>
              <Icon icon="solar:pen-2-linear" className="size-4" aria-hidden="true" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={share}>
              <Icon icon="solar:share-linear" className="size-4" aria-hidden="true" />
              {t("share")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={remove}>
              <Icon icon="solar:trash-bin-trash-linear" className="size-4" aria-hidden="true" />
              {t("delete")}
            </DropdownMenuItem>
          </>
        ) : type === "goal" ? (
          <>
            <DropdownMenuItem onSelect={copyGoal}>
              <Icon icon="solar:add-circle-linear" className="size-4" aria-hidden="true" />
              {t("addGoal")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.success(t("betPlaced"))}>
              <Icon icon="solar:bolt-linear" className="size-4" aria-hidden="true" />
              {t("betFinish")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFollowing((value) => !value)}>
              <Icon icon="solar:user-plus-linear" className="size-4" aria-hidden="true" />
              {following ? t("following") : t("follow")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={share}>
              <Icon icon="solar:share-linear" className="size-4" aria-hidden="true" />
              {t("share")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => router.push("/app/chats")}>
              <Icon icon="solar:chat-round-line-linear" className="size-4" aria-hidden="true" />
              {t("messageOwner")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={share}>
              <Icon icon="solar:share-linear" className="size-4" aria-hidden="true" />
              {t("share")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
