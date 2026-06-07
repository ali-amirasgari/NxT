"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type ExploreSearchFieldProps = {
  label: string;
  placeholder: string;
  clearLabel?: string;
  initialValue?: string;
  compactLink?: boolean;
  onQueryChange?: (query: string) => void;
};

export function ExploreSearchField({
  label,
  placeholder,
  clearLabel = "Clear search",
  initialValue = "",
  compactLink = false,
  onQueryChange,
}: ExploreSearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  if (compactLink) {
    return (
      <Button
        asChild
        variant="outline"
        tone="neutral"
        className="h-[42px] w-full justify-start rounded-2xl border border-input bg-card px-4 text-[13px] font-normal text-muted-foreground shadow-none"
      >
        <Link href="/app/explore/search" aria-label={label}>
          <Icon
            icon="solar:magnifer-linear"
            className="size-4"
            aria-hidden="true"
          />
          {placeholder}
        </Link>
      </Button>
    );
  }

  return (
    <div
      role="search"
      className="min-w-0 flex-1"
    >
      <InputGroup className="h-10 rounded-[14px] border-input bg-card shadow-none">
        <InputGroupAddon>
          <Icon
            icon="solar:magnifer-linear"
            className="size-4"
            aria-hidden="true"
          />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onQueryChange?.(event.target.value);
          }}
          aria-label={label}
          placeholder={placeholder}
          className="text-sm"
        />
        {query ? (
          <InputGroupButton
            size="icon-xs"
            aria-label={clearLabel}
            onClick={() => {
              setQuery("");
              onQueryChange?.("");
              router.replace("/app/explore/search");
            }}
          >
            <Icon
              icon="solar:close-circle-linear"
              className="size-4"
              aria-hidden="true"
            />
          </InputGroupButton>
        ) : null}
      </InputGroup>
    </div>
  );
}
