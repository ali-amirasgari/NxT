"use client";

import { LandingCTA } from "@/components/page/landing/landing-cta";
import { LandingFooter } from "@/components/page/landing/landing-footer";
import { LandingFeatures } from "@/components/page/landing/landing-features";
import { LandingHero } from "@/components/page/landing/landing-hero";
import { LandingHowItWorks } from "@/components/page/landing/landing-how-it-works";
import { LandingNav } from "@/components/page/landing/landing-nav";
import { LandingStats } from "@/components/page/landing/landing-stats";

export function ModernLandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-secondary text-secondary-foreground">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
