import { RequestHandler, Router } from 'express';
import { requireHttpAuth } from '../auth/httpMiddleware';
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
} from '../controllers/chatNotificationsController';

const handler = (value: unknown) => value as RequestHandler;

export const createNotificationRouter = () => {
    const router = Router();

    router.use(requireHttpAuth);
    router.get('/', handler(getNotifications));
    router.get('/unread-count', handler(getUnreadNotificationCount));
    router.patch('/:id/read', handler(markNotificationRead));
    router.post('/read-all', handler(markAllNotificationsRead));

    return router;
};
