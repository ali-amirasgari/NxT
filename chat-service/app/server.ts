import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from '../config/database';
import { registerSocketHandlers } from './socket';
import { authenticateSocket } from './auth/middleware';
import { AuthenticatedSocketData } from './auth/types';
import { createConversationRouter } from './routes/conversationRoutes';
import { createNotificationRouter } from './routes/notificationRoutes';
import { createUserRouter } from './routes/userRoutes';

const getAllowedOrigins = (): string[] =>
    (process.env.CHAT_CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const app = express();
const allowedOrigins = getAllowedOrigins();

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'chat-service' });
});

const server = http.createServer(app);
const io = new Server<any, any, any, AuthenticatedSocketData>(server, {
    maxHttpBufferSize: 8 * 1024 * 1024,
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

io.use(authenticateSocket);
registerSocketHandlers(io);

app.use('/conversations', createConversationRouter(io));
app.use('/notifications', createNotificationRouter());
app.use('/users', createUserRouter());

connectDatabase();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
