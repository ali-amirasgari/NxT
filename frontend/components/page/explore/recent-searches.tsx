"use client";

import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item";
import { Typography } from "@/components/ui/typography";

type RecentSearchesProps = {
  title: string;
  clearAllLabel: string;
  removeLabel: string;
  items: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
};

export function RecentSearches({
  title,
  clearAllLabel,
  removeLabel,
  items,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchesProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Typography as="h1" className="text-base font-bold text-foreground">
          {title}
        </Typography>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-primary"
          >
            {clearAllLabel}
          </button>
        ) : null}
      </div>

      <ItemGroup className="gap-1">
        {items.map((term) => (
          <Item key={term} size="sm" className="rounded-xl border-transparent px-0">
            <ItemMedia variant="icon">
              <Icon
                icon="solar:history-linear"
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(term)}
                className="block w-full truncate text-start text-sm font-semibold text-foreground"
              >
                {term}
              </button>
            </ItemContent>
            <ItemActions>
              <Button
                type="button"
                variant="ghost"
                tone="neutral"
                size="icon-sm"
                aria-label={removeLabel}
                onClick={() => onRemove(term)}
              >
                <Icon icon="solar:close-circle-linear" className="size-4" aria-hidden="true" />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
