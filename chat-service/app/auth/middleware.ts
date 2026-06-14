import { Socket } from 'socket.io';
import { extractAccessTokenFromCookieHeader } from './cookies';
import { AuthenticatedSocketData, AuthenticatedUserIdentity } from './types';
import { mapAuthServiceUserIdentity } from './userIdentity';

type AuthenticatedSocket = Socket<any, any, any, AuthenticatedSocketData>;

const getAuthServiceUrl = (): string => {
    const authServiceUrl = process.env.AUTH_SERVICE_URL?.trim();

    if (!authServiceUrl) {
        throw new Error('AUTH_SERVICE_URL is not configured');
    }

    return authServiceUrl.replace(/\/+$/, '');
};

const fetchAuthenticatedUser = async (token: string): Promise<AuthenticatedUserIdentity | null> => {
    const response = await fetch(`${getAuthServiceUrl()}/users/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        return null;
    }

    const payload = (await response.json()) as unknown;

    if (!payload || typeof payload !== 'object') {
        return null;
    }

    return mapAuthServiceUserIdentity(payload as Record<string, unknown>);
};

const createUnauthorizedError = (message: string): Error & { data?: { code: string } } => {
    const error = new Error(message) as Error & { data?: { code: string } };
    error.data = { code: 'UNAUTHORIZED' };
    return error;
};

export const authenticateSocket = async (
    socket: AuthenticatedSocket,
    next: (error?: Error) => void
): Promise<void> => {
    try {
        const token = extractAccessTokenFromCookieHeader(socket.handshake.headers.cookie);

        if (!token) {
            next(createUnauthorizedError('Authentication required'));
            return;
        }

        const user = await fetchAuthenticatedUser(token);

        if (!user) {
            next(createUnauthorizedError('Authentication required'));
            return;
        }

        socket.data.user = user;
        next();
    } catch (error) {
        console.error('❌ Socket authentication failed:', error);
        next(createUnauthorizedError('Authentication failed'));
    }
};
