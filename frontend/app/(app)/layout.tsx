import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/global/application-shell";
import { defaultLocale, isLocale, rtlLocales } from "@/i18n/config";
import { hasServerSession } from "@/lib/auth/session";
import config from "@/lib/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authenticated = config.authGuardsEnabled
    ? await hasServerSession()
    : true;

  if (!authenticated) {
    redirect("/signin");
  }

  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-locale");
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale;
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return <AppShell dir={dir}>{children}</AppShell>;
}
