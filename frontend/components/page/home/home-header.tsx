"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import { useUnreadNotificationsCountQuery } from "@/apis/queries/chat/queries";
import chatSocketService from "@/apis/services/chatSocketService";
import { Button } from "@/components/ui/button";

type HomeHeaderProps = {
  notificationsLabel: string;
};

export function HomeHeader({ notificationsLabel }: HomeHeaderProps) {
  const queryClient = useQueryClient();
  const unreadQuery = useUnreadNotificationsCountQuery();
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  useEffect(() => {
    const socket = chatSocketService.getSocket();
    const handleUnreadCount = (payload: { unreadCount: number }) => {
      queryClient.setQueryData(
        QUERY_KEYS.chat.notifications.unreadCount,
        payload,
      );
    };
    const refreshNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.notifications.all,
      });
    };

    socket.on("notification:unread_count", handleUnreadCount);
    socket.on("notification:new", refreshNotifications);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("notification:unread_count", handleUnreadCount);
      socket.off("notification:new", refreshNotifications);
      chatSocketService.disconnect();
    };
  }, [queryClient]);

  return (
    <header className="flex justify-end pt-5 md:pt-1">
      <div className="flex items-center gap-2.5">
        <Button
          asChild
          variant="outline"
          tone="neutral"
          size="icon"
          className="relative size-10 -translate-y-1 rounded-full border-border bg-card shadow-none hover:bg-accent"
          aria-label={notificationsLabel}
        >
          <Link href="/app/notifications">
            <Icon
              icon="solar:bell-linear"
              className="size-5"
              aria-hidden="true"
            />
            {unreadCount > 0 ? (
              <span className="absolute end-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        </Button>

        <div
          className="relative flex size-12 items-center justify-center rounded-full bg-secondary"
          aria-label="User A"
        >
          <Image
            src="/figma/avatar-a.svg"
            alt=""
            width={36}
            height={36}
            aria-hidden="true"
          />
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-secondary-foreground">
            A
          </span>
        </div>
      </div>
    </header>
  );
}
