"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  type ExploreCategory,
  exploreTiles,
} from "@/components/page/explore/explore-data";
import { ExploreFilterChips } from "@/components/page/explore/explore-filter-chips";
import { ExploreCreatorsRow } from "@/components/page/explore/explore-creators-row";
import { ExploreMediaGrid } from "@/components/page/explore/explore-media-grid";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";

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
      <div className="mt-5 px-1 md:mt-2">
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

      <div className="mt-5 px-1">
        <ExploreCreatorsRow label={t("creators")} />
      </div>

      <div className="mt-4">
        <ExploreMediaGrid tiles={filteredTiles} />
      </div>
    </section>
  );
}
