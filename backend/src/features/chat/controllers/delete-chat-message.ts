import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { chatQueue } from '~services/queues/chat.queue';
import { ChatCache } from '~services/redis/chat.cache';
import { socketIOChatObject } from '~sockets/chat.socket';

const chatCache: ChatCache = new ChatCache();
export class DeleteChat {
  public async markMessageAsDeleted(req: Request, res: Response): Promise<void> {
    const { senderId, conversationId, messageId, type } = req.params;
    const updatedMessage: IMessageData = await chatCache.markMessageAsDeleted(senderId, conversationId, messageId, type);

    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);

    chatQueue.addChatJob('markMessageAsDeleted', { messageId, type });

    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as deleted' });
  }
}
