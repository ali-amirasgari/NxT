import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    createNotificationsForConversation,
    emitConversationUpdated,
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getOptionalString,
    getValidMessageContent,
    getValidRoom,
} from './utils';

export const handleSendMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'send_message');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'send_message', data?.room);
        if (!room) {
            return;
        }

        const membership = await getConversationMembership(socket, 'send_message', room);
        if (!membership) {
            return;
        }

        const imageUrl = getOptionalString(data?.imageUrl);
        const message = getValidMessageContent(socket, 'send_message', data?.message ?? '', imageUrl);
        if (message === null) {
            return;
        }

        const newMessage = new Message({
            room,
            userId: authUser.id,
            user: authUser.username,
            message,
            imageUrl,
            replyTo: getOptionalString(data?.replyTo),
            mentions: Array.isArray(data?.mentions)
                ? data.mentions.filter((mention: unknown): mention is string => typeof mention === 'string' && mention.trim() !== '')
                : [],
            reactions: {},
            pinned: false,
            edited: false,
            deleted: false,
        });

        await newMessage.save();
        io.to(room).emit('newMessage', newMessage);
        await emitConversationUpdated(io, room);
        await createNotificationsForConversation(io, room, authUser, newMessage, membership.conversation.members ?? []);
        console.log(`📤 Message from ${authUser.username} in room ${room}: ${message || (imageUrl ? 'image attachment' : '')}`);
    } catch (error) {
        console.error('❌ Error occurred while sending message:', error);
        emitSocketError(socket, 'send_message', 'error', 'Failed to send message.');
    }
};
