import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { ChatRecord } from "./chat-data";

const toneClasses: Record<ChatRecord["tone"], string> = {
  green: "bg-emerald-400",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
};

export function ChatAvatar({
  chat,
  className,
}: {
  chat: ChatRecord;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-[46px] after:border-0", className)}>
      <AvatarFallback
        className={cn(
          "text-[13px] font-bold text-white",
          toneClasses[chat.tone],
        )}
      >
        {chat.initial}
      </AvatarFallback>
    </Avatar>
  );
}
