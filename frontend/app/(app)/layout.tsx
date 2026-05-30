import { headers } from "next/headers";

import { AppShell } from "@/components/app/app-shell";
import { defaultLocale, isLocale, rtlLocales } from "@/i18n/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-locale");
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale;
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return <AppShell dir={dir}>{children}</AppShell>;
}

