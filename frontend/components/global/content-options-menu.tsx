"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
} from "@/apis/queries/goals/queries";
import { useDeletePostMutation } from "@/apis/queries/social/queries";
import type { Goal } from "@/apis/types/goal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ContentOptionsMenuProps = {
  type: "goal" | "post";
  id: string;
  owner?: boolean;
  goal?: Goal;
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
  const deletePost = useDeletePostMutation();
  const deleteGoal = useDeleteGoalMutation();
  const createGoal = useCreateGoalMutation();

  function share() {
    if (onShare) {
      onShare();
      return;
    }

    navigator.clipboard?.writeText(`${window.location.origin}/app/${type}s/${id}`);
    toast.success(t("copied"));
  }

  function remove() {
    const onSuccess = () => {
      toast.success(t("deleted"));
      router.push("/app/profile");
    };

    if (type === "goal") {
      deleteGoal.mutate(id, { onSuccess });
    } else {
      deletePost.mutate(id, { onSuccess });
    }
  }

  function copyGoal() {
    if (!goal) return;

    createGoal.mutate(
      {
        title: goal.title,
        description: goal.description,
        category_id: goal.category?.id ?? goal.category_id ?? null,
        goal_type: "solo",
        stake_points: 0,
      },
      {
        onSuccess: (created) => {
          toast.success(t("goalAdded"));
          router.push(`/app/goals/${created.id}`);
        },
      },
    );
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
