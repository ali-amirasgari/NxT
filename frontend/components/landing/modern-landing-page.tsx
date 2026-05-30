"use client";

import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingStats } from "@/components/landing/landing-stats";

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

