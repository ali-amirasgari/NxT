"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DirectionProvider } from "@/components/ui/direction";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Typography } from "@/components/ui/typography";

type AppShellProps = {
  dir: "ltr" | "rtl";
  children: React.ReactNode;
};

const navigationItems = [
  {
    href: "/app",
    labelKey: "home",
    desktopIcon: "solar:home-2-linear",
    mobileIcon: "solar:home-2-linear",
    showOnMobile: true,
  },
  {
    href: "/app/explore",
    labelKey: "explore",
    desktopIcon: "solar:users-group-rounded-linear",
    mobileIcon: "solar:users-group-rounded-linear",
    showOnMobile: true,
  },
  {
    href: "/app/goals",
    labelKey: "goals",
    desktopIcon: "solar:target-linear",
    mobileIcon: "solar:target-linear",
    showOnMobile: false,
  },
  {
    href: "/app/chats",
    labelKey: "chats",
    desktopIcon: "solar:chat-round-line-linear",
    mobileIcon: "solar:chat-round-line-linear",
    showOnMobile: true,
  },
  {
    href: "/app/profile",
    labelKey: "profile",
    desktopIcon: "solar:user-rounded-linear",
    mobileIcon: "solar:user-rounded-linear",
    showOnMobile: true,
  },
] as const;

const mobileNavigationItems = navigationItems.filter(
  (item) => item.showOnMobile,
);

function isRouteActive(pathname: string, href: string, fromExplore: boolean) {
  if (href === "/app/explore" && fromExplore) {
    return true;
  }

  if (fromExplore) {
    return false;
  }

  if (href === "/app/profile" && pathname.startsWith("/app/posts/")) {
    return true;
  }

  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ dir, children }: AppShellProps) {
  const t = useTranslations("app.navigation");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromExplore = searchParams.get("from") === "explore";
  const showMobileNavigation =
    pathname !== "/app/profile/settings" && pathname !== "/app/profile/edit";

  return (
    <DirectionProvider dir={dir}>
      <SidebarProvider className="font-[family-name:var(--font-inter)]">
        <Sidebar
          side={dir === "rtl" ? "right" : "left"}
          dir={dir}
          mobile="hidden"
          className="hidden md:flex"
        >
          <SidebarHeader className="gap-1.5">
            <div className="flex items-center justify-between gap-2 px-2">
              <Typography
                as="div"
                className="text-lg font-black tracking-widest text-sidebar-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                NxT
              </Typography>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const active = isRouteActive(
                      pathname,
                      item.href,
                      fromExplore,
                    );
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link href={item.href}>
                            <Icon
                              icon={item.desktopIcon}
                              aria-hidden="true"
                            />
                            <span>{t(item.labelKey)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset
          className={cn(
            "min-w-0 md:pb-0",
            showMobileNavigation ? "pb-24" : "pb-4",
          )}
        >
          <div className="sticky top-0 z-20 hidden h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur md:flex">
            <SidebarTrigger />
          </div>

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6">
            {children}
          </div>

          {showMobileNavigation ? (
            <nav
              dir={dir}
              aria-label="Primary navigation"
              className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(20px,env(safe-area-inset-bottom))] md:hidden"
            >
              <div className="mx-auto grid h-[54px] w-full max-w-[358px] grid-cols-5 items-center rounded-[27px] border border-border bg-card shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                {mobileNavigationItems.slice(0, 2).map((item) => {
                  const active = isRouteActive(
                    pathname,
                    item.href,
                    fromExplore,
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={t(item.labelKey)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex size-full items-center justify-center rounded-[18px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        active && "text-primary",
                      )}
                    >
                      <Icon
                        icon={item.mobileIcon}
                        aria-hidden="true"
                        className="size-5"
                      />
                    </Link>
                  );
                })}

                <div className="flex size-full items-center justify-center">
                  <Button
                    asChild
                    size="icon"
                    className="size-10 -translate-y-2 rounded-full text-primary-foreground shadow-[0_8px_20px_rgba(255,122,26,0.3)] hover:-translate-y-2.5"
                  >
                    <Link href="/app/goals/create" aria-label={t("createGoal")}>
                      <Icon
                        icon="mingcute:add-fill"
                        className="size-6"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </div>

                {mobileNavigationItems.slice(2).map((item) => {
                  const active = isRouteActive(
                    pathname,
                    item.href,
                    fromExplore,
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={t(item.labelKey)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex size-full items-center justify-center rounded-[18px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        active && "text-primary",
                      )}
                    >
                      <Icon
                        icon={item.mobileIcon}
                        aria-hidden="true"
                        className="size-5"
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>
          ) : null}
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  );
}
