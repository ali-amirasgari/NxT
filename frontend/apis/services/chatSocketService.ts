import { io } from "socket.io-client";

import { getChatServiceBaseUrl } from "@/apis/services/chatServiceUrl";
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
  private refreshRequest: Promise<void> | null = null;
  private authRetried = false;

  private async refreshSession() {
    if (!this.refreshRequest) {
      this.refreshRequest = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unable to refresh session.");
          }
        })
        .finally(() => {
          this.refreshRequest = null;
        });
    }

    return this.refreshRequest;
  }

  getSocket() {
    if (!this.socket) {
      this.socket = io(
        getChatServiceBaseUrl(),
        {
          autoConnect: false,
          withCredentials: true,
          transports: ["websocket", "polling"],
        },
      );
      // Reset the one-shot auth guard whenever a healthy connection is made.
      this.socket.on("connect", () => {
        this.authRetried = false;
      });

      this.socket.on("connect_error", async (error) => {
        const code = (error as Error & { data?: { code?: string } }).data?.code;
        const unauthorized =
          code === "UNAUTHORIZED" ||
          error.message === "Authentication required" ||
          error.message === "Authentication failed";

        if (!unauthorized) return;

        // Try to refresh the session at most ONCE. If the socket still can't
        // authenticate afterwards, stop reconnecting instead of looping
        // /api/auth/refresh forever (and don't bounce the user out of the app).
        if (this.authRetried) {
          this.socket?.disconnect();
          return;
        }

        this.authRetried = true;

        try {
          await this.refreshSession();
          this.socket?.connect();
        } catch {
          this.socket?.disconnect();
        }
      });
    }

    return this.socket;
  }

  connect() {
    const socket = this.getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.authRetried = false;
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
