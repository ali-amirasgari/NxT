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
