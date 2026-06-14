import mongoose, { Document, Schema } from 'mongoose';

export type ChatNotificationType =
    | 'conversation_created'
    | 'member_added'
    | 'member_role_updated'
    | 'member_removed'
    | 'message_received';

export interface IChatNotification extends Document {
    userId: string;
    conversationId: string;
    type: ChatNotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    readAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const ChatNotificationSchema = new Schema<IChatNotification>(
    {
        userId: { type: String, required: true, index: true, trim: true },
        conversationId: { type: String, required: true, index: true, trim: true },
        type: {
            type: String,
            enum: [
                'conversation_created',
                'member_added',
                'member_role_updated',
                'member_removed',
                'message_received',
            ],
            required: true,
        },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
        data: { type: Schema.Types.Mixed, default: {} },
        readAt: { type: Date, default: null, index: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IChatNotification>('ChatNotification', ChatNotificationSchema);
