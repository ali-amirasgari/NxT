import { Server, Socket } from 'socket.io';
import {
    handleAddReaction,
    handleDeleteMessage,
    handleEditMessage,
    handleJoinRoom,
    handlePinMessage,
    handleSendMessage,
    handleUploadImage,
} from './socketHandlers'

export const registerSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('🔌 New client connected:', socket.id);

        socket.on('join_room', async (room: string) => {
            await handleJoinRoom(socket, room);
        });

        socket.on('send_message', async (data: any) => {
            await handleSendMessage(io, socket, data);
        });

        socket.on('edit_message', async (data: any) => {
            await handleEditMessage(io, socket, data);
        });

        socket.on('delete_message', async (data: any) => {
            await handleDeleteMessage(io, socket, data);
        });

        socket.on('add_reaction', async (data: any) => {
            await handleAddReaction(io, socket, data);
        });

        socket.on('pin_message', async (data: any) => {
            await handlePinMessage(io, socket, data);
        });

        socket.on('upload_image', async (data: any) => {
            await handleUploadImage(io, socket, data);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
};
