import { Response } from 'express';
import { AuthenticatedRequest, searchUsers } from '../auth/http';

export const proxyUserSearch = async (request: AuthenticatedRequest, response: Response) => {
    const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';

    if (!search) {
        response.status(400).json({ error: 'search query parameter is required' });
        return;
    }

    const result = await searchUsers(search, request.authToken);

    if (!result.ok) {
        response.status(result.status).json(result.data ?? { error: 'User search failed' });
        return;
    }

    response.json(result.data);
};
