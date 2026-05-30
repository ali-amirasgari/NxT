"use client";

import { motion } from "motion/react";

import { Typography } from "@/components/ui/typography";

import { FEATURES } from "./landing-data";

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 md:py-32 bg-secondary-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <Typography
              as="div"
              className="text-xs uppercase tracking-widest mb-4 text-primary"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Platform
            </Typography>
            <Typography
              as="h2"
              variant="h2"
              className="font-black uppercase text-secondary-foreground border-b-0 pb-0"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                lineHeight: 1,
              }}
            >
              Built for
              <br />
              <Typography as="span" tone="primary" className="text-primary">
                winners.
              </Typography>
            </Typography>
          </div>
          <Typography as="p" className="max-w-xs text-sm leading-relaxed text-secondary-foreground/65">
            Every feature makes failure more painful and success more rewarding. NxT has no comfort mode.
          </Typography>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-lg p-6 bg-secondary-600/60 border border-primary/10 hover:border-primary/30 hover:-translate-y-0.5 transition-[border-color,transform]"
              >
                <div className="w-10 h-10 rounded flex items-center justify-center mb-4 bg-primary/10">
                  <Icon size={17} className="text-primary" />
                </div>
                <Typography
                  as="h3"
                  variant="h3"
                  className="font-bold mb-2 text-secondary-foreground"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "0.03em",
                    fontSize: "1.1rem",
                  }}
                >
                  {feat.title}
                </Typography>
                <Typography as="p" className="text-sm leading-relaxed text-secondary-foreground/60">
                  {feat.desc}
                </Typography>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
