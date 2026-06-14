"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  useChatUsersSearchQuery,
  useCreateDirectConversationMutation,
} from "@/apis/queries/chat/queries";
import { ChatAvatar } from "@/components/page/chats/chat-avatar";
import { CreateGroupForm } from "@/components/page/chats/create-group-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";

export function StartChatDialog() {
  const t = useTranslations("app.chats");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const usersQuery = useChatUsersSearchQuery({ query });
  const createDirectMutation = useCreateDirectConversationMutation();
  const users = usersQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          aria-label={t("start")}
          className="absolute end-1 bottom-5 size-12 rounded-full text-white shadow-[0_10px_28px_rgba(255,100,20,0.35)] md:end-0"
        >
          <Icon icon="solar:pen-new-square-linear" className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-[390px] gap-4 overflow-hidden rounded-3xl p-5">
        <DialogHeader className="pe-9">
          <DialogTitle className="text-xl font-bold">
            {t("startTitle")}
          </DialogTitle>
          <DialogDescription>{t("startDescription")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct" className="min-w-0">
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="direct">{t("select")}</TabsTrigger>
            <TabsTrigger value="group">{t("createGroup")}</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-3 space-y-3">
            <InputGroup className="h-11 rounded-[14px] border-input bg-card shadow-none">
              <InputGroupAddon className="ps-3">
                <Icon icon="solar:magnifer-linear" className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchUsers")}
                aria-label={t("searchUsers")}
                className="text-sm"
              />
            </InputGroup>

            <div className="space-y-2">
              {users.map((user) => {
                const chat = {
                  id: user.id,
                  name: user.username,
                  initial: user.username.charAt(0).toUpperCase(),
                  preview: user.email,
                  time: "",
                  unread: false,
                  tone: "violet" as const,
                  status: user.email,
                };

                return (
                <Button
                  key={user.id}
                  type="button"
                  variant="ghost"
                  tone="neutral"
                  className="flex h-auto w-full min-w-0 justify-start gap-3 rounded-2xl px-2 py-2.5 text-start"
                  disabled={createDirectMutation.isPending}
                  onClick={() => {
                    createDirectMutation.mutate(
                      { targetUserId: user.id },
                      {
                        onSuccess: (conversation) => {
                          setOpen(false);
                          router.push(`/app/chats/${conversation.id}`);
                        },
                      },
                    );
                  }}
                >
                  <ChatAvatar chat={chat} className="size-10" />
                  <span className="min-w-0 flex-1">
                    <Typography as="span" className="block truncate text-sm font-semibold">
                      {chat.name}
                    </Typography>
                    <Typography as="span" variant="muted" className="block truncate text-xs">
                      @{chat.id} · {chat.status}
                    </Typography>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {t("select")}
                  </span>
                </Button>
              )})}
              {query.trim() && !usersQuery.isLoading && users.length === 0 ? (
                <Typography as="p" variant="muted" className="py-8 text-center text-sm">
                  {t("noUsers")}
                </Typography>
              ) : null}
              {!query.trim() ? (
                <Typography as="p" variant="muted" className="py-8 text-center text-sm">
                  {t("searchToStart")}
                </Typography>
              ) : null}
              {createDirectMutation.error ? (
                <Typography as="p" className="text-sm text-destructive">
                  {createDirectMutation.error.message}
                </Typography>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="group" className="mt-4">
            <CreateGroupForm onCreated={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
