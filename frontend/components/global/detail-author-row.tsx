import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";

type DetailAuthorRowProps = {
  initial: string;
  name: string;
  meta: string;
  badge?: string;
};

export function DetailAuthorRow({
  initial,
  name,
  meta,
  badge,
}: DetailAuthorRowProps) {
  return (
    <div className="flex items-center gap-3">
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

      {badge ? (
        <Badge variant="secondary" className="h-7 px-3 text-xs">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}
