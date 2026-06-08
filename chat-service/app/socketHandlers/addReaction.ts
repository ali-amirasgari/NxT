import { Server, Socket } from 'socket.io';
import Message from '../../models/Message';

export const handleAddReaction = async (io: Server, socket: Socket, data: any) => {
    try {
        const { room, messageId, emoji, user } = data;
        const message = await Message.findOne({ _id: messageId, room });

        if (!message) {
            return;
        }

        const currentReactions = message.reactions ?? {};
        const emojiUsers = currentReactions[emoji] ?? [];

        if (!emojiUsers.includes(user)) {
            currentReactions[emoji] = [...emojiUsers, user];
        }

        message.reactions = currentReactions;
        await message.save();
        io.to(room).emit('message_reaction_updated', message);
    } catch (error) {
        console.error('❌ Error occurred while adding reaction:', error);
    }
};
