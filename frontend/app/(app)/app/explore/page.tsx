"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  type ExploreCategory,
  exploreTiles,
} from "@/components/page/explore/explore-data";
import { ExploreFilterChips } from "@/components/page/explore/explore-filter-chips";
import { ExploreMediaGrid } from "@/components/page/explore/explore-media-grid";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";
import { Typography } from "@/components/ui/typography";

export default function ExplorePage() {
  const t = useTranslations("app.explore");
  const [category, setCategory] = useState<ExploreCategory>("for-you");
  const filters = [
    { value: "for-you", label: t("filters.forYou") },
    { value: "fitness", label: t("filters.fitness") },
    { value: "coding", label: t("filters.coding") },
    { value: "proof", label: t("filters.proof") },
  ] as const;
  const filteredTiles = useMemo(
    () =>
      category === "for-you"
        ? exploreTiles
        : exploreTiles.filter((tile) => tile.category === category),
    [category],
  );

  return (
    <section className="mx-auto w-full px-0 md:max-w-5xl">
      <header className="px-1 pt-6 md:pt-2">
        <Typography
          as="h1"
          className="text-2xl font-bold tracking-[-0.025em] text-foreground md:text-3xl"
        >
          {t("title")}
        </Typography>
        <Typography
          as="p"
          className="mt-0.5 max-w-sm text-xs leading-[17px] text-muted-foreground md:text-sm"
        >
          {t("description")}
        </Typography>
      </header>

      <div className="mt-[21px] px-1">
        <ExploreSearchField
          compactLink
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      <div className="mt-[18px] px-1">
        <ExploreFilterChips
          value={category}
          options={filters}
          onValueChange={setCategory}
        />
      </div>

      <div className="mt-4">
        <ExploreMediaGrid tiles={filteredTiles} />
      </div>
    </section>
  );
}
