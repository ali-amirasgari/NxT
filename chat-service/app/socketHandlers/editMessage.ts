import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleEditMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, messageId, message = '', imageUrl = '' } = data;
        const updatedMessage = await Message.findOneAndUpdate(
            { _id: messageId, room },
            { $set: { message, imageUrl, edited: true, editedAt: new Date() } },
            { new: true },
        );

        if (updatedMessage) {
            io.to(room).emit('message_edited', updatedMessage);
        }
    } catch (error) {
        console.error('❌ Error occurred while editing message:', error);
    }
};
