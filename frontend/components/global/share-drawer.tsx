"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";

import {
  shareContacts,
  type ShareContact,
} from "@/components/global/detail-social-data";
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
import { cn } from "@/lib/utils";

const avatarTones: Record<ShareContact["tone"], string> = {
  green: "bg-emerald-400 text-white",
  orange: "bg-orange-500 text-white",
  violet: "bg-violet-500 text-white",
};

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
  };
};

export function ShareDrawer({
  open,
  onOpenChange,
  shareUrl,
  labels,
}: ShareDrawerProps) {
  const [query, setQuery] = useState("");
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const contacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? shareContacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(normalized) ||
            contact.meta.toLowerCase().includes(normalized),
        )
      : shareContacts;
  }, [query]);

  async function handleCopyLink() {
    const url = new URL(shareUrl, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setAnnouncement(labels.copied);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
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

          <div className="mt-4 space-y-2.5">
            {contacts.map((contact) => {
              const sent = sentIds.includes(contact.id);

              return (
                <div key={contact.id} className="flex items-center gap-3">
                  <Avatar className="size-[42px]">
                    <AvatarFallback
                      className={cn(
                        "text-[13px] font-bold",
                        avatarTones[contact.tone],
                      )}
                    >
                      {contact.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Typography
                      as="p"
                      className="truncate text-[15px] font-semibold"
                    >
                      {contact.name}
                    </Typography>
                    <Typography
                      as="p"
                      variant="muted"
                      className="truncate text-xs"
                    >
                      {contact.meta}
                    </Typography>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    tone={sent ? "neutral" : "primary"}
                    disabled={sent}
                    className="h-7 min-w-14 rounded-full px-3 text-[11px] font-bold"
                    onClick={() => {
                      setSentIds((current) => [...current, contact.id]);
                      setAnnouncement(`${labels.sent} ${contact.name}`);
                    }}
                  >
                    {sent ? labels.sent : labels.send}
                  </Button>
                </div>
              );
            })}
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
