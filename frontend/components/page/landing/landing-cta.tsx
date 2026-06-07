"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function LandingCTA() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-secondary-700">
      <div className="max-w-4xl mx-auto px-6">
        <div
          className="rounded-xl p-12 md:p-16 text-center relative overflow-hidden border border-primary/30"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, transparent) 0%, color-mix(in oklab, var(--primary) 6%, transparent) 60%, transparent 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in oklab, var(--primary) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary) 6%, transparent) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            className="absolute top-0 left-1/2 pointer-events-none"
            style={{
              width: 400,
              height: 200,
              background:
                "radial-gradient(ellipse, color-mix(in oklab, var(--primary) 16%, transparent) 0%, transparent 70%)",
              transform: "translate(-50%, -50%)",
            }}
          />

          <div className="relative">
            <Typography
              as="div"
              className="text-xs uppercase tracking-widest mb-5 text-primary"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Ready to commit?
            </Typography>
            <Typography
              as="h2"
              variant="h2"
              className="font-black uppercase mb-6 text-secondary-foreground border-b-0 pb-0"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                lineHeight: 1,
              }}
            >
              Your goals deserve
              <br />
              <Typography
                as="span"
                tone="primary"
                className="text-primary"
                style={{
                  textShadow:
                    "0 0 40px color-mix(in oklab, var(--primary) 35%, transparent)",
                }}
              >
                real accountability.
              </Typography>
            </Typography>
            <Typography
              as="p"
              className="text-lg mb-10 max-w-md mx-auto leading-relaxed text-secondary-foreground/70"
            >
              Join 847K+ people who stopped lying to themselves. First commitment takes under 2 minutes.
            </Typography>
            <Button
              type="button"
              variant="default"
              tone="primary"
              className="h-auto px-10 py-4 text-sm font-black hover:scale-[1.02]"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.1em",
                boxShadow:
                  "0 0 60px color-mix(in oklab, var(--primary) 35%, transparent), 0 8px 32px color-mix(in oklab, var(--primary) 22%, transparent)",
              }}
            >
              START STAKING — IT'S FREE
              <ArrowRight size={15} />
            </Button>
            <Typography
              as="p"
              className="text-xs mt-6 text-secondary-foreground/35"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              No credit card. No fluff. Just commitment.
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}
