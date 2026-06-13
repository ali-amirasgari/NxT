"use client";

import { Typography } from "@/components/ui/typography";

export function LandingFooter() {
  return (
    <footer className="py-10 bg-secondary border-t border-primary/15">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center font-black text-xs bg-primary text-primary-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <Typography as="span" className="text-xs font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              N
            </Typography>
          </div>
          <Typography
            as="span"
            className="font-black text-sm tracking-widest text-secondary-foreground"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            NxT
          </Typography>
          <Typography
            as="span"
            className="text-xs ml-1 text-secondary-foreground/35"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            © 2025 · Commit. Prove. Resolve.
          </Typography>
        </div>
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "API", "Status"].map((link) => (
            <Typography
              key={link}
              asChild
              className="text-xs text-secondary-foreground/40 hover:text-primary transition-colors duration-150"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <a href="#">{link}</a>
            </Typography>
          ))}
        </div>
      </div>
    </footer>
  );
}
