import { Request } from 'express';
import { extractAccessTokenFromCookieHeader } from './cookies';
import { AuthenticatedUserIdentity } from './types';
import { mapAuthServiceUserIdentity } from './userIdentity';

export interface AuthenticatedRequest extends Request {
    authToken: string;
    user: AuthenticatedUserIdentity;
}

const getAuthServiceUrl = (): string => {
    const authServiceUrl = process.env.AUTH_SERVICE_URL?.trim();

    if (!authServiceUrl) {
        throw new Error('AUTH_SERVICE_URL is not configured');
    }

    return authServiceUrl.replace(/\/+$/, '');
};

export const getRequestAccessToken = (request: Request): string | null => {
    const authorizationHeader = request.header('authorization');

    if (authorizationHeader?.startsWith('Bearer ')) {
        const bearerToken = authorizationHeader.slice('Bearer '.length).trim();

        if (bearerToken) {
            return bearerToken;
        }
    }

    return extractAccessTokenFromCookieHeader(request.headers.cookie);
};

const readJson = async (response: Response): Promise<unknown> => {
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
        return null;
    }

    return response.json();
};

export const fetchAuthenticatedUser = async (
    token: string
): Promise<AuthenticatedUserIdentity | null> => {
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

    const payload = await readJson(response);

    if (!payload || typeof payload !== 'object') {
        return null;
    }

    return mapAuthServiceUserIdentity(payload as Record<string, unknown>);
};

export interface AuthBackendUser {
    id: string;
    username: string;
    email: string;
    isStaff: boolean;
}

export const fetchAuthBackendJson = async <T>(
    path: string,
    token: string,
    init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null }> => {
    const response = await fetch(`${getAuthServiceUrl()}${path}`, {
        ...init,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            ...(init?.headers ?? {}),
        },
    });

    const data = (await readJson(response)) as T | null;

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
};

const mapAuthBackendUser = (payload: unknown): AuthBackendUser | null => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    return mapAuthServiceUserIdentity(payload as Record<string, unknown>);
};

export const fetchUserById = async (
    userId: string,
    token: string
): Promise<AuthBackendUser | null> => {
    const response = await fetchAuthBackendJson<unknown>(`/users/${encodeURIComponent(userId)}`, token);

    if (!response.ok) {
        return null;
    }

    if (Array.isArray(response.data)) {
        return null;
    }

    return mapAuthBackendUser(response.data);
};

export const searchUsers = async (
    search: string,
    token: string
): Promise<{ ok: boolean; status: number; data: unknown }> => {
    const response = await fetchAuthBackendJson<unknown>(
        `/users?search=${encodeURIComponent(search)}`,
        token
    );

    return {
        ok: response.ok,
        status: response.status,
        data: response.data,
    };
};
