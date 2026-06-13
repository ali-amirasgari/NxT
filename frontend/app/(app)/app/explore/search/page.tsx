"use client";

import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useMemo, useState } from "react";

import {
  exploreSearchResults,
  suggestedExploreGoals,
} from "@/components/page/explore/explore-data";
import { ExploreFilterChips } from "@/components/page/explore/explore-filter-chips";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";
import { ExploreSearchResults } from "@/components/page/explore/explore-search-results";
import { GoalCard } from "@/components/global/goal-card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type SearchType = "all" | "accounts" | "goals" | "tags";

function ExploreSearchContent() {
  const t = useTranslations("app.exploreSearch");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const requestedType = searchParams.get("type");
  const [type, setType] = useState<SearchType>(
    requestedType === "accounts" ||
      requestedType === "goals" ||
      requestedType === "tags"
      ? requestedType
      : "all",
  );
  const filters = [
    { value: "all", label: t("filters.all") },
    { value: "accounts", label: t("filters.accounts") },
    { value: "goals", label: t("filters.goals") },
    { value: "tags", label: t("filters.tags") },
  ] as const;
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exploreSearchResults.filter((result) => {
      const matchesType =
        type === "all" ||
        (type === "accounts" && result.type === "account") ||
        (type === "goals" && result.type === "goal") ||
        (type === "tags" && result.type === "tag");
      const matchesQuery =
        !normalizedQuery ||
        result.title.toLowerCase().includes(normalizedQuery) ||
        result.description.toLowerCase().includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [query, type]);

  return (
    <section className="mx-auto w-full max-w-[390px] px-1 md:max-w-3xl">
      <header className="flex items-center gap-3 pt-4 md:pt-0">
        <Button
          type="button"
          size="icon-lg"
          tone="neutral"
          className="size-9 rounded-full bg-card"
          aria-label={t("back")}
          onClick={() => router.push("/app/explore")}
        >
          <Icon
            icon="solar:alt-arrow-left-linear"
            className="size-5 rtl:rotate-180"
            aria-hidden="true"
          />
        </Button>
        <ExploreSearchField
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          clearLabel={t("clear")}
          initialValue={initialQuery}
          onQueryChange={setQuery}
        />
      </header>

      <div className="mt-[22px]">
        <ExploreFilterChips
          value={type}
          options={filters}
          onValueChange={setType}
        />
      </div>

      <div className="mt-4" aria-live="polite">
        <Typography
          as="h1"
          className="mb-2 text-base font-bold text-foreground"
        >
          {query ? t("resultsTitle") : t("recentTitle")}
        </Typography>
        <ExploreSearchResults
          results={results}
          emptyTitle={t("emptyTitle")}
          emptyDescription={t("emptyDescription")}
        />
      </div>

      <div className="mt-11">
        <Typography as="h2" className="mb-4 border-0 pb-0 text-base font-bold">
          {t("suggestedTitle")}
        </Typography>
        <div className="grid gap-[18px] md:grid-cols-2">
          {suggestedExploreGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              href={`/app/goals/${goal.id}?from=explore`}
              title={goal.title}
              meta={goal.meta}
              progress={goal.progress}
              progressLabel={t("progress")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ExploreSearchPage() {
  return (
    <Suspense>
      <ExploreSearchContent />
    </Suspense>
  );
}
