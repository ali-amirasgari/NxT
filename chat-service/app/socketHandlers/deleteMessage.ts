import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    emitConversationUpdated,
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getValidMessageId,
    getValidRoom,
} from './utils';

export const handleDeleteMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'delete_message');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'delete_message', data?.room);
        const messageId = getValidMessageId(socket, 'delete_message', data?.messageId);

        if (!room || !messageId) {
            return;
        }

        if (!await getConversationMembership(socket, 'delete_message', room)) {
            return;
        }

        const existingMessage = await Message.findOne({ _id: messageId, room });
        if (!existingMessage) {
            emitSocketError(socket, 'delete_message', 'not_found', 'Message not found.');
            return;
        }

        if (existingMessage.userId !== authUser.id && !authUser.isStaff) {
            emitSocketError(socket, 'delete_message', 'unauthorized', 'You cannot delete this message.');
            return;
        }

        existingMessage.deleted = true;
        await existingMessage.save();
        io.to(room).emit('message_deleted', { messageId, room });
        await emitConversationUpdated(io, room);
    } catch (error) {
        console.error('❌ Error occurred while deleting message:', error);
        emitSocketError(socket, 'delete_message', 'error', 'Failed to delete message.');
    }
};
