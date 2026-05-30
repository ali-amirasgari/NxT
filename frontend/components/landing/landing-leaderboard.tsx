"use client";

import { Flame, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import { BADGE_ALPHA, LEADERBOARD } from "./landing-data";

function getRankTone(rank: number) {
  if (rank === 1) return "text-primary";
  if (rank <= 3) return "text-primary-400";
  return "text-secondary-foreground/30";
}

export function LandingLeaderboard() {
  return (
    <section id="leaderboard" className="py-24 md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-start">
          <div>
            <Typography
              as="div"
              className="text-xs uppercase tracking-widest mb-4 text-primary"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Leaderboard
            </Typography>
            <Typography
              as="h2"
              variant="h2"
              className="font-black uppercase mb-6 text-secondary-foreground border-b-0 pb-0"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                lineHeight: 1,
              }}
            >
              Your reputation
              <br />
              <Typography as="span" tone="primary" className="text-primary">
                is public.
              </Typography>
            </Typography>
            <Typography as="p" className="text-lg max-w-md leading-relaxed mb-6 text-secondary-foreground/70">
              Every commitment, every proof, every verdict — visible to your circle and the global community.
            </Typography>
            <Typography as="p" className="text-sm max-w-md leading-relaxed text-secondary-foreground/55">
              Top performers earn{" "}
              <Typography
                as="span"
                tone="primary"
                className="text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}
              >
                LEGEND
              </Typography>{" "}
              status, multiplied XP earning rates, and access to elite high-stakes commitment pools.
            </Typography>
          </div>

          <div
            className="rounded-lg overflow-hidden bg-secondary-700/60 border border-primary/20"
            style={{
              boxShadow:
                "0 0 60px color-mix(in oklab, var(--primary) 6%, transparent)",
            }}
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-primary/15">
              <div className="flex items-center gap-2">
                <Trophy size={13} className="text-primary" />
                <Typography
                  as="span"
                  className="text-sm font-black tracking-widest text-secondary-foreground"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  GLOBAL RANKINGS
                </Typography>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary" />
                <Typography
                  as="span"
                  className="text-xs text-primary"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  LIVE
                </Typography>
              </div>
            </div>

            {LEADERBOARD.map((entry, i) => (
              <div
                key={entry.rank}
                className="px-5 py-4 flex items-center gap-4 cursor-pointer transition-colors duration-150 hover:bg-primary/5"
                style={{
                  borderBottom: i < LEADERBOARD.length - 1 ? "1px solid color-mix(in oklab, var(--primary) 8%, transparent)" : "none",
                }}
              >
                <Typography
                  as="span"
                  className={`text-base font-black w-5 text-center flex-shrink-0 ${getRankTone(entry.rank)}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {entry.rank}
                </Typography>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-primary border border-primary/30"
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${
                      Math.round(BADGE_ALPHA[entry.badge] * 18)
                    }%, transparent)`,
                  }}
                >
                  <Typography as="span" className="text-xs font-black leading-none text-primary">
                    {entry.initials}
                  </Typography>
                </div>

                <div className="flex-1 min-w-0">
                  <Typography as="div" className="text-sm font-medium truncate text-secondary-foreground">
                    {entry.name}
                  </Typography>
                  <div className="text-xs flex items-center gap-1 mt-0.5 text-secondary-foreground/55">
                    <Flame size={9} className="text-primary" />
                    <Typography as="span" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {entry.streak}d streak
                    </Typography>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <Typography
                    as="div"
                    className="text-sm font-bold text-secondary-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {entry.points.toLocaleString()}
                  </Typography>
                  <Typography
                    as="div"
                    className="mt-0.5 font-bold text-primary"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.62rem",
                      opacity: BADGE_ALPHA[entry.badge],
                      letterSpacing: "0.1em",
                    }}
                  >
                    {entry.badge}
                  </Typography>
                </div>
              </div>
            ))}

            <div className="px-5 py-3 text-center border-t border-primary/15">
              <Button
                type="button"
                variant="link"
                tone="primary"
                size="sm"
                className="text-xs text-secondary-foreground/50 hover:text-primary"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                VIEW FULL LEADERBOARD →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
