import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { reactionService } from '~services/db/reaction.service';

const log: Logger = config.createLogger('reactionWorker');

export class ReactionWorker {
  public async addReaction(job: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.addReactionToDB(job.data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async removeReaction(job: Job, done: DoneCallback): Promise<void> {
    try {
      await reactionService.removeReactionFromDB(job.data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
