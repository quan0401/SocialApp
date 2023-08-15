import { IPostDocument } from '~post/interfaces/post.interface';
import { PostModel } from '~post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '~reaction/interfaces/reaction.interface';
import { ReactionModel } from '~reaction/models/reaction.schema';
import { UserCache } from '~services/redis/user.cache';
import { IUserDocument } from '~user/interfaces/user.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addReactionToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, userTo, userFrom, type, reactionObject } = reactionData;

    let deleteIdReactionObject: IReactionDocument = reactionObject as IReactionDocument;

    if (previousReaction) deleteIdReactionObject = omit(reactionObject, ['_id']);

    const updateReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserFromCache(userTo as string),
      ReactionModel.replaceOne({ postId, type: previousReaction, userId: userFrom }, deleteIdReactionObject, { upsert: true }),
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { [`reactions.${previousReaction}`]: -1, [`reactions.${type}`]: 1 }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
    // Send reaction nofitication
  }

  public async removeReactionFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, userFrom } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, userId: userFrom, type: previousReaction }),
      PostModel.findOneAndUpdate(
        { _id: postId, [`reactions.${previousReaction}`]: { $gt: 0 } },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        }
      )
    ]);
  }

  public async getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      {
        $sort: sort
      }
    ]);
    return [reactions, reactions.length];
  }

  public async getReactionByUserId(postId: string, userId: string): Promise<[IReactionDocument, 1] | []> {
    const reaction: IReactionDocument = (await ReactionModel.findOne({ postId, userId })) as IReactionDocument;
    return reaction ? [reaction, 1] : [];
  }

  public async getAllReactionsByUserId(userId: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
