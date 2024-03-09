import { IReactionJob } from '~reaction/interfaces/reaction.interface';
import { BaseQueue } from './base.queue';
import { ReactionWorker } from '~workers/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactionQueue');
    this.proccessJob('addReactionToDB', 5, ReactionWorker.prototype.addReaction);
    this.proccessJob('removeReactionFromDB', 5, ReactionWorker.prototype.removeReaction);
  }

  public addReactionJob(name: string, reactionData: IReactionJob): void {
    this.addJob(name, reactionData);
  }
}
export const reactionQueue: ReactionQueue = new ReactionQueue();
