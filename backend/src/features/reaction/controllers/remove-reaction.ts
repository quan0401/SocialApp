import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { IReactionJob } from '~reaction/interfaces/reaction.interface';
import { removeReactionScheme } from '~reaction/schemes/reaction.scheme';
import { reactionQueue } from '~services/queues/reaction.queue';
import { ReactionCache } from '~services/redis/reaction.cache';

const reactionCache: ReactionCache = new ReactionCache();

export class RemoveReaction {
  @joiValidation(removeReactionScheme)
  public async remove(req: Request, res: Response): Promise<void> {
    const { postReactions } = req.body;
    const { postId, previousReaction } = req.params;

    await reactionCache.removeReaction(postId, { username: req.currentUser!.username, userId: req.currentUser!.userId }, postReactions);
    reactionQueue.addReactionJob('removeReactionFromDB', { postId, previousReaction, userFrom: req.currentUser!.userId } as IReactionJob);

    res.status(HTTP_STATUS.OK).json({ message: 'Remove removed from post' });
  }
}
