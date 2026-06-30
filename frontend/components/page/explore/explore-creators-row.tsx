"use client";

import Link from "next/link";

import { useUsersListQuery } from "@/apis/queries/users/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { userInitial } from "@/lib/user-display";

export function ExploreCreatorsRow({ label }: { label: string }) {
  const { data: users } = useUsersListQuery();

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Typography as="h2" variant="small" className="text-sm font-bold">
        {label}
      </Typography>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/app/users/${user.id}?from=explore`}
            className="flex min-w-[92px] flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3 text-center shadow-none transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-11 after:hidden">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {userInitial(user)}
              </AvatarFallback>
            </Avatar>
            <Typography as="span" className="max-w-[72px] truncate text-xs font-semibold">
              {user.username}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  );
}
