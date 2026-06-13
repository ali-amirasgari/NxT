import { Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleJoinRoom = async (socket: Socket, room: string) => {
    socket.join(room);
    console.log(`📥 Client ${socket.id} joined room: ${room}`);

    try {
        const messagesHistory = await Message.find({ room, deleted: false }).sort({ timestamp: 1 }).limit(100);
        socket.emit('room_history', messagesHistory);
    } catch (error) {
        console.error('❌ Error occurred while joining room:', error);
    }
};
