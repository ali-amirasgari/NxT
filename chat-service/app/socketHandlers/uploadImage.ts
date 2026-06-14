import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';
import {
    createNotificationsForConversation,
    emitConversationUpdated,
    emitSocketError,
    getAuthenticatedUser,
    getConversationMembership,
    getOptionalString,
    getValidImageUrl,
    getValidRoom,
} from './utils';

export const handleUploadImage = async (io: Server, socket: Socket, data: any) => {
    try {
        const authUser = getAuthenticatedUser(socket, 'upload_image');
        if (!authUser) {
            return;
        }

        const room = getValidRoom(socket, 'upload_image', data?.room);
        if (!room) {
            return;
        }

        const membership = await getConversationMembership(socket, 'upload_image', room);
        if (!membership) {
            return;
        }

        const imageUrl = getValidImageUrl(socket, 'upload_image', data?.imageUrl);
        if (!imageUrl) {
            return;
        }

        const newMessage = new Message({
            room,
            userId: authUser.id,
            user: authUser.username,
            message: getOptionalString(data?.message, 'Image shared') || 'Image shared',
            imageUrl,
            pinned: false,
            edited: false,
            deleted: false,
        });

        await newMessage.save();
        io.to(room).emit('newMessage', newMessage);
        await emitConversationUpdated(io, room);
        await createNotificationsForConversation(io, room, authUser, newMessage, membership.conversation.members ?? []);
    } catch (error) {
        console.error('❌ Error occurred while uploading image:', error);
        emitSocketError(socket, 'upload_image', 'error', 'Failed to upload image.');
    }
};
