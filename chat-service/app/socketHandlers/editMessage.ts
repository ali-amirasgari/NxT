import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    emitConversationUpdated,
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getOptionalString,
    getValidMessageContent,
    getValidMessageId,
    getValidRoom,
} from './utils';

export const handleEditMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'edit_message');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'edit_message', data?.room);
        const messageId = getValidMessageId(socket, 'edit_message', data?.messageId);
        const imageUrl = getOptionalString(data?.imageUrl);
        const message = getValidMessageContent(socket, 'edit_message', data?.message ?? '', imageUrl);

        if (!room || !messageId || message === null) {
            return;
        }

        if (!await getConversationMembership(socket, 'edit_message', room)) {
            return;
        }

        const existingMessage = await Message.findOne({ _id: messageId, room });
        if (!existingMessage) {
            emitSocketError(socket, 'edit_message', 'not_found', 'Message not found.');
            return;
        }

        if (existingMessage.userId !== authUser.id && !authUser.isStaff) {
            emitSocketError(socket, 'edit_message', 'unauthorized', 'You cannot edit this message.');
            return;
        }

        existingMessage.message = message;
        existingMessage.imageUrl = imageUrl;
        existingMessage.edited = true;
        existingMessage.editedAt = new Date();
        await existingMessage.save();

        io.to(room).emit('message_edited', existingMessage);
        await emitConversationUpdated(io, room);
    } catch (error) {
        console.error('❌ Error occurred while editing message:', error);
        emitSocketError(socket, 'edit_message', 'error', 'Failed to edit message.');
    }
};
