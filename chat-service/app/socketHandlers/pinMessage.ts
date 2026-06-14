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

export const handlePinMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'pin_message');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'pin_message', data?.room);
        const messageId = getValidMessageId(socket, 'pin_message', data?.messageId);

        if (!room || !messageId) {
            return;
        }

        if (!await getConversationMembership(socket, 'pin_message', room)) {
            return;
        }

        const updatedMessage = await Message.findOneAndUpdate(
            { _id: messageId, room },
            { $set: { pinned: Boolean(data?.pinned) } },
            { new: true },
        );

        if (!updatedMessage) {
            emitSocketError(socket, 'pin_message', 'not_found', 'Message not found.');
            return;
        }

        io.to(room).emit('message_pinned', updatedMessage);
        await emitConversationUpdated(io, room);
    } catch (error) {
        console.error('❌ Error occurred while pinning message:', error);
        emitSocketError(socket, 'pin_message', 'error', 'Failed to pin message.');
    }
};
