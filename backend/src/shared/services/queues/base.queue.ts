import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '~/config';
import { IAuthJob } from '~auth/interfaces/auth.interface';
import { IBasicInfo, IEmailJob, IUserJobInfo } from '~user/interfaces/user.interface';
import { IPostJobData } from '~post/interfaces/post.interface';
import { IReactionJob } from '~reaction/interfaces/reaction.interface';
import { ICommentJob } from '~comment/interfaces/comment.interface';
import { IBlockedUserJobData, IFollowerJobData } from '~follower/interfaces/follower.interface';
import { INotificationJobData } from '~nofitication/interfaces/notification.interface';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { IChatJobData, IMessageData } from '~chat/interfaces/chat.interface';

let bullAdapter: BullAdapter[] = [];

type IBaseJobData =
  | IAuthJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  | IFollowerJobData
  | IBlockedUserJobData
  | INotificationJobData
  | IFileImageDocument
  | IMessageData
  | IChatJobData
  | IBasicInfo
  | IUserJobInfo;
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  private queue: Queue.Queue;
  private log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapter.push(new BullAdapter(this.queue));
    bullAdapter = [...new Set(bullAdapter)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapter,
      serverAdapter
    });

    this.log = config.createLogger(queueName);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });
    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });
    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }
  protected proccessJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
