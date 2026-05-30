"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LocaleToggle() {
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const current = isClient
    ? ((document.documentElement.lang as Locale) ?? defaultLocale)
    : defaultLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          aria-label="Language"
        >
          {isClient ? current.toUpperCase() : "LANG"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={locales.includes(current) ? current : defaultLocale}
          onValueChange={(nextValue) => {
            setLocaleCookie(nextValue as Locale);
            window.location.reload();
          }}
        >
          {locales.map((locale) => (
            <DropdownMenuRadioItem key={locale} value={locale}>
              {locale.toUpperCase()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
