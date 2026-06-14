import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export type SocketEventName =
    | 'add_reaction'
    | 'delete_message'
    | 'edit_message'
    | 'join_room'
    | 'pin_message'
    | 'send_message'
    | 'upload_image';

type SocketErrorCode = 'unauthorized' | 'invalid' | 'not_found' | 'error';

export interface AuthenticatedSocketUser {
    id: string;
    username: string;
    email: string;
    isStaff: boolean;
}

type ConversationMember = {
    userId: string;
    username?: string;
    email?: string;
    role?: string;
    lastReadAt?: Date;
};

type ConversationDocument = {
    _id: unknown;
    room?: string;
    members?: ConversationMember[];
    lastMessage?: unknown;
    save?: () => Promise<unknown>;
};

type NotificationDocument = {
    countDocuments: (filter: Record<string, unknown>) => Promise<number>;
    create: (payload: Record<string, unknown>) => Promise<unknown>;
};

export const emitSocketError = (
    socket: Socket,
    event: SocketEventName,
    code: SocketErrorCode,
    message: string,
) => {
    socket.emit('socket_error', { event, code, message });
};

export const getUserRoom = (userId: string) => `user:${userId}`;

export const getAuthenticatedUser = (
    socket: Socket,
    event: SocketEventName,
): AuthenticatedSocketUser | null => {
    const user = socket.data.user as Partial<AuthenticatedSocketUser> | undefined;

    if (!user?.id || !user.username || !user.email || typeof user.isStaff !== 'boolean') {
        emitSocketError(socket, event, 'unauthorized', 'Authentication required.');
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        isStaff: user.isStaff,
    };
};

export const getValidRoom = (
    socket: Socket,
    event: SocketEventName,
    room: unknown,
): string | null => {
    if (typeof room !== 'string' || room.trim() === '') {
        emitSocketError(socket, event, 'invalid', 'A valid room is required.');
        return null;
    }

    return room.trim();
};

export const getValidMessageId = (
    socket: Socket,
    event: SocketEventName,
    messageId: unknown,
): string | null => {
    if (typeof messageId !== 'string' || messageId.trim() === '') {
        emitSocketError(socket, event, 'invalid', 'A valid messageId is required.');
        return null;
    }

    return messageId.trim();
};

export const getOptionalString = (value: unknown, fallback = ''): string => {
    return typeof value === 'string' ? value.trim() : fallback;
};

export const getValidMessageContent = (
    socket: Socket,
    event: SocketEventName,
    message: unknown,
    imageUrl?: unknown,
): string | null => {
    if (typeof message !== 'string') {
        emitSocketError(socket, event, 'invalid', 'A valid message is required.');
        return null;
    }

    const normalizedMessage = message.trim();
    const normalizedImageUrl = getOptionalString(imageUrl);

    if (normalizedMessage === '' && normalizedImageUrl === '') {
        emitSocketError(socket, event, 'invalid', 'Message content is required.');
        return null;
    }

    return normalizedMessage;
};

export const getValidImageUrl = (
    socket: Socket,
    event: SocketEventName,
    imageUrl: unknown,
): string | null => {
    if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        emitSocketError(socket, event, 'invalid', 'A valid imageUrl is required.');
        return null;
    }

    return imageUrl.trim();
};

const getRegisteredModel = <T>(modelName: string): T => {
    const model = mongoose.models[modelName];

    if (!model) {
        throw new Error(`${modelName} model is not registered.`);
    }

    return model as T;
};

export const getConversationModel = () => getRegisteredModel<any>('Conversation');

export const getChatNotificationModel = () => getRegisteredModel<NotificationDocument>('ChatNotification');

export const getConversationMembership = async (
    socket: Socket,
    event: SocketEventName,
    room: string,
): Promise<{ conversation: ConversationDocument; member: ConversationMember } | null> => {
    const authUser = getAuthenticatedUser(socket, event);
    if (!authUser) {
        return null;
    }

    const Conversation = getConversationModel();
    const conversation = await Conversation.findOne({
        _id: room,
        'members.userId': authUser.id,
    });

    if (!conversation) {
        emitSocketError(socket, event, 'unauthorized', 'You are not a member of this conversation.');
        return null;
    }

    const member = Array.isArray(conversation.members)
        ? conversation.members.find((item: ConversationMember) => item.userId === authUser.id)
        : null;

    if (!member) {
        emitSocketError(socket, event, 'unauthorized', 'You are not a member of this conversation.');
        return null;
    }

    return { conversation, member };
};

export const updateConversationLastMessage = async (room: string) => {
    const Conversation = getConversationModel();

    const conversation = await Conversation.findById(room);
    if (!conversation) {
        return null;
    }

    const latestMessage = await Message.findOne({ room, deleted: false }).sort({ timestamp: -1 });

    conversation.lastMessage = latestMessage
        ? {
            _id: latestMessage._id,
            room: latestMessage.room,
            userId: latestMessage.userId,
            user: latestMessage.user,
            message: latestMessage.message,
            imageUrl: latestMessage.imageUrl,
            replyTo: latestMessage.replyTo,
            mentions: latestMessage.mentions,
            reactions: latestMessage.reactions,
            pinned: latestMessage.pinned,
            edited: latestMessage.edited,
            deleted: latestMessage.deleted,
            timestamp: latestMessage.timestamp,
            editedAt: latestMessage.editedAt,
        }
        : null;

    await conversation.save?.();
    return conversation;
};

export const emitConversationUpdated = async (io: Server, room: string) => {
    const conversation = await updateConversationLastMessage(room);

    if (conversation) {
        io.to(room).emit('conversation:updated', conversation);
    }

    return conversation;
};

export const updateMemberLastReadAt = async (room: string, userId: string) => {
    const Conversation = getConversationModel();

    return Conversation.findOneAndUpdate(
        { _id: room, 'members.userId': userId },
        { $set: { 'members.$.lastReadAt': new Date() } },
        { new: true },
    );
};

export const emitUnreadCount = async (io: Server, userId: string) => {
    const ChatNotification = getChatNotificationModel();
    const unreadCount = await ChatNotification.countDocuments({
        userId,
        readAt: null,
    });

    io.to(getUserRoom(userId)).emit('notification:unread_count', {
        userId,
        unreadCount,
    });
};

export const createNotificationsForConversation = async (
    io: Server,
    room: string,
    actor: AuthenticatedSocketUser,
    message: {
        _id: unknown;
        message: string;
        imageUrl?: string;
        timestamp?: Date;
    },
    members: ConversationMember[],
) => {
    const ChatNotification = getChatNotificationModel();
    const recipients = members.filter((member) => member.userId && member.userId !== actor.id);

    await Promise.all(recipients.map(async (member) => {
        const notification = await ChatNotification.create({
            userId: member.userId,
            conversationId: room,
            type: 'message_received',
            title: `New message from ${actor.username}`,
            body: message.message || 'Shared an attachment',
            data: {
                messageId: String(message._id),
                senderId: actor.id,
                senderUsername: actor.username,
                imageUrl: message.imageUrl ?? '',
            },
            readAt: null,
        });

        io.to(getUserRoom(member.userId)).emit('notification:new', notification);
        await emitUnreadCount(io, member.userId);
    }));
};
