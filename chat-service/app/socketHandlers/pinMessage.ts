import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handlePinMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, messageId, pinned } = data;
        const updatedMessage = await Message.findOneAndUpdate(
            { _id: messageId, room },
            { $set: { pinned: Boolean(pinned) } },
            { new: true },
        );

        if (updatedMessage) {
            io.to(room).emit('message_pinned', updatedMessage);
        }
    } catch (error) {
        console.error('❌ Error occurred while pinning message:', error);
    }
};
