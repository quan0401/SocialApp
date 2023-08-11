import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { mailTransport } from '~services/emails/mail.transport';
import { IEmailJob } from '~user/interfaces/user.interface';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
  public async addNofiticationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data as IEmailJob;
      await mailTransport.sendMail(receiverEmail, subject, template);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
