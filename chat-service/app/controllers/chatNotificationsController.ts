import { Response } from 'express';
import { Types } from 'mongoose';
import ChatNotification, { IChatNotification } from '../../models/ChatNotification';
import { AuthenticatedRequest } from '../auth/http';

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

export const getNotifications = async (request: AuthenticatedRequest, response: Response) => {
    const notifications = await ChatNotification.find({ userId: request.user.id })
        .sort({ createdAt: -1 })
        .lean(false);

    response.json({
        notifications: notifications.map((notification) => normalizeNotification(notification)),
    });
};

export const getUnreadNotificationCount = async (
    request: AuthenticatedRequest,
    response: Response
) => {
    const unreadCount = await ChatNotification.countDocuments({
        userId: request.user.id,
        readAt: null,
    });

    response.json({ unreadCount });
};

export const markNotificationRead = async (
    request: AuthenticatedRequest,
    response: Response
) => {
    const notificationId = Array.isArray(request.params.id)
        ? request.params.id[0] ?? ''
        : request.params.id ?? '';

    if (!Types.ObjectId.isValid(notificationId)) {
        response.status(400).json({ error: 'Invalid notification id' });
        return;
    }

    const notification = await ChatNotification.findOneAndUpdate(
        { _id: notificationId, userId: request.user.id },
        { $set: { readAt: new Date() } },
        { new: true }
    );

    if (!notification) {
        response.status(404).json({ error: 'Notification not found' });
        return;
    }

    response.json({ notification: normalizeNotification(notification) });
};

export const markAllNotificationsRead = async (
    request: AuthenticatedRequest,
    response: Response
) => {
    const filter = {
        userId: request.user.id,
        readAt: null,
    };

    await ChatNotification.updateMany(filter, { $set: { readAt: new Date() } });
    response.status(204).send();
};
