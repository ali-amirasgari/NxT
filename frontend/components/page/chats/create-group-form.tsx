"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import type {
  GroupChatMember,
  GroupMemberRole,
} from "@/apis/types/group-chat";
import { publicUsers } from "@/components/global/users-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { createGroupChat } from "@/lib/group-chat-storage";
import { groupChatSchema } from "@/validations/group-chat-validation";

const MAX_GROUP_IMAGE_SIZE = 2 * 1024 * 1024;

export function CreateGroupForm({ onCreated }: { onCreated?: () => void }) {
  const t = useTranslations("app.chats");
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<GroupChatMember[]>([]);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase().replace(/^@/, "");

    return normalized
      ? publicUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(normalized) ||
            user.username.toLowerCase().includes(normalized),
        )
      : publicUsers;
  }, [query]);

  function toggleMember(userId: string) {
    const selected = members.some((member) => member.id === userId);

    if (selected) {
      setMembers((current) => current.filter((member) => member.id !== userId));
      return;
    }

    const user = publicUsers.find((item) => item.id === userId);
    if (!user) return;

    setMembers((current) => [
      ...current,
      {
        id: user.id,
        name: user.name,
        initial: user.initial,
        role: current.length === 0 ? "admin" : "member",
      },
    ]);
  }

  function setMemberRole(userId: string, role: GroupMemberRole) {
    setMembers((current) =>
      current.map((member) =>
        member.id === userId ? { ...member, role } : member,
      ),
    );
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > MAX_GROUP_IMAGE_SIZE) {
      setError(t("groupImageError"));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
        setError("");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = groupChatSchema.safeParse({
      name,
      imageDataUrl,
      members,
    });

    if (!result.success) {
      const issue = result.error.issues[0];
      const issuePath = issue?.path[0];

      setError(
        issuePath === "name"
          ? t("groupNameRequired")
          : issue?.code === "custom"
            ? t("groupAdminRequired")
            : t("groupMembersRequired"),
      );
      return;
    }

    const group = createGroupChat(result.data);
    onCreated?.();
    router.push(`/app/chats/${group.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-20 after:border-0">
          {imageDataUrl ? <AvatarImage src={imageDataUrl} alt="" /> : null}
          <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
            {name.trim().charAt(0).toUpperCase() || (
              <Icon icon="solar:users-group-rounded-bold" className="size-7" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" size="sm" variant="outline">
            <Label htmlFor="group-image" className="cursor-pointer">
              <Icon icon="solar:camera-add-linear" className="size-4" />
              {imageDataUrl ? t("changeImage") : t("selectImage")}
            </Label>
          </Button>
          {imageDataUrl ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              tone="neutral"
              onClick={() => setImageDataUrl(undefined)}
            >
              {t("removeImage")}
            </Button>
          ) : null}
          <Input
            id="group-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />
          <Typography as="p" variant="muted" className="w-full text-xs">
            {t("groupImage")}
          </Typography>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-name">{t("groupName")}</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          placeholder={t("groupNamePlaceholder")}
          className="h-11 rounded-xl bg-card"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="group-member-search">{t("members")}</Label>
          <Typography as="span" variant="muted" className="text-xs">
            {t("memberCount", { count: members.length })}
          </Typography>
        </div>
        <Input
          id="group-member-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchMembers")}
          className="h-10 rounded-xl bg-card"
        />

        <div className="max-h-56 space-y-2 overflow-y-auto pe-1">
          {filteredUsers.map((user) => {
            const selectedMember = members.find(
              (member) => member.id === user.id,
            );

            return (
              <div
                key={user.id}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2"
              >
                <Checkbox
                  checked={Boolean(selectedMember)}
                  onCheckedChange={() => toggleMember(user.id)}
                  aria-label={user.name}
                />
                <Avatar className="size-9 after:border-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {user.initial}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => toggleMember(user.id)}
                  className="min-w-0 flex-1 text-start"
                >
                  <Typography as="span" className="block truncate text-sm font-semibold">
                    {user.name}
                  </Typography>
                  <Typography as="span" variant="muted" className="block truncate text-xs">
                    {user.username}
                  </Typography>
                </button>

                {selectedMember ? (
                  <Select
                    value={selectedMember.role}
                    onValueChange={(value) =>
                      setMemberRole(user.id, value as GroupMemberRole)
                    }
                  >
                    <SelectTrigger size="sm" className="w-[92px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">{t("memberRole")}</SelectItem>
                      <SelectItem value="admin">{t("adminRole")}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            );
          })}
          {filteredUsers.length === 0 ? (
            <Typography as="p" variant="muted" className="py-6 text-center text-sm">
              {t("noGroupUsers")}
            </Typography>
          ) : null}
        </div>
      </div>

      {error ? (
        <Typography as="p" className="text-sm text-destructive">
          {error}
        </Typography>
      ) : null}

      <Button
        type="submit"
        disabled={!name.trim() || members.length === 0}
        className="h-11 w-full rounded-xl font-bold"
      >
        <Icon icon="solar:users-group-rounded-bold" className="size-5" />
        {t("createGroupSubmit")}
      </Button>
    </form>
  );
}
