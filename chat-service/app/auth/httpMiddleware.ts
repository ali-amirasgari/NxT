import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, fetchAuthenticatedUser, getRequestAccessToken } from './http';

export const requireHttpAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = getRequestAccessToken(request);

        if (!token) {
            response.status(401).json({ error: 'Authentication required' });
            return;
        }

        const user = await fetchAuthenticatedUser(token);

        if (!user) {
            response.status(401).json({ error: 'Authentication required' });
            return;
        }

        const authenticatedRequest = request as AuthenticatedRequest;
        authenticatedRequest.authToken = token;
        authenticatedRequest.user = user;
        next();
    } catch (error) {
        console.error('❌ HTTP authentication failed:', error);
        response.status(500).json({ error: 'Authentication failed' });
    }
};
