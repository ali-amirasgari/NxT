import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleSendMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, user, message = '', imageUrl = '', replyTo = '', mentions = [], reactions = {} } = data;

        const newMessage = new Message({
            room,
            user,
            message,
            imageUrl,
            replyTo,
            mentions,
            reactions,
            pinned: false,
            edited: false,
            deleted: false,
        });

        await newMessage.save();
        io.to(room).emit('newMessage', newMessage);
        console.log(`📤 Message from ${user} in room ${room}: ${message || (imageUrl ? 'image attachment' : '')}`);
    } catch (error) {
        console.error('❌ Error occurred while sending message:', error);
    }
};
