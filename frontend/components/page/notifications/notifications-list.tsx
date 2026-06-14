"use client";

import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/apis/queries/chat/queries";
import chatSocketService from "@/apis/services/chatSocketService";
import type { ChatNotificationType } from "@/apis/types/notification";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const notificationIcons: Record<ChatNotificationType, string> = {
  conversation_created: "solar:chat-round-line-linear",
  member_added: "solar:user-plus-linear",
  member_role_updated: "solar:shield-user-linear",
  member_removed: "solar:user-minus-linear",
  message_received: "solar:chat-round-dots-linear",
};

export function NotificationsList({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const queryClient = useQueryClient();
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const notifications = notificationsQuery.data ?? [];

  useEffect(() => {
    const socket = chatSocketService.getSocket();
    const refreshNotifications = () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.chat.notifications.all,
      });
    };

    socket.on("notification:new", refreshNotifications);
    socket.on("notification:unread_count", refreshNotifications);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("notification:new", refreshNotifications);
      socket.off("notification:unread_count", refreshNotifications);
      chatSocketService.disconnect();
    };
  }, [queryClient]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Typography as="p" variant="muted" className="text-xs">
          {labels.recent}
        </Typography>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs"
          disabled={markAllMutation.isPending || notifications.length === 0}
          onClick={() => markAllMutation.mutate()}
        >
          {labels.markAll}
        </Button>
      </div>

      {notificationsQuery.isLoading ? (
        <Typography as="p" variant="muted" className="py-8 text-center text-sm">
          {labels.loading}
        </Typography>
      ) : null}

      {!notificationsQuery.isLoading && notifications.length === 0 ? (
        <Typography as="p" variant="muted" className="py-8 text-center text-sm">
          {labels.empty}
        </Typography>
      ) : null}

      {notifications.map((item) => {
        const read = Boolean(item.readAt);

        return (
          <Link
            key={item.id}
            href={`/app/chats/${item.conversationId}`}
            onClick={() => {
              if (!read) {
                markReadMutation.mutate({ notificationId: item.id });
              }
            }}
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-border p-3.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              read ? "bg-card" : "bg-primary/5",
            )}
          >
            <Avatar className="size-11 shrink-0 after:hidden">
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                {item.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <Typography as="h2" variant="small" className="flex-1 text-sm">
                  {item.title}
                </Typography>
                {!read ? (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                ) : null}
              </div>
              <Typography as="p" variant="muted" className="mt-1 text-xs leading-5">
                {item.body}
              </Typography>
              <span className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon
                  icon={notificationIcons[item.type]}
                  className="size-3.5"
                  aria-hidden="true"
                />
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
