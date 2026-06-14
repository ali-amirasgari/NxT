import { RequestHandler, Router } from 'express';
import { requireHttpAuth } from '../auth/httpMiddleware';
import { proxyUserSearch } from '../controllers/usersController';

const handler = (value: unknown) => value as RequestHandler;

export const createUserRouter = () => {
    const router = Router();

    router.use(requireHttpAuth);
    router.get('/', handler(proxyUserSearch));

    return router;
};
