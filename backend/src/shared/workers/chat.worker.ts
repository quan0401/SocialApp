import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { ChattyServer } from '~/setupServer';
import { chatService } from '~services/db/chat.service';

const log: Logger = config.createLogger('chatWorker');

export class ChatWorker {
  public async addChatMessageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addChatMessage(job.data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async markMessageAsDeleted(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { messageId, type } = job.data;
      await chatService.markMessageAsDeleted(messageId, type);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async markMessagesAsRead(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { senderId, conversationId } = job.data;
      await chatService.markMessagesAsRead(senderId, conversationId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateMessageReaction(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { messageId, senderName, reaction, type } = job.data;
      await chatService.updateMessageReaction(messageId, senderName, reaction, type);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
