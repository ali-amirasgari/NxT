import { Response } from 'express';
import { Server } from 'socket.io';
import { Types } from 'mongoose';
import Conversation, {
    ConversationMemberRole,
    IConversation,
    IConversationMember,
} from '../../models/Conversation';
import Message from '../../models/Message';
import ChatNotification, { ChatNotificationType, IChatNotification } from '../../models/ChatNotification';
import { AuthenticatedRequest, AuthBackendUser, fetchUserById } from '../auth/http';

type AuthenticatedSocketServer = Server<any, any, any, any>;

interface NotificationPayloadInput {
    userId: string;
    conversationId: string;
    type: ChatNotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const sortDirectMemberIds = (memberIds: string[]): string => [...memberIds].sort().join(':');

const normalizeNotification = (notification: IChatNotification) => ({
    id: String(notification._id),
    userId: notification.userId,
    conversationId: notification.conversationId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data ?? {},
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
});

const serializeConversation = (
    conversation: IConversation,
    currentUserId: string,
    memberCount: number,
    lastMessage: Record<string, unknown> | null,
    unreadCount: number
) => {
    const currentMember = conversation.members.find((member) => member.userId === currentUserId);

    return {
        id: String(conversation._id),
        type: conversation.type,
        name:
            conversation.type === 'direct'
                ? conversation.members.find((member) => member.userId !== currentUserId)
                    ?.username ?? conversation.name
                : conversation.name,
        imageUrl: conversation.imageUrl ?? '',
        createdBy: conversation.createdBy,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        memberRole: currentMember?.role ?? null,
        memberCount,
        lastMessage,
        unreadCount,
        members: conversation.members.map((member) => ({
            userId: member.userId,
            username: member.username,
            email: member.email,
            role: member.role,
            joinedAt: member.joinedAt,
            lastReadAt: member.lastReadAt ?? null,
        })),
    };
};

const serializeMessage = (message: {
    _id: Types.ObjectId;
    room: string;
    userId: string;
    user: string;
    message: string;
    imageUrl?: string;
    replyTo?: string;
    mentions?: string[];
    reactions?: Record<string, string[]>;
    pinned?: boolean;
    edited?: boolean;
    deleted?: boolean;
    timestamp: Date;
    editedAt?: Date;
}) => ({
    id: String(message._id),
    room: message.room,
    userId: message.userId,
    user: message.user,
    message: message.message,
    imageUrl: message.imageUrl ?? '',
    replyTo: message.replyTo ?? '',
    mentions: message.mentions ?? [],
    reactions: message.reactions ?? {},
    pinned: message.pinned ?? false,
    edited: message.edited ?? false,
    deleted: message.deleted ?? false,
    timestamp: message.timestamp,
    editedAt: message.editedAt ?? null,
});

const getConversationMember = (conversation: IConversation, userId: string) =>
    conversation.members.find((member) => member.userId === userId);

const requireConversationId = (value: string): string | null =>
    Types.ObjectId.isValid(value) ? value : null;

const getRouteParam = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] ?? '' : value ?? '';

const requireRole = (
    conversation: IConversation,
    userId: string,
    allowedRoles: ConversationMemberRole[]
): IConversationMember | null => {
    const member = getConversationMember(conversation, userId);

    if (!member || !allowedRoles.includes(member.role)) {
        return null;
    }

    return member;
};

const ensureMembership = (conversation: IConversation, userId: string) =>
    getConversationMember(conversation, userId) ?? null;

const getConversationByIdForUser = async (conversationId: string, userId: string) => {
    return Conversation.findOne({ _id: conversationId, 'members.userId': userId });
};

const buildConversationName = (validatedUsers: AuthBackendUser[], fallbackName: string) => {
    if (fallbackName.trim()) {
        return fallbackName.trim();
    }

    return validatedUsers.map((user) => user.username).join(', ');
};

const emitNotifications = (
    io: AuthenticatedSocketServer,
    notifications: Array<IChatNotification>
) => {
    for (const notification of notifications) {
        io.to(`user:${notification.userId}`).emit(
            'notification:new',
            normalizeNotification(notification)
        );
    }
};

const createNotifications = async (
    io: AuthenticatedSocketServer,
    inputs: NotificationPayloadInput[]
) => {
    if (inputs.length === 0) {
        return;
    }

    const notifications = await ChatNotification.insertMany(inputs);
    emitNotifications(io, notifications);

    for (const userId of [...new Set(inputs.map((input) => input.userId))]) {
        const unreadCount = await ChatNotification.countDocuments({
            userId,
            readAt: null,
        });
        io.to(`user:${userId}`).emit('notification:unread_count', {
            userId,
            unreadCount,
        });
    }
};

const fetchUsersOrFail = async (
    userIds: string[],
    token: string
): Promise<{ users: AuthBackendUser[]; missingUserId?: string }> => {
    const uniqueUserIds = [...new Set(userIds)];
    const users: AuthBackendUser[] = [];

    for (const userId of uniqueUserIds) {
        const user = await fetchUserById(userId, token);

        if (!user) {
            return { users: [], missingUserId: userId };
        }

        users.push(user);
    }

    return { users };
};

const conversationSummaryMap = async (conversations: IConversation[]) => {
    const conversationIds = conversations.map((conversation) => String(conversation._id));

    const lastMessages = await Message.aggregate<{
        _id: string;
        message: {
            _id: Types.ObjectId;
            room: string;
            userId: string;
            user: string;
            message: string;
            imageUrl?: string;
            replyTo?: string;
            mentions?: string[];
            reactions?: Record<string, string[]>;
            pinned?: boolean;
            edited?: boolean;
            deleted?: boolean;
            timestamp: Date;
            editedAt?: Date;
        };
    }>([
        { $match: { room: { $in: conversationIds } } },
        { $sort: { timestamp: -1 } },
        { $group: { _id: '$room', message: { $first: '$$ROOT' } } },
    ]);

    const lastMessageMap = new Map<string, Record<string, unknown>>();
    for (const item of lastMessages) {
        lastMessageMap.set(item._id, serializeMessage(item.message));
    }

    return lastMessageMap;
};

const unreadCountForConversation = async (
    conversationId: string,
    member: IConversationMember
): Promise<number> => {
    const filter: Record<string, unknown> = {
        room: conversationId,
        userId: { $ne: member.userId },
    };

    if (member.lastReadAt) {
        filter.timestamp = { $gt: member.lastReadAt };
    }

    return Message.countDocuments(filter);
};

export const createConversationsController = (io: AuthenticatedSocketServer) => {
    const getConversations = async (request: AuthenticatedRequest, response: Response) => {
        const conversations = await Conversation.find({ 'members.userId': request.user.id }).sort({
            updatedAt: -1,
        });

        const lastMessageMap = await conversationSummaryMap(conversations);

        const payload = await Promise.all(
            conversations.map(async (conversation) => {
                const member = getConversationMember(conversation, request.user.id);
                const unreadCount = member
                    ? await unreadCountForConversation(String(conversation._id), member)
                    : 0;

                return serializeConversation(
                    conversation,
                    request.user.id,
                    conversation.members.length,
                    lastMessageMap.get(String(conversation._id)) ?? null,
                    unreadCount
                );
            })
        );

        response.json({ conversations: payload });
    };

    const getConversation = async (request: AuthenticatedRequest, response: Response) => {
        const conversationId = requireConversationId(getRouteParam(request.params.id));

        if (!conversationId) {
            response.status(400).json({ error: 'Invalid conversation id' });
            return;
        }

        const conversation = await getConversationByIdForUser(conversationId, request.user.id);

        if (!conversation) {
            response.status(404).json({ error: 'Conversation not found' });
            return;
        }

        const member = getConversationMember(conversation, request.user.id);
        const unreadCount = member
            ? await unreadCountForConversation(String(conversation._id), member)
            : 0;
        const lastMessage = await Message.findOne({ room: conversationId }).sort({ timestamp: -1 });

        response.json({
            conversation: serializeConversation(
                conversation,
                request.user.id,
                conversation.members.length,
                lastMessage ? serializeMessage(lastMessage.toObject()) : null,
                unreadCount
            ),
        });
    };

    const createDirectConversation = async (request: AuthenticatedRequest, response: Response) => {
        const targetUserId = isNonEmptyString(request.body?.targetUserId)
            ? request.body.targetUserId.trim()
            : '';

        if (!targetUserId || targetUserId === request.user.id) {
            response.status(400).json({ error: 'A valid targetUserId is required' });
            return;
        }

        const usersResult = await fetchUsersOrFail([request.user.id, targetUserId], request.authToken);

        if (usersResult.missingUserId) {
            response.status(404).json({ error: `User ${usersResult.missingUserId} not found` });
            return;
        }

        const directKey = sortDirectMemberIds([request.user.id, targetUserId]);
        const existingConversation = await Conversation.findOne({ type: 'direct', directKey });

        if (existingConversation) {
            response.json({
                conversation: serializeConversation(
                    existingConversation,
                    request.user.id,
                    existingConversation.members.length,
                    null,
                    0
                ),
            });
            return;
        }

        const targetUser = usersResult.users.find((user) => user.id === targetUserId);
        const currentUser = usersResult.users.find((user) => user.id === request.user.id);
        const conversation = await Conversation.create({
            type: 'direct',
            name: targetUser?.username ?? 'Direct conversation',
            directKey,
            createdBy: request.user.id,
            members: [
                {
                    userId: request.user.id,
                    username: currentUser?.username ?? request.user.username,
                    email: currentUser?.email ?? request.user.email,
                    role: 'owner',
                    joinedAt: new Date(),
                    lastReadAt: new Date(),
                },
                {
                    userId: targetUserId,
                    username: targetUser?.username ?? targetUserId,
                    email: targetUser?.email ?? '',
                    role: 'member',
                    joinedAt: new Date(),
                    lastReadAt: null,
                },
            ],
        });

        await createNotifications(io, [
            {
                userId: targetUserId,
                conversationId: String(conversation._id),
                type: 'conversation_created',
                title: 'New direct conversation',
                body: `${request.user.username} started a direct conversation with you.`,
                data: { initiatedBy: request.user.id },
            },
        ]);

        response.status(201).json({
            conversation: serializeConversation(conversation, request.user.id, 2, null, 0),
        });
    };

    const createGroupConversation = async (request: AuthenticatedRequest, response: Response) => {
        const requestedName = isNonEmptyString(request.body?.name) ? request.body.name : '';
        const imageUrl = isNonEmptyString(request.body?.imageUrl) ? request.body.imageUrl.trim() : '';
        const membersInput: any[] = Array.isArray(request.body?.members) ? request.body.members : [];

        if (membersInput.length === 0) {
            response.status(400).json({ error: 'members must include at least one user' });
            return;
        }

        const normalizedMembers = membersInput
            .map((member: any) => {
                const userId = isNonEmptyString(member?.userId) ? member.userId.trim() : '';
                const role = member?.role === 'admin' ? 'admin' : 'member';
                return userId ? { userId, role } : null;
            })
            .filter((member: any): member is { userId: string; role: 'member' | 'admin' } => member !== null)
            .filter((member: { userId: string }) => member.userId !== request.user.id);

        if (normalizedMembers.length === 0) {
            response.status(400).json({ error: 'members must include valid users other than the creator' });
            return;
        }

        const usersResult = await fetchUsersOrFail(
            [request.user.id, ...normalizedMembers.map((member) => member.userId)],
            request.authToken
        );

        if (usersResult.missingUserId) {
            response.status(404).json({ error: `User ${usersResult.missingUserId} not found` });
            return;
        }

        const conversation = await Conversation.create({
            type: 'group',
            name: buildConversationName(usersResult.users, requestedName),
            imageUrl,
            createdBy: request.user.id,
            members: [
                {
                    userId: request.user.id,
                    username: request.user.username,
                    email: request.user.email,
                    role: 'owner',
                    joinedAt: new Date(),
                    lastReadAt: new Date(),
                },
                ...normalizedMembers.map((member) => ({
                    userId: member.userId,
                    username:
                        usersResult.users.find((user) => user.id === member.userId)
                            ?.username ?? member.userId,
                    email:
                        usersResult.users.find((user) => user.id === member.userId)
                            ?.email ?? '',
                    role: member.role,
                    joinedAt: new Date(),
                    lastReadAt: null,
                })),
            ],
        });

        await createNotifications(
            io,
            normalizedMembers.map((member) => ({
                userId: member.userId,
                conversationId: String(conversation._id),
                type: 'conversation_created',
                title: 'Added to a group conversation',
                body: `${request.user.username} added you to ${conversation.name}.`,
                data: { addedBy: request.user.id },
            }))
        );

        response.status(201).json({
            conversation: serializeConversation(
                conversation,
                request.user.id,
                conversation.members.length,
                null,
                0
            ),
        });
    };

    const updateConversationMetadata = async (
        request: AuthenticatedRequest,
        response: Response
    ) => {
        const conversationId = requireConversationId(getRouteParam(request.params.id));

        if (!conversationId) {
            response.status(400).json({ error: 'Invalid conversation id' });
            return;
        }

        const conversation = await getConversationByIdForUser(conversationId, request.user.id);

        if (!conversation) {
            response.status(404).json({ error: 'Conversation not found' });
            return;
        }

        if (!requireRole(conversation, request.user.id, ['owner', 'admin'])) {
            response.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        const name = isNonEmptyString(request.body?.name) ? request.body.name.trim() : undefined;
        const imageUrl =
            typeof request.body?.imageUrl === 'string' ? request.body.imageUrl.trim() : undefined;

        if (name !== undefined) {
            conversation.name = name;
        }

        if (imageUrl !== undefined) {
            conversation.imageUrl = imageUrl;
        }

        await conversation.save();

        response.json({
            conversation: serializeConversation(
                conversation,
                request.user.id,
                conversation.members.length,
                null,
                0
            ),
        });
    };

    const addMembers = async (request: AuthenticatedRequest, response: Response) => {
        const conversationId = requireConversationId(getRouteParam(request.params.id));

        if (!conversationId) {
            response.status(400).json({ error: 'Invalid conversation id' });
            return;
        }

        const conversation = await getConversationByIdForUser(conversationId, request.user.id);

        if (!conversation) {
            response.status(404).json({ error: 'Conversation not found' });
            return;
        }

        if (!requireRole(conversation, request.user.id, ['owner', 'admin'])) {
            response.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        const membersInput: any[] = Array.isArray(request.body?.members) ? request.body.members : [];
        const normalizedMembers = membersInput
            .map((member: any) => {
                const userId = isNonEmptyString(member?.userId) ? member.userId.trim() : '';
                const role = member?.role === 'admin' ? 'admin' : 'member';
                return userId ? { userId, role } : null;
            })
            .filter((member: any): member is { userId: string; role: 'member' | 'admin' } => member !== null)
            .filter((member: { userId: string }) => !conversation.members.some((existingMember) => existingMember.userId === member.userId));

        if (normalizedMembers.length === 0) {
            response.status(400).json({ error: 'No new valid members provided' });
            return;
        }

        const usersResult = await fetchUsersOrFail(
            normalizedMembers.map((member) => member.userId),
            request.authToken
        );

        if (usersResult.missingUserId) {
            response.status(404).json({ error: `User ${usersResult.missingUserId} not found` });
            return;
        }

        for (const member of normalizedMembers) {
            const user = usersResult.users.find((item) => item.id === member.userId);
            conversation.members.push({
                userId: member.userId,
                username: user?.username ?? member.userId,
                email: user?.email ?? '',
                role: member.role,
                joinedAt: new Date(),
                lastReadAt: null,
            } as IConversationMember);
        }

        await conversation.save();

        await createNotifications(
            io,
            normalizedMembers.map((member) => ({
                userId: member.userId,
                conversationId,
                type: 'member_added',
                title: 'Added to conversation',
                body: `${request.user.username} added you to ${conversation.name}.`,
                data: { addedBy: request.user.id, role: member.role },
            }))
        );

        response.json({
            conversation: serializeConversation(
                conversation,
                request.user.id,
                conversation.members.length,
                null,
                0
            ),
        });
    };

    const updateMember = async (request: AuthenticatedRequest, response: Response) => {
        const conversationId = requireConversationId(getRouteParam(request.params.id));
        const memberUserId = getRouteParam(request.params.userId);

        if (!conversationId) {
            response.status(400).json({ error: 'Invalid conversation id' });
            return;
        }

        const conversation = await getConversationByIdForUser(conversationId, request.user.id);

        if (!conversation) {
            response.status(404).json({ error: 'Conversation not found' });
            return;
        }

        const actor = requireRole(conversation, request.user.id, ['owner', 'admin']);

        if (!actor) {
            response.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        const member = getConversationMember(conversation, memberUserId);

        if (!member) {
            response.status(404).json({ error: 'Member not found' });
            return;
        }

        const nextRole =
            request.body?.role === 'owner' || request.body?.role === 'admin' || request.body?.role === 'member'
                ? request.body.role
                : null;

        if (!nextRole) {
            response.status(400).json({ error: 'A valid role is required' });
            return;
        }

        if (actor.role !== 'owner' && (nextRole === 'owner' || member.role === 'owner')) {
            response.status(403).json({ error: 'Only the owner can manage owner role changes' });
            return;
        }

        member.role = nextRole;
        await conversation.save();

        await createNotifications(io, [
            {
                userId: member.userId,
                conversationId,
                type: 'member_role_updated',
                title: 'Conversation role updated',
                body: `${request.user.username} changed your role to ${nextRole} in ${conversation.name}.`,
                data: { updatedBy: request.user.id, role: nextRole },
            },
        ]);

        response.json({
            conversation: serializeConversation(
                conversation,
                request.user.id,
                conversation.members.length,
                null,
                0
            ),
        });
    };

    const removeMember = async (request: AuthenticatedRequest, response: Response) => {
        const conversationId = requireConversationId(getRouteParam(request.params.id));
        const memberUserId = getRouteParam(request.params.userId);

        if (!conversationId) {
            response.status(400).json({ error: 'Invalid conversation id' });
            return;
        }

        const conversation = await getConversationByIdForUser(conversationId, request.user.id);

        if (!conversation) {
            response.status(404).json({ error: 'Conversation not found' });
            return;
        }

        const actor = requireRole(conversation, request.user.id, ['owner', 'admin']);

        if (!actor) {
            response.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        const member = getConversationMember(conversation, memberUserId);

        if (!member) {
            response.status(404).json({ error: 'Member not found' });
            return;
        }

        if (member.role === 'owner' && actor.role !== 'owner') {
            response.status(403).json({ error: 'Only the owner can remove the owner' });
            return;
        }

        if (member.userId === request.user.id && conversation.members.filter((item) => item.role === 'owner').length === 1) {
            response.status(400).json({ error: 'Conversation must retain an owner' });
            return;
        }

        conversation.members = conversation.members.filter((item) => item.userId !== memberUserId) as typeof conversation.members;

        if (conversation.members.length < 2) {
            response.status(400).json({ error: 'Conversation must keep at least two members' });
            return;
        }

        await conversation.save();

        await createNotifications(io, [
            {
                userId: memberUserId,
                conversationId,
                type: 'member_removed',
                title: 'Removed from conversation',
                body: `${request.user.username} removed you from ${conversation.name}.`,
                data: { removedBy: request.user.id },
            },
        ]);

        response.status(204).send();
    };

    return {
        getConversations,
        getConversation,
        createDirectConversation,
        createGroupConversation,
        updateConversationMetadata,
        addMembers,
        updateMember,
        removeMember,
    };
};
