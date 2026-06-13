"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type ExploreFilterChipsProps<T extends string> = {
  value: T;
  options: readonly FilterOption<T>[];
  onValueChange: (value: T) => void;
};

export function ExploreFilterChips<T extends string>({
  value,
  options,
  onValueChange,
}: ExploreFilterChipsProps<T>) {
  return (
    <div
      aria-label="Explore filters"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={active ? "outline" : "default"}
            tone={active ? "primary" : "neutral"}
            active={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-7 min-w-16 rounded-full border px-4 text-[11px] font-bold shadow-none",
              active
                ? "border-primary bg-accent text-primary hover:bg-accent"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
