import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { chatQueue } from '~services/queues/chat.queue';
import { ChatCache } from '~services/redis/chat.cache';
import { socketChatObject } from '~sockets/chat.socket';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { updateMessageReaction } from '~chat/schemes/chat.scheme';

const chatCache: ChatCache = new ChatCache();

export class UpdateMessages {
  public async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    const { conversationId, senderId } = req.params;
    const lastMessage: IMessageData = (await chatCache.markMessagesAsRead(senderId, conversationId)) as IMessageData;
    socketChatObject.emit('message read', lastMessage);
    socketChatObject.emit('chat list', lastMessage);
    chatQueue.addChatJob('markMessagesAsRead', { conversationId, senderId });
    res.status(HTTP_STATUS.OK).json({ message: 'Messages are marked as read successfully' });
  }

  @joiValidation(updateMessageReaction)
  public async updateMessageReaction(req: Request, res: Response): Promise<void> {
    const { messageId, senderName, reaction, type, conversationId } = req.body;

    const updatedMessage: IMessageData = (await chatCache.updateMessageReaction(
      conversationId,
      messageId,
      senderName,
      reaction,
      type
    )) as IMessageData;

    socketChatObject.emit('message reaction', updatedMessage);

    chatQueue.addChatJob('updateMessageReaction', { messageId, senderName, reaction, type });

    res.status(HTTP_STATUS.OK).json({ message: 'Updated message reaction' });
  }
}
