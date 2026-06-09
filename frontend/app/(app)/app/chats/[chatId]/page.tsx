import { ChatDetail } from "@/components/page/chats/chat-detail";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  return <ChatDetail chatId={chatId} />;
}
