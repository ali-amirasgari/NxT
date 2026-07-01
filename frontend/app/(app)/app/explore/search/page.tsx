"use client";

import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useGoalsQuery } from "@/apis/queries/goals/queries";
import { useExploreSearchQuery } from "@/apis/queries/social/queries";
import { useUsersSearchQuery } from "@/apis/queries/users/queries";
import {
  goalToExploreSearchResult,
  postToExploreSearchResult,
  userToExploreSearchResult,
} from "@/components/page/explore/explore-data";
import { ExploreFilterChips } from "@/components/page/explore/explore-filter-chips";
import { ExploreSearchField } from "@/components/page/explore/explore-search-field";
import { ExploreSearchResults } from "@/components/page/explore/explore-search-results";
import { RecentSearches } from "@/components/page/explore/recent-searches";
import { GoalCard } from "@/components/global/goal-card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useRecentSearches } from "@/lib/use-recent-searches";

type SearchType = "all" | "posts" | "accounts" | "goals" | "tags";

function ExploreSearchContent() {
  const t = useTranslations("app.exploreSearch");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const requestedType = searchParams.get("type");
  const [type, setType] = useState<SearchType>(
    requestedType === "posts" ||
      requestedType === "accounts" ||
      requestedType === "goals" ||
      requestedType === "tags"
      ? requestedType
      : "all",
  );
  const recentSearches = useRecentSearches();
  const searchQuery = useExploreSearchQuery({
    q: query.trim(),
    type,
  });
  const goalsQuery = useGoalsQuery({
    status: "active",
    search: query.trim(),
  });
  const usersQuery = useUsersSearchQuery({ search: query.trim() });
  const filters = [
    { value: "all", label: t("filters.all") },
    { value: "posts", label: t("filters.posts") },
    { value: "accounts", label: t("filters.accounts") },
    { value: "goals", label: t("filters.goals") },
    { value: "tags", label: t("filters.tags") },
  ] as const;
  const results = useMemo(
    () => [
      ...(type === "all" || type === "posts"
        ? (searchQuery.data ?? []).map(postToExploreSearchResult)
        : []),
      ...(type === "all" || type === "goals"
        ? (goalsQuery.data ?? []).map(goalToExploreSearchResult)
        : []),
      ...(type === "all" || type === "accounts"
        ? (usersQuery.data ?? []).map(userToExploreSearchResult)
        : []),
    ],
    [goalsQuery.data, searchQuery.data, type, usersQuery.data],
  );
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const timeoutId = window.setTimeout(() => {
      recentSearches.addSearch(trimmed);
    }, 800);
    return () => window.clearTimeout(timeoutId);
  }, [query, recentSearches.addSearch]);

  const suggestedGoals = useMemo(
    () =>
      (goalsQuery.data ?? []).slice(0, 4).map((goal) => ({
        id: goal.id,
        title: goal.title,
        meta: goal.category?.name ?? goal.schedule_label,
        progress: goal.progress,
      })),
    [goalsQuery.data],
  );

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
        {query ? (
          <>
            <Typography
              as="h1"
              className="mb-2 text-base font-bold text-foreground"
            >
              {t("resultsTitle")}
            </Typography>
            <ExploreSearchResults
              results={results}
              emptyTitle={t("emptyTitle")}
              emptyDescription={
                searchQuery.isLoading ? t("loading") : t("emptyDescription")
              }
            />
          </>
        ) : recentSearches.items.length > 0 ? (
          <RecentSearches
            title={t("recentTitle")}
            clearAllLabel={t("clearAll")}
            removeLabel={t("removeSearch")}
            items={recentSearches.items}
            onSelect={setQuery}
            onRemove={recentSearches.removeSearch}
            onClearAll={recentSearches.clearSearches}
          />
        ) : (
          <Typography as="p" variant="muted" className="py-6 text-center text-sm">
            {t("recentEmpty")}
          </Typography>
        )}
      </div>

      {suggestedGoals.length > 0 ? (
        <div className="mt-11">
          <Typography as="h2" className="mb-4 border-0 pb-0 text-base font-bold">
            {t("suggestedTitle")}
          </Typography>
          <div className="grid gap-[18px] md:grid-cols-2">
            {suggestedGoals.map((goal) => (
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
      ) : null}
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
