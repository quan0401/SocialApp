import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { blockQueue } from '~services/queues/block.queue';
import { FollowerCache } from '~services/redis/follower.cache';

const followerCache: FollowerCache = new FollowerCache();

export class BlockUser {
  public async block(req: Request, res: Response): Promise<void> {
    const { blockerId, beingBlockedId } = req.params;
    await BlockUser.prototype.updateBlock(blockerId, beingBlockedId, 'block');
    blockQueue.addBlockJob('blockJob', { keyOne: blockerId, keyTwo: beingBlockedId, type: 'block' });
    res.status(HTTP_STATUS.OK).json({ message: 'Blocked user successfully' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { blockerId, beingBlockedId } = req.params;
    await BlockUser.prototype.updateBlock(blockerId, beingBlockedId, 'unblock');
    blockQueue.addBlockJob('blockJob', { keyOne: blockerId, keyTwo: beingBlockedId, type: 'unblock' });
    res.status(HTTP_STATUS.OK).json({ message: 'Unblocked user successfully' });
  }

  private async updateBlock(blockerId: string, beingBlockedId: string, type: 'block' | 'unblock'): Promise<void> {
    await followerCache.updateBlockInCache(blockerId, 'blocked', beingBlockedId, type);
    await followerCache.updateBlockInCache(beingBlockedId, 'blockedBy', blockerId, type);
  }
}
