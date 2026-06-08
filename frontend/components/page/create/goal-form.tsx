"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { GoalRecord } from "@/components/global/app-data";
import { chats } from "@/components/page/chats/chat-data";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { saveGoal } from "@/lib/content-storage";

const colors = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-400",
  "bg-violet-500",
  "bg-red-500",
  "bg-amber-400",
] as const;

const categories = [
  "Fitness",
  "Coding",
  "Learning",
  "Mindfulness",
  "Reading",
  "Career",
  "Finance",
  "Nutrition",
  "Creative",
] as const;

export function GoalForm({
  initialGoal,
  labels,
}: {
  initialGoal?: GoalRecord;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [type, setType] = useState<"solo" | "group">(
    initialGoal?.category === "Group goal" ? "group" : "solo",
  );
  const [color, setColor] = useState(0);
  const [title, setTitle] = useState(initialGoal?.title ?? "");
  const [description, setDescription] = useState(
    initialGoal?.description ?? "",
  );
  const [category, setCategory] = useState(
    initialGoal?.category === "Group goal"
      ? "Fitness"
      : (initialGoal?.category ?? "Fitness"),
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stake, setStake] = useState(
    initialGoal?.stake.replace(/\D/g, "") ?? "200",
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    initialGoal?.category === "Group goal" ? ["nima-goals", "mina"] : [],
  );

  function toggleUser(userId: string) {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const joinedCount = Math.max(selectedUsers.length + 1, 2);
    const saved = saveGoal({
      id: initialGoal?.id,
      title: title.trim(),
      description:
        description.trim() ||
        (type === "group"
          ? "A shared goal created with your accountability team."
          : "A personal goal focused on building consistent progress."),
      category: type === "group" ? "Group goal" : category,
      author: initialGoal?.author ?? "Alex Carter",
      authorInitial: initialGoal?.authorInitial ?? "A",
      meta:
        type === "group"
          ? `${joinedCount} joined · active`
          : `Active goal · ${category.toLowerCase()}`,
      progress: initialGoal?.progress ?? 0,
      stake: `${stake || "0"} pts`,
      schedule:
        type === "group"
          ? `${joinedCount} members · group goal`
          : `${category} · newly created`,
      likes: initialGoal?.likes ?? "0 likes",
      comments: initialGoal?.comments ?? "View all 0 comments",
    });
    router.push(`/app/goals/${saved.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid h-11 grid-cols-2 rounded-2xl bg-muted p-1">
        {(["solo", "group"] as const).map((item) => (
          <Button
            key={item}
            type="button"
            variant={type === item ? "default" : "ghost"}
            tone={type === item ? "primary" : "neutral"}
            onClick={() => setType(item)}
            className="h-9 rounded-[14px] font-bold"
          >
            {labels[item]}
          </Button>
        ))}
      </div>

      <div className="flex h-[106px] overflow-hidden rounded-[18px] bg-secondary">
        <div
          className={cn(
            "flex w-[126px] items-end p-[18px] text-2xl font-extrabold text-white",
            colors[color],
          )}
        >
          {type === "group" ? labels.teamCover : labels.soloCover}
        </div>
        <div className="flex flex-1 items-center px-6 text-sm text-muted-foreground">
          {labels.coverHelp}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{labels.color}</Label>
        <div className="flex gap-[18px]">
          {colors.map((surface, index) => (
            <Button
              key={surface}
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`${labels.color} ${index + 1}`}
              onClick={() => setColor(index)}
              className={cn(
                "size-9 rounded-full p-0",
                surface,
                color === index && "ring-2 ring-primary ring-offset-2",
              )}
            >
              {color === index ? (
                <Icon icon="solar:check-read-linear" className="text-white" />
              ) : null}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-title">{labels.title}</Label>
        <Input
          id="goal-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder={labels.titlePlaceholder}
          className="h-11 rounded-2xl bg-card px-3.5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-description">{labels.description}</Label>
        <Textarea
          id="goal-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={labels.descriptionPlaceholder}
          className="min-h-[72px] rounded-2xl bg-card px-3.5"
        />
      </div>

      <div className="space-y-2">
        <Label>{labels.category}</Label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              className="h-11 w-full justify-between rounded-2xl bg-card px-3.5"
            >
              <span className="flex items-center gap-2">
                <Icon
                  icon="solar:tag-linear"
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                {category}
              </span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[358px] rounded-2xl p-1">
            <Command>
              <CommandInput placeholder={labels.categorySearch} />
              <CommandList>
                <CommandEmpty>{labels.noCategory}</CommandEmpty>
                <CommandGroup>
                  {categories.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={() => {
                        setCategory(item);
                        setCategoryOpen(false);
                      }}
                      data-checked={category === item}
                    >
                      <Icon
                        icon="solar:tag-linear"
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {type === "group" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-stake">{labels.stake}</Label>
            <Input
              id="goal-stake"
              type="number"
              min="0"
              value={stake}
              onChange={(event) => setStake(event.target.value)}
              className="h-10 rounded-xl bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.users}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  tone="neutral"
                  className="min-h-11 w-full justify-between rounded-2xl bg-card px-3.5"
                >
                  <span className="truncate">
                    {selectedUsers.length
                      ? `${selectedUsers.length} ${labels.usersSelected}`
                      : labels.usersPlaceholder}
                  </span>
                  <Icon
                    icon="solar:users-group-rounded-linear"
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[358px] rounded-2xl p-1">
                <Command>
                  <CommandInput placeholder={labels.usersSearch} />
                  <CommandList>
                    <CommandEmpty>{labels.noUsers}</CommandEmpty>
                    <CommandGroup>
                      {chats.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.name} ${user.id} ${user.status}`}
                          onSelect={() => toggleUser(user.id)}
                          data-checked={selectedUsers.includes(user.id)}
                          className="py-2"
                        >
                          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {user.initial}
                          </span>
                          <span className="min-w-0">
                            <Typography
                              as="span"
                              className="block truncate text-sm font-semibold"
                            >
                              {user.name}
                            </Typography>
                            <Typography
                              as="span"
                              variant="muted"
                              className="block truncate text-xs"
                            >
                              @{user.id}
                            </Typography>
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedUsers.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = chats.find((item) => item.id === userId);
                  if (!user) return null;

                  return (
                    <Button
                      key={user.id}
                      type="button"
                      size="sm"
                      variant="secondary"
                      tone="neutral"
                      className="h-8 rounded-full"
                      onClick={() => toggleUser(user.id)}
                    >
                      {user.name}
                      <Icon icon="solar:close-circle-linear" className="size-4" />
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <Typography as="p" variant="muted" className="text-[13px]">
          {labels.proofLater}
        </Typography>
      )}

      <Button
        type="submit"
        disabled={!title.trim() || (type === "group" && !selectedUsers.length)}
        className="h-11 w-full rounded-[14px] font-bold text-white"
      >
        {initialGoal ? labels.save : type === "group" ? labels.createGroup : labels.createSolo}
      </Button>
    </form>
  );
}
