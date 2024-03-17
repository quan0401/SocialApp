import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

import { IReactionDocument } from '~reaction/interfaces/reaction.interface';

import { ReactionCache } from '~services/redis/reaction.cache';
import { reactionService } from '~services/db/reaction.service';

const reactionCache: ReactionCache = new ReactionCache();

export class GetReaction {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const reactionsFromCache: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);

    const reactions: [IReactionDocument[], number] = reactionsFromCache[0].length
      ? reactionsFromCache
      : await reactionService.getPostReactions({ postId }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async getPostReactionsByUserId(req: Request, res: Response): Promise<void> {
    const { postId, userId } = req.params;

    const reactionFromCache: [IReactionDocument, number] | [] = await reactionCache.getReactionByUserId(postId, userId);

    const reaction: [IReactionDocument, number] | [] = reactionFromCache.length
      ? reactionFromCache
      : await reactionService.getReactionByUserId(postId, userId);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'User single reaction', reaction: reaction.length ? reaction[0] : {}, count: reaction.length ? reaction[1] : 0 });
  }

  public async getAllReactionsOfUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const reactions: IReactionDocument[] = await reactionService.getAllReactionsByUserId(userId);
    res.status(HTTP_STATUS.OK).json({ message: 'All reactions by user', reactions });
  }
}
