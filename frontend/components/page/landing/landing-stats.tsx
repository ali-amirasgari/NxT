"use client";

import { motion } from "motion/react";

import { Typography } from "@/components/ui/typography";

export function LandingStats() {
  const items = [
    { value: "847K", label: "Goals Committed" },
    { value: "2.3M", label: "XP Staked Total" },
    { value: "94%", label: "Completion Rate" },
    { value: "12K", label: "Active Right Now" },
  ];

  return (
    <section className="bg-secondary-700 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <Typography
              as="div"
              className="text-4xl font-black mb-1 text-primary"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                textShadow:
                  "0 0 20px color-mix(in oklab, var(--primary) 35%, transparent)",
              }}
            >
              {item.value}
            </Typography>
            <Typography
              as="div"
              className="text-xs uppercase tracking-widest text-secondary-foreground/55"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {item.label}
            </Typography>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
