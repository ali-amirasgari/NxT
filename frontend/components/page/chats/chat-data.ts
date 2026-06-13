export type ChatRecord = {
  id: string;
  name: string;
  initial: string;
  preview: string;
  time: string;
  unread: boolean;
  tone: "green" | "orange" | "blue" | "violet";
  status: string;
  imageDataUrl?: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  time?: string;
  sender: "me" | "other";
  kind?: "message" | "bet";
};

export const chats: ChatRecord[] = [
  {
    id: "nima-goals",
    name: "nima_goals",
    initial: "N",
    preview: "Bet deadline moved to Friday",
    time: "2m",
    unread: true,
    tone: "green",
    status: "Online · goal accountability",
  },
  {
    id: "alex-carter",
    name: "Alex Carter",
    initial: "A",
    preview: "Shared proof for Run 5km",
    time: "18m",
    unread: true,
    tone: "orange",
    status: "Active now",
  },
  {
    id: "team-sprint",
    name: "Team Sprint",
    initial: "T",
    preview: "3 new messages in group goal",
    time: "1h",
    unread: true,
    tone: "blue",
    status: "4 members · group goal",
  },
  {
    id: "mina",
    name: "Mina",
    initial: "M",
    preview: "Can I join your coding goal?",
    time: "3h",
    unread: true,
    tone: "violet",
    status: "Last active 1h ago",
  },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "message-1",
    text: "Hey, did you finish today’s sprint proof?",
    time: "10:24",
    sender: "other",
  },
  {
    id: "message-2",
    text: "Yes, uploaded it. I’m keeping the streak alive.",
    time: "10:28",
    sender: "me",
  },
  {
    id: "message-3",
    text: "Nice. I’m betting you can hit day 30 without missing.",
    sender: "other",
  },
  {
    id: "bet-1",
    text: "Nima bets 80 pts on your streak",
    sender: "other",
    kind: "bet",
  },
  {
    id: "message-4",
    text: "Deal. I’ll send proof every night.",
    sender: "me",
  },
];

export function getChatById(chatId: string) {
  return chats.find((chat) => chat.id === chatId);
}
