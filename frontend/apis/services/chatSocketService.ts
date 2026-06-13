import { io } from "socket.io-client";

import type {
  AddReactionPayload,
  ChatSocket,
  DeleteMessagePayload,
  EditMessagePayload,
  PinMessagePayload,
  SendMessagePayload,
  UploadImagePayload,
} from "@/apis/types/chat";

class ChatSocketService {
  private socket: ChatSocket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(
        process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ?? "http://localhost:3000",
        {
          autoConnect: false,
          transports: ["websocket", "polling"],
        },
      );
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinRoom(room: string) {
    this.connect().emit("join_room", room);
  }

  sendMessage(payload: SendMessagePayload) {
    this.connect().emit("send_message", payload);
  }

  editMessage(payload: EditMessagePayload) {
    this.connect().emit("edit_message", payload);
  }

  deleteMessage(payload: DeleteMessagePayload) {
    this.connect().emit("delete_message", payload);
  }

  addReaction(payload: AddReactionPayload) {
    this.connect().emit("add_reaction", payload);
  }

  pinMessage(payload: PinMessagePayload) {
    this.connect().emit("pin_message", payload);
  }

  uploadImage(payload: UploadImagePayload) {
    this.connect().emit("upload_image", payload);
  }
}

const chatSocketService = new ChatSocketService();

export default chatSocketService;
