import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Flame,
  Lock,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const PHASES: Array<{
  label: "COMMIT" | "PROVE" | "RESOLVE";
  title: string;
  desc: string;
  icon: LucideIcon;
}> = [
  {
    label: "COMMIT",
    title: "Stake your claim",
    desc: "Set a goal with precision. Lock in XP as collateral — the higher the stake, the greater the reward. No vague promises.",
    icon: Target,
  },
  {
    label: "PROVE",
    title: "Show your work",
    desc: "Execute the goal. Submit evidence — screenshots, code, video, timestamps. Proof is immutable and public.",
    icon: Upload,
  },
  {
    label: "RESOLVE",
    title: "AI decides instantly",
    desc: "Our AI validator reviews your proof in seconds. Pass: earn XP back plus rewards. Fail: points go to the winners pool.",
    icon: CheckCircle,
  },
];

export const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  desc: string;
}> = [
  {
    icon: Shield,
    title: "AI Validation Engine",
    desc: "Vision + reasoning models verify every submission. No humans, no bias — just objective proof analysis.",
  },
  {
    icon: Zap,
    title: "10-Second Resolution",
    desc: "No waiting. No appeals process. Your result is final and delivered before you can second-guess yourself.",
  },
  {
    icon: Trophy,
    title: "Global Leaderboards",
    desc: "Your win rate, streak, and XP are public. Accountability is contagious when reputation is on the line.",
  },
  {
    icon: Lock,
    title: "Trustless by Design",
    desc: "Stakes are locked at commit time. Once you're in, there's no way out but through.",
  },
  {
    icon: TrendingUp,
    title: "XP Compounding",
    desc: "Win streaks multiply your earning rate. Build momentum and your returns grow exponentially.",
  },
  {
    icon: Users,
    title: "Accountability Circles",
    desc: "Form groups with friends. Your failure costs them — your wins lift the whole circle.",
  },
];

export const LEADERBOARD = [
  { rank: 1, name: "Marcus K.", points: 12480, streak: 47, badge: "LEGEND", initials: "MK" },
  { rank: 2, name: "Priya S.", points: 11320, streak: 38, badge: "ELITE", initials: "PS" },
  { rank: 3, name: "Daniel R.", points: 9870, streak: 29, badge: "ELITE", initials: "DR" },
  { rank: 4, name: "Amara T.", points: 8640, streak: 22, badge: "PRO", initials: "AT" },
  { rank: 5, name: "Lior B.", points: 7290, streak: 19, badge: "PRO", initials: "LB" },
] as const;

export const BADGE_ALPHA: Record<(typeof LEADERBOARD)[number]["badge"], number> = {
  LEGEND: 0.9,
  ELITE: 0.65,
  PRO: 0.45,
};

export const TICKER_ITEMS = [
  "Alex K. committed: Run 5km before 7am — 200 XP staked",
  "Maria S. RESOLVED ✓ — Earned 340 XP",
  "James T. committed: Ship homepage redesign — 500 XP staked",
  "Yuki A. submitted proof — AI validating...",
  "Omar N. RESOLVED ✓ — 47-day streak continues",
  "Fatima B. committed: Read 30 pages daily — 150 XP staked",
  "Dev C. RESOLVED ✓ — Earned 820 XP",
  "Lena M. committed: No social media for 7 days — 300 XP staked",
];

export const PRIMARY_SHADE_SWATCH = [
  "var(--primary-500)",
  "var(--primary-400)",
  "var(--primary-300)",
  "var(--primary-200)",
  "var(--primary-600)",
];

export const LEADERBOARD_ICON = {
  Trophy,
  Flame,
};

