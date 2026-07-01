"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from "@/apis/queries/chat/queries";
import chatSocketService from "@/apis/services/chatSocketService";
import type { ChatNotificationType } from "@/apis/types/notification";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<ChatNotificationType, string> = {
  conversation_created: "solar:chat-round-line-linear",
  member_added: "solar:user-plus-linear",
  member_role_updated: "solar:shield-user-linear",
  member_removed: "solar:user-minus-linear",
  message_received: "solar:chat-round-dots-linear",
};

const DROPDOWN_LIMIT = 5;

type HomeHeaderProps = {
  notificationsLabel: string;
};

export function HomeHeader({ notificationsLabel }: HomeHeaderProps) {
  const t = useTranslations("app.notifications");
  const queryClient = useQueryClient();
  const unreadQuery = useUnreadNotificationsCountQuery();
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;
  const notifications = (notificationsQuery.data ?? []).slice(0, DROPDOWN_LIMIT);

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
    <header className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            tone="neutral"
            size="icon"
            className="relative size-10 rounded-full border-border bg-card shadow-none hover:bg-accent"
            aria-label={notificationsLabel}
          >
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
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
          <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>

          {notificationsQuery.isLoading ? (
            <Typography as="p" variant="muted" className="px-2 py-4 text-center text-xs">
              {t("loading")}
            </Typography>
          ) : null}

          {!notificationsQuery.isLoading && notifications.length === 0 ? (
            <Typography as="p" variant="muted" className="px-2 py-4 text-center text-xs">
              {t("empty")}
            </Typography>
          ) : null}

          {notifications.map((item) => {
            const read = Boolean(item.readAt);

            return (
              <DropdownMenuItem key={item.id} asChild className="rounded-xl p-0">
                <Link
                  href={`/app/chats/${item.conversationId}`}
                  onClick={() => {
                    if (!read) {
                      markReadMutation.mutate({ notificationId: item.id });
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl p-2.5",
                    !read && "bg-primary/5",
                  )}
                >
                  <Avatar className="size-9 shrink-0 after:hidden">
                    <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                      {item.title.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Typography as="span" className="flex-1 truncate text-xs font-bold text-foreground">
                        {item.title}
                      </Typography>
                      {!read ? (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <Typography as="p" variant="muted" className="mt-0.5 line-clamp-2 text-xs">
                      {item.body}
                    </Typography>
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Icon
                        icon={NOTIFICATION_ICONS[item.type]}
                        className="size-3"
                        aria-hidden="true"
                      />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="justify-center rounded-xl text-sm font-bold text-primary">
            <Link href="/app/notifications">{t("showMore")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
