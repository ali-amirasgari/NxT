"use client";

import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCategoriesQuery } from "@/apis/queries/social/queries";
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from "@/apis/queries/goals/queries";
import { useUsersSearchQuery } from "@/apis/queries/users/queries";
import type { Goal, GoalPayload } from "@/apis/types/goal";
import type { User } from "@/apis/types/user";
import { resolveDisplayName, userInitial } from "@/lib/user-display";
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

const colors = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-400",
  "bg-violet-500",
  "bg-red-500",
  "bg-amber-400",
] as const;

export function GoalForm({
  initialGoal,
  labels,
}: {
  initialGoal?: Goal;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const createGoal = useCreateGoalMutation();
  const updateGoal = useUpdateGoalMutation(initialGoal?.id ?? 0);
  const { data: categories = [] } = useCategoriesQuery();

  const [type, setType] = useState<"solo" | "group">(
    initialGoal?.goal_type ?? "solo",
  );
  const [color, setColor] = useState(() => {
    const index = colors.indexOf(
      (initialGoal?.cover_color ?? "") as (typeof colors)[number],
    );
    return index >= 0 ? index : 0;
  });
  const [title, setTitle] = useState(initialGoal?.title ?? "");
  const [description, setDescription] = useState(
    initialGoal?.description ?? "",
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initialGoal?.category?.id ?? initialGoal?.category_id ?? null,
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stake, setStake] = useState(
    String(initialGoal?.stake_points ?? 200),
  );
  const [userSearch, setUserSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>(() =>
    (initialGoal?.members ?? [])
      .filter((member) => member.role !== "owner")
      .map((member) => member.user),
  );

  const { data: userResults = [] } = useUsersSearchQuery({ search: userSearch });
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const isPending = createGoal.isPending || updateGoal.isPending;

  function toggleUser(user: User) {
    setSelectedUsers((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const payload: GoalPayload = {
      title: trimmedTitle,
      description: description.trim(),
      category_id: categoryId,
      goal_type: type,
      stake_points: Number.parseInt(stake, 10) || 0,
      cover_color: colors[color],
    };

    if (type === "group") {
      payload.members = selectedUsers.map((user) => ({
        user_id: user.id,
        role: "member",
      }));
    }

    const onError = () => toast.error(labels.error);

    if (initialGoal) {
      updateGoal.mutate(payload, {
        onSuccess: (goal) => router.push(`/app/goals/${goal.id}`),
        onError,
      });
    } else {
      createGoal.mutate(payload, {
        onSuccess: (goal) => router.push(`/app/goals/${goal.id}`),
        onError,
      });
    }
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
                {selectedCategory?.name ?? labels.categoryPlaceholder}
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
                      key={item.id}
                      value={item.name}
                      onSelect={() => {
                        setCategoryId((current) =>
                          current === item.id ? null : item.id,
                        );
                        setCategoryOpen(false);
                      }}
                      data-checked={categoryId === item.id}
                    >
                      <Icon
                        icon="solar:tag-linear"
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {item.name}
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
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={labels.usersSearch}
                    value={userSearch}
                    onValueChange={setUserSearch}
                  />
                  <CommandList>
                    <CommandEmpty>{labels.noUsers}</CommandEmpty>
                    <CommandGroup>
                      {userResults.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={String(user.id)}
                          onSelect={() => toggleUser(user)}
                          data-checked={selectedUsers.some(
                            (item) => item.id === user.id,
                          )}
                          className="py-2"
                        >
                          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {userInitial(user)}
                          </span>
                          <span className="min-w-0">
                            <Typography
                              as="span"
                              className="block truncate text-sm font-semibold"
                            >
                              {resolveDisplayName(user)}
                            </Typography>
                            <Typography
                              as="span"
                              variant="muted"
                              className="block truncate text-xs"
                            >
                              @{user.username}
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
                {selectedUsers.map((user) => (
                  <Button
                    key={user.id}
                    type="button"
                    size="sm"
                    variant="secondary"
                    tone="neutral"
                    className="h-8 rounded-full"
                    onClick={() => toggleUser(user)}
                  >
                    {resolveDisplayName(user)}
                    <Icon icon="solar:close-circle-linear" className="size-4" />
                  </Button>
                ))}
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
        disabled={
          !title.trim() ||
          isPending ||
          (type === "group" && !selectedUsers.length)
        }
        className="h-11 w-full rounded-[14px] font-bold text-white"
      >
        {initialGoal
          ? labels.save
          : type === "group"
            ? labels.createGroup
            : labels.createSolo}
      </Button>
    </form>
  );
}
