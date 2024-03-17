import { IBlockedUserJobData } from '~follower/interfaces/follower.interface';
import { BaseQueue } from './base.queue';
import { BlockWorker } from '~workers/block.worker';

class BlockQueue extends BaseQueue {
  constructor() {
    super('blockQueue');
    this.proccessJob('blockJob', 5, BlockWorker.prototype.block);
  }
  public addBlockJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockQueue: BlockQueue = new BlockQueue();
