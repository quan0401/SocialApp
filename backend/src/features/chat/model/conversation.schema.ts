import { IConversationDocument } from '~chat/interfaces/conversation.interface';

import mongoose, { Model, Schema, model } from 'mongoose';

const conversationSchema: Schema = new Schema({
  senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Types.ObjectId, ref: 'User' }
});

export const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>(
  'Conversation',
  conversationSchema,
  'Conversation'
);
