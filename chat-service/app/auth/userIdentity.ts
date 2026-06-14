import { AuthenticatedUserIdentity } from './types';

interface AuthServiceUserResponse {
    id?: unknown;
    user_id?: unknown;
    _id?: unknown;
    username?: unknown;
    email?: unknown;
    is_staff?: unknown;
    isStaff?: unknown;
}

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const normalizeId = (value: unknown): string | null => {
    if (isNonEmptyString(value)) {
        return value.trim();
    }

    if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
        return String(value);
    }

    return null;
};

export const mapAuthServiceUserIdentity = (
    payload: Record<string, unknown>
): AuthenticatedUserIdentity | null => {
    const rawUser =
        payload.user && typeof payload.user === 'object'
            ? (payload.user as AuthServiceUserResponse)
            : (payload as AuthServiceUserResponse);
    const id =
        normalizeId(rawUser.id) ??
        normalizeId(rawUser.user_id) ??
        normalizeId(rawUser._id);
    const username = isNonEmptyString(rawUser.username) ? rawUser.username.trim() : null;
    const email = isNonEmptyString(rawUser.email) ? rawUser.email.trim() : null;
    const isStaff =
        typeof rawUser.is_staff === 'boolean'
            ? rawUser.is_staff
            : rawUser.isStaff;

    if (!id || !username || !email || typeof isStaff !== 'boolean') {
        return null;
    }

    return {
        id,
        username,
        email,
        isStaff,
    };
};
