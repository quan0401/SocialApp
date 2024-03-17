import mongoose, { model, Model, Schema } from 'mongoose';
import { ICommentDocument } from '~comment/interfaces/comment.interface';

const commentSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  comment: { type: String, default: '' },
  username: { type: String },
  avataColor: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now() }
});

export const CommentsModel: Model<ICommentDocument> = model<ICommentDocument>('Comment', commentSchema, 'Comment');
