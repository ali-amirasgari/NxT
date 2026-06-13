import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";

type DetailAuthorRowProps = {
  initial: string;
  name: string;
  meta: string;
  badge?: string;
  href?: string;
};

export function DetailAuthorRow({
  initial,
  name,
  meta,
  badge,
  href,
}: DetailAuthorRowProps) {
  const content = (
    <>
      <Avatar className="size-10 after:hidden">
        <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
          {initial}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <Typography
          as="p"
          variant="small"
          className="truncate text-sm font-semibold text-foreground"
        >
          {name}
        </Typography>
        <Typography
          as="p"
          variant="muted"
          className="mt-1 truncate text-[11px] leading-none"
        >
          {meta}
        </Typography>
      </div>
    </>
  );

  return (
    <div className="flex items-center gap-3">
      {href ? (
        <Link
          href={href}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      )}

      {badge ? (
        <Badge variant="secondary" className="h-7 px-3 text-xs">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}
