const COOKIE_NAMES = ['access_token', 'nxt_access'] as const;

export const extractAccessTokenFromCookieHeader = (cookieHeader?: string): string | null => {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .filter(Boolean);

    for (const cookieName of COOKIE_NAMES) {
        const match = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

        if (!match) {
            continue;
        }

        const rawValue = match.slice(cookieName.length + 1).trim();

        if (!rawValue) {
            continue;
        }

        try {
            return decodeURIComponent(rawValue);
        } catch {
            return rawValue;
        }
    }

    return null;
};
