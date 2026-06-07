export type GoalRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  authorInitial: string;
  meta: string;
  progress: number;
  stake: string;
  schedule: string;
  likes: string;
  comments: string;
};

export type PostRecord = {
  id: string;
  author: string;
  authorInitial: string;
  meta: string;
  title: string;
  caption: string;
  likes: string;
  comments: string;
  timestamp: string;
  mediaTone: "primary" | "secondary" | "muted";
};

export const goals: GoalRecord[] = [
  {
    id: "fitness",
    title: "Run 5km every morning",
    description:
      "Building a consistent morning routine with a verified run before the day starts.",
    category: "Fitness",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "Active goal · started Jun 1",
    progress: 65,
    stake: "200 pts",
    schedule: "Daily · 7:00 AM",
    likes: "48 likes",
    comments: "View all 12 comments",
  },
  {
    id: "reading",
    title: "Read 20 pages",
    description:
      "A daily reading commitment focused on consistency instead of finishing quickly.",
    category: "Learning",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "Daily habit · 14 day streak",
    progress: 42,
    stake: "120 pts",
    schedule: "Daily · before bed",
    likes: "31 likes",
    comments: "View all 8 comments",
  },
  {
    id: "focus",
    title: "Ship portfolio update",
    description:
      "A shared goal to publish the next portfolio version with the team this week.",
    category: "Group goal",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "8 joined · due Friday",
    progress: 64,
    stake: "320 pts",
    schedule: "Deadline · Friday",
    likes: "76 likes",
    comments: "View all 19 comments",
  },
];

export const posts: PostRecord[] = [
  {
    id: "morning-run",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "Fitness · verified proof",
    title: "Morning run complete",
    caption: "5km before breakfast. The streak stays alive.",
    likes: "86 likes",
    comments: "View all 14 comments",
    timestamp: "2 hours ago",
    mediaTone: "primary",
  },
  {
    id: "reading-session",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "Learning · photo proof",
    title: "Twenty pages finished",
    caption: "Small sessions are adding up faster than expected.",
    likes: "43 likes",
    comments: "View all 6 comments",
    timestamp: "Yesterday",
    mediaTone: "secondary",
  },
  {
    id: "portfolio-progress",
    author: "Alex Carter",
    authorInitial: "A",
    meta: "Coding · group update",
    title: "Portfolio is taking shape",
    caption: "The final case study is now ready for review.",
    likes: "112 likes",
    comments: "View all 21 comments",
    timestamp: "2 days ago",
    mediaTone: "muted",
  },
];

export function getGoalById(goalId: string) {
  return goals.find((goal) => goal.id === goalId);
}

export function getPostById(postId: string) {
  return posts.find((post) => post.id === postId);
}
