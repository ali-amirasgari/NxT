"use client";

import { motion } from "motion/react";

import { Typography } from "@/components/ui/typography";

import { PHASES } from "./landing-data";

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <Typography
            as="div"
            className="text-xs uppercase tracking-widest mb-4 text-primary"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            The System
          </Typography>
          <Typography
            as="h2"
            variant="h2"
            className="font-black uppercase mb-5 text-secondary-foreground border-b-0 pb-0"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              lineHeight: 1,
            }}
          >
            Three steps.
            <br />
            <Typography as="span" tone="primary" className="text-primary">
              Zero exceptions.
            </Typography>
          </Typography>
          <Typography as="p" className="text-lg max-w-xl leading-relaxed text-secondary-foreground/70">
            Every commitment runs through the same immutable loop. No shortcuts, no leniency — the system treats everyone equally.
          </Typography>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PHASES.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-lg p-7 group cursor-default relative overflow-hidden bg-secondary-700/60 border border-primary/15 hover:border-primary/35 hover:shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_10%,transparent)] transition-[border-color,box-shadow]"
              >
                <div
                  className="absolute top-5 right-5 text-6xl font-black pointer-events-none select-none text-primary/10"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1,
                  }}
                >
                  0{i + 1}
                </div>

                <div className="w-11 h-11 rounded flex items-center justify-center mb-6 bg-primary/10 border border-primary/20">
                  <Icon size={20} className="text-primary" />
                </div>

                <Typography
                  as="div"
                  className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block mb-3 text-primary bg-primary/10"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {phase.label}
                </Typography>

                <Typography
                  as="h3"
                  variant="h3"
                  className="text-xl font-bold mb-3 text-secondary-foreground"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "0.03em",
                  }}
                >
                  {phase.title}
                </Typography>

                <Typography as="p" className="text-sm leading-relaxed text-secondary-foreground/65">
                  {phase.desc}
                </Typography>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
