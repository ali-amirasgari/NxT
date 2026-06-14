export interface AuthenticatedUserIdentity {
    id: string;
    username: string;
    email: string;
    isStaff: boolean;
}

export interface AuthenticatedSocketData {
    user: AuthenticatedUserIdentity;
}
