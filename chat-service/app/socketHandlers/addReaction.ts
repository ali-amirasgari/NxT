import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    emitConversationUpdated,
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getOptionalString,
    getValidMessageId,
    getValidRoom,
} from './utils';

export const handleAddReaction = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'add_reaction');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'add_reaction', data?.room);
        const messageId = getValidMessageId(socket, 'add_reaction', data?.messageId);
        const emoji = getOptionalString(data?.emoji);

        if (!room || !messageId) {
            return;
        }

        if (!await getConversationMembership(socket, 'add_reaction', room)) {
            return;
        }

        if (emoji === '') {
            emitSocketError(socket, 'add_reaction', 'invalid', 'A valid emoji is required.');
            return;
        }

        const message = await Message.findOne({ _id: messageId, room });

        if (!message) {
            emitSocketError(socket, 'add_reaction', 'not_found', 'Message not found.');
            return;
        }

        const currentReactions = message.reactions ?? {};
        const emojiUsers = currentReactions[emoji] ?? [];

        if (!emojiUsers.includes(authUser.id)) {
            currentReactions[emoji] = [...emojiUsers, authUser.id];
        }

        message.reactions = currentReactions;
        await message.save();
        io.to(room).emit('message_reaction_updated', message);
        await emitConversationUpdated(io, room);
    } catch (error) {
        console.error('❌ Error occurred while adding reaction:', error);
        emitSocketError(socket, 'add_reaction', 'error', 'Failed to add reaction.');
    }
};
