export type DetailComment = {
  id: string;
  author: string;
  initial: string;
  text: string;
  timestamp: string;
  tone: "green" | "orange" | "violet";
};

export const detailComments: DetailComment[] = [
  {
    id: "nima",
    author: "nima_goals",
    initial: "N",
    text: "This sprint is hard but the streak feels real.",
    timestamp: "12m",
    tone: "green",
  },
  {
    id: "alex",
    author: "Alex Carter",
    initial: "A",
    text: "I’m joining this goal too. 80 pts keeps it serious.",
    timestamp: "8m",
    tone: "orange",
  },
  {
    id: "mina",
    author: "Mina",
    initial: "M",
    text: "Can you share your proof template?",
    timestamp: "2m",
    tone: "violet",
  },
];

export type ShareContact = {
  id: string;
  name: string;
  initial: string;
  meta: string;
  tone: DetailComment["tone"];
};

export const shareContacts: ShareContact[] = [
  {
    id: "nima",
    name: "nima_goals",
    initial: "N",
    meta: "Active goal buddy",
    tone: "green",
  },
  {
    id: "alex",
    name: "Alex Carter",
    initial: "A",
    meta: "Fitness · Coding",
    tone: "orange",
  },
  {
    id: "mina",
    name: "Mina",
    initial: "M",
    meta: "Following your goals",
    tone: "violet",
  },
];
