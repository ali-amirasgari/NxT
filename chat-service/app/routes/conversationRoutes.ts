import { RequestHandler, Router } from 'express';
import { Server } from 'socket.io';
import { requireHttpAuth } from '../auth/httpMiddleware';
import { createConversationsController } from '../controllers/conversationsController';

const handler = (value: unknown) => value as RequestHandler;

export const createConversationRouter = (io: Server) => {
    const router = Router();
    const controller = createConversationsController(io);

    router.use(requireHttpAuth);
    router.get('/', handler(controller.getConversations));
    router.get('/:id', handler(controller.getConversation));
    router.post('/direct', handler(controller.createDirectConversation));
    router.post('/group', handler(controller.createGroupConversation));
    router.patch('/:id', handler(controller.updateConversationMetadata));
    router.post('/:id/members', handler(controller.addMembers));
    router.patch('/:id/members/:userId', handler(controller.updateMember));
    router.delete('/:id/members/:userId', handler(controller.removeMember));

    return router;
};
