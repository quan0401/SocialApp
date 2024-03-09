import { IChatJobData, IMessageData } from '~chat/interfaces/chat.interface';
import { BaseQueue } from './base.queue';
import { ChatWorker } from '~workers/chat.worker';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chatQueue');
    this.proccessJob('addChatMessageToDB', 5, ChatWorker.prototype.addChatMessageToDB);
    this.proccessJob('markMessageAsDeleted', 5, ChatWorker.prototype.markMessageAsDeleted);
    this.proccessJob('markMessagesAsRead', 5, ChatWorker.prototype.markMessagesAsRead);
    this.proccessJob('updateMessageReaction', 5, ChatWorker.prototype.updateMessageReaction);
  }

  public addChatJob(name: string, data: IMessageData | IChatJobData) {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
