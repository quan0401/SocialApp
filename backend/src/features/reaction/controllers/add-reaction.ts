import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { IReactionDocument, IReactionJob } from '~reaction/interfaces/reaction.interface';
import { addReactionScheme } from '~reaction/schemes/reaction.scheme';
import { ReactionCache } from '~services/redis/reaction.cache';
import { reactionQueue } from '~services/queues/reaction.queue';

const reactionCache = new ReactionCache();

export class AddReaction {
  @joiValidation(addReactionScheme)
  public async add(req: Request, res: Response): Promise<void> {
    const { userTo, type, postId, profilePicture, postReactions, previousReaction } = req.body;

    if (type === previousReaction) res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });

    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      username: req.currentUser!.username,
      userId: req.currentUser!.userId,
      avataColor: req.currentUser!.avatarColor,
      type,
      postId,
      profilePicture
      // userTo
    } as IReactionDocument;

    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

    const reactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction,
      userFrom: req.currentUser!.userId,
      type,
      reactionObject,
      userTo
    };

    reactionQueue.addReactionJob('addReactionToDB', reactionData);

    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
  }
}
