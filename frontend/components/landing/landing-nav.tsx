"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import { NAV_LINKS } from "./landing-data";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled && "bg-secondary/90 backdrop-blur-xl border-b border-primary/20"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-black text-sm bg-primary text-primary-foreground"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.05em",
              boxShadow:
                "0 0 16px color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            <Typography as="span" className="text-sm font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              N
            </Typography>
          </div>
          <Typography
            as="span"
            className="font-black text-xl text-secondary-foreground tracking-widest"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            NxT
          </Typography>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Typography
              key={l.label}
              asChild
              className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors duration-200"
            >
              <a href={l.href}>{l.label}</a>
            </Typography>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild type="button" variant="outline" tone="primary">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild type="button" variant="default" tone="primary">
            <Link href="/app">START STAKING</Link>
          </Button>
        </div>

        <Button
          aria-label={open ? "Close menu" : "Open menu"}
          variant="ghost"
          tone="secondary"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden px-6 py-4 flex flex-col gap-4 bg-secondary/95 backdrop-blur-xl border-b border-primary/20">
          {NAV_LINKS.map((l) => (
            <Typography
              key={l.label}
              asChild
              className="text-sm text-secondary-foreground/70"
            >
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </Typography>
          ))}
          <Button asChild type="button" variant="outline" tone="primary" className="w-full">
            <Link href="/signin" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          </Button>
          <Button
            asChild
            type="button"
            variant="default"
            tone="primary"
            className="w-full"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            <Link href="/app" onClick={() => setOpen(false)}>
              START STAKING
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
