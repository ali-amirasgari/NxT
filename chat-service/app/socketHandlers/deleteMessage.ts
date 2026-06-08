import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleDeleteMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, messageId } = data;
        const deletedMessage = await Message.findOneAndUpdate(
            { _id: messageId, room },
            { $set: { deleted: true } },
            { new: true },
        );

        if (deletedMessage) {
            io.to(room).emit('message_deleted', { messageId, room });
        }
    } catch (error) {
        console.error('❌ Error occurred while deleting message:', error);
    }
};
