export type PublicUser = {
  id: string;
  name: string;
  username: string;
  initial: string;
  bio: string;
  stats: {
    posts: string;
    goals: string;
    points: string;
    streak: string;
  };
  interests: string[];
};

export const publicUsers: PublicUser[] = [
  {
    id: "alex-carter",
    name: "Alex Carter",
    username: "@alex_carter",
    initial: "A",
    bio: "Fitness, coding, and daily proof. Building momentum in public.",
    stats: {
      posts: "18",
      goals: "3",
      points: "1.2k",
      streak: "12",
    },
    interests: ["Fitness", "Coding", "Books"],
  },
  {
    id: "nima-goals",
    name: "nima_goals",
    username: "@nima_goals",
    initial: "N",
    bio: "Group challenges, finish bets, and accountability streaks.",
    stats: {
      posts: "24",
      goals: "5",
      points: "2.4k",
      streak: "19",
    },
    interests: ["Group goals", "Fitness", "Focus"],
  },
  {
    id: "mina",
    name: "Mina",
    username: "@mina",
    initial: "M",
    bio: "Learning goals, reading proof, and calm consistency.",
    stats: {
      posts: "11",
      goals: "2",
      points: "840",
      streak: "8",
    },
    interests: ["Learning", "Reading", "Mindfulness"],
  },
];

export function getPublicUser(userId: string) {
  return publicUsers.find((user) => user.id === userId);
}

export function getUserIdByName(name: string) {
  const normalized = name.toLowerCase().replace(/^@/, "");

  return (
    publicUsers.find(
      (user) =>
        user.name.toLowerCase() === normalized ||
        user.username.toLowerCase().replace(/^@/, "") === normalized,
    )?.id ?? "alex-carter"
  );
}
