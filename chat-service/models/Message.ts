import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
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
}

const MessageSchema: Schema = new Schema({
    room: { type: String, required: true },
    userId: { type: String, required: true },
    user: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    replyTo: { type: String, default: '' },
    mentions: { type: [String], default: [] },
    reactions: { type: Schema.Types.Mixed, default: {} },
    pinned: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    editedAt: { type: Date, default: null }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
