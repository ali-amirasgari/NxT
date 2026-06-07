import { Icon } from "@iconify/react";
import Link from "next/link";

import type { ExploreSearchResult } from "@/components/page/explore/explore-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type ExploreSearchResultsProps = {
  results: ExploreSearchResult[];
  emptyTitle: string;
  emptyDescription: string;
};

export function ExploreSearchResults({
  results,
  emptyTitle,
  emptyDescription,
}: ExploreSearchResultsProps) {
  if (!results.length) {
    return (
      <Empty className="min-h-64 border border-dashed border-border p-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="solar:magnifer-linear" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ItemGroup className="gap-1">
      {results.map((result) => (
        <div key={result.id} role="listitem">
          <Item
            asChild
            size="sm"
            className="rounded-xl border-transparent px-0 hover:bg-muted/60"
          >
            <Link href={result.href}>
              <ItemMedia>
                <Avatar size="lg" className="size-[42px]">
                  <AvatarFallback
                    className={
                      result.type === "tag"
                        ? "bg-secondary text-lg font-bold text-primary"
                        : result.type === "goal"
                          ? "bg-blue-600 font-bold text-white"
                          : "bg-primary font-bold text-primary-foreground"
                    }
                  >
                    {result.iconText}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0.5">
                <ItemTitle className="text-[15px] font-bold text-foreground">
                  {result.title}
                </ItemTitle>
                <ItemDescription className="text-start text-xs">
                  {result.description}
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}
