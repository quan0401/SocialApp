import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { chatService } from '~services/db/chat.service';
import { ChatCache } from '~services/redis/chat.cache';

const chatCache: ChatCache = new ChatCache();

export class GetChatMessage {
  public async list(req: Request, res: Response): Promise<void> {
    const listFromcache: IMessageData[] = await chatCache.getUserConversationList(req.currentUser!.userId);
    const list: IMessageData[] = listFromcache.length
      ? listFromcache
      : await chatService.getUserConversationList(new mongoose.Types.ObjectId(req.currentUser!.userId));

    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const messagesFromCache: IMessageData[] = await chatCache.getMessages(req.params.conversationId);
    const messages: IMessageData[] = messagesFromCache.length
      ? messagesFromCache
      : await chatService.getMessages(new mongoose.Types.ObjectId(req.params.conversationId));

    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
  }
}
