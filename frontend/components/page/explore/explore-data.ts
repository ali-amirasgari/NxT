export type ExploreCategory = "for-you" | "fitness" | "coding" | "proof";

export type ExploreTile = {
  id: string;
  label: string;
  category: Exclude<ExploreCategory, "for-you">;
  media: "image" | "video";
  tone: "primary" | "secondary" | "muted" | "card";
  size: "large" | "small" | "wide";
  href: string;
  hasCaption?: boolean;
};

export const exploreTiles: ExploreTile[] = [
  {
    id: "morning-run",
    label: "Morning run proof",
    category: "fitness",
    media: "video",
    tone: "primary",
    size: "large",
    href: "/app/posts/morning-run?from=explore",
    hasCaption: true,
  },
  {
    id: "reading-session",
    label: "Reading session proof",
    category: "proof",
    media: "image",
    tone: "secondary",
    size: "small",
    href: "/app/posts/reading-session?from=explore",
  },
  {
    id: "portfolio-progress",
    label: "Portfolio progress",
    category: "coding",
    media: "image",
    tone: "secondary",
    size: "small",
    href: "/app/posts/portfolio-progress?from=explore",
  },
  {
    id: "focus-goal",
    label: "Build in public goal",
    category: "coding",
    media: "video",
    tone: "muted",
    size: "wide",
    href: "/app/goals/focus?from=explore",
    hasCaption: true,
  },
  {
    id: "fitness-proof",
    label: "Fitness photo proof",
    category: "fitness",
    media: "image",
    tone: "card",
    size: "small",
    href: "/app/posts/morning-run?from=explore",
  },
  {
    id: "coding-proof",
    label: "Coding photo proof",
    category: "coding",
    media: "image",
    tone: "primary",
    size: "small",
    href: "/app/posts/portfolio-progress?from=explore",
  },
  {
    id: "reading-goal",
    label: "Daily reading goal",
    category: "proof",
    media: "video",
    tone: "secondary",
    size: "large",
    href: "/app/goals/reading?from=explore",
    hasCaption: true,
  },
  {
    id: "fitness-goal",
    label: "Morning run club",
    category: "fitness",
    media: "image",
    tone: "secondary",
    size: "wide",
    href: "/app/goals/fitness?from=explore",
  },
  {
    id: "focus-session",
    label: "Deep focus proof",
    category: "proof",
    media: "image",
    tone: "muted",
    size: "small",
    href: "/app/posts/portfolio-progress?from=explore",
  },
  {
    id: "run-update",
    label: "Run update",
    category: "fitness",
    media: "video",
    tone: "card",
    size: "small",
    href: "/app/posts/morning-run?from=explore",
    hasCaption: true,
  },
];

export type ExploreSearchResult = {
  id: string;
  type: "account" | "goal" | "tag";
  title: string;
  description: string;
  iconText: string;
  href: string;
};

export const exploreSearchResults: ExploreSearchResult[] = [
  {
    id: "alex-levels-up",
    type: "account",
    title: "alex_levels_up",
    description: "Account · 1.2k points",
    iconText: "A",
    href: "/app/profile?from=explore",
  },
  {
    id: "focus-sprint",
    type: "goal",
    title: "30-Day Focus Sprint",
    description: "Goal · group challenge",
    iconText: "3",
    href: "/app/goals/focus?from=explore",
  },
  {
    id: "fitness-tag",
    type: "tag",
    title: "#fitness",
    description: "Tag · trending",
    iconText: "#",
    href: "/app/explore/search?q=fitness&type=tags",
  },
  {
    id: "coding-tag",
    type: "tag",
    title: "#coding",
    description: "Tag · trending",
    iconText: "#",
    href: "/app/explore/search?q=coding&type=tags",
  },
];

export const suggestedExploreGoals = [
  {
    id: "fitness",
    title: "Morning run club",
    meta: "Group · 80 pts each",
    progress: 64,
  },
  {
    id: "focus",
    title: "Build in public",
    meta: "Active · coding",
    progress: 64,
  },
] as const;
