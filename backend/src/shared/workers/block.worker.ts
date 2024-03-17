import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { IBlockedUserJobData } from '~follower/interfaces/follower.interface';
import { blockService } from '~services/db/block.service';

const log: Logger = config.createLogger('blockWorker');

export class BlockWorker {
  public async block(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data as IBlockedUserJobData;
      if (type === 'block') {
        await blockService.block(keyOne, keyTwo);
      } else if (type === 'unblock') await blockService.unblock(keyOne, keyTwo);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
