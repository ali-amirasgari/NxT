import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleUploadImage = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, user, imageUrl, message = 'Image shared' } = data;

        if (!imageUrl) {
            return;
        }

        const newMessage = new Message({
            room,
            user,
            message,
            imageUrl,
            pinned: false,
            edited: false,
            deleted: false,
        });

        await newMessage.save();
        io.to(room).emit('newMessage', newMessage);
    } catch (error) {
        console.error('❌ Error occurred while uploading image:', error);
    }
};
