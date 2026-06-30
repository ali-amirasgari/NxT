"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

import { useUsersSearchQuery } from "@/apis/queries/users/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Typography } from "@/components/ui/typography";
import { resolveDisplayName, userInitial } from "@/lib/user-display";

type ShareDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  labels: {
    title: string;
    description: string;
    search: string;
    send: string;
    sent: string;
    copy: string;
    copied: string;
    prompt: string;
    loading: string;
    empty: string;
  };
};

export function ShareDrawer({
  open,
  onOpenChange,
  shareUrl,
  labels,
}: ShareDrawerProps) {
  const [query, setQuery] = useState("");
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const search = query.trim();
  const usersQuery = useUsersSearchQuery({ search });
  const users = usersQuery.data ?? [];
  const hasSearch = search.length > 0;
  const isLoading = hasSearch && usersQuery.isLoading;
  const isEmpty = hasSearch && !isLoading && users.length === 0;

  async function handleCopyLink() {
    const url = new URL(shareUrl, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setAnnouncement(labels.copied);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
      setBackgroundColorOnScale={false}
      noBodyStyles
    >
      <DrawerContent className="!bottom-[70px] !left-1/2 !right-auto mx-0 h-[388px] w-[calc(100%-40px)] max-w-[350px] -translate-x-1/2 rounded-3xl border border-primary/40 bg-card shadow-[0_-8px_24px_rgba(0,0,0,0.35)] [&>div:first-child]:hidden">
        <DrawerHeader className="px-5 pb-2 pt-5 text-start">
          <DrawerTitle className="text-xl font-bold">
            {labels.title}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {labels.description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-5">
          <InputGroup className="h-10 rounded-[14px] border-primary/40 bg-muted shadow-none">
            <InputGroupAddon>
              <Icon
                icon="solar:magnifer-linear"
                className="size-4"
                aria-hidden="true"
              />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={labels.search}
              placeholder={labels.search}
              className="text-sm"
            />
          </InputGroup>

          <div className="mt-4 min-h-[120px] space-y-2.5">
            {!hasSearch ? (
              <Typography
                as="p"
                variant="muted"
                className="py-6 text-center text-sm"
              >
                {labels.prompt}
              </Typography>
            ) : null}

            {isLoading ? (
              <Typography
                as="p"
                variant="muted"
                className="py-6 text-center text-sm"
              >
                {labels.loading}
              </Typography>
            ) : null}

            {isEmpty ? (
              <Typography
                as="p"
                variant="muted"
                className="py-6 text-center text-sm"
              >
                {labels.empty}
              </Typography>
            ) : null}

            {hasSearch && !isLoading && users.length > 0
              ? users.map((user) => {
                  const sent = sentIds.includes(user.id);
                  const name = resolveDisplayName(user);

                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="size-[42px]">
                        <AvatarFallback className="bg-primary text-[13px] font-bold text-primary-foreground">
                          {userInitial(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <Typography
                          as="p"
                          className="truncate text-[15px] font-semibold"
                        >
                          {name}
                        </Typography>
                        <Typography
                          as="p"
                          variant="muted"
                          className="truncate text-xs"
                        >
                          {`@${user.username}`}
                        </Typography>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        tone={sent ? "neutral" : "primary"}
                        disabled={sent}
                        className="h-7 min-w-14 rounded-full px-3 text-[11px] font-bold"
                        onClick={() => {
                          setSentIds((current) => [...current, user.id]);
                          setAnnouncement(`${labels.sent} ${name}`);
                        }}
                      >
                        {sent ? labels.sent : labels.send}
                      </Button>
                    </div>
                  );
                })
              : null}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-4 h-10 w-full rounded-[14px] border-primary/40 bg-muted text-sm font-semibold text-primary"
            onClick={handleCopyLink}
          >
            <Icon icon="solar:link-linear" aria-hidden="true" />
            {labels.copy}
          </Button>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
