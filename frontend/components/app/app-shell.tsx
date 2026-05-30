"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Trophy, User } from "lucide-react";

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
import { useIsMobile } from "@/hooks/use-mobile";

type AppShellProps = {
  dir: "ltr" | "rtl";
  children: React.ReactNode;
};

const navItems = [
  { href: "/app", label: "Home", Icon: Home },
  { href: "/app/goals", label: "Goals", Icon: Target },
  { href: "/app/leaderboard", label: "Leaderboard", Icon: Trophy },
  { href: "/app/profile", label: "Profile", Icon: User },
] as const;

export function AppShell({ dir, children }: AppShellProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <DirectionProvider dir={dir}>
      <SidebarProvider>
        {isMobile ? null : (
          <Sidebar
            side={dir === "rtl" ? "right" : "left"}
            dir={dir}
            mobile="hidden"
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
                {/* <div className="hidden md:block">
                  <SidebarTrigger />
                </div> */}
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/app" &&
                          pathname?.startsWith(item.href));
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={active}>
                            <Link href={item.href}>
                              <item.Icon />
                              <span>{item.label}</span>
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
        )}

        <SidebarInset className="pb-16 md:pb-0">
          {isMobile ? null : (
            <div className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 backdrop-blur px-4">
              <div className="hidden md:block">
                <SidebarTrigger />
              </div>
            </div>
          )}

          <div className="flex-1 p-4">{children}</div>

          <nav
            dir={dir}
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur md:hidden"
          >
            <div className="mx-auto flex max-w-md">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/app" && pathname?.startsWith(item.href));
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "h-14 flex-1 rounded-none flex-col gap-1 text-black dark:text-muted-foreground",
                      active &&
                        "text-primary dark:text-primary",
                    )}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.Icon className="size-4" />
                      <span className="text-[11px] leading-none">
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>
        </SidebarInset>
      </SidebarProvider>
    </DirectionProvider>
  );
}
