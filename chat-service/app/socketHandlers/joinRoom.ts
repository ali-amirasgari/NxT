import { Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getValidRoom,
    updateMemberLastReadAt,
} from './utils';

export const handleJoinRoom = async (socket: Socket, room: string) => {
    const validRoom = getValidRoom(socket, 'join_room', room);
    if (!validRoom) {
        return;
    }

    try {
        const authUser = getAuthenticatedUser(socket, 'join_room');
        if (!authUser) {
            return;
        }

        if (!await getConversationMembership(socket, 'join_room', validRoom)) {
            return;
        }

        await updateMemberLastReadAt(validRoom, authUser.id);

        socket.join(validRoom);
        console.log(`📥 Client ${socket.id} joined room: ${validRoom}`);

        const messagesHistory = await Message.find({ room: validRoom, deleted: false }).sort({ timestamp: 1 }).limit(100);
        socket.emit('room_history', messagesHistory);
    } catch (error) {
        console.error('❌ Error occurred while joining room:', error);
        emitSocketError(socket, 'join_room', 'error', 'Failed to join room.');
    }
};
