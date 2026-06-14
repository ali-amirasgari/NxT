import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConversationType = 'direct' | 'group';
export type ConversationMemberRole = 'owner' | 'admin' | 'member';

export interface IConversationMember {
    userId: string;
    username: string;
    email: string;
    role: ConversationMemberRole;
    joinedAt: Date;
    lastReadAt?: Date | null;
}

export interface IConversation extends Document {
    type: ConversationType;
    name: string;
    imageUrl?: string;
    directKey?: string | null;
    members: Types.DocumentArray<IConversationMember & Document>;
    lastMessage?: Record<string, unknown> | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationMemberSchema = new Schema<IConversationMember>(
    {
        userId: { type: String, required: true, trim: true },
        username: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            required: true,
        },
        joinedAt: { type: Date, default: Date.now },
        lastReadAt: { type: Date, default: null },
    },
    { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
    {
        type: {
            type: String,
            enum: ['direct', 'group'],
            required: true,
        },
        name: { type: String, required: true, trim: true },
        imageUrl: { type: String, default: '' },
        directKey: { type: String, default: null },
        members: {
            type: [ConversationMemberSchema],
            default: [],
            validate: {
                validator: (members: IConversationMember[]) => members.length >= 2,
                message: 'A conversation must have at least two members.',
            },
        },
        lastMessage: { type: Schema.Types.Mixed, default: null },
        createdBy: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    }
);

ConversationSchema.index(
    { directKey: 1 },
    {
        unique: true,
        partialFilterExpression: { type: 'direct', directKey: { $type: 'string' } },
    }
);

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
